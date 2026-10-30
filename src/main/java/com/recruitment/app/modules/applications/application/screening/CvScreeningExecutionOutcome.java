package com.recruitment.app.modules.applications.application.screening;

import java.util.Objects;

/**
 * Deliberately contains only durable status metadata. It never returns raw CV text, provider
 * output, credentials, or exception detail to a caller.
 */
public record CvScreeningExecutionOutcome(
        Long screeningId,
        Status status,
        String failureCode,
        boolean retryable
) {

    public CvScreeningExecutionOutcome {
        if (screeningId == null || screeningId <= 0) {
            throw new IllegalArgumentException("screening id must be positive");
        }
        status = Objects.requireNonNull(status, "screening execution status must not be null");
        if (status == Status.FAILED && (failureCode == null || failureCode.isBlank())) {
            throw new IllegalArgumentException("a failed screening execution requires a failure code");
        }
        if (status != Status.FAILED && failureCode != null) {
            throw new IllegalArgumentException("only a failed screening execution can carry a failure code");
        }
    }

    static CvScreeningExecutionOutcome completed(Long screeningId) {
        return new CvScreeningExecutionOutcome(screeningId, Status.COMPLETED, null, false);
    }

    static CvScreeningExecutionOutcome failed(Long screeningId, CvScreeningFailure failure) {
        return new CvScreeningExecutionOutcome(screeningId, Status.FAILED, failure.code(), failure.retryable());
    }

    static CvScreeningExecutionOutcome notFound(Long screeningId) {
        return new CvScreeningExecutionOutcome(screeningId, Status.NOT_FOUND, null, false);
    }

    static CvScreeningExecutionOutcome notClaimable(Long screeningId) {
        return new CvScreeningExecutionOutcome(screeningId, Status.NOT_CLAIMABLE, null, false);
    }

    static CvScreeningExecutionOutcome staleResultDiscarded(Long screeningId) {
        return new CvScreeningExecutionOutcome(screeningId, Status.STALE_RESULT_DISCARDED, null, false);
    }

    public enum Status {
        COMPLETED,
        FAILED,
        NOT_FOUND,
        NOT_CLAIMABLE,
        STALE_RESULT_DISCARDED
    }
}
