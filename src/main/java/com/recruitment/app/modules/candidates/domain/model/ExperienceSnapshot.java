package com.recruitment.app.modules.candidates.domain.model;

import java.time.LocalDate;

public record ExperienceSnapshot(
        Long id,
        String companyName,
        String jobTitle,
        String employmentType,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}
