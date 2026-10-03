package com.recruitment.app;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationScreening;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateProfile;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateResume;
import com.recruitment.app.modules.jobs.infrastructure.persistence.entity.Job;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DomainLifecycleTests {

    @Test
    void jobCannotBePublishedAfterItHasExpired() {
        Job job = new Job(
                1L,
                1L,
                "Backend Engineer",
                "backend-engineer",
                "Build reliable services.",
                Job.EmploymentType.FULL_TIME,
                Job.WorkplaceType.HYBRID
        );
        Instant now = Instant.parse("2026-09-28T00:00:00Z");
        job.updateDraft(
                "Backend Engineer",
                "Build reliable services.",
                null,
                Job.EmploymentType.FULL_TIME,
                Job.WorkplaceType.HYBRID,
                "Ho Chi Minh City",
                new BigDecimal("1000"),
                new BigDecimal("2000"),
                "USD",
                1,
                now.minusSeconds(1)
        );

        assertThrows(IllegalStateException.class, () -> job.publish(now));
    }

    @Test
    void applicationUsesOnlyAllowedTransitions() {
        JobApplication application = new JobApplication(1L, 2L, 3L, null);
        Instant now = Instant.parse("2026-09-28T00:00:00Z");

        assertThrows(
                IllegalStateException.class,
                () -> application.transitionTo(JobApplication.ApplicationStatus.OFFERED, 10L, null, now)
        );

        application.transitionTo(JobApplication.ApplicationStatus.IN_REVIEW, 10L, "review started", now);
        assertEquals(JobApplication.ApplicationStatus.IN_REVIEW, application.getStatus());
        application.withdraw(10L, "candidate withdrew", now);
        assertEquals(JobApplication.ApplicationStatus.WITHDRAWN, application.getStatus());
        assertEquals(now, application.getWithdrawnAt());
        assertEquals(3, application.getStatusHistories().size());
    }

    @Test
    void onlyOneResumeCanBePrimaryInTheAggregate() {
        CandidateProfile profile = new CandidateProfile(1L);
        CandidateResume first = new CandidateResume(profile, "first.pdf", "candidate/1/first.pdf", "application/pdf", 10L);
        CandidateResume second = new CandidateResume(profile, "second.pdf", "candidate/1/second.pdf", "application/pdf", 11L);

        profile.setPrimaryResume(first);
        assertTrue(first.isPrimaryResume());
        assertFalse(second.isPrimaryResume());

        profile.setPrimaryResume(second);
        assertFalse(first.isPrimaryResume());
        assertTrue(second.isPrimaryResume());
    }

    @Test
    void screeningRequiresProcessingAndABoundedScoreBeforeCompletion() {
        JobApplication application = new JobApplication(1L, 2L, 3L, null);
        ApplicationScreening screening = new ApplicationScreening(
                application,
                "internal-model-provider",
                "model-2026-09",
                "prompt-v1",
                "a".repeat(64),
                1
        );

        assertThrows(
                IllegalStateException.class,
                () -> screening.complete(70, ApplicationScreening.Recommendation.REVIEW, null, null, null, null, "internal", "m1", "p1", Instant.now())
        );

        Instant now = Instant.parse("2026-09-29T12:00:00Z");
        screening.markProcessing("manual-screening-lease-token", now.plusSeconds(60));
        assertThrows(
                IllegalStateException.class,
                () -> screening.complete(101, ApplicationScreening.Recommendation.REVIEW, null, null, null, null, "internal", "m1", "p1", Instant.now())
        );

        screening.complete(70, ApplicationScreening.Recommendation.REVIEW, null, null, null, null, "internal", "m1", "p1", now);
        assertEquals(ApplicationScreening.ScreeningStatus.COMPLETED, screening.getStatus());
    }
}
