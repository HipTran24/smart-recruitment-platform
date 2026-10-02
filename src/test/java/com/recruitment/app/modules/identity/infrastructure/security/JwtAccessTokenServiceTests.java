package com.recruitment.app.modules.identity.infrastructure.security;

import com.recruitment.app.modules.identity.application.JwtSubject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtAccessTokenServiceTests {

    private static final Instant NOW = Instant.parse("2026-09-29T12:00:00Z");
    private static final Clock CLOCK = Clock.fixed(NOW, ZoneOffset.UTC);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void issuesAndAuthenticatesAnRs256ApplicationAccessToken() throws Exception {
        JwtFixture fixture = JwtFixture.create();

        String rawToken = fixture.service.issue(new JwtSubject(42L, Set.of("ROLE_CANDIDATE", "ROLE_RECRUITER")), NOW)
                .value();
        JwtPrincipal principal = fixture.service.authenticate(rawToken);

        assertEquals(42L, principal.userId());
        assertEquals(Set.of("ROLE_CANDIDATE", "ROLE_RECRUITER"), principal.roleCodes());
        assertEquals("42", principal.getName());
        assertEquals(2, principal.authorities().size());
    }

    @Test
    void rejectsWrongAudienceWrongTokenUseAndExpiredTokens() throws Exception {
        JwtFixture fixture = JwtFixture.create();

        assertThrows(InvalidAccessTokenException.class, () -> fixture.service.authenticate(
                fixture.mint("https://other-issuer.test", fixture.properties.audience(), "access", NOW, NOW.plusSeconds(60))
        ));
        assertThrows(InvalidAccessTokenException.class, () -> fixture.service.authenticate(
                fixture.mint("other-audience", "access", NOW, NOW.plusSeconds(60))
        ));
        assertThrows(InvalidAccessTokenException.class, () -> fixture.service.authenticate(
                fixture.mint(fixture.properties.audience(), "refresh", NOW, NOW.plusSeconds(60))
        ));
        assertThrows(InvalidAccessTokenException.class, () -> fixture.service.authenticate(
                fixture.mint(fixture.properties.audience(), "access", NOW.minusSeconds(61), NOW.minusSeconds(1))
        ));
    }

    @Test
    void rejectsAccessTokensWithoutAtLeastOneRecognizedRole() throws Exception {
        JwtFixture fixture = JwtFixture.create();

        assertThrows(InvalidAccessTokenException.class, () -> fixture.service.authenticate(
                fixture.mint(fixture.properties.audience(), "access", NOW, NOW.plusSeconds(60), List.of())
        ));
    }

    @Test
    void refusesToMintAnUnusableTokenForAnAccountWithoutRoles() throws Exception {
        JwtFixture fixture = JwtFixture.create();

        assertThrows(IllegalArgumentException.class, () -> fixture.service.issue(new JwtSubject(42L, Set.of()), NOW));
    }

    @Test
    void rejectsTokenSignedByASeparateKeyPair() throws Exception {
        JwtFixture fixture = JwtFixture.create();
        KeyPair attackerKeyPair = rsaKeyPair();
        JwtEncoder attackerEncoder = new JwtSecurityConfiguration().jwtEncoder(
                new RsaJwtKeyPair((RSAPublicKey) attackerKeyPair.getPublic(), (RSAPrivateKey) attackerKeyPair.getPrivate()),
                fixture.properties
        );
        String attackerToken = fixture.mint(attackerEncoder, fixture.properties.audience(), "access", NOW, NOW.plusSeconds(60));

        assertThrows(InvalidAccessTokenException.class, () -> fixture.service.authenticate(attackerToken));
    }

    @Test
    void bearerFilterCreatesAuthoritiesOnlyForAValidApplicationToken() throws Exception {
        JwtFixture fixture = JwtFixture.create();
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(fixture.service);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/jobs");
        request.addHeader("Authorization", "Bearer " + fixture.service.issue(new JwtSubject(42L, Set.of("ROLE_CANDIDATE")), NOW).value());
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<Authentication> authentication = new AtomicReference<>();

        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) ->
                authentication.set(SecurityContextHolder.getContext().getAuthentication())
        );

        assertEquals(200, response.getStatus());
        assertTrue(authentication.get().isAuthenticated());
        assertEquals("ROLE_CANDIDATE", authentication.get().getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void bearerFilterReturnsGeneric401ForMalformedOrInvalidTokens() throws Exception {
        JwtFixture fixture = JwtFixture.create();
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(fixture.service);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/jobs");
        request.addHeader("Authorization", "Bearer invalid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> {
            throw new AssertionError("invalid bearer token must not reach the filter chain");
        });

        assertEquals(401, response.getStatus());
        assertEquals("Bearer error=\"invalid_token\"", response.getHeader("WWW-Authenticate"));
        assertTrue(response.getContentAsString().contains("INVALID_ACCESS_TOKEN"));
    }

    private static KeyPair rsaKeyPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        return generator.generateKeyPair();
    }

    private static final class JwtFixture {

        private final JwtProperties properties;
        private final JwtEncoder encoder;
        private final JwtAccessTokenService service;

        private JwtFixture(JwtProperties properties, JwtEncoder encoder, JwtAccessTokenService service) {
            this.properties = properties;
            this.encoder = encoder;
            this.service = service;
        }

        static JwtFixture create() throws Exception {
            KeyPair keyPair = rsaKeyPair();
            JwtProperties properties = new JwtProperties(
                    "https://smart-recruitment.test",
                    "smart-recruitment-api",
                    "test-key-2026",
                    new ByteArrayResource("unused".getBytes(StandardCharsets.US_ASCII)),
                    new ByteArrayResource("unused".getBytes(StandardCharsets.US_ASCII)),
                    Duration.ofMinutes(15),
                    Duration.ofDays(30),
                    Duration.ZERO
            );
            JwtSecurityConfiguration configuration = new JwtSecurityConfiguration();
            RsaJwtKeyPair rsaKeys = new RsaJwtKeyPair(
                    (RSAPublicKey) keyPair.getPublic(),
                    (RSAPrivateKey) keyPair.getPrivate()
            );
            JwtEncoder encoder = configuration.jwtEncoder(rsaKeys, properties);
            JwtDecoder decoder = configuration.jwtDecoder(rsaKeys, properties, CLOCK);
            return new JwtFixture(properties, encoder, configuration.jwtAccessTokenService(encoder, decoder, properties));
        }

        String mint(String audience, String tokenUse, Instant issuedAt, Instant expiresAt) {
            return mint(properties.issuer(), encoder, audience, tokenUse, issuedAt, expiresAt, List.of("ROLE_CANDIDATE"));
        }

        String mint(JwtEncoder signingEncoder, String audience, String tokenUse, Instant issuedAt, Instant expiresAt) {
            return mint(properties.issuer(), signingEncoder, audience, tokenUse, issuedAt, expiresAt, List.of("ROLE_CANDIDATE"));
        }

        String mint(String issuer, String audience, String tokenUse, Instant issuedAt, Instant expiresAt) {
            return mint(issuer, encoder, audience, tokenUse, issuedAt, expiresAt, List.of("ROLE_CANDIDATE"));
        }

        String mint(
                String audience,
                String tokenUse,
                Instant issuedAt,
                Instant expiresAt,
                List<String> roles
        ) {
            return mint(properties.issuer(), encoder, audience, tokenUse, issuedAt, expiresAt, roles);
        }

        String mint(
                String issuer,
                JwtEncoder signingEncoder,
                String audience,
                String tokenUse,
                Instant issuedAt,
                Instant expiresAt,
                List<String> roles
        ) {
            JwtClaimsSet claims = JwtClaimsSet.builder()
                    .issuer(issuer)
                    .subject("42")
                    .audience(List.of(audience))
                    .issuedAt(issuedAt)
                    .notBefore(issuedAt)
                    .expiresAt(expiresAt)
                    .id(UUID.randomUUID().toString())
                    .claim(ApplicationAccessTokenValidator.TOKEN_USE_CLAIM, tokenUse)
                    .claim(ApplicationAccessTokenValidator.ROLES_CLAIM, roles)
                    .build();
            Jwt jwt = signingEncoder.encode(JwtEncoderParameters.from(
                    JwsHeader.with(SignatureAlgorithm.RS256).type("JWT").keyId(properties.keyId()).build(),
                    claims
            ));
            return jwt.getTokenValue();
        }
    }
}
