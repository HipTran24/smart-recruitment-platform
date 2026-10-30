package com.recruitment.app.modules.jobs.application.port.out;

import com.recruitment.app.modules.jobs.domain.model.JobSnapshot;
import com.recruitment.app.modules.jobs.domain.model.SkillSnapshot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface JobStore {

    Optional<JobSnapshot> findById(Long id);

    Optional<JobSnapshot> findBySlug(String slug);

    List<JobSnapshot> findPublishedJobs(String query, String workplaceType, String employmentType, int page, int size);

    long countPublishedJobs(String query, String workplaceType, String employmentType);

    List<JobSnapshot> findRecruiterJobs(Long recruiterUserId, String status, String search, int page, int size);

    long countRecruiterJobs(Long recruiterUserId, String status, String search);

    JobSnapshot createJob(
            Long recruiterUserId, Long companyId, String title, String slug,
            String description, String requirements, String employmentType,
            String workplaceType, String location, BigDecimal salaryMin,
            BigDecimal salaryMax, String salaryCurrency, Integer headcount,
            Instant expiresAt
    );

    JobSnapshot updateJob(
            Long id, Long recruiterUserId, String title, String description,
            String requirements, String employmentType, String workplaceType,
            String location, BigDecimal salaryMin, BigDecimal salaryMax,
            String salaryCurrency, Integer headcount, Instant expiresAt
    );

    JobSnapshot publishJob(Long id, Long recruiterUserId);

    JobSnapshot closeJob(Long id, Long recruiterUserId);

    List<SkillSnapshot> findAllSkills();

    SkillSnapshot createSkill(String name, String category);

    void deleteSkill(Long id);
}
