package com.recruitment.app.modules.applications.infrastructure.config;

import com.recruitment.app.modules.applications.application.screening.ScreeningSubmissionService;
import org.springframework.scheduling.annotation.Scheduled;

final class ScreeningQueueDispatcher {
    private final ScreeningSubmissionService service;
    ScreeningQueueDispatcher(ScreeningSubmissionService service) { this.service = service; }

    @Scheduled(initialDelayString = "${app.screening.dispatch-initial-delay:10000}",
            fixedDelayString = "${app.screening.dispatch-interval:5000}")
    public void resume() { service.resumePending(); }
}
