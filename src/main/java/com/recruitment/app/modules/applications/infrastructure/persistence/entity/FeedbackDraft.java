package com.recruitment.app.modules.applications.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "feedback_drafts",
        indexes = @Index(name = "idx_feedback_drafts_application", columnList = "job_application_id")
)
public class FeedbackDraft extends BaseEntity {

    @Column(name = "job_application_id", nullable = false)
    private Long jobApplicationId;

    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DraftStatus status = DraftStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", length = 20)
    private DeliveryStatus deliveryStatus;

    @Column(name = "approved_by_user_id")
    private Long approvedByUserId;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    public FeedbackDraft(Long jobApplicationId, Long authorUserId, String content) {
        this.jobApplicationId = jobApplicationId;
        this.authorUserId = authorUserId;
        this.content = content;
        this.status = DraftStatus.DRAFT;
    }

    public void updateContent(String newContent) {
        this.content = newContent;
        // If content is edited after approval, must re-approve per ADR
        if (this.status == DraftStatus.APPROVED) {
            this.status = DraftStatus.DRAFT;
            this.approvedByUserId = null;
            this.approvedAt = null;
        }
    }

    public void approve(Long approverUserId, Instant now) {
        this.status = DraftStatus.APPROVED;
        this.approvedByUserId = approverUserId;
        this.approvedAt = now;
    }

    public void send(Instant now) {
        if (this.status != DraftStatus.APPROVED) {
            throw new IllegalStateException("feedback must be approved by recruiter before sending");
        }
        this.status = DraftStatus.SENT;
        this.deliveryStatus = DeliveryStatus.DELIVERED;
        this.sentAt = now;
    }

    public enum DraftStatus {
        DRAFT,
        APPROVED,
        SENT
    }

    public enum DeliveryStatus {
        QUEUED,
        DELIVERED,
        FAILED
    }
}
