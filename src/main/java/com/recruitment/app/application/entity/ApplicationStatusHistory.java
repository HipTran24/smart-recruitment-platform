package com.recruitment.app.application.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import com.recruitment.app.identity.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "application_status_histories",
        indexes = @Index(name = "idx_application_status_histories_application_id", columnList = "job_application_id")
)
public class ApplicationStatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_application_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_application_status_histories_application")
    )
    private JobApplication jobApplication;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private JobApplication.ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private JobApplication.ApplicationStatus toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "changed_by_user_id",
            foreignKey = @ForeignKey(name = "fk_application_status_histories_changed_by")
    )
    private User changedBy;

    @Column(columnDefinition = "TEXT")
    private String note;

    public ApplicationStatusHistory(
            JobApplication jobApplication,
            JobApplication.ApplicationStatus fromStatus,
            JobApplication.ApplicationStatus toStatus,
            User changedBy,
            String note
    ) {
        this.jobApplication = jobApplication;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedBy = changedBy;
        this.note = note;
    }
}
