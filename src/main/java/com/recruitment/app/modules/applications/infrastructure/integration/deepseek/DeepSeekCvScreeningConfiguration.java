package com.recruitment.app.modules.applications.infrastructure.integration.deepseek;

import com.recruitment.app.modules.applications.application.screening.CvScreeningGateway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(DeepSeekCvScreeningProperties.class)
@ConditionalOnProperty(prefix = "app.ai.deepseek", name = "enabled", havingValue = "true")
public class DeepSeekCvScreeningConfiguration {
    @Bean
    CvScreeningGateway deepSeekCvScreeningGateway(DeepSeekCvScreeningProperties properties, ObjectMapper mapper) {
        properties.validate();
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(properties.getConnectTimeout());
        factory.setReadTimeout(properties.getReadTimeout());
        var client = RestClient.builder().baseUrl(properties.getApiBaseUrl().toString().replaceAll("/$", ""))
                .requestFactory(factory).build();
        return new DeepSeekCvScreeningClient(client, mapper, properties);
    }
}
