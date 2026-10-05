package com.recruitment.app.modules.applications.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class ApplicationDtos {
    private ApplicationDtos() {}

    public record ApplicationResponse(
            Long id,
            Long jobId,
            String jobTitle,
            Long candidateProfileId,
            String candidateName,
            String candidateEmail,
            Long candidateResumeId,
            String status,
            String coverLetter,
            Instant withdrawnAt,
            Instant createdAt,
            Integer screeningScore,
            String screeningRecommendation,
            String screeningSummary,
            String matchedCriteria,
            String missingCriteria,
            List<StatusHistoryDto> histories
    ) {
        public String stage() { return status; }
        public Integer aiScore() { return screeningScore; }
        public Instant submittedAt() { return createdAt; }
        public Instant updatedAt() { return createdAt; }
    }

    public record StatusHistoryDto(
            Long id,
            String fromStatus,
            String toStatus,
            Long changedByUserId,
            String note,
            Instant createdAt
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ApplyRequest(
            @JsonAlias({"resumeId", "candidateResumeId"})
            Long candidateResumeId,
            String coverLetter
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TransitionStageRequest(
            String stage,
            String note
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record WithdrawRequest(
            String note
    ) {}

    public record InterviewResponse(
            Long id,
            Long jobApplicationId,
            Long candidateUserId,
            Long recruiterUserId,
            String title,
            Instant scheduledAt,
            Integer durationMinutes,
            String locationOrUrl,
            String status,
            String timezone,
            String notes
    ) {
        public String interviewType() { return title; }
        public String meetingUrl() { return locationOrUrl; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ScheduleInterviewRequest(
            Long jobApplicationId,
            Long candidateUserId,
            @JsonAlias({"interviewType", "title"})
            String title,
            Instant scheduledAt,
            Integer durationMinutes,
            @JsonAlias({"meetingUrl", "locationOrUrl"})
            String locationOrUrl,
            String timezone,
            String notes
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RescheduleInterviewRequest(
            Instant scheduledAt,
            Integer durationMinutes,
            @JsonAlias({"meetingUrl", "locationOrUrl"})
            String locationOrUrl,
            String notes
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CancelInterviewRequest(
            String reason
    ) {}

    public record OfferResponse(
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
    ) {
        public String currency() { return salaryCurrency; }
        public Instant expiresAt() { return deadline; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CreateOfferRequest(
            Long jobApplicationId,
            Long candidateUserId,
            BigDecimal salaryOffered,
            @JsonAlias({"currency", "salaryCurrency"})
            String salaryCurrency,
            LocalDate startDate,
            @JsonAlias({"expiresAt", "deadline"})
            Instant deadline,
            String notes
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RespondOfferRequest(
            String comment,
            String action
    ) {}

    public record EvaluationResponse(
            Long id,
            Long jobApplicationId,
            Long evaluatorUserId,
            Integer score,
            String recommendation,
            String technicalNotes,
            String culturalFitNotes,
            String strengths,
            String areasForGrowth
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CreateEvaluationRequest(
            Integer score,
            String recommendation,
            String technicalNotes,
            String culturalFitNotes,
            String strengths,
            String areasForGrowth
    ) {}

    public record FeedbackDraftResponse(
            Long id,
            Long jobApplicationId,
            Long authorUserId,
            String content,
            String status,
            String deliveryStatus,
            Long approvedByUserId,
            Instant approvedAt,
            Instant sentAt
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CreateFeedbackDraftRequest(
            Long jobApplicationId,
            String content
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UpdateFeedbackDraftRequest(
            String content
    ) {}

    public record PageDto<T>(
            List<T> items,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}
}
