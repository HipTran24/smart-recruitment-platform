package com.recruitment.app.modules.identity.application.port.out;

import java.util.Optional;

/**
 * Inspection port for local and test environments to retrieve recent verification
 * and password-reset tokens without exposing them via application logs or persistent stores.
 */
public interface TestNotificationInspector {
    Optional<String> getLatestVerificationToken(String email);
    Optional<String> getLatestResetToken(String email);
    void clear();
}
