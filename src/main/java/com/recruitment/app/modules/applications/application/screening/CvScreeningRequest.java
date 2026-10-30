package com.recruitment.app.modules.applications.application.screening;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

/**
 * The minimum job-related content required by a CV screening provider.
 *
 * <p>Do not place identifiers, application notes, protected-characteristic data, or arbitrary
 * recruiter instructions in this object. The infrastructure adapter applies a second layer of
 * direct-identifier redaction before a provider receives the content.</p>
 */
public record CvScreeningRequest(
        String jobTitle,
        String jobDescription,
        List<String> requiredCriteria,
        String resumeText
) {

    private static final int MAX_ABSOLUTE_TEXT_LENGTH = 120_000;
    private static final int MAX_CRITERIA = 100;

    public CvScreeningRequest {
        jobTitle = requireText(jobTitle, "job title", 500);
        jobDescription = requireText(jobDescription, "job description", MAX_ABSOLUTE_TEXT_LENGTH);
        resumeText = requireText(resumeText, "resume text", MAX_ABSOLUTE_TEXT_LENGTH);
        requiredCriteria = normalizeCriteria(requiredCriteria);
    }

    private static List<String> normalizeCriteria(List<String> values) {
        Objects.requireNonNull(values, "required criteria must not be null");
        if (values.size() > MAX_CRITERIA) {
            throw new IllegalArgumentException("required criteria must not contain more than " + MAX_CRITERIA + " items");
        }

        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String value : values) {
            normalized.add(requireText(value, "required criterion", 500));
        }
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("at least one required criterion is required");
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
}
