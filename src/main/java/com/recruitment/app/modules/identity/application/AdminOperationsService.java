package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.domain.model.SystemSettingsSnapshot;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicReference;

@Service
public class AdminOperationsService {

    private final AtomicReference<SystemSettingsSnapshot> settingsRef = new AtomicReference<>(
            new SystemSettingsSnapshot(false, true, "gemini-2.5-flash", 10)
    );

    public SystemSettingsSnapshot getSettings() {
        return settingsRef.get();
    }

    public SystemSettingsSnapshot updateSettings(SystemSettingsSnapshot newSettings) {
        if (newSettings == null) {
            throw new IllegalArgumentException("settings must not be null");
        }
        if (newSettings.maxUploadSizeMb() <= 0 || newSettings.maxUploadSizeMb() > 100) {
            throw new IllegalArgumentException("maxUploadSizeMb must be between 1 and 100");
        }
        settingsRef.set(newSettings);
        return newSettings;
    }
}
