package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.application.PlatformOverviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/overview")
@PreAuthorize("hasAuthority('ROLE_PLATFORM_ADMIN')")
public class PlatformOverviewController {
    private final PlatformOverviewService overview;
    public PlatformOverviewController(PlatformOverviewService overview) { this.overview = overview; }
    @GetMapping
    public Map<String, Long> overview() { return overview.overview(); }
}
