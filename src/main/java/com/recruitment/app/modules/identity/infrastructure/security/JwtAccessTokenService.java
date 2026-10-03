package com.recruitment.app.modules.identity.infrastructure.security;

import com.recruitment.app.modules.identity.application.AccessTokenIssuer;
import com.recruitment.app.modules.identity.application.IssuedAccessToken;
import com.recruitment.app.modules.identity.application.JwtSubject;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwsHeader;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Mints and verifies only this application's RS256 access JWTs. Google ID and
 * access tokens are never accepted by this service.
 */
public final class JwtAccessTokenService implements AccessTokenIssuer {

    private static final int MAX_COMPACT_TOKEN_LENGTH = 8_192;

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final JwtProperties properties;

    JwtAccessTokenService(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder, JwtProperties properties) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
        this.properties = properties;
    }

    @Override
    public IssuedAccessToken issue(JwtSubject subject, Instant issuedAt) {
        if (subject == null) {
            throw new IllegalArgumentException("JWT subject must not be null");
        }
        if (issuedAt == null) {
            throw new IllegalArgumentException("issued at must not be null");
        }
        Instant expiresAt = issuedAt.plus(properties.accessTokenTtl());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .subject(subject.userId().toString())
                .audience(List.of(properties.audience()))
                .issuedAt(issuedAt)
                .notBefore(issuedAt)
                .expiresAt(expiresAt)
                .id(UUID.randomUUID().toString())
                .claim(ApplicationAccessTokenValidator.TOKEN_USE_CLAIM, ApplicationAccessTokenValidator.ACCESS_TOKEN_USE)
                .claim(ApplicationAccessTokenValidator.ROLES_CLAIM, subject.roleCodes().stream().sorted().toList())
                .claim(ApplicationAccessTokenValidator.CREDENTIAL_VERSION_CLAIM, subject.credentialVersion())
                .build();
        JwsHeader headers = JwsHeader.with(SignatureAlgorithm.RS256)
                .type("JWT")
                .keyId(properties.keyId())
                .build();
        Jwt jwt = jwtEncoder.encode(JwtEncoderParameters.from(headers, claims));
        return new IssuedAccessToken(jwt.getTokenValue(), expiresAt);
    }

    /**
     * Decodes a signed application access token and returns a principal only
     * after all issuer, audience, type, claim, and time checks have passed.
     */
    public JwtPrincipal authenticate(String compactToken) {
        if (compactToken == null || compactToken.isBlank() || compactToken.length() > MAX_COMPACT_TOKEN_LENGTH) {
            throw new InvalidAccessTokenException();
        }
        try {
            Jwt jwt = jwtDecoder.decode(compactToken);
            Set<String> roleCodes = new LinkedHashSet<>(jwt.getClaimAsStringList(ApplicationAccessTokenValidator.ROLES_CLAIM));
            Object cvClaim = jwt.getClaim(ApplicationAccessTokenValidator.CREDENTIAL_VERSION_CLAIM);
            int credentialVersion = cvClaim instanceof Number number ? number.intValue() : 1;
            return new JwtPrincipal(Long.parseLong(jwt.getSubject()), roleCodes, jwt.getId(), credentialVersion);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new InvalidAccessTokenException(exception);
        }
    }
}
