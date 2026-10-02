package com.recruitment.app.modules.identity.infrastructure.security;

import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.Signature;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Loads a PKCS#8 RSA private key and X.509 RSA public key from mounted PEM
 * resources, verifies that they form a pair, and rejects weak RSA keys.
 */
final class RsaJwtKeyLoader {

    private static final int MIN_RSA_KEY_SIZE_BITS = 2048;

    RsaJwtKeyPair load(JwtProperties properties) {
        try {
            RSAPrivateKey privateKey = readPrivateKey(properties.privateKeyLocation());
            RSAPublicKey publicKey = readPublicKey(properties.publicKeyLocation());
            validateKeyStrength(publicKey);
            verifyKeyPair(publicKey, privateKey);
            return new RsaJwtKeyPair(publicKey, privateKey);
        } catch (IOException | GeneralSecurityException | RuntimeException exception) {
            throw new IllegalStateException("JWT signing key material is invalid", exception);
        }
    }

    private static RSAPrivateKey readPrivateKey(Resource resource) throws IOException, GeneralSecurityException {
        String pem = readPem(resource);
        if (!pem.contains("-----BEGIN PRIVATE KEY-----")) {
            throw new IllegalArgumentException("JWT private key must be a PKCS#8 PEM (BEGIN PRIVATE KEY)");
        }
        byte[] encoded = decodePem(pem);
        return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(encoded));
    }

    private static RSAPublicKey readPublicKey(Resource resource) throws IOException, GeneralSecurityException {
        String pem = readPem(resource);
        if (!pem.contains("-----BEGIN PUBLIC KEY-----")) {
            throw new IllegalArgumentException("JWT public key must be an X.509 PEM (BEGIN PUBLIC KEY)");
        }
        byte[] encoded = decodePem(pem);
        return (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(new X509EncodedKeySpec(encoded));
    }

    private static String readPem(Resource resource) throws IOException {
        try (var inputStream = resource.getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.US_ASCII)
                    .replace("\\n", "\n")
                    .strip();
        }
    }

    private static byte[] decodePem(String pem) {
        String base64 = pem
                .replaceAll("-----BEGIN [A-Z ]+-----", "")
                .replaceAll("-----END [A-Z ]+-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(base64);
    }

    private static void validateKeyStrength(RSAPublicKey publicKey) {
        if (publicKey.getModulus().bitLength() < MIN_RSA_KEY_SIZE_BITS) {
            throw new IllegalArgumentException("JWT RSA key must be at least " + MIN_RSA_KEY_SIZE_BITS + " bits");
        }
    }

    private static void verifyKeyPair(RSAPublicKey publicKey, RSAPrivateKey privateKey)
            throws GeneralSecurityException {
        byte[] challenge = "smart-recruitment-jwt-key-check".getBytes(StandardCharsets.US_ASCII);
        Signature signer = Signature.getInstance("SHA256withRSA");
        signer.initSign(privateKey);
        signer.update(challenge);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance("SHA256withRSA");
        verifier.initVerify(publicKey);
        verifier.update(challenge);
        if (!verifier.verify(signature)) {
            throw new IllegalArgumentException("JWT public and private keys do not form a pair");
        }
    }
}
