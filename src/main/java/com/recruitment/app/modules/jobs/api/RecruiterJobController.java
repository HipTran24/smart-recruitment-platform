package com.recruitment.app.modules.jobs.api;

import com.recruitment.app.modules.jobs.api.dto.JobDtos.*;
import com.recruitment.app.modules.jobs.application.JobService;
import com.recruitment.app.modules.jobs.domain.model.JobSnapshot;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/recruiter/jobs", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasAuthority('ROLE_RECRUITER')")
public class RecruiterJobController {

    private final JobService jobService;

    public RecruiterJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public PageDto<JobDetailResponse> getRecruiterJobs(
            Authentication auth,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        Long userId = getUserId(auth);
        List<JobSnapshot> jobs = jobService.getRecruiterJobs(userId, status, search, page, size);
        long total = jobService.countRecruiterJobs(userId, status, search);
        int totalPages = (int) Math.ceil((double) total / Math.max(1, size));

        List<JobDetailResponse> items = jobs.stream().map(this::toDetailResponse).toList();
        return new PageDto<>(items, page, size, total, totalPages);
    }

    @PostMapping
    public ResponseEntity<JobDetailResponse> createJob(Authentication auth, @RequestBody CreateJobRequest req) {
        Long userId = getUserId(auth);
        JobSnapshot job = jobService.createJob(
                userId, req.companyId(), req.title(), req.slug(), req.description(),
                req.requirements(), req.employmentType(), req.workplaceType(),
                req.location(), req.salaryMin(), req.salaryMax(), req.salaryCurrency(),
                req.headcount(), req.expiresAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toDetailResponse(job));
    }

    @GetMapping("/{id}")
    public JobDetailResponse getJob(@PathVariable("id") Long id) {
        JobSnapshot job = jobService.getJobById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        return toDetailResponse(job);
    }

    @PutMapping("/{id}")
    public JobDetailResponse updateJob(Authentication auth, @PathVariable("id") Long id, @RequestBody UpdateJobRequest req) {
        Long userId = getUserId(auth);
        JobSnapshot job = jobService.updateJob(
                id, userId, req.title(), req.description(), req.requirements(),
                req.employmentType(), req.workplaceType(), req.location(),
                req.salaryMin(), req.salaryMax(), req.salaryCurrency(),
                req.headcount(), req.expiresAt()
        );
        return toDetailResponse(job);
    }

    @PostMapping("/{id}/publish")
    public JobDetailResponse publishJob(Authentication auth, @PathVariable("id") Long id) {
        Long userId = getUserId(auth);
        JobSnapshot job = jobService.publishJob(id, userId);
        return toDetailResponse(job);
    }

    @PostMapping("/{id}/close")
    public JobDetailResponse closeJob(Authentication auth, @PathVariable("id") Long id) {
        Long userId = getUserId(auth);
        JobSnapshot job = jobService.closeJob(id, userId);
        return toDetailResponse(job);
    }

    private static Long getUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return Long.parseLong(auth.getName());
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
