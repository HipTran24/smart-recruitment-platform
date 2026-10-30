package com.recruitment.app.modules.identity.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;

public record AuthenticatedUserResponse(Long id, String email, String fullName, Set<String> roles) {
    @JsonProperty("roleCodes")
    public Set<String> roleCodes() {
        return roles;
    }
}
