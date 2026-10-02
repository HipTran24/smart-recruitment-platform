package com.recruitment.app.modules.identity.api.response;

import java.util.Set;

public record AuthenticatedUserResponse(Long id, String email, String fullName, Set<String> roles) {
}
