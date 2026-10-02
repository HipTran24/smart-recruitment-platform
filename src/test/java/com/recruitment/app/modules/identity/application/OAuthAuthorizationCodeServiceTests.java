package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.infrastructure.security.oauth.GoogleOAuthProperties;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.OAuthAuthorizationCode;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.OAuthAuthorizationCodeRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OAuthAuthorizationCodeServiceTests {

    private static final Instant NOW = Instant.parse("2026-09-29T00:00:00Z");

    @Test
    void issuesOnlyHashAndConsumesTheBrowserHandoffCodeOnce() throws Exception {
        OAuthAuthorizationCodeRepository repository = mock(OAuthAuthorizationCodeRepository.class);
        OAuthAuthorizationCodeService service = new OAuthAuthorizationCodeService(
                repository,
                new GoogleOAuthProperties(true, "client", "secret", null, Duration.ofMinutes(1)),
                Clock.fixed(NOW, ZoneOffset.UTC)
        );

        String verifier = "a".repeat(43);
        String transactionId = "t".repeat(43);
        OAuthAuthorizationCodeService.IssuedAuthorizationCode issued = service.issueFor(
                42L,
                codeChallenge(verifier),
                transactionId
        );
        ArgumentCaptor<OAuthAuthorizationCode> persisted = ArgumentCaptor.forClass(OAuthAuthorizationCode.class);
        verify(repository).save(persisted.capture());

        OAuthAuthorizationCode code = persisted.getValue();
        assertEquals(43, issued.rawCode().length());
        assertNotEquals(issued.rawCode(), code.getCodeHash());
        assertEquals(sha256(issued.rawCode()), code.getCodeHash());
        assertEquals(transactionId, code.getTransactionId());
        assertEquals(transactionId, issued.transactionId());
        assertEquals(NOW.plus(Duration.ofMinutes(1)), code.getExpiresAt());

        when(repository.findByCodeHashForUpdate(eq(code.getCodeHash()))).thenReturn(Optional.of(code));
        assertEquals(42L, service.consume(issued.rawCode(), verifier, transactionId));
        assertEquals(NOW, code.getConsumedAt());
        assertThrows(OAuthIdentityException.class, () -> service.consume(issued.rawCode(), verifier, transactionId));
    }

    @Test
    void rejectsMalformedCodesBeforeQueryingPersistence() {
        OAuthAuthorizationCodeRepository repository = mock(OAuthAuthorizationCodeRepository.class);
        OAuthAuthorizationCodeService service = new OAuthAuthorizationCodeService(
                repository,
                new GoogleOAuthProperties(true, "client", "secret", null, Duration.ofMinutes(1)),
                Clock.fixed(NOW, ZoneOffset.UTC)
        );

        assertThrows(OAuthIdentityException.class, () -> service.consume(
                "not-a-valid-code",
                "a".repeat(43),
                "t".repeat(43)
        ));
        verify(repository, org.mockito.Mockito.never()).findByCodeHashForUpdate(any());
    }

    @Test
    void consumesTheCodeWhenItsTransactionDoesNotMatch() throws Exception {
        OAuthAuthorizationCodeRepository repository = mock(OAuthAuthorizationCodeRepository.class);
        OAuthAuthorizationCodeService service = new OAuthAuthorizationCodeService(
                repository,
                new GoogleOAuthProperties(true, "client", "secret", null, Duration.ofMinutes(1)),
                Clock.fixed(NOW, ZoneOffset.UTC)
        );

        String verifier = "a".repeat(43);
        OAuthAuthorizationCodeService.IssuedAuthorizationCode issued = service.issueFor(
                42L,
                codeChallenge(verifier),
                "t".repeat(43)
        );
        ArgumentCaptor<OAuthAuthorizationCode> persisted = ArgumentCaptor.forClass(OAuthAuthorizationCode.class);
        verify(repository).save(persisted.capture());
        OAuthAuthorizationCode code = persisted.getValue();
        when(repository.findByCodeHashForUpdate(eq(code.getCodeHash()))).thenReturn(Optional.of(code));

        assertThrows(OAuthIdentityException.class, () -> service.consume(
                issued.rawCode(),
                verifier,
                "u".repeat(43)
        ));
        assertEquals(NOW, code.getConsumedAt());
    }

    private static String sha256(String value) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.US_ASCII)));
    }

    private static String codeChallenge(String verifier) throws Exception {
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII))
        );
    }
}
