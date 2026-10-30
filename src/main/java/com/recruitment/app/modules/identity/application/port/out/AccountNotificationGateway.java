package com.recruitment.app.modules.identity.application.port.out;

/**
 * Outbound port for dispatching account notifications (password reset, email verification).
 */
public interface AccountNotificationGateway {

    void sendPasswordResetNotification(String email, String rawToken);

    void sendEmailVerificationNotification(String email, String rawToken);
}
