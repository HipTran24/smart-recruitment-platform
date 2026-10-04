package com.recruitment.app.modules.identity;

import com.recruitment.app.modules.identity.application.port.out.AccountNotificationGateway;
import com.recruitment.app.modules.identity.infrastructure.integration.email.LoggingAccountNotificationGateway;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationGatewayFailFastTests {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner();

    @Test
    void loggingGatewayIsRegisteredByDefault() {
        contextRunner
                .withUserConfiguration(LoggingAccountNotificationGateway.class)
                .run(context -> {
                    assertThat(context).hasSingleBean(AccountNotificationGateway.class);
                    assertThat(context).hasSingleBean(LoggingAccountNotificationGateway.class);
                });
    }

    @Test
    void loggingGatewayIsDisabledWhenProviderIsNotLogging() {
        contextRunner
                .withUserConfiguration(LoggingAccountNotificationGateway.class)
                .withPropertyValues("app.notification.provider=ses")
                .run(context -> {
                    assertThat(context).doesNotHaveBean(AccountNotificationGateway.class);
                    assertThat(context).doesNotHaveBean(LoggingAccountNotificationGateway.class);
                });
    }
}
