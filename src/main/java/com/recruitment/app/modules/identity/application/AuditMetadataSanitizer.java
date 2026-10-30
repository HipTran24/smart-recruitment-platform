package com.recruitment.app.modules.identity.application;

import tools.jackson.databind.json.JsonMapper;
import java.util.*;

/** Positive allowlist: new fields are excluded until their privacy contract is reviewed. */
final class AuditMetadataSanitizer {
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private AuditMetadataSanitizer() {}
    static String sanitize(String raw) {
        if (raw == null || raw.length() > 4096) return "{}";
        Map<String,Object> safe = new LinkedHashMap<>();
        try {
            var value = JSON.readTree(raw);
            if (value.path("active").isBoolean()) safe.put("active", value.path("active").asBoolean());
            if (value.path("status").isInt()) {
                int code = value.path("status").asInt();
                if (code >= 100 && code <= 599) safe.put("status", code);
            }
            String method = value.path("method").asText("");
            if (Set.of("GET","POST","PUT","PATCH","DELETE").contains(method)) safe.put("method",method);
            String id = value.path("requestId").asText("");
            if (id.matches("[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}")) safe.put("requestId",id);
            if (value.path("roles").isArray() && value.path("roles").size() <= 3) {
                List<String> roles = new ArrayList<>();
                for (var role : value.path("roles")) {
                    if (Set.of("ROLE_CANDIDATE","ROLE_RECRUITER","ROLE_PLATFORM_ADMIN").contains(role.asText())) roles.add(role.asText());
                }
                safe.put("roles", roles);
            }
            return JSON.writeValueAsString(safe);
        } catch (RuntimeException ignored) { return "{}"; }
    }
}
