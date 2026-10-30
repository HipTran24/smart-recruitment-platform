package com.recruitment.app.recovery;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CandidateOwnershipIntegrationTests extends RecoveryDatabaseTest {
    @Test
    void candidatesCannotReadOrMutateAnotherCandidatesDossierOrOffer() throws Exception {
        long owner = createUser();
        long attacker = createUser();
        long recruiter = createUser();
        long application = application(job(recruiter), profile(owner));
        long offer = offer(application, owner, recruiter);
        var other = user(Long.toString(attacker)).roles("CANDIDATE");
        mvc.perform(get("/api/v1/candidates/me/applications/" + application).with(other)).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/candidates/me/applications/" + application + "/withdraw").with(other))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/candidates/me/offers/" + offer).with(other)).andExpect(status().isNotFound());
        for (String action : new String[]{"accept", "decline"}) {
            mvc.perform(post("/api/v1/candidates/me/offers/" + offer + "/" + action).with(other))
                    .andExpect(status().isNotFound());
        }
        for (String method : new String[]{"POST", "PUT"}) {
            mvc.perform(request(org.springframework.http.HttpMethod.valueOf(method),
                            "/api/v1/candidates/offers/" + offer + "/response").with(other))
                    .andExpect(status().isNotFound());
        }
        assertEquals("SUBMITTED", jdbc.queryForObject("SELECT status FROM job_applications WHERE id=?", String.class, application));
        assertEquals("SENT", jdbc.queryForObject("SELECT status FROM job_offers WHERE id=?", String.class, offer));
        var self = user(Long.toString(owner)).roles("CANDIDATE");
        mvc.perform(get("/api/v1/candidates/me/applications/" + application).with(self)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/candidates/me/offers/" + offer).with(self)).andExpect(status().isOk());
        mvc.perform(post("/api/v1/candidates/me/offers/" + offer + "/accept").with(self)).andExpect(status().isOk());
        entityManager.flush();
        assertEquals("ACCEPTED", jdbc.queryForObject("SELECT status FROM job_offers WHERE id=?", String.class, offer));
    }

    @Test
    void submissionDoesNotInventConsentOrCompletedAiResult() throws Exception {
        long candidate = createUser();
        long job = job(createUser());
        mvc.perform(post("/api/v1/jobs/" + job + "/applications")
                .with(user(Long.toString(candidate)).roles("CANDIDATE"))).andExpect(status().isCreated());
        assertEquals(0, jdbc.queryForObject("SELECT ai_processing_consented FROM candidate_profiles WHERE user_id=?",
                Integer.class, candidate));
        assertEquals(0, jdbc.queryForObject("""
                SELECT COUNT(*) FROM application_screenings s JOIN job_applications a ON a.id=s.job_application_id
                JOIN candidate_profiles p ON p.id=a.candidate_profile_id WHERE p.user_id=?
                """, Integer.class, candidate));
    }
}
