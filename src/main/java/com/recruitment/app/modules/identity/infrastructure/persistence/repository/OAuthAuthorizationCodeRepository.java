package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.infrastructure.persistence.entity.OAuthAuthorizationCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OAuthAuthorizationCodeRepository extends JpaRepository<OAuthAuthorizationCode, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select code
            from OAuthAuthorizationCode code
            where code.codeHash = :codeHash
            """)
    Optional<OAuthAuthorizationCode> findByCodeHashForUpdate(@Param("codeHash") String codeHash);
}
