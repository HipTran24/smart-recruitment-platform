package com.recruitment.app.modules.applications.domain.model;

import java.time.Instant;
import java.time.LocalDate;

public record KpiQuery(LocalDate from, LocalDate to, String timezone, Instant startInclusive,
                       Instant endExclusive, Long jobId, String source) {}
