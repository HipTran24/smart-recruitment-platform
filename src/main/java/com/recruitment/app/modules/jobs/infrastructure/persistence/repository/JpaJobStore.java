package com.recruitment.app.modules.jobs.infrastructure.persistence.repository;

import com.recruitment.app.modules.jobs.application.port.out.JobStore;
import com.recruitment.app.modules.jobs.domain.model.JobSnapshot;
import com.recruitment.app.modules.jobs.domain.model.SkillSnapshot;
import com.recruitment.app.modules.jobs.infrastructure.persistence.entity.Job;
import com.recruitment.app.modules.jobs.infrastructure.persistence.entity.Job.EmploymentType;
import com.recruitment.app.modules.jobs.infrastructure.persistence.entity.Job.WorkplaceType;
import com.recruitment.app.modules.jobs.infrastructure.persistence.entity.Skill;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class JpaJobStore implements JobStore {

    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;
    private final JdbcTemplate jdbcTemplate;

    public JpaJobStore(JobRepository jobRepository, SkillRepository skillRepository, JdbcTemplate jdbcTemplate) {
        this.jobRepository = jobRepository;
        this.skillRepository = skillRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JobSnapshot> findById(Long id) {
        return jobRepository.findById(id).map(this::toSnapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JobSnapshot> findBySlug(String slug) {
        return jobRepository.findBySlug(slug).map(this::toSnapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobSnapshot> findPublishedJobs(String query, String workplaceType, String employmentType, int page, int size) {
        String trimmedQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        return jobRepository.findPublishedJobs(Job.JobStatus.OPEN, Instant.now(), trimmedQuery, PageRequest.of(page, size))
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countPublishedJobs(String query, String workplaceType, String employmentType) {
        String trimmedQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        return jobRepository.countPublishedJobs(Job.JobStatus.OPEN, Instant.now(), trimmedQuery);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobSnapshot> findRecruiterJobs(Long recruiterUserId, String status, String search, int page, int size) {
        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return jobRepository.findAllRecruiterJobs(trimmedSearch, PageRequest.of(page, size))
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countRecruiterJobs(Long recruiterUserId, String status, String search) {
        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return jobRepository.countAllRecruiterJobs(trimmedSearch);
    }

    @Override
    public JobSnapshot createJob(
            Long recruiterUserId, Long companyId, String title, String slug,
            String description, String requirements, String employmentTypeStr,
            String workplaceTypeStr, String location, BigDecimal salaryMin,
            BigDecimal salaryMax, String salaryCurrency, Integer headcount,
            Instant expiresAt
    ) {
        Long targetCompanyId = (companyId != null && companyId > 0) ? companyId : 1L;
        ensureCompanyAndMembership(targetCompanyId, recruiterUserId);

        EmploymentType empType = parseEmploymentType(employmentTypeStr);
        WorkplaceType workType = parseWorkplaceType(workplaceTypeStr);

        Job job = new Job(targetCompanyId, recruiterUserId, title, slug, description, empType, workType);
        job.updateDraft(title, description, requirements, empType, workType, location,
                salaryMin, salaryMax, salaryCurrency != null ? salaryCurrency : "VND",
                headcount != null ? headcount : 1, expiresAt);

        Job saved = jobRepository.save(job);
        return toSnapshot(saved);
    }

    @Override
    public JobSnapshot updateJob(
            Long id, Long recruiterUserId, String title, String description,
            String requirements, String employmentTypeStr, String workplaceTypeStr,
            String location, BigDecimal salaryMin, BigDecimal salaryMax,
            String salaryCurrency, Integer headcount, Instant expiresAt
    ) {
        Job job = jobRepository.findById(id).orElseThrow();
        EmploymentType empType = parseEmploymentType(employmentTypeStr);
        WorkplaceType workType = parseWorkplaceType(workplaceTypeStr);

        job.updateDraft(title, description, requirements, empType, workType, location,
                salaryMin, salaryMax, salaryCurrency != null ? salaryCurrency : "VND",
                headcount != null ? headcount : 1, expiresAt);

        return toSnapshot(jobRepository.save(job));
    }

    @Override
    public JobSnapshot publishJob(Long id, Long recruiterUserId) {
        Job job = jobRepository.findById(id).orElseThrow();
        job.publish(Instant.now());
        return toSnapshot(jobRepository.save(job));
    }

    @Override
    public JobSnapshot closeJob(Long id, Long recruiterUserId) {
        Job job = jobRepository.findById(id).orElseThrow();
        job.close(Instant.now());
        return toSnapshot(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkillSnapshot> findAllSkills() {
        return skillRepository.findAll().stream()
                .map(s -> new SkillSnapshot(s.getId(), s.getName(), s.getCategory())).toList();
    }

    @Override
    public SkillSnapshot createSkill(String name, String category) {
        Skill skill = skillRepository.findByName(name)
                .orElseGet(() -> skillRepository.save(new Skill(name, category)));
        return new SkillSnapshot(skill.getId(), skill.getName(), skill.getCategory());
    }

    @Override
    public void deleteSkill(Long id) {
        skillRepository.deleteById(id);
    }

    private void ensureCompanyAndMembership(Long companyId, Long userId) {
        jdbcTemplate.update(
                "INSERT INTO companies (id, version, created_at, updated_at, name, slug, is_verified) " +
                "VALUES (?, 0, NOW(), NOW(), 'SmartRecruit Team', CONCAT('company-', ?), 1) " +
                "ON DUPLICATE KEY UPDATE updated_at = NOW()",
                companyId, companyId
        );
        jdbcTemplate.update(
                "INSERT INTO company_members (version, created_at, updated_at, company_id, user_id, role, is_active) " +
                "VALUES (0, NOW(), NOW(), ?, ?, 'RECRUITER', 1) " +
                "ON DUPLICATE KEY UPDATE is_active = 1",
                companyId, userId
        );
    }

    private JobSnapshot toSnapshot(Job j) {
        return new JobSnapshot(
                j.getId(), j.getCompanyId(), "SmartRecruit Hiring Team", j.getCreatedByUserId(),
                j.getTitle(), j.getSlug(), j.getDescription(), j.getRequirements(),
                j.getEmploymentType() != null ? j.getEmploymentType().name() : "FULL_TIME",
                j.getWorkplaceType() != null ? j.getWorkplaceType().name() : "HYBRID",
                j.getLocation(), j.getSalaryMin(), j.getSalaryMax(), j.getSalaryCurrency(),
                j.getStatus() != null ? j.getStatus().name() : "DRAFT",
                j.getHeadcount(), j.getPublishedAt(), j.getExpiresAt(), j.getClosedAt(),
                List.of()
        );
    }

    private static EmploymentType parseEmploymentType(String val) {
        if (val == null) return EmploymentType.FULL_TIME;
        try {
            return EmploymentType.valueOf(val.toUpperCase().replace('-', '_'));
        } catch (Exception e) {
            return EmploymentType.FULL_TIME;
        }
    }

    private static WorkplaceType parseWorkplaceType(String val) {
        if (val == null) return WorkplaceType.HYBRID;
        try {
            return WorkplaceType.valueOf(val.toUpperCase());
        } catch (Exception e) {
            return WorkplaceType.HYBRID;
        }
    }
}
