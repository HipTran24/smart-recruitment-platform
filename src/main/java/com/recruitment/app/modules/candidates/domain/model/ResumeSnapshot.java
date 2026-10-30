package com.recruitment.app.modules.candidates.domain.model;

import java.time.Instant;

public record ResumeSnapshot(
        Long id,
        Long profileId,
        String originalFileName,
        String storageKey,
        String contentType,
        Long fileSizeBytes,
        boolean primaryResume,
        String scanStatus,
        String parsedText,
        Instant createdAt
) {}
