package com.recruitment.app.modules.identity.infrastructure.integration.email;

import com.recruitment.app.modules.identity.application.port.out.AccountNotificationGateway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Explicitly disabled email delivery; never stores or logs raw security tokens. */
@Component
@ConditionalOnProperty(name = "app.notification.provider", havingValue = "disabled")
public final class DisabledAccountNotificationGateway implements AccountNotificationGateway {
    @Override public void sendPasswordResetNotification(String email, String rawToken) {}
    @Override public void sendEmailVerificationNotification(String email, String rawToken) {}
}
