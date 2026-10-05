package com.recruitment.app.common.api.openapi;

import com.recruitment.app.ApplicationTests;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class OpenApiControllerTests {

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!ApplicationTests.MYSQL.isRunning()) {
            ApplicationTests.MYSQL.start();
        }
        registry.add("spring.datasource.url", ApplicationTests.MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", ApplicationTests.MYSQL::getUsername);
        registry.add("spring.datasource.password", ApplicationTests.MYSQL::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void openApiSpecificationContainsAllEndpointsWithRequestBodyAndSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").value("3.1.0"))
                // Verify all 9 POST endpoints have requestBody with valid ref
                .andExpect(jsonPath("$.paths['/api/v1/auth/register'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/refresh'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/logout'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/oauth/exchange'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/password/change'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/password/reset-request'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/password/reset-confirm'].post.requestBody.required").value(true))
                .andExpect(jsonPath("$.paths['/api/v1/auth/verify-email'].post.requestBody.required").value(true))
                // Verify GET endpoint exists
                .andExpect(jsonPath("$.paths['/api/v1/auth/me'].get").exists())
                // Verify schemas exist
                .andExpect(jsonPath("$.components.schemas.RegistrationRequest").exists())
                .andExpect(jsonPath("$.components.schemas.PasswordLoginRequest").exists())
                .andExpect(jsonPath("$.components.schemas.RefreshTokenRequest").exists())
                .andExpect(jsonPath("$.components.schemas.OAuthCodeExchangeRequest").exists())
                .andExpect(jsonPath("$.components.schemas.ChangePasswordRequest").exists())
                .andExpect(jsonPath("$.components.schemas.PasswordResetRequest").exists())
                .andExpect(jsonPath("$.components.schemas.PasswordResetConfirmRequest").exists())
                .andExpect(jsonPath("$.components.schemas.VerifyEmailRequest").exists())
                .andExpect(jsonPath("$.components.schemas.ApiErrorResponse").exists())
                // Verify operational error response codes exist
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post.responses['429']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post.responses['415']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post.responses['500']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/auth/register'].post.responses['409']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/auth/password/change'].post.responses['422']").exists());
    }
}
