package com.recruitment.app.modules.identity.application;

import java.time.Instant;

/**
 * Port for issuing a short-lived access credential from an active identity.
 */
public interface AccessTokenIssuer {

    IssuedAccessToken issue(JwtSubject subject, Instant issuedAt);
}
