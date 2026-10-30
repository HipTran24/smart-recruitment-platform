package com.recruitment.app.common.api.error;

import com.recruitment.app.ApplicationTests;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ApiExceptionHandlerTests {

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
    void getOnPostEndpointReturns405MethodNotAllowed() throws Exception {
        mockMvc.perform(get("/api/v1/auth/login"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"))
                .andExpect(jsonPath("$.message").value("The request could not be processed."));
    }

    @Test
    void unsupportedContentTypeReturns415UnsupportedMediaType() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("email=test%40example.com"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_MEDIA_TYPE"))
                .andExpect(jsonPath("$.message").value("The request could not be processed."));
    }

    @Test
    void actuatorHealthWithBrowserAcceptHeaderReturns200() throws Exception {
        mockMvc.perform(get("/actuator/health")
                        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"))
                .andExpect(status().isOk());
    }

    @Test
    void actuatorHealthWithStrictXmlAcceptHeaderReturns406Not401() throws Exception {
        mockMvc.perform(get("/actuator/health")
                        .header("Accept", "application/xml"))
                .andExpect(status().isNotAcceptable());
    }

    @Test
    void actuatorHealthWithStrictHtmlAcceptHeaderReturns406Not401() throws Exception {
        mockMvc.perform(get("/actuator/health")
                        .header("Accept", "text/html"))
                .andExpect(status().isNotAcceptable());
    }

    @Test
    void jsonEndpointWithUnsupportedAcceptHeaderDoesNotReturn401() throws Exception {
        mockMvc.perform(get("/v3/api-docs")
                        .header("Accept", "application/xml"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status,
                            "Accept negotiation error must never be masked as 401 UNAUTHORIZED");
                });
    }

    @Test
    void anonymousAccessToErrorEndpointDoesNotReturn401() throws Exception {
        mockMvc.perform(get("/error"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status,
                            "/error must not be blocked by deny-all with 401");
                });
    }

    @Test
    void postWithUnsupportedAcceptHeaderReturns406WithoutBody() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Accept", "application/xml")
                        .content("{\"email\":\"test@example.com\",\"password\":\"Passw0rdSecure12\"}"))
                .andExpect(status().isNotAcceptable())
                .andExpect(result -> {
                    byte[] content = result.getResponse().getContentAsByteArray();
                    org.junit.jupiter.api.Assertions.assertEquals(0, content.length,
                            "406 Not Acceptable response should have empty body when client rejects JSON");
                });
    }

    @Test
    void getErrorWithJsonAcceptHeaderReturnsApiErrorResponse() throws Exception {
        mockMvc.perform(get("/error")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected internal error occurred."))
                .andExpect(jsonPath("$.requestId").exists());
    }

    @Test
    void getErrorWithWildcardAcceptHeaderReturnsApiErrorResponse() throws Exception {
        mockMvc.perform(get("/error")
                        .header("Accept", "*/*"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected internal error occurred."))
                .andExpect(jsonPath("$.requestId").exists());
    }

    @Test
    void getErrorWithDefaultAcceptHeaderReturnsApiErrorResponse() throws Exception {
        mockMvc.perform(get("/error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected internal error occurred."))
                .andExpect(jsonPath("$.requestId").exists());
    }
}
