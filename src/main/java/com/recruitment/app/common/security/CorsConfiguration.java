package com.recruitment.app.common.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;

/** Explicit, bearer-token-only CORS policy; no wildcard origin is accepted. */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(ApiCorsProperties.class)
public class CorsConfiguration {

    @Bean
    CorsConfigurationSource corsConfigurationSource(ApiCorsProperties properties) {
        properties.validate();
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        if (properties.getAllowedOrigins().isEmpty()) {
            return source;
        }

        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(properties.getAllowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Request-Id"));
        configuration.setExposedHeaders(List.of("WWW-Authenticate", "X-Request-Id"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(Duration.ofHours(1));
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
