package com.recruitment.app.modules.applications.application.screening;

/**
 * Application port for evaluating a resume against job-related criteria.
 *
 * <p>Implementations must not persist or log raw resume content. Callers should invoke this port
 * from an asynchronous worker rather than a user-facing request thread.</p>
 */
public interface CvScreeningGateway {

    CvScreeningResult screen(CvScreeningRequest request);
}
