package com.recruitment.app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
@AutoConfigureMockMvc
public class ApplicationTests {

    @Container
    @ServiceConnection
    public static final MySQLContainer<?> MYSQL = new MySQLContainer<>(DockerImageName.parse("mysql:8.4.11"))
            .withDatabaseName("smartrecruit_test")
            .withUsername("smartrecruit_test")
            .withPassword("test-only-password")
            .withCommand(
                    "--character-set-server=utf8mb4",
                    "--collation-server=utf8mb4_0900_ai_ci",
                    "--default-time-zone=+00:00"
            );

    @Autowired
    private MockMvc mockMvc;

	@Test
	void contextLoads() {
        org.junit.jupiter.api.Assertions.assertNotNull(mockMvc);
	}

    @Test
    void exposesHealthAndOpenApiSpecificationWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.openapi").value("3.1.0"));
        mockMvc.perform(get("/api/v1/unconfigured"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void correlatesSecurityAndValidationErrorsWithoutReflectingCallerIds() throws Exception {
        var denied = mockMvc.perform(get("/api/v1/unconfigured")
                        .header("X-Request-ID", "untrusted-id"))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse();
        var mapper = tools.jackson.databind.json.JsonMapper.builder().build();
        String requestId = denied.getHeader("X-Request-ID");
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> java.util.UUID.fromString(requestId));
        org.junit.jupiter.api.Assertions.assertEquals(requestId,
                mapper.readTree(denied.getContentAsString()).path("requestId").asText());

        var invalid = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/v1/auth/register")
                        .contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest())
                .andReturn().getResponse();
        org.junit.jupiter.api.Assertions.assertEquals(invalid.getHeader("X-Request-ID"),
                mapper.readTree(invalid.getContentAsString()).path("requestId").asText());
    }

    @Test
    void registrationAndPasswordLoginUseThePersistenceAdapter() throws Exception {
        String body = """
                {"fullName":"Synthetic Candidate","email":"synthetic@example.test",
                 "password":"synthetic-password-123"}
                """;
        var registration = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/v1/auth/register").contentType("application/json").content(body))
                .andExpect(status().isCreated()).andReturn().getResponse();
        org.junit.jupiter.api.Assertions.assertEquals("no-store", registration.getHeader("Cache-Control"));
        var mapper = tools.jackson.databind.json.JsonMapper.builder().build();
        String accessToken = mapper.readTree(registration.getContentAsString()).path("accessToken").asText();
        var me = mockMvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk()).andReturn().getResponse();
        var account = mapper.readTree(me.getContentAsString());
        org.junit.jupiter.api.Assertions.assertEquals("synthetic@example.test", account.path("email").asText());
        org.junit.jupiter.api.Assertions.assertEquals(1, account.path("roles").size());
        org.junit.jupiter.api.Assertions.assertEquals("ROLE_CANDIDATE", account.path("roles").get(0).asText());
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/v1/auth/login").contentType("application/json")
                        .content("""
                                {"email":"synthetic@example.test","password":"synthetic-password-123"}
                                """))
                .andExpect(status().isOk());
    }

}
