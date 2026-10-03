package com.recruitment.app.modules.identity.infrastructure.security;

import com.recruitment.app.modules.identity.application.AccessTokenIssuer;
import com.recruitment.app.modules.identity.application.JwtSubjectResolver;
import com.recruitment.app.modules.identity.application.RefreshTokenStore;
import com.recruitment.app.modules.identity.application.TokenSessionService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuedAtValidator;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.time.Clock;

/**
 * Creates JWT infrastructure at startup. Required key configuration is bound
 * and verified eagerly, so a deployment cannot accidentally expose the auth
 * API with generated, missing, or mismatched key material.
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(JwtProperties.class)
public class JwtSecurityConfiguration {

    @Bean
    RsaJwtKeyPair rsaJwtKeyPair(JwtProperties properties) {
        return new RsaJwtKeyLoader().load(properties);
    }

    @Bean
    JwtEncoder jwtEncoder(RsaJwtKeyPair keyPair, JwtProperties properties) {
        return NimbusJwtEncoder.withKeyPair(keyPair.publicKey(), keyPair.privateKey())
                .algorithm(SignatureAlgorithm.RS256)
                .jwkPostProcessor(builder -> builder.keyID(properties.keyId()))
                .build();
    }

    @Bean
    JwtDecoder jwtDecoder(RsaJwtKeyPair keyPair, JwtProperties properties, Clock clock) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(keyPair.publicKey())
                .signatureAlgorithm(SignatureAlgorithm.RS256)
                .build();
        decoder.setJwtValidator(jwtValidator(properties, clock));
        return decoder;
    }

    @Bean
    JwtAccessTokenService jwtAccessTokenService(
            JwtEncoder jwtEncoder,
            JwtDecoder jwtDecoder,
            JwtProperties properties
    ) {
        return new JwtAccessTokenService(jwtEncoder, jwtDecoder, properties);
    }

    @Bean
    JwtAuthenticationFilter jwtAuthenticationFilter(
            JwtAccessTokenService jwtAccessTokenService,
            org.springframework.beans.factory.ObjectProvider<LiveAccountValidator> liveAccountValidator,
            org.springframework.beans.factory.ObjectProvider<org.springframework.security.web.util.matcher.RequestMatcher> publicEndpointsMatcher
    ) {
        return new JwtAuthenticationFilter(jwtAccessTokenService, liveAccountValidator.getIfAvailable(), publicEndpointsMatcher.getIfAvailable());
    }

    /**
     * The filter is inserted explicitly into Spring Security's chain. Disable
     * automatic servlet-container registration so it cannot run twice.
     */
    @Bean
    FilterRegistrationBean<JwtAuthenticationFilter> jwtAuthenticationFilterRegistration(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    TokenSessionService tokenSessionService(
            JwtSubjectResolver subjectResolver,
            AccessTokenIssuer accessTokenIssuer,
            RefreshTokenStore refreshTokenStore,
            Clock clock,
            JwtProperties properties
    ) {
        return new TokenSessionService(
                subjectResolver,
                accessTokenIssuer,
                refreshTokenStore,
                clock,
                properties.refreshTokenTtl()
        );
    }

    private static OAuth2TokenValidator<Jwt> jwtValidator(JwtProperties properties, Clock clock) {
        JwtTimestampValidator timestamps = new JwtTimestampValidator(properties.clockSkew());
        timestamps.setAllowEmptyExpiryClaim(false);
        timestamps.setAllowEmptyNotBeforeClaim(false);
        timestamps.setClock(clock);

        JwtIssuedAtValidator issuedAt = new JwtIssuedAtValidator(true);
        issuedAt.setClockSkew(properties.clockSkew());
        issuedAt.setClock(clock);

        return new DelegatingOAuth2TokenValidator<>(
                timestamps,
                issuedAt,
                new JwtIssuerValidator(properties.issuer()),
                new ApplicationAccessTokenValidator(properties.audience())
        );
    }
}
