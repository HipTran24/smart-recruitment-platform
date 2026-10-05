package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.port.out.AdminUserStore;
import com.recruitment.app.modules.identity.domain.model.UserAdminSnapshot;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.Role;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JpaAdminUserStore implements AdminUserStore {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EntityManager entityManager;

    public JpaAdminUserStore(UserRepository userRepository, RoleRepository roleRepository, EntityManager entityManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.entityManager = entityManager;
    }

    @Override
    public List<UserAdminSnapshot> searchUsers(String keyword, String role, Boolean active, int page, int size) {
        StringBuilder jpql = new StringBuilder("select distinct u from User u left join fetch u.roles r where 1=1 ");
        appendFilterConditions(jpql, keyword, role, active);
        jpql.append("order by u.createdAt desc");

        TypedQuery<User> query = entityManager.createQuery(jpql.toString(), User.class);
        setFilterParameters(query, keyword, role, active);
        query.setFirstResult(page * size);
        query.setMaxResults(size);

        return query.getResultList().stream().map(this::toSnapshot).toList();
    }

    @Override
    public long countUsers(String keyword, String role, Boolean active) {
        StringBuilder jpql = new StringBuilder("select count(distinct u) from User u left join u.roles r where 1=1 ");
        appendFilterConditions(jpql, keyword, role, active);

        TypedQuery<Long> query = entityManager.createQuery(jpql.toString(), Long.class);
        setFilterParameters(query, keyword, role, active);
        return query.getSingleResult();
    }

    @Override
    public Optional<UserAdminSnapshot> findUserById(Long id) {
        return userRepository.findByIdWithRoles(id).map(this::toSnapshot);
    }

    @Override
    public void updateUserRoles(Long id, Set<String> roleCodes) {
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        Set<Role> currentRoles = new HashSet<>(user.getRoles());
        for (Role r : currentRoles) {
            user.removeRole(r);
        }

        for (String roleCode : roleCodes) {
            Role role = roleRepository.findByCode(roleCode)
                    .orElseThrow(() -> new IllegalArgumentException("Unknown role code: " + roleCode));
            user.addRole(role);
        }
        userRepository.save(user);
    }

    @Override
    public void updateUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        if (active) {
            user.activate();
        } else {
            user.deactivate();
        }
        userRepository.save(user);
    }

    @Override
    public long countActivePlatformAdmins() {
        return userRepository.countActivePlatformAdmins();
    }

    @Override
    public boolean userHasRole(Long id, String roleCode) {
        return userRepository.findByIdWithRoles(id)
                .map(u -> u.hasRole(roleCode))
                .orElse(false);
    }

    private void appendFilterConditions(StringBuilder jpql, String keyword, String role, Boolean active) {
        if (keyword != null && !keyword.isBlank()) {
            jpql.append("and (lower(u.email) like lower(:keyword) or lower(u.fullName) like lower(:keyword)) ");
        }
        if (role != null && !role.isBlank()) {
            jpql.append("and r.code = :role ");
        }
        if (active != null) {
            jpql.append("and u.active = :active ");
        }
    }

    private void setFilterParameters(TypedQuery<?> query, String keyword, String role, Boolean active) {
        if (keyword != null && !keyword.isBlank()) {
            query.setParameter("keyword", "%" + keyword.trim() + "%");
        }
        if (role != null && !role.isBlank()) {
            query.setParameter("role", role.trim());
        }
        if (active != null) {
            query.setParameter("active", active);
        }
    }

    private UserAdminSnapshot toSnapshot(User u) {
        Set<String> roleCodes = u.getRoles() != null
                ? u.getRoles().stream().map(Role::getCode).collect(Collectors.toSet())
                : Collections.emptySet();
        return new UserAdminSnapshot(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.isActive(),
                u.isEmailVerified(),
                u.getCredentialVersion(),
                roleCodes,
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}
