package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.port.out.AdminUserStore;
import com.recruitment.app.modules.identity.domain.model.AuditEventSnapshot;
import com.recruitment.app.modules.identity.domain.model.UserAdminSnapshot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class AdminUserService {

    private final AdminUserStore userStore;
    private final AuditEventService auditService;

    public AdminUserService(AdminUserStore userStore, AuditEventService auditService) {
        this.userStore = Objects.requireNonNull(userStore, "userStore must not be null");
        this.auditService = Objects.requireNonNull(auditService, "auditService must not be null");
    }

    @Transactional(readOnly = true)
    public List<UserAdminSnapshot> searchUsers(String keyword, String role, Boolean active, int page, int size) {
        return userStore.searchUsers(keyword, role, active, page, size);
    }

    @Transactional(readOnly = true)
    public long countUsers(String keyword, String role, Boolean active) {
        return userStore.countUsers(keyword, role, active);
    }

    @Transactional(readOnly = true)
    public UserAdminSnapshot getUser(Long id) {
        return userStore.findUserById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    @Transactional
    public void updateUserRoles(Long id, Set<String> roles, Long adminActorId, String ipAddress) {
        Objects.requireNonNull(roles, "roles must not be null");
        if (roles.contains("ROLE_PLATFORM_ADMIN") && roles.contains("ROLE_RECRUITER")) {
            throw new IllegalArgumentException("Platform Administrator cannot hold Recruiter role");
        }

        boolean currentIsAdmin = userStore.userHasRole(id, "ROLE_PLATFORM_ADMIN");
        boolean newHasAdmin = roles.contains("ROLE_PLATFORM_ADMIN");

        if (currentIsAdmin && !newHasAdmin) {
            long activeAdmins = userStore.countActivePlatformAdmins();
            if (activeAdmins <= 1) {
                throw new IllegalStateException("Cannot remove the last active platform administrator");
            }
        }

        userStore.updateUserRoles(id, roles);
        auditService.recordEvent(new AuditEventSnapshot(
                null,
                Instant.now(),
                adminActorId,
                "UPDATE_USER_ROLES",
                "USER",
                id.toString(),
                "{\"roles\":" + roles + "}",
                ipAddress
        ));
    }

    @Transactional
    public void updateUserStatus(Long id, boolean active, Long adminActorId, String ipAddress) {
        if (!active && userStore.userHasRole(id, "ROLE_PLATFORM_ADMIN")) {
            long activeAdmins = userStore.countActivePlatformAdmins();
            if (activeAdmins <= 1) {
                throw new IllegalStateException("Cannot deactivate the last active platform administrator");
            }
        }

        userStore.updateUserStatus(id, active);
        auditService.recordEvent(new AuditEventSnapshot(
                null,
                Instant.now(),
                adminActorId,
                active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
                "USER",
                id.toString(),
                "{\"active\":" + active + "}",
                ipAddress
        ));
    }
}
