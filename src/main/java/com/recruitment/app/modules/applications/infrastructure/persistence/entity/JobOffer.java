package com.recruitment.app.modules.applications.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "job_offers",
        indexes = {
                @Index(name = "idx_job_offers_application", columnList = "job_application_id"),
                @Index(name = "idx_job_offers_candidate", columnList = "candidate_user_id, status")
        }
)
public class JobOffer extends BaseEntity {

    @Column(name = "job_application_id", nullable = false)
    private Long jobApplicationId;

    @Column(name = "candidate_user_id", nullable = false)
    private Long candidateUserId;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(name = "salary_offered", precision = 15, scale = 2, nullable = false)
    private BigDecimal salaryOffered;

    @Column(name = "salary_currency", nullable = false, length = 3)
    private String salaryCurrency = "VND";

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private Instant deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OfferStatus status = OfferStatus.DRAFT;

    @Column(name = "terms_version", nullable = false)
    private Integer termsVersion = 1;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "candidate_comment", columnDefinition = "TEXT")
    private String candidateComment;

    @Column(name = "responded_at")
    private Instant respondedAt;

    public JobOffer(
            Long jobApplicationId,
            Long candidateUserId,
            Long createdByUserId,
            BigDecimal salaryOffered,
            String salaryCurrency,
            LocalDate startDate,
            Instant deadline,
            String notes
    ) {
        this.jobApplicationId = jobApplicationId;
        this.candidateUserId = candidateUserId;
        this.createdByUserId = createdByUserId;
        this.salaryOffered = salaryOffered;
        this.salaryCurrency = salaryCurrency != null ? salaryCurrency : "VND";
        this.startDate = startDate;
        this.deadline = deadline;
        this.notes = notes;
        this.status = OfferStatus.DRAFT;
    }

    public void send() {
        if (status != OfferStatus.DRAFT) {
            throw new IllegalStateException("only draft offers can be sent");
        }
        this.status = OfferStatus.SENT;
    }

    public void accept(String comment, Instant now) {
        if (status != OfferStatus.SENT) {
            throw new IllegalStateException("only sent offers can be accepted");
        }
        if (now.isAfter(deadline)) {
            throw new IllegalStateException("offer has expired");
        }
        this.status = OfferStatus.ACCEPTED;
        this.candidateComment = comment;
        this.respondedAt = now;
    }

    public void decline(String comment, Instant now) {
        if (status != OfferStatus.SENT) {
            throw new IllegalStateException("only sent offers can be declined");
        }
        this.status = OfferStatus.DECLINED;
        this.candidateComment = comment;
        this.respondedAt = now;
    }

    public void withdraw() {
        this.status = OfferStatus.WITHDRAWN;
    }

    public enum OfferStatus {
        DRAFT,
        SENT,
        ACCEPTED,
        DECLINED,
        WITHDRAWN
    }
}
