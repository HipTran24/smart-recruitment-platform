package com.recruitment.app.common.api.error;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Safe JSON error serialization for filters that run outside MVC advice. */
public final class ApiErrorWriter {
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private ApiErrorWriter() {
    }

    public static void write(HttpServletResponse response, int status,
                             String code, String message) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(MAPPER.writeValueAsString(ApiErrorResponse.of(code, message)));
    }
}
