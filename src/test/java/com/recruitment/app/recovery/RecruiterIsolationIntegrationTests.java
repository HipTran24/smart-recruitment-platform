package com.recruitment.app.recovery;

import org.junit.jupiter.api.Test;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RecruiterIsolationIntegrationTests extends RecoveryDatabaseTest {
    @Test void recruiterListsAndReportsOnlyContainTheirCompanyData() throws Exception {
        long owner = createUser(); long outsider = createUser();
        long ownedJob = job(owner); long privateJob = job(outsider);
        long owned = application(ownedJob, profile(createUser())); application(privateJob, profile(createUser()));
        var auth = user(Long.toString(owner)).roles("RECRUITER");
        mvc.perform(get("/api/v1/recruiter/applications?size=999").with(auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(owned)).andExpect(jsonPath("$.size").value(100))
                .andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/v1/recruiter/jobs").with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1)).andExpect(jsonPath("$.items[0].id").value(ownedJob));
        mvc.perform(get("/api/v1/recruiter/reports/overview").with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApplications").value(1));
        mvc.perform(get("/api/v1/recruiter/applications/"+owned).with(user(Long.toString(outsider)).roles("RECRUITER")))
                .andExpect(status().isForbidden());
    }

    @Test void publicJobFiltersAndPageMetadataReflectAppliedLimits() throws Exception {
        long recruiter = createUser(); long remote = job(recruiter); long onsite = job(recruiter);
        jdbc.update("UPDATE jobs SET workplace_type='ONSITE' WHERE id=?", onsite);
        mvc.perform(get("/api/v1/jobs?workplaceType=REMOTE&size=999")).andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1)).andExpect(jsonPath("$.items[0].id").value(remote))
                .andExpect(jsonPath("$.totalElements").value(1)).andExpect(jsonPath("$.size").value(100));
    }
}
