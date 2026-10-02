package com.recruitment.app.modules.applications.application.screening;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationScreening;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication;
import com.recruitment.app.modules.applications.infrastructure.persistence.repository.ApplicationScreeningRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CvScreeningWorkflowTests {

    private static final Instant NOW = Instant.parse("2026-09-29T12:00:00Z");

    @Test
    void persistsAllAuditableProviderResultFieldsAfterClaimingTheScreening() throws Exception {
        MutableClock clock = new MutableClock(NOW);
        CvScreeningRequest request = validRequest();
        ApplicationScreening screening = pendingScreening(request);
        ApplicationScreeningRepository repository = repositoryReturning(screening);
        CvScreeningStateService stateService = stateService(repository, clock);
        AtomicInteger invocations = new AtomicInteger();
        CvScreeningGateway gateway = ignored -> {
            invocations.incrementAndGet();
            return validResult();
        };
        CvScreeningWorkflow workflow = new CvScreeningWorkflow(stateService, gatewayProvider(gateway));

        CvScreeningExecutionOutcome outcome = workflow.execute(screening.getId(), request);

        assertEquals(CvScreeningExecutionOutcome.Status.COMPLETED, outcome.status());
        assertEquals(1, invocations.get());
        assertEquals(ApplicationScreening.ScreeningStatus.COMPLETED, screening.getStatus());
        assertEquals(82, screening.getScore());
        assertEquals(ApplicationScreening.Recommendation.RECOMMENDED, screening.getRecommendation());
        assertEquals("Evidence supports relevant Java and Spring experience.", screening.getSummary());
        assertEquals("[\"Java\",\"Spring Boot\"]", screening.getMatchedCriteria());
        assertEquals("[\"Kubernetes\"]", screening.getMissingCriteria());
        assertEquals("[\"Employment duration was not stated.\"]", screening.getLimitations());
        assertEquals("gemini", screening.getProvider());
        assertEquals("gemini-2.5-flash", screening.getModelVersion());
        assertEquals("gemini-cv-screening-v1", screening.getPromptVersion());
        assertEquals(NOW, screening.getEvaluatedAt());
        assertNull(screening.getFailureCode());
        assertNull(screening.getRetryable());
        assertNull(screening.getProcessingLeaseToken());
        assertNull(screening.getProcessingLeaseExpiresAt());
    }

    @Test
    void rejectsMismatchedInputBeforeTheGatewayCanReceiveResumeText() throws Exception {
        MutableClock clock = new MutableClock(NOW);
        CvScreeningRequest queuedRequest = validRequest();
        CvScreeningRequest differentRequest = new CvScreeningRequest(
                queuedRequest.jobTitle(),
                queuedRequest.jobDescription(),
                queuedRequest.requiredCriteria(),
                "Different resume content that must not be sent to the provider."
        );
        ApplicationScreening screening = pendingScreening(queuedRequest);
        ApplicationScreeningRepository repository = repositoryReturning(screening);
        CvScreeningGateway gateway = mock(CvScreeningGateway.class);
        CvScreeningWorkflow workflow = new CvScreeningWorkflow(
                stateService(repository, clock),
                gatewayProvider(gateway)
        );

        CvScreeningExecutionOutcome outcome = workflow.execute(screening.getId(), differentRequest);

        assertEquals(CvScreeningExecutionOutcome.Status.FAILED, outcome.status());
        assertEquals("INPUT_FINGERPRINT_MISMATCH", outcome.failureCode());
        assertFalse(outcome.retryable());
        assertEquals(ApplicationScreening.ScreeningStatus.FAILED, screening.getStatus());
        assertEquals("INPUT_FINGERPRINT_MISMATCH", screening.getFailureCode());
        assertFalse(screening.getRetryable());
        assertFalse(screening.getErrorMessage().contains("Different resume content"));
        verify(gateway, never()).screen(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void persistsOnlyBoundedGenericFailureMetadataWhenProviderThrows() throws Exception {
        MutableClock clock = new MutableClock(NOW);
        CvScreeningRequest request = validRequest();
        ApplicationScreening screening = pendingScreening(request);
        ApplicationScreeningRepository repository = repositoryReturning(screening);
        String sensitiveDetail = "raw-resume-secret@example.test ".repeat(100);
        CvScreeningGateway gateway = ignored -> {
            throw new CvScreeningException(
                    CvScreeningException.Reason.PROVIDER_UNAVAILABLE,
                    true,
                    sensitiveDetail
            );
        };
        CvScreeningWorkflow workflow = new CvScreeningWorkflow(
                stateService(repository, clock),
                gatewayProvider(gateway)
        );

        CvScreeningExecutionOutcome outcome = workflow.execute(screening.getId(), request);

        assertEquals(CvScreeningExecutionOutcome.Status.FAILED, outcome.status());
        assertEquals("PROVIDER_UNAVAILABLE", outcome.failureCode());
        assertTrue(outcome.retryable());
        assertEquals(ApplicationScreening.ScreeningStatus.FAILED, screening.getStatus());
        assertEquals("PROVIDER_UNAVAILABLE", screening.getFailureCode());
        assertTrue(screening.getRetryable());
        assertFalse(screening.getErrorMessage().contains("raw-resume-secret@example.test"));
        assertTrue(screening.getErrorMessage().length() <= 1_000);
        assertNull(screening.getProcessingLeaseToken());
    }

    @Test
    void expiredLeaseCanBeReclaimedAndItsLateCompletionCannotOverwriteTheNewClaim() throws Exception {
        MutableClock clock = new MutableClock(NOW);
        CvScreeningRequest request = validRequest();
        ApplicationScreening screening = pendingScreening(request);
        CvScreeningStateService stateService = stateService(repositoryReturning(screening), clock);
        String fingerprint = CvScreeningInputFingerprint.sha256(request);

        CvScreeningStateService.ClaimResult firstClaim = stateService.claim(screening.getId(), fingerprint);
        assertEquals(CvScreeningStateService.ClaimStatus.CLAIMED, firstClaim.status());
        String firstToken = firstClaim.lease().token();

        clock.advance(CvScreeningStateService.PROCESSING_LEASE_TTL.plusSeconds(1));
        CvScreeningStateService.ClaimResult reclaimedClaim = stateService.claim(screening.getId(), fingerprint);
        assertEquals(CvScreeningStateService.ClaimStatus.CLAIMED, reclaimedClaim.status());
        assertNotEquals(firstToken, reclaimedClaim.lease().token());

        assertEquals(
                CvScreeningStateService.CompletionStatus.NOT_APPLIED,
                stateService.complete(firstClaim.lease(), validResult()).status()
        );
        assertEquals(ApplicationScreening.ScreeningStatus.PROCESSING, screening.getStatus());
        assertEquals(
                CvScreeningStateService.CompletionStatus.COMPLETED,
                stateService.complete(reclaimedClaim.lease(), validResult()).status()
        );
        assertEquals(ApplicationScreening.ScreeningStatus.COMPLETED, screening.getStatus());
    }

    @Test
    void workflowDeclaresThatItSuspendsAnAmbientTransactionDuringTheProviderCall() throws Exception {
        Transactional transactional = CvScreeningWorkflow.class
                .getMethod("execute", Long.class, CvScreeningRequest.class)
                .getAnnotation(Transactional.class);

        assertEquals(Propagation.NOT_SUPPORTED, transactional.propagation());
    }

    private static CvScreeningRequest validRequest() {
        return new CvScreeningRequest(
                "Backend Engineer",
                "Build secure Java services.",
                List.of("Java", "Spring Boot", "Kubernetes"),
                "Five years building Java and Spring services."
        );
    }

    private static CvScreeningResult validResult() {
        return new CvScreeningResult(
                82,
                CvScreeningResult.Recommendation.RECOMMENDED,
                "Evidence supports relevant Java and Spring experience.",
                List.of("Java", "Spring Boot"),
                List.of("Kubernetes"),
                List.of("Employment duration was not stated."),
                "gemini",
                "gemini-2.5-flash",
                "gemini-cv-screening-v1"
        );
    }

    private static ApplicationScreening pendingScreening(CvScreeningRequest request) throws Exception {
        ApplicationScreening screening = new ApplicationScreening(
                new JobApplication(10L, 20L, null, null),
                "planned-provider",
                "planned-model",
                "planned-prompt",
                CvScreeningInputFingerprint.sha256(request),
                1
        );
        Field id = BaseEntity.class.getDeclaredField("id");
        id.setAccessible(true);
        id.set(screening, 99L);
        return screening;
    }

    private static ApplicationScreeningRepository repositoryReturning(ApplicationScreening screening) {
        ApplicationScreeningRepository repository = mock(ApplicationScreeningRepository.class);
        when(repository.findByIdForUpdate(anyLong())).thenReturn(Optional.of(screening));
        return repository;
    }

    private static CvScreeningStateService stateService(
            ApplicationScreeningRepository repository,
            Clock clock
    ) {
        return new CvScreeningStateService(repository, new JsonMapper(), clock, new SecureRandom());
    }

    @SuppressWarnings("unchecked")
    private static ObjectProvider<CvScreeningGateway> gatewayProvider(CvScreeningGateway gateway) {
        ObjectProvider<CvScreeningGateway> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(gateway);
        return provider;
    }

    private static final class MutableClock extends Clock {

        private Instant instant;

        private MutableClock(Instant instant) {
            this.instant = instant;
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }

        private void advance(Duration duration) {
            instant = instant.plus(duration);
        }
    }
}
