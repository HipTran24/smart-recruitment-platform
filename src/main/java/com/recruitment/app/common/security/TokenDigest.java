package com.recruitment.app.common.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.regex.Pattern;

/**
 * Canonical digest, token formatting, and cryptographically secure random material utility.
 */
public final class TokenDigest {

    public static final String OPAQUE_TOKEN_REGEX = "[A-Za-z0-9_-]{43}";
    public static final Pattern OPAQUE_TOKEN_PATTERN = Pattern.compile(OPAQUE_TOKEN_REGEX);

    public static final String FLEXIBLE_TOKEN_REGEX = "[A-Za-z0-9_-]{43,128}";
    public static final Pattern FLEXIBLE_TOKEN_PATTERN = Pattern.compile(FLEXIBLE_TOKEN_REGEX);

    public static final String SHA256_HEX_REGEX = "[a-f0-9]{64}";
    public static final Pattern SHA256_HEX_PATTERN = Pattern.compile(SHA256_HEX_REGEX);

    public static final String PKCE_CODE_VERIFIER_REGEX = "[A-Za-z0-9\\-._~]{43,128}";
    public static final Pattern PKCE_CODE_VERIFIER_PATTERN = Pattern.compile(PKCE_CODE_VERIFIER_REGEX);

    public static final String ROLE_CODE_REGEX = "ROLE_[A-Z0-9_]{1,45}";
    public static final Pattern ROLE_CODE_PATTERN = Pattern.compile(ROLE_CODE_REGEX);

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

    private TokenDigest() {
    }

    public static String newOpaqueToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return URL_ENCODER.encodeToString(bytes);
    }

    public static String newOpaqueToken(int byteLength) {
        byte[] bytes = new byte[byteLength];
        SECURE_RANDOM.nextBytes(bytes);
        return URL_ENCODER.encodeToString(bytes);
    }

    public static String sha256Hex(String input) {
        if (input == null) {
            throw new IllegalArgumentException("input must not be null");
        }
        return HexFormat.of().formatHex(digest(input.getBytes(StandardCharsets.UTF_8)));
    }

    public static String sha256Base64Url(String input) {
        if (input == null) {
            throw new IllegalArgumentException("input must not be null");
        }
        return URL_ENCODER.encodeToString(digest(input.getBytes(StandardCharsets.UTF_8)));
    }

    public static String sha256Base64Url(byte[] input) {
        if (input == null) {
            throw new IllegalArgumentException("input must not be null");
        }
        return URL_ENCODER.encodeToString(digest(input));
    }

    private static byte[] digest(byte[] bytes) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm must be available", e);
        }
    }
}
