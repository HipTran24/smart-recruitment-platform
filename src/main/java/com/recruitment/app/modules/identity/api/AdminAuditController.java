package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.api.dto.AdminDtos.AuditEventPageResponse;
import com.recruitment.app.modules.identity.api.dto.AdminDtos.AuditEventResponse;
import com.recruitment.app.modules.identity.application.AuditEventService;
import com.recruitment.app.modules.identity.domain.model.AuditEventSnapshot;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit-events")
@PreAuthorize("hasAuthority('ROLE_PLATFORM_ADMIN')")
public class AdminAuditController {

    private final AuditEventService auditService;

    public AdminAuditController(AuditEventService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<AuditEventPageResponse> listEvents(
            @RequestParam(required = false) Long actorUserId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        List<AuditEventSnapshot> events = auditService.searchEvents(actorUserId, action, resourceType, page, size);
        long total = auditService.countEvents(actorUserId, action, resourceType);
        List<AuditEventResponse> items = events.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(new AuditEventPageResponse(items, total, page, size));
    }

    private AuditEventResponse toResponse(AuditEventSnapshot s) {
        return new AuditEventResponse(
                s.id(),
                s.createdAt(),
                s.actorUserId(),
                s.action(),
                s.resourceType(),
                s.resourceId(),
                s.metadataJson(),
                s.ipAddress()
        );
    }
}
