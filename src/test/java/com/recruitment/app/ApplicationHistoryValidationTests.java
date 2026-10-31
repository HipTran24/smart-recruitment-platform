package com.recruitment.app;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationHistoryValidationTests {

    @Test
    void validTransitionRecordsActorStatusesAndNote() {
        JobApplication application = new JobApplication(1L, 2L, 3L, null);
        int originalHistoryCount = application.getStatusHistories().size();

        application.transitionTo(
                JobApplication.ApplicationStatus.IN_REVIEW,
                10L,
                "QA reviewed synthetic application",
                Instant.parse("2026-10-31T00:00:00Z")
        );

        assertEquals(
                JobApplication.ApplicationStatus.IN_REVIEW,
                application.getStatus()
        );
        assertEquals(
                originalHistoryCount + 1,
                application.getStatusHistories().size()
        );

        var history = application.getStatusHistories()
                .get(application.getStatusHistories().size() - 1);

        assertEquals(
                JobApplication.ApplicationStatus.SUBMITTED,
                history.getFromStatus()
        );
        assertEquals(
                JobApplication.ApplicationStatus.IN_REVIEW,
                history.getToStatus()
        );
        assertEquals(Long.valueOf(10L), history.getChangedByUserId());
        assertEquals(
                "QA reviewed synthetic application",
                history.getNote()
        );
        assertSame(application, history.getJobApplication());
    }

    @Test
    void rejectedTransitionDoesNotChangeStatusOrAppendHistory() {
        JobApplication application = new JobApplication(1L, 2L, 3L, null);
        int originalHistoryCount = application.getStatusHistories().size();

        assertThrows(
                IllegalStateException.class,
                () -> application.transitionTo(
                        JobApplication.ApplicationStatus.OFFERED,
                        10L,
                        "Invalid direct offer",
                        Instant.parse("2026-10-31T00:00:00Z")
                )
        );

        assertEquals(
                JobApplication.ApplicationStatus.SUBMITTED,
                application.getStatus()
        );
        assertEquals(
                originalHistoryCount,
                application.getStatusHistories().size()
        );
    }
}