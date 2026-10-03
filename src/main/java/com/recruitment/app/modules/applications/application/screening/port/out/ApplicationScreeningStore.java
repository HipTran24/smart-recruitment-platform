package com.recruitment.app.modules.applications.application.screening.port.out;

import com.recruitment.app.modules.applications.application.screening.CvScreeningFailure;
import com.recruitment.app.modules.applications.application.screening.CvScreeningResult;
import com.recruitment.app.modules.applications.application.screening.CvScreeningStateService.ClaimResult;
import com.recruitment.app.modules.applications.application.screening.CvScreeningStateService.CompletionResult;
import com.recruitment.app.modules.applications.application.screening.CvScreeningStateService.ScreeningLease;

import java.time.Duration;

/**
 * Persistence port for durable screening state transitions and pessimistic lease management.
 */
public interface ApplicationScreeningStore {

    ClaimResult claim(Long screeningId, String inputHash, Duration leaseTtl);

    CompletionResult complete(ScreeningLease lease, CvScreeningResult result);

    boolean fail(ScreeningLease lease, CvScreeningFailure failure);
}
