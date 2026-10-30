package com.recruitment.app.recovery;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CsrfAndReadSafetyIntegrationTests extends RecoveryDatabaseTest {
    @Test
    void readingApplicationsNeverCreatesAProfileOrConsent() throws Exception {
        long candidate=createUser();
        mvc.perform(get("/api/v1/candidates/me/applications").with(user(Long.toString(candidate)).roles("CANDIDATE")))
                .andExpect(status().isOk());
        assertEquals(0,jdbc.queryForObject("SELECT COUNT(*) FROM candidate_profiles WHERE user_id=?",Integer.class,candidate));
    }
    @Test
    void cookieStyleMutationRequiresCsrfAndPublicAuthRejectsSimpleFormRequests() throws Exception {
        mvc.perform(post("/api/v1/candidates/me/offers/123/accept").with(user("123").roles("CANDIDATE")))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/login").contentType("application/x-www-form-urlencoded")
                .content("email=synthetic@example.test&password=synthetic"))
                .andExpect(status().isForbidden());
    }
}
