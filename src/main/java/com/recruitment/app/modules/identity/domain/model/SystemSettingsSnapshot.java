package com.recruitment.app.modules.identity.domain.model;

public record SystemSettingsSnapshot(
        boolean maintenanceMode,
        boolean registrationEnabled,
        String aiModelVersion,
        int maxUploadSizeMb
) {}
