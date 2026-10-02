package com.recruitment.app.modules.applications.infrastructure.integration.gemini;

import com.recruitment.app.modules.applications.application.screening.CvScreeningGateway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.ObjectMapper;

/**
 * Registers the external Gemini adapter only when it is explicitly enabled. This keeps local and
 * test environments from accidentally making an external AI call.
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(GeminiCvScreeningProperties.class)
@ConditionalOnProperty(prefix = "app.ai.gemini", name = "enabled", havingValue = "true")
public class GeminiCvScreeningConfiguration {

    @Bean(name = "geminiCvScreeningRestClient")
    RestClient geminiCvScreeningRestClient(GeminiCvScreeningProperties properties) {
        properties.validateOperationalConfiguration();

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getConnectTimeout());
        requestFactory.setReadTimeout(properties.getReadTimeout());

        return RestClient.builder()
                .baseUrl(stripTrailingSlash(properties.getApiBaseUrl().toString()))
                .requestFactory(requestFactory)
                .build();
    }

    @Bean
    @ConditionalOnMissingBean(CvScreeningGateway.class)
    CvScreeningGateway geminiCvScreeningGateway(
            @Qualifier("geminiCvScreeningRestClient") RestClient geminiCvScreeningRestClient,
            ObjectMapper objectMapper,
            GeminiCvScreeningProperties properties
    ) {
        return new GeminiCvScreeningClient(geminiCvScreeningRestClient, objectMapper, properties);
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
