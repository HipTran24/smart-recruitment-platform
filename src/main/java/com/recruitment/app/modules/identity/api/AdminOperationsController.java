package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.api.dto.AdminDtos.SystemSettingsRequest;
import com.recruitment.app.modules.identity.api.dto.AdminDtos.SystemSettingsResponse;
import com.recruitment.app.modules.identity.application.AdminOperationsService;
import com.recruitment.app.modules.identity.domain.model.SystemSettingsSnapshot;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/operations/settings")
@PreAuthorize("hasAuthority('ROLE_PLATFORM_ADMIN')")
public class AdminOperationsController {

    private final AdminOperationsService operationsService;

    public AdminOperationsController(AdminOperationsService operationsService) {
        this.operationsService = operationsService;
    }

    @GetMapping
    public ResponseEntity<SystemSettingsResponse> getSettings() {
        SystemSettingsSnapshot settings = operationsService.getSettings();
        return ResponseEntity.ok(toResponse(settings));
    }

    @PutMapping
    public ResponseEntity<SystemSettingsResponse> updateSettings(@RequestBody SystemSettingsRequest request) {
        SystemSettingsSnapshot updated = operationsService.updateSettings(new SystemSettingsSnapshot(
                request.maintenanceMode(),
                request.registrationEnabled(),
                request.aiModelVersion(),
                request.maxUploadSizeMb()
        ));
        return ResponseEntity.ok(toResponse(updated));
    }

    private SystemSettingsResponse toResponse(SystemSettingsSnapshot s) {
        return new SystemSettingsResponse(
                s.maintenanceMode(),
                s.registrationEnabled(),
                s.aiModelVersion(),
                s.maxUploadSizeMb()
        );
    }
}
