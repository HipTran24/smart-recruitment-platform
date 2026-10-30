package com.recruitment.app.modules.applications.application.screening;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Objects;

/**
 * Computes a versioned SHA-256 fingerprint of the exact job-related input sent to a screening
 * provider. Raw resume content is never persisted by this helper.
 */
public final class CvScreeningInputFingerprint {

    private static final byte[] FORMAT_VERSION = "cv-screening-input-v1".getBytes(StandardCharsets.US_ASCII);

    private CvScreeningInputFingerprint() {
    }

    public static String sha256(CvScreeningRequest request) {
        Objects.requireNonNull(request, "CV screening request must not be null");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            appendBytes(digest, FORMAT_VERSION);
            appendText(digest, "jobTitle", request.jobTitle());
            appendText(digest, "jobDescription", request.jobDescription());
            appendLength(digest, request.requiredCriteria().size());
            for (String criterion : request.requiredCriteria()) {
                appendText(digest, "requiredCriterion", criterion);
            }
            appendText(digest, "resumeText", request.resumeText());
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static void appendText(MessageDigest digest, String fieldName, String value) {
        appendBytes(digest, fieldName.getBytes(StandardCharsets.US_ASCII));
        appendBytes(digest, value.getBytes(StandardCharsets.UTF_8));
    }

    private static void appendBytes(MessageDigest digest, byte[] bytes) {
        appendLength(digest, bytes.length);
        digest.update(bytes);
    }

    private static void appendLength(MessageDigest digest, int value) {
        if (value < 0) {
            throw new IllegalArgumentException("fingerprint field length must not be negative");
        }
        digest.update(ByteBuffer.allocate(Integer.BYTES).putInt(value).array());
    }
}
