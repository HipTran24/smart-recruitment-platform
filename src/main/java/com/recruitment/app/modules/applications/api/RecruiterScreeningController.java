package com.recruitment.app.modules.applications.api;

import com.recruitment.app.modules.applications.application.screening.ScreeningSubmissionService;
import com.recruitment.app.modules.applications.application.screening.port.out.ScreeningSubmissionStore.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiter")
@PreAuthorize("hasAuthority('ROLE_RECRUITER')")
public class RecruiterScreeningController {
    private final ScreeningSubmissionService screening;
    public RecruiterScreeningController(ScreeningSubmissionService screening) { this.screening = screening; }
    @PostMapping("/applications/{id}/screening")
    public ResponseEntity<Status> submit(Authentication auth, @PathVariable("id") Long id) {
        return ResponseEntity.accepted().body(screening.submit(Long.parseLong(auth.getName()), id));
    }
    @GetMapping("/applications/{id}/screening")
    public Status status(Authentication auth, @PathVariable("id") Long id) {
        return screening.status(Long.parseLong(auth.getName()), id);
    }
    @GetMapping("/screening-statuses")
    public java.util.Map<Long, Status> statuses(Authentication auth, @RequestParam("ids") java.util.List<Long> ids) {
        return screening.statuses(Long.parseLong(auth.getName()), ids);
    }
}
