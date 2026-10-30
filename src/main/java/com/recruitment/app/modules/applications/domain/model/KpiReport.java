package com.recruitment.app.modules.applications.domain.model;

import java.time.Instant;
import java.util.Map;

public record KpiReport(KpiQuery filters, Instant generatedAt, long applications,
                        Map<String, Long> stageReachCounts, Map<String, Long> bySource) {}
