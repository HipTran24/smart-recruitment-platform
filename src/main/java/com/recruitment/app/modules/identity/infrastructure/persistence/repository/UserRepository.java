package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "roles")
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    @Query("select user from User user where user.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select user from User user where user.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);

    @Query("select count(u) > 0 from User u join u.roles r where r.code = :roleCode and u.active = true")
    boolean existsByActiveRoleCode(@Param("roleCode") String roleCode);

    @Query("select count(u) > 0 from User u where u.id = :id and u.active = true and u.credentialVersion = :cv")
    boolean isAccountLive(@Param("id") Long id, @Param("cv") int cv);
}
