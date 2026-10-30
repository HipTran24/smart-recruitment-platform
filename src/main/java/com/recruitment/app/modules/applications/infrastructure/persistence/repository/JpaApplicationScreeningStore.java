package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.application.screening.CvScreeningFailure;
import com.recruitment.app.modules.applications.application.screening.CvScreeningResult;
import com.recruitment.app.modules.applications.application.screening.CvScreeningStateService.ClaimResult;
import com.recruitment.app.modules.applications.application.screening.CvScreeningStateService.CompletionResult;
import com.recruitment.app.modules.applications.application.screening.CvScreeningStateService.ScreeningLease;
import com.recruitment.app.modules.applications.application.screening.port.out.ApplicationScreeningStore;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationScreening;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Objects;

@Component
public class JpaApplicationScreeningStore implements ApplicationScreeningStore {

    private final ApplicationScreeningRepository screenings;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final SecureRandom secureRandom;

    @org.springframework.beans.factory.annotation.Autowired
    public JpaApplicationScreeningStore(
            ApplicationScreeningRepository screenings,
            ObjectMapper objectMapper,
            Clock clock
    ) {
        this(screenings, objectMapper, clock, new SecureRandom());
    }

    public JpaApplicationScreeningStore(
            ApplicationScreeningRepository screenings,
            ObjectMapper objectMapper,
            Clock clock,
            SecureRandom secureRandom
    ) {
        this.screenings = Objects.requireNonNull(screenings, "screening repository must not be null");
        this.objectMapper = Objects.requireNonNull(objectMapper, "object mapper must not be null");
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.secureRandom = Objects.requireNonNull(secureRandom, "secure random must not be null");
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ClaimResult claim(Long screeningId, String inputHash, Duration leaseTtl) {
        Instant now = clock.instant();
        ApplicationScreening screening = screenings.findByIdForUpdate(screeningId).orElse(null);
        if (screening == null) {
            return ClaimResult.notFound();
        }

        if (!screening.getInputHash().equals(inputHash)) {
            if (screening.getStatus() == ApplicationScreening.ScreeningStatus.PENDING) {
                CvScreeningFailure failure = CvScreeningFailure.inputFingerprintMismatch();
                screening.rejectPendingInput(failure.code(), failure.message(), now);
                return ClaimResult.inputRejected();
            }
            return ClaimResult.notClaimable();
        }

        if (!isApplicationEligible(screening)) {
            if (screening.getStatus() == ApplicationScreening.ScreeningStatus.PENDING) {
                CvScreeningFailure failure = CvScreeningFailure.applicationNotEligible();
                screening.rejectPendingInput(failure.code(), failure.message(), now);
                return ClaimResult.applicationRejected();
            }
            return ClaimResult.notClaimable();
        }

        if (screening.getStatus() == ApplicationScreening.ScreeningStatus.PENDING) {
            return ClaimResult.claimed(start(screening, now, leaseTtl));
        }
        if (screening.isLeaseExpired(now)) {
            return ClaimResult.claimed(reclaim(screening, now, leaseTtl));
        }
        return ClaimResult.notClaimable();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletionResult complete(ScreeningLease lease, CvScreeningResult result) {
        Instant now = clock.instant();
        ApplicationScreening screening = screenings.findByIdForUpdate(lease.screeningId()).orElse(null);
        if (screening == null || !screening.hasActiveLease(lease.token(), now)) {
            return CompletionResult.notApplied();
        }
        if (!isApplicationEligible(screening)) {
            CvScreeningFailure failure = CvScreeningFailure.applicationNotEligible();
            screening.fail(failure.code(), failure.retryable(), failure.message(), now);
            return CompletionResult.applicationRejected();
        }

        screening.complete(
                result.score(),
                toEntityRecommendation(result.recommendation()),
                result.summary(),
                serializeAuditList(result.matchedCriteria()),
                serializeAuditList(result.missingCriteria()),
                serializeAuditList(result.limitations()),
                result.provider(),
                result.model(),
                result.promptVersion(),
                now
        );
        return CompletionResult.completed();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean fail(ScreeningLease lease, CvScreeningFailure failure) {
        Instant now = clock.instant();
        ApplicationScreening screening = screenings.findByIdForUpdate(lease.screeningId()).orElse(null);
        if (screening == null || !screening.hasActiveLease(lease.token(), now)) {
            return false;
        }
        screening.fail(failure.code(), failure.retryable(), failure.message(), now);
        return true;
    }

    private ScreeningLease start(ApplicationScreening screening, Instant now, Duration leaseTtl) {
        String token = generateLeaseToken();
        screening.markProcessing(token, now.plus(leaseTtl));
        return new ScreeningLease(screening.getId(), token);
    }

    private ScreeningLease reclaim(ApplicationScreening screening, Instant now, Duration leaseTtl) {
        String token = generateLeaseToken();
        screening.reclaimExpiredProcessing(token, now.plus(leaseTtl), now);
        return new ScreeningLease(screening.getId(), token);
    }

    private static boolean isApplicationEligible(ApplicationScreening screening) {
        JobApplication.ApplicationStatus status = screening.getJobApplication().getStatus();
        return status != JobApplication.ApplicationStatus.REJECTED
                && status != JobApplication.ApplicationStatus.WITHDRAWN;
    }

    private String serializeAuditList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JacksonException exception) {
            throw new IllegalStateException("could not serialize CV screening audit data", exception);
        }
    }

    private String generateLeaseToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static ApplicationScreening.Recommendation toEntityRecommendation(
            CvScreeningResult.Recommendation recommendation
    ) {
        return ApplicationScreening.Recommendation.valueOf(recommendation.name());
    }
}
