package com.recruitment.app.modules.identity.infrastructure.integration.email;

import com.recruitment.app.modules.identity.application.port.out.AccountNotificationGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Baseline notification gateway implementation that logs security dispatch events without exposing raw tokens.
 */
@Component
public class LoggingAccountNotificationGateway implements AccountNotificationGateway {

    private static final Logger log = LoggerFactory.getLogger(LoggingAccountNotificationGateway.class);

    @Override
    public void sendPasswordResetNotification(String email, String rawToken) {
        log.info("Dispatched password reset instructions for recipient: {}", email);
    }

    @Override
    public void sendEmailVerificationNotification(String email, String rawToken) {
        log.info("Dispatched email verification instructions for recipient: {}", email);
    }
}
