package com.recruitment.app.modules.jobs.application;

import com.recruitment.app.modules.jobs.application.port.out.JobStore;
import com.recruitment.app.modules.jobs.domain.model.JobSnapshot;
import com.recruitment.app.modules.jobs.domain.model.SkillSnapshot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class JobService {

    private final JobStore jobStore;

    public JobService(JobStore jobStore) {
        this.jobStore = jobStore;
    }

    @Transactional(readOnly = true)
    public List<JobSnapshot> getPublishedJobs(String query, String workplaceType, String employmentType, int page, int size) {
        return jobStore.findPublishedJobs(query, workplaceType, employmentType, Math.max(0, page), Math.min(100, Math.max(1, size)));
    }

    @Transactional(readOnly = true)
    public long countPublishedJobs(String query, String workplaceType, String employmentType) {
        return jobStore.countPublishedJobs(query, workplaceType, employmentType);
    }

    @Transactional(readOnly = true)
    public Optional<JobSnapshot> getJobById(Long id) {
        return jobStore.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<JobSnapshot> getJobBySlug(String slug) {
        return jobStore.findBySlug(slug);
    }

    @Transactional(readOnly = true)
    public List<JobSnapshot> getRecruiterJobs(Long recruiterUserId, String status, String search, int page, int size) {
        return jobStore.findRecruiterJobs(recruiterUserId, status, search, Math.max(0, page), Math.min(100, Math.max(1, size)));
    }

    @Transactional(readOnly = true)
    public long countRecruiterJobs(Long recruiterUserId, String status, String search) {
        return jobStore.countRecruiterJobs(recruiterUserId, status, search);
    }

    public JobSnapshot createJob(
            Long recruiterUserId, Long companyId, String title, String slug,
            String description, String requirements, String employmentType,
            String workplaceType, String location, BigDecimal salaryMin,
            BigDecimal salaryMax, String salaryCurrency, Integer headcount,
            Instant expiresAt
    ) {
        String generatedSlug = (slug != null && !slug.isBlank())
                ? slug.toLowerCase().replaceAll("[^a-z0-9]+", "-")
                : title.toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + System.currentTimeMillis();
        return jobStore.createJob(
                recruiterUserId, companyId, title, generatedSlug, description, requirements,
                employmentType, workplaceType, location, salaryMin, salaryMax, salaryCurrency,
                headcount, expiresAt
        );
    }

    public JobSnapshot updateJob(
            Long id, Long recruiterUserId, String title, String description,
            String requirements, String employmentType, String workplaceType,
            String location, BigDecimal salaryMin, BigDecimal salaryMax,
            String salaryCurrency, Integer headcount, Instant expiresAt
    ) {
        return jobStore.updateJob(
                id, recruiterUserId, title, description, requirements, employmentType,
                workplaceType, location, salaryMin, salaryMax, salaryCurrency,
                headcount, expiresAt
        );
    }

    public JobSnapshot publishJob(Long id, Long recruiterUserId) {
        return jobStore.publishJob(id, recruiterUserId);
    }

    public JobSnapshot closeJob(Long id, Long recruiterUserId) {
        return jobStore.closeJob(id, recruiterUserId);
    }

    @Transactional(readOnly = true)
    public List<SkillSnapshot> getSkills() {
        return jobStore.findAllSkills();
    }

    public SkillSnapshot createSkill(String name, String category) {
        return jobStore.createSkill(name, category);
    }

    public void deleteSkill(Long id) {
        jobStore.deleteSkill(id);
    }
}
