package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

/**
 * Registers Google only when explicitly enabled. This keeps local/test startup
 * independent of OAuth credentials and avoids an accidental empty client id.
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(GoogleOAuthProperties.class)
@ConditionalOnProperty(prefix = "app.security.oauth2.google", name = "enabled", havingValue = "true")
public class GoogleOAuthClientConfiguration {

    @Bean
    ClientRegistrationRepository googleClientRegistrationRepository(GoogleOAuthProperties properties) {
        properties.validateEnabledConfiguration();

        ClientRegistration registration = CommonOAuth2Provider.GOOGLE
                .getBuilder("google")
                .clientId(properties.clientId().strip())
                .clientSecret(properties.clientSecret().strip())
                .scope("openid", "profile", "email")
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .build();

        return new InMemoryClientRegistrationRepository(registration);
    }
}
