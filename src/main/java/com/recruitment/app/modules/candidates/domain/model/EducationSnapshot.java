package com.recruitment.app.modules.candidates.domain.model;

import java.time.LocalDate;

public record EducationSnapshot(
        Long id,
        String institutionName,
        String degree,
        String fieldOfStudy,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}
