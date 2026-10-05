package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.application.port.out.TestNotificationInspector;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Map;

/**
 * Test mailbox harness for local, automated test, and browser UAT execution.
 * Allows retrieving verification and reset tokens issued by the in-memory test provider.
 * Automatically disabled in production environments.
 */
@RestController
@RequestMapping(value = "/api/v1/test/mailbox", produces = MediaType.APPLICATION_JSON_VALUE)
public class TestMailboxController {

    private final ObjectProvider<TestNotificationInspector> inspectorProvider;
    private final boolean isProduction;

    public TestMailboxController(ObjectProvider<TestNotificationInspector> inspectorProvider, Environment environment) {
        this.inspectorProvider = inspectorProvider;
        this.isProduction = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
    }

    @GetMapping("/verification-token")
    public ResponseEntity<Map<String, String>> getLatestVerificationToken(@RequestParam("email") String email) {
        assertNotProduction();
        TestNotificationInspector inspector = inspectorProvider.getIfAvailable();
        if (inspector == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Test notification inspector is unavailable.");
        }
        return inspector.getLatestVerificationToken(email)
                .map(token -> ResponseEntity.ok(Map.of("email", email, "token", token)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No verification token found for " + email));
    }

    @GetMapping("/reset-token")
    public ResponseEntity<Map<String, String>> getLatestResetToken(@RequestParam("email") String email) {
        assertNotProduction();
        TestNotificationInspector inspector = inspectorProvider.getIfAvailable();
        if (inspector == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Test notification inspector is unavailable.");
        }
        return inspector.getLatestResetToken(email)
                .map(token -> ResponseEntity.ok(Map.of("email", email, "token", token)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No reset token found for " + email));
    }

    private void assertNotProduction() {
        if (isProduction) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
}
