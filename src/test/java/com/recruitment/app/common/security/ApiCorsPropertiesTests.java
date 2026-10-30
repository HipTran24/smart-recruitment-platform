package com.recruitment.app.common.security;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ApiCorsPropertiesTests {

    @Test
    void acceptsExactCommaSeparatedLocalAndHttpsOrigins() {
        ApiCorsProperties properties = new ApiCorsProperties();
        properties.setAllowedOrigins("http://localhost:3000, https://app.example.test");

        properties.validate();

        assertEquals(List.of("http://localhost:3000", "https://app.example.test"), properties.getAllowedOrigins());
    }

    @Test
    void rejectsWildcardAndPaths() {
        ApiCorsProperties wildcard = new ApiCorsProperties();
        wildcard.setAllowedOrigins("*");
        assertThrows(IllegalStateException.class, wildcard::validate);

        ApiCorsProperties path = new ApiCorsProperties();
        path.setAllowedOrigins("https://app.example.test/auth");
        assertThrows(IllegalStateException.class, path::validate);
    }
}
