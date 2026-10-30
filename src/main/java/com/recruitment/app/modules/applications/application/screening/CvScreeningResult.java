package com.recruitment.app.modules.applications.application.screening;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * Provider-neutral, job-related screening result. It is advisory evidence for a recruiter and is
 * not an automated hiring decision.
 */
public record CvScreeningResult(
        int score,
        Recommendation recommendation,
        String summary,
        List<String> matchedCriteria,
        List<String> missingCriteria,
        List<String> limitations,
        String provider,
        String model,
        String promptVersion
) {

    private static final int MAX_SUMMARY_LENGTH = 4_000;
    private static final int MAX_LIST_ITEMS = 40;
    private static final int MAX_LIST_ITEM_LENGTH = 600;

    public CvScreeningResult {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("screening score must be between 0 and 100");
        }
        recommendation = Objects.requireNonNull(recommendation, "recommendation must not be null");
        summary = requireText(summary, "summary", MAX_SUMMARY_LENGTH);
        matchedCriteria = normalizeList(matchedCriteria, "matched criteria");
        missingCriteria = normalizeList(missingCriteria, "missing criteria");
        limitations = normalizeList(limitations, "limitations");
        provider = requireText(provider, "provider", 100);
        model = requireText(model, "model", 100);
        promptVersion = requireText(promptVersion, "prompt version", 100);
    }

    private static List<String> normalizeList(List<String> values, String field) {
        Objects.requireNonNull(values, field + " must not be null");
        if (values.size() > MAX_LIST_ITEMS) {
            throw new IllegalArgumentException(field + " exceeds the allowed number of items");
        }
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String value : values) {
            normalized.add(requireText(value, field + " item", MAX_LIST_ITEM_LENGTH));
        }
        return List.copyOf(new ArrayList<>(normalized));
    }

    private static String requireText(String value, String field, int maximumLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        String normalized = value.strip();
        if (normalized.length() > maximumLength) {
            throw new IllegalArgumentException(field + " exceeds the allowed length");
        }
        return normalized;
    }

    public enum Recommendation {
        RECOMMENDED,
        REVIEW,
        NOT_RECOMMENDED;

        public static Recommendation fromProviderValue(String value) {
            if (value == null) {
                throw new IllegalArgumentException("recommendation must not be null");
            }
            try {
                return valueOf(value.strip().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException exception) {
                throw new IllegalArgumentException("unsupported recommendation returned by screening provider", exception);
            }
        }
    }
}
