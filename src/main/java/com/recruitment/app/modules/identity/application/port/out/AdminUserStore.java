package com.recruitment.app.modules.identity.application.port.out;

import com.recruitment.app.modules.identity.domain.model.UserAdminSnapshot;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface AdminUserStore {
    List<UserAdminSnapshot> searchUsers(String keyword, String role, Boolean active, int page, int size);
    long countUsers(String keyword, String role, Boolean active);
    Optional<UserAdminSnapshot> findUserById(Long id);
    void updateUserRoles(Long id, Set<String> roles);
    void updateUserStatus(Long id, boolean active);
    long countActivePlatformAdmins();
    boolean userHasRole(Long id, String roleCode);
}
