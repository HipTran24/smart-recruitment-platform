package com.recruitment.app.common.api.context;

import org.slf4j.MDC;

/** Correlation only; never used as an authorization or identity input. */
public final class RequestContext {
    public static final String REQUEST_ID = "requestId";

    private RequestContext() {
    }

    public static String requestId() {
        return MDC.get(REQUEST_ID);
    }
}
