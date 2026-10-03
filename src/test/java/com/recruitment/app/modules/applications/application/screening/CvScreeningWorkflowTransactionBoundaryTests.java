package com.recruitment.app.modules.applications.application.screening;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationScreening;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication;
import com.recruitment.app.modules.applications.infrastructure.persistence.repository.ApplicationScreeningRepository;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.lang.reflect.Field;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Verifies Spring's transaction proxies, not just annotations: even an ambient caller transaction
 * is suspended while the gateway executes.
 */
@SpringJUnitConfig(CvScreeningWorkflowTransactionBoundaryTests.TransactionTestConfiguration.class)
class CvScreeningWorkflowTransactionBoundaryTests {

    @org.springframework.beans.factory.annotation.Autowired
    private TransactionalCaller caller;

    @org.springframework.beans.factory.annotation.Autowired
    private ApplicationScreeningRepository repository;

    @org.springframework.beans.factory.annotation.Autowired
    private TransactionAwareGateway gateway;

    @Test
    void suspendsAmbientTransactionBeforeCallingExternalScreeningGateway() throws Exception {
        CvScreeningRequest request = new CvScreeningRequest(
                "Backend Engineer",
                "Build Java services.",
                List.of("Java"),
                "Five years building Java services."
        );
        ApplicationScreening screening = new ApplicationScreening(
                new JobApplication(1L, 2L, null, null),
                "planned-provider",
                "planned-model",
                "planned-prompt",
                CvScreeningInputFingerprint.sha256(request),
                1
        );
        setId(screening, 123L);
        when(repository.findByIdForUpdate(anyLong())).thenReturn(Optional.of(screening));

        CvScreeningExecutionOutcome outcome = caller.executeInsideTransaction(screening.getId(), request);

        assertEquals(CvScreeningExecutionOutcome.Status.COMPLETED, outcome.status());
        assertFalse(gateway.wasTransactionActive());
        assertEquals(ApplicationScreening.ScreeningStatus.COMPLETED, screening.getStatus());
    }

    private static void setId(ApplicationScreening screening, Long id) throws Exception {
        Field field = BaseEntity.class.getDeclaredField("id");
        field.setAccessible(true);
        field.set(screening, id);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement
    static class TransactionTestConfiguration {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        ApplicationScreeningRepository applicationScreeningRepository() {
            return mock(ApplicationScreeningRepository.class);
        }

        @Bean
        Clock clock() {
            return Clock.fixed(Instant.parse("2026-09-29T12:00:00Z"), ZoneOffset.UTC);
        }

        @Bean
        com.recruitment.app.modules.applications.application.screening.port.out.ApplicationScreeningStore applicationScreeningStore(
                ApplicationScreeningRepository applicationScreeningRepository,
                Clock clock
        ) {
            return new com.recruitment.app.modules.applications.infrastructure.persistence.repository.JpaApplicationScreeningStore(
                    applicationScreeningRepository,
                    new JsonMapper(),
                    clock,
                    new SecureRandom()
            );
        }

        @Bean
        CvScreeningStateService cvScreeningStateService(
                com.recruitment.app.modules.applications.application.screening.port.out.ApplicationScreeningStore applicationScreeningStore
        ) {
            return new CvScreeningStateService(applicationScreeningStore);
        }

        @Bean
        TransactionAwareGateway transactionAwareGateway() {
            return new TransactionAwareGateway();
        }

        @Bean
        CvScreeningWorkflow cvScreeningWorkflow(
                CvScreeningStateService cvScreeningStateService,
                org.springframework.beans.factory.ObjectProvider<CvScreeningGateway> cvScreeningGateway
        ) {
            return new CvScreeningWorkflow(cvScreeningStateService, cvScreeningGateway);
        }

        @Bean
        TransactionalCaller transactionalCaller(CvScreeningWorkflow cvScreeningWorkflow) {
            return new TransactionalCaller(cvScreeningWorkflow);
        }
    }

    static class TransactionalCaller {

        private final CvScreeningWorkflow workflow;

        TransactionalCaller(CvScreeningWorkflow workflow) {
            this.workflow = workflow;
        }

        @Transactional
        public CvScreeningExecutionOutcome executeInsideTransaction(Long screeningId, CvScreeningRequest request) {
            return workflow.execute(screeningId, request);
        }
    }

    static final class TransactionAwareGateway implements CvScreeningGateway {

        private final AtomicBoolean transactionActive = new AtomicBoolean();

        @Override
        public CvScreeningResult screen(CvScreeningRequest request) {
            transactionActive.set(TransactionSynchronizationManager.isActualTransactionActive());
            return new CvScreeningResult(
                    75,
                    CvScreeningResult.Recommendation.REVIEW,
                    "Relevant Java experience was found.",
                    List.of("Java"),
                    List.of(),
                    List.of("Evidence was limited to the submitted CV."),
                    "test-provider",
                    "test-model",
                    "test-prompt"
            );
        }

        boolean wasTransactionActive() {
            return transactionActive.get();
        }
    }

    /**
     * Small in-memory transaction manager used solely to exercise Spring propagation and suspend
     * behavior without a database. The screening repository remains mocked in this focused test.
     */
    static final class RecordingTransactionManager extends AbstractPlatformTransactionManager {

        private final ThreadLocal<Integer> depth = ThreadLocal.withInitial(() -> 0);

        @Override
        protected Object doGetTransaction() {
            return new Object();
        }

        @Override
        protected boolean isExistingTransaction(Object transaction) {
            return depth.get() > 0;
        }

        @Override
        protected void doBegin(Object transaction, TransactionDefinition definition) {
            depth.set(depth.get() + 1);
        }

        @Override
        protected void doCommit(DefaultTransactionStatus status) {
            finish();
        }

        @Override
        protected void doRollback(DefaultTransactionStatus status) {
            finish();
        }

        @Override
        protected Object doSuspend(Object transaction) {
            int previousDepth = depth.get();
            depth.set(0);
            return previousDepth;
        }

        @Override
        protected void doResume(Object transaction, Object suspendedResources) {
            depth.set((Integer) suspendedResources);
        }

        private void finish() {
            int currentDepth = depth.get();
            depth.set(Math.max(0, currentDepth - 1));
        }
    }
}
