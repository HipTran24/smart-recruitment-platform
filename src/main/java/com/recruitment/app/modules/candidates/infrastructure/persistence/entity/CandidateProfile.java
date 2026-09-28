package com.recruitment.app.modules.candidates.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "candidate_profiles",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_candidate_profiles_user_id",
                columnNames = "user_id"
        )
)
public class CandidateProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String headline;

    @Column(length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @OneToMany(
            mappedBy = "candidateProfile",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CandidateEducation> educations = new ArrayList<>();

    @OneToMany(
            mappedBy = "candidateProfile",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CandidateExperience> experiences = new ArrayList<>();

    @OneToMany(
            mappedBy = "candidateProfile",
            fetch = FetchType.LAZY,
            cascade = {CascadeType.PERSIST, CascadeType.MERGE}
    )
    private List<CandidateResume> resumes = new ArrayList<>();

    @OneToMany(
            mappedBy = "candidateProfile",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CandidateSkill> skills = new ArrayList<>();

    public CandidateProfile(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        this.userId = userId;
    }

    public void updateProfile(String phone, String headline, String city, String bio) {
        this.phone = phone;
        this.headline = headline;
        this.city = city;
        this.bio = bio;
    }

    public List<CandidateEducation> getEducations() {
        return Collections.unmodifiableList(educations);
    }

    public List<CandidateExperience> getExperiences() {
        return Collections.unmodifiableList(experiences);
    }

    public List<CandidateResume> getResumes() {
        return Collections.unmodifiableList(resumes);
    }

    public List<CandidateSkill> getSkills() {
        return Collections.unmodifiableList(skills);
    }

    public void addEducation(CandidateEducation education) {
        Objects.requireNonNull(education, "education must not be null").attachTo(this);
        if (!educations.contains(education)) {
            educations.add(education);
        }
    }

    public void removeEducation(CandidateEducation education) {
        if (educations.remove(education)) {
            education.detachFrom(this);
        }
    }

    public void addExperience(CandidateExperience experience) {
        Objects.requireNonNull(experience, "experience must not be null").attachTo(this);
        if (!experiences.contains(experience)) {
            experiences.add(experience);
        }
    }

    public void removeExperience(CandidateExperience experience) {
        if (experiences.remove(experience)) {
            experience.detachFrom(this);
        }
    }

    public void addResume(CandidateResume resume) {
        Objects.requireNonNull(resume, "resume must not be null").attachTo(this);
        if (resume == null || !resumes.contains(resume)) {
            resumes.add(resume);
        }
    }

    public void setPrimaryResume(CandidateResume resume) {
        if (!resumes.contains(resume)) {
            throw new IllegalArgumentException("resume does not belong to this candidate profile");
        }
        resumes.forEach(CandidateResume::unmarkAsPrimary);
        resume.markAsPrimary();
    }

    public void addSkill(CandidateSkill skill) {
        Objects.requireNonNull(skill, "skill must not be null").attachTo(this);
        if (!skills.contains(skill)) {
            skills.add(skill);
        }
    }

    public void removeSkill(CandidateSkill skill) {
        if (skills.remove(skill)) {
            skill.detachFrom(this);
        }
    }
}
