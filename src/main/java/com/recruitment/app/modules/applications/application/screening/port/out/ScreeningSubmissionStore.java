package com.recruitment.app.modules.applications.application.screening.port.out;

import com.recruitment.app.modules.applications.application.screening.CvScreeningRequest;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public interface ScreeningSubmissionStore {
    Prepared prepare(Long userId, Long applicationId);
    Status status(Long userId, Long applicationId);
    Map<Long, Status> statuses(Long userId, List<Long> applicationIds);
    List<Queued> due(int limit);
    record Prepared(Long id, CvScreeningRequest request, boolean dispatch) {}
    record Queued(Long userId, Long applicationId) {}
    record Status(Long id, String status, Integer score, String summary, String failureCode, Instant nextAttemptAt, boolean retryable) {}
}
