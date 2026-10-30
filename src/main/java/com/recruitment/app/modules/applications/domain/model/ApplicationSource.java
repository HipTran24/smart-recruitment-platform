package com.recruitment.app.modules.applications.domain.model;

import java.util.Locale;

/** Self-reported attribution, never an authorization or trusted billing signal. */
public final class ApplicationSource {
    private ApplicationSource() {}
    public static String normalize(String value) {
        if (value == null || value.isBlank()) return "UNKNOWN";
        String source = value.strip().toUpperCase(Locale.ROOT);
        if (!source.matches("[A-Z0-9][A-Z0-9_-]{0,63}")) {
            throw new IllegalArgumentException("source must be a slug of 1 to 64 characters");
        }
        return source;
    }
}
