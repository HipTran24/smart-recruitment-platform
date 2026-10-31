package com.recruitment.app.recovery;

import org.junit.jupiter.api.Test;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminUserFiltersIntegrationTests extends RecoveryDatabaseTest {
    @Test void roleFilterPaginatesUsersAndRetainsAllAssignedRoles() throws Exception {
        long first = createUser(); long second = createUser();
        String marker = "filter-" + java.util.UUID.randomUUID();
        jdbc.update("UPDATE users SET full_name=? WHERE id IN (?,?)", marker, first, second);
        jdbc.update("INSERT INTO user_roles(user_id,role_id) SELECT ?,id FROM roles WHERE code IN ('ROLE_CANDIDATE','ROLE_RECRUITER')", first);
        jdbc.update("INSERT INTO user_roles(user_id,role_id) SELECT ?,id FROM roles WHERE code='ROLE_CANDIDATE'", second);
        mvc.perform(get("/api/v1/admin/users").param("keyword", marker).param("role", "ROLE_CANDIDATE").param("size", "1")
                .with(user("1").roles("PLATFORM_ADMIN")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1)).andExpect(jsonPath("$.total").value(2));
        mvc.perform(get("/api/v1/admin/users").param("keyword", marker).param("role", "ROLE_RECRUITER")
                .with(user("1").roles("PLATFORM_ADMIN")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(first))
                .andExpect(jsonPath("$.items[0].roles.length()").value(2)).andExpect(jsonPath("$.total").value(1));
    }
}
