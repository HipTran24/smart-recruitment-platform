package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import com.recruitment.app.modules.identity.application.port.out.OAuthAuthorizationCodeStore;
import com.recruitment.app.modules.identity.domain.model.OAuthCodeSnapshot;
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
import java.util.concurrent.atomic.AtomicReference;

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
        OAuthAuthorizationCodeStore store = mock(OAuthAuthorizationCodeStore.class);
        OAuthAuthorizationCodeService service = new OAuthAuthorizationCodeService(
                store,
                Clock.fixed(NOW, ZoneOffset.UTC),
                Duration.ofMinutes(1)
        );

        String verifier = "a".repeat(43);
        String transactionId = "t".repeat(43);
        OAuthAuthorizationCodeService.IssuedAuthorizationCode issued = service.issueFor(
                42L,
                codeChallenge(verifier),
                transactionId
        );

        ArgumentCaptor<String> hashCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Instant> expiresCaptor = ArgumentCaptor.forClass(Instant.class);
        verify(store).save(eq(42L), hashCaptor.capture(), eq(codeChallenge(verifier)), eq(transactionId), expiresCaptor.capture());

        String savedHash = hashCaptor.getValue();
        assertEquals(43, issued.rawCode().length());
        assertNotEquals(issued.rawCode(), savedHash);
        assertEquals(sha256(issued.rawCode()), savedHash);
        assertEquals(transactionId, issued.transactionId());
        assertEquals(NOW.plus(Duration.ofMinutes(1)), expiresCaptor.getValue());

        AtomicReference<Instant> consumedAt = new AtomicReference<>();
        when(store.lockByCodeHash(eq(savedHash))).thenAnswer(invocation -> {
            OAuthCodeSnapshot snapshot = new OAuthCodeSnapshot(
                    1L,
                    42L,
                    savedHash,
                    codeChallenge(verifier),
                    transactionId,
                    NOW.plus(Duration.ofMinutes(1)),
                    consumedAt.get()
            );
            return Optional.of(snapshot);
        });
        org.mockito.Mockito.doAnswer(invocation -> {
            consumedAt.set(invocation.getArgument(1));
            return null;
        }).when(store).markConsumed(eq(1L), any(Instant.class));

        assertEquals(42L, service.consume(issued.rawCode(), verifier, transactionId));
        assertEquals(NOW, consumedAt.get());
        assertThrows(OAuthIdentityException.class, () -> service.consume(issued.rawCode(), verifier, transactionId));
    }

    @Test
    void rejectsMalformedCodesBeforeQueryingPersistence() {
        OAuthAuthorizationCodeStore store = mock(OAuthAuthorizationCodeStore.class);
        OAuthAuthorizationCodeService service = new OAuthAuthorizationCodeService(
                store,
                Clock.fixed(NOW, ZoneOffset.UTC),
                Duration.ofMinutes(1)
        );

        assertThrows(OAuthIdentityException.class, () -> service.consume(
                "not-a-valid-code",
                "a".repeat(43),
                "t".repeat(43)
        ));
        verify(store, org.mockito.Mockito.never()).lockByCodeHash(any());
    }

    @Test
    void consumesTheCodeWhenItsTransactionDoesNotMatch() throws Exception {
        OAuthAuthorizationCodeStore store = mock(OAuthAuthorizationCodeStore.class);
        OAuthAuthorizationCodeService service = new OAuthAuthorizationCodeService(
                store,
                Clock.fixed(NOW, ZoneOffset.UTC),
                Duration.ofMinutes(1)
        );

        String verifier = "a".repeat(43);
        OAuthAuthorizationCodeService.IssuedAuthorizationCode issued = service.issueFor(
                42L,
                codeChallenge(verifier),
                "t".repeat(43)
        );
        ArgumentCaptor<String> hashCaptor = ArgumentCaptor.forClass(String.class);
        verify(store).save(eq(42L), hashCaptor.capture(), eq(codeChallenge(verifier)), eq("t".repeat(43)), any());

        String savedHash = hashCaptor.getValue();
        OAuthCodeSnapshot snapshot = new OAuthCodeSnapshot(
                1L,
                42L,
                savedHash,
                codeChallenge(verifier),
                "t".repeat(43),
                NOW.plus(Duration.ofMinutes(1)),
                null
        );
        when(store.lockByCodeHash(eq(savedHash))).thenReturn(Optional.of(snapshot));

        assertThrows(OAuthIdentityException.class, () -> service.consume(
                issued.rawCode(),
                verifier,
                "u".repeat(43)
        ));
        verify(store).markConsumed(eq(1L), eq(NOW));
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
