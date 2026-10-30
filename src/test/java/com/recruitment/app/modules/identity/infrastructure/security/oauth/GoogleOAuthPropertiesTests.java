package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GoogleOAuthPropertiesTests {

    @Test
    void rejectsAConfiguredRedirectThatCanPreSupplyTheHandoffCode() {
        GoogleOAuthProperties properties = properties("https://app.example.test/auth/complete?%63ode=stale");

        assertThrows(IllegalStateException.class, properties::validateEnabledConfiguration);
    }

    @Test
    void rejectsAConfiguredRedirectThatCanPreSupplyTheTransactionId() {
        GoogleOAuthProperties properties = properties(
                "https://app.example.test/auth/complete?source=google&transaction_id=stale"
        );

        assertThrows(IllegalStateException.class, properties::validateEnabledConfiguration);
    }

    @Test
    void permitsAnExactTrustedRedirectWithUnrelatedQueryParameters() {
        assertDoesNotThrow(() -> properties("https://app.example.test/auth/complete?source=google")
                .validateEnabledConfiguration());
    }

    @Test
    void rejectsAUserInfoRedirectTarget() {
        assertThrows(IllegalStateException.class, () -> properties("https://user@app.example.test/auth/complete")
                .validateEnabledConfiguration());
    }

    private static GoogleOAuthProperties properties(String successRedirectUri) {
        return new GoogleOAuthProperties(
                true,
                "client-id",
                "client-secret",
                successRedirectUri,
                Duration.ofMinutes(1)
        );
    }
}
