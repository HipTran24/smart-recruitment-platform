package com.recruitment.app.modules.jobs.api;

import com.recruitment.app.modules.jobs.api.dto.JobDtos.*;
import com.recruitment.app.modules.jobs.application.JobService;
import com.recruitment.app.modules.jobs.domain.model.JobSnapshot;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/api/v1/jobs")
    public PageDto<JobSummaryResponse> getPublishedJobs(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "workplaceType", required = false) String workplaceType,
            @RequestParam(name = "employmentType", required = false) String employmentType,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        List<JobSnapshot> jobs = jobService.getPublishedJobs(query, workplaceType, employmentType, page, size);
        long total = jobService.countPublishedJobs(query, workplaceType, employmentType);
        int totalPages = (int) Math.ceil((double) total / Math.max(1, size));

        List<JobSummaryResponse> items = jobs.stream().map(this::toSummaryResponse).toList();
        return new PageDto<>(items, page, size, total, totalPages);
    }

    @GetMapping("/api/v1/jobs/{idOrSlug}")
    public JobDetailResponse getJobDetail(@PathVariable("idOrSlug") String idOrSlug) {
        JobSnapshot job;
        try {
            Long id = Long.parseLong(idOrSlug);
            job = jobService.getJobById(id).orElse(null);
        } catch (NumberFormatException e) {
            job = jobService.getJobBySlug(idOrSlug).orElse(null);
        }

        if (job == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        return toDetailResponse(job);
    }

    @GetMapping("/api/v1/skills")
    public List<SkillDto> getSkills() {
        return jobService.getSkills().stream()
                .map(s -> new SkillDto(s.id(), s.name(), s.category())).toList();
    }

    private JobSummaryResponse toSummaryResponse(JobSnapshot j) {
        return new JobSummaryResponse(
                j.id(), j.title(), j.slug(), j.companyName(), j.location(),
                j.employmentType(), j.workplaceType(), j.salaryMin(), j.salaryMax(),
                j.salaryCurrency(), j.status(), j.publishedAt(), j.expiresAt()
        );
    }

    private JobDetailResponse toDetailResponse(JobSnapshot j) {
        List<SkillDto> skills = j.skills().stream()
                .map(s -> new SkillDto(s.id(), s.name(), s.category())).toList();
        return new JobDetailResponse(
                j.id(), j.companyId(), j.companyName(), j.createdByUserId(),
                j.title(), j.slug(), j.description(), j.requirements(),
                j.employmentType(), j.workplaceType(), j.location(),
                j.salaryMin(), j.salaryMax(), j.salaryCurrency(), j.status(),
                j.headcount(), j.publishedAt(), j.expiresAt(), j.closedAt(),
                skills
        );
    }
}
