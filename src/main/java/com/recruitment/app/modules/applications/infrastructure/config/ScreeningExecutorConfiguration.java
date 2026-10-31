package com.recruitment.app.modules.applications.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@org.springframework.scheduling.annotation.EnableScheduling
public class ScreeningExecutorConfiguration {
    @Bean("screeningExecutor")
    ThreadPoolTaskExecutor screeningExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        // Only executing work lives in memory; all waiting work is durable in the database.
        executor.setQueueCapacity(0);
        executor.setThreadNamePrefix("cv-screening-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(100);
        return executor;
    }

    @Bean
    ScreeningQueueDispatcher screeningQueueDispatcher(com.recruitment.app.modules.applications.application.screening.ScreeningSubmissionService service) {
        return new ScreeningQueueDispatcher(service);
    }
}
