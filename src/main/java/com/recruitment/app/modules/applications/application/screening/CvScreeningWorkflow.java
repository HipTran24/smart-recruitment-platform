package com.recruitment.app.modules.applications.application.screening;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * Orchestrates one CV-screening attempt. The method explicitly suspends any caller transaction:
 * its state transitions occur in {@link CvScreeningStateService}'s short transactions and the
 * external provider call is never made while a database transaction or pessimistic lock is held.
 *
 * <p>This class is intentionally not a web endpoint or a scheduler. A durable dispatcher can call
 * it after a screening has been queued, and a later invocation safely reclaims an expired lease if
 * a previous worker crashed.</p>
 */
@Service
public class CvScreeningWorkflow {

    private final CvScreeningStateService stateService;
    private final ObjectProvider<CvScreeningGateway> screeningGateway;

    public CvScreeningWorkflow(
            CvScreeningStateService stateService,
            ObjectProvider<CvScreeningGateway> screeningGateway
    ) {
        this.stateService = Objects.requireNonNull(stateService, "screening state service must not be null");
        this.screeningGateway = Objects.requireNonNull(screeningGateway, "screening gateway provider must not be null");
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public CvScreeningExecutionOutcome execute(Long screeningId, CvScreeningRequest request) {
        Objects.requireNonNull(request, "CV screening request must not be null");

        CvScreeningStateService.ClaimResult claim = stateService.claim(
                screeningId,
                CvScreeningInputFingerprint.sha256(request)
        );
        switch (claim.status()) {
            case NOT_FOUND:
                return CvScreeningExecutionOutcome.notFound(screeningId);
            case NOT_CLAIMABLE:
                return CvScreeningExecutionOutcome.notClaimable(screeningId);
            case INPUT_REJECTED:
                return CvScreeningExecutionOutcome.failed(screeningId, CvScreeningFailure.inputFingerprintMismatch());
            case APPLICATION_REJECTED:
                return CvScreeningExecutionOutcome.failed(screeningId, CvScreeningFailure.applicationNotEligible());
            case CLAIMED:
                break;
        }

        CvScreeningStateService.ScreeningLease lease = claim.lease();
        CvScreeningGateway gateway = screeningGateway.getIfAvailable();
        if (gateway == null) {
            return persistFailure(lease, CvScreeningFailure.providerNotConfigured());
        }

        try {
            CvScreeningResult result = gateway.screen(request);
            CvScreeningStateService.CompletionResult completion = stateService.complete(lease, result);
            return switch (completion.status()) {
                case COMPLETED -> CvScreeningExecutionOutcome.completed(screeningId);
                case APPLICATION_REJECTED -> CvScreeningExecutionOutcome.failed(
                        screeningId,
                        CvScreeningFailure.applicationNotEligible()
                );
                case NOT_APPLIED -> CvScreeningExecutionOutcome.staleResultDiscarded(screeningId);
            };
        } catch (CvScreeningException exception) {
            return persistFailure(lease, CvScreeningFailure.from(exception));
        } catch (RuntimeException exception) {
            // Do not persist arbitrary exception text: adapters or dependencies can include CV
            // content, provider bodies, credentials, or implementation details in their message.
            return persistFailure(lease, CvScreeningFailure.unexpectedProviderFailure());
        }
    }

    private CvScreeningExecutionOutcome persistFailure(
            CvScreeningStateService.ScreeningLease lease,
            CvScreeningFailure failure
    ) {
        if (stateService.fail(lease, failure)) {
            return CvScreeningExecutionOutcome.failed(lease.screeningId(), failure);
        }
        return CvScreeningExecutionOutcome.staleResultDiscarded(lease.screeningId());
    }
}
