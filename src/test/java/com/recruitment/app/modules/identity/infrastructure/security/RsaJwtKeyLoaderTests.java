package com.recruitment.app.modules.identity.infrastructure.security;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.Duration;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RsaJwtKeyLoaderTests {

    @Test
    void loadsMatchingPkcs8AndX509PemResources() throws Exception {
        KeyPair keyPair = rsaKeyPair(2048);
        JwtProperties properties = properties(keyPair);

        RsaJwtKeyPair loaded = new RsaJwtKeyLoader().load(properties);

        assertEquals(keyPair.getPublic(), loaded.publicKey());
        assertEquals(keyPair.getPrivate(), loaded.privateKey());
    }

    @Test
    void rejectsWeakRsaKeysAtStartup() throws Exception {
        KeyPair weakKeyPair = rsaKeyPair(1024);

        assertThrows(IllegalStateException.class, () -> new RsaJwtKeyLoader().load(properties(weakKeyPair)));
    }

    private static KeyPair rsaKeyPair(int bits) throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(bits);
        return generator.generateKeyPair();
    }

    private static JwtProperties properties(KeyPair keyPair) {
        return new JwtProperties(
                "https://smart-recruitment.test",
                "smart-recruitment-api",
                "test-key-2026",
                new ByteArrayResource(pem("PRIVATE KEY", keyPair.getPrivate().getEncoded()).getBytes(StandardCharsets.US_ASCII)),
                new ByteArrayResource(pem("PUBLIC KEY", keyPair.getPublic().getEncoded()).getBytes(StandardCharsets.US_ASCII)),
                Duration.ofMinutes(15),
                Duration.ofDays(30),
                Duration.ZERO
        );
    }

    private static String pem(String label, byte[] encoded) {
        String payload = Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.US_ASCII)).encodeToString(encoded);
        return "-----BEGIN " + label + "-----\n" + payload + "\n-----END " + label + "-----\n";
    }
}
