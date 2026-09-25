package com.recruitment.app.candidate.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "candidate_resumes",
        indexes = @Index(name = "idx_candidate_resumes_profile_id", columnList = "candidate_profile_id"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_candidate_resumes_storage_key",
                columnNames = "storage_key"
        )
)
public class CandidateResume extends BaseEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "candidate_profile_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_candidate_resumes_profile")
    )
    private CandidateProfile candidateProfile;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "is_primary", nullable = false)
    private boolean primaryResume;

    public CandidateResume(
            CandidateProfile candidateProfile,
            String originalFileName,
            String storageKey,
            String contentType,
            Long fileSizeBytes
    ) {
        this.originalFileName = originalFileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        candidateProfile.addResume(this);
    }

    void attachTo(CandidateProfile candidateProfile) {
        if (this.candidateProfile != null && this.candidateProfile != candidateProfile) {
            throw new IllegalStateException("resume cannot be moved to another candidate profile");
        }
        this.candidateProfile = candidateProfile;
    }

    void markAsPrimary() {
        primaryResume = true;
    }

    void unmarkAsPrimary() {
        primaryResume = false;
    }
}
