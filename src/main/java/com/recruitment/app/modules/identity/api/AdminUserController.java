package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.api.dto.AdminDtos.UpdateUserRolesRequest;
import com.recruitment.app.modules.identity.api.dto.AdminDtos.UpdateUserStatusRequest;
import com.recruitment.app.modules.identity.api.dto.AdminDtos.UserPageResponse;
import com.recruitment.app.modules.identity.api.dto.AdminDtos.UserSummaryResponse;
import com.recruitment.app.modules.identity.application.AdminUserService;
import com.recruitment.app.modules.identity.domain.model.UserAdminSnapshot;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasAuthority('ROLE_PLATFORM_ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<UserPageResponse> listUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<UserAdminSnapshot> users = adminUserService.searchUsers(keyword, role, active, page, size);
        long total = adminUserService.countUsers(keyword, role, active);
        List<UserSummaryResponse> items = users.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(new UserPageResponse(items, total, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryResponse> getUser(@PathVariable Long id) {
        UserAdminSnapshot user = adminUserService.getUser(id);
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<Map<String, String>> updateUserRoles(
            @PathVariable Long id,
            @RequestBody UpdateUserRolesRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        Long adminId = Long.parseLong(authentication.getName());
        String ip = servletRequest.getRemoteAddr();
        adminUserService.updateUserRoles(id, request.roles(), adminId, ip);
        return ResponseEntity.ok(Map.of("message", "User roles updated successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        Long adminId = Long.parseLong(authentication.getName());
        String ip = servletRequest.getRemoteAddr();
        adminUserService.updateUserStatus(id, request.active(), adminId, ip);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    private UserSummaryResponse toResponse(UserAdminSnapshot s) {
        return new UserSummaryResponse(
                s.id(),
                s.email(),
                s.fullName(),
                s.active(),
                s.emailVerified(),
                s.roles(),
                s.createdAt()
        );
    }
}
