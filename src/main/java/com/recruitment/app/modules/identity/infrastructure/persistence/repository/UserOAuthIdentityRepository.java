package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.infrastructure.persistence.entity.UserOAuthIdentity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserOAuthIdentityRepository extends JpaRepository<UserOAuthIdentity, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"user", "user.roles"})
    @Query("""
            select identity
            from UserOAuthIdentity identity
            where identity.provider = :provider
              and identity.providerSubject = :providerSubject
            """)
    Optional<UserOAuthIdentity> findForUpdate(
            @Param("provider") UserOAuthIdentity.Provider provider,
            @Param("providerSubject") String providerSubject
    );
}
