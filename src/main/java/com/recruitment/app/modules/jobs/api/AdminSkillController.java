package com.recruitment.app.modules.jobs.api;

import com.recruitment.app.modules.jobs.api.dto.JobDtos.CreateSkillRequest;
import com.recruitment.app.modules.jobs.api.dto.JobDtos.SkillDto;
import com.recruitment.app.modules.jobs.application.JobService;
import com.recruitment.app.modules.jobs.domain.model.SkillSnapshot;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/skills")
@PreAuthorize("hasAuthority('ROLE_PLATFORM_ADMIN')")
public class AdminSkillController {

    private final JobService jobService;

    public AdminSkillController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<SkillDto>> listSkills() {
        List<SkillDto> list = jobService.getSkills().stream()
                .map(s -> new SkillDto(s.id(), s.name(), s.category()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<SkillDto> createSkill(@RequestBody CreateSkillRequest request) {
        SkillSnapshot skill = jobService.createSkill(request.name(), request.category());
        return ResponseEntity.ok(new SkillDto(skill.id(), skill.name(), skill.category()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSkill(@PathVariable Long id) {
        jobService.deleteSkill(id);
        return ResponseEntity.ok(Map.of("message", "Skill deleted successfully"));
    }
}
