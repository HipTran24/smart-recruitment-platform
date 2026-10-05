package com.recruitment.app.modules.applications.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record OfferSnapshot(
        Long id,
        Long jobApplicationId,
        Long candidateUserId,
        Long createdByUserId,
        BigDecimal salaryOffered,
        String salaryCurrency,
        LocalDate startDate,
        Instant deadline,
        String status,
        Integer termsVersion,
        String notes,
        String candidateComment,
        Instant respondedAt
) {}
