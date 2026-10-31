package com.recruitment.app.modules.applications.application.screening;

/** The output contract is part of the cache key, including the response language. */
public final class CvScreeningPolicy {
    public static final String PROMPT_VERSION = "gemini-cv-screening-v2-vi";
    public static final String DEEPSEEK_PROMPT_VERSION = "deepseek-cv-screening-v1-vi";
    private CvScreeningPolicy() {}
}
