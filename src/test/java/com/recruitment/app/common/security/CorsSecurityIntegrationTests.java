package com.recruitment.app.common.security;

import com.recruitment.app.ApplicationTests;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class CorsSecurityIntegrationTests {

    private static final String ALLOWED_ORIGIN = "https://app.smartrecruit.local";

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!ApplicationTests.MYSQL.isRunning()) {
            ApplicationTests.MYSQL.start();
        }
        registry.add("spring.datasource.url", ApplicationTests.MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", ApplicationTests.MYSQL::getUsername);
        registry.add("spring.datasource.password", ApplicationTests.MYSQL::getPassword);
        registry.add("app.web.cors.allowed-origins", () -> ALLOWED_ORIGIN);
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void preflightFromAllowedOriginSucceedsWithCorsHeaders() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header(HttpHeaders.ORIGIN, ALLOWED_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ALLOWED_ORIGIN));
    }

    @Test
    void preflightFromDisallowedOriginFailsWithForbidden() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header(HttpHeaders.ORIGIN, "https://malicious.evil.com")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }
}
