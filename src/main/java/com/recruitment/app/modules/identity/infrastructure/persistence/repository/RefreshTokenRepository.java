package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.infrastructure.persistence.entity.RefreshToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Locks the credential row during rotation, making a refresh token
     * single-use even when two requests arrive concurrently.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select refreshToken from RefreshToken refreshToken where refreshToken.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    @Modifying(flushAutomatically = true)
    @Query("""
            update RefreshToken refreshToken
               set refreshToken.revokedAt = :revokedAt
             where refreshToken.id = :id
               and refreshToken.revokedAt is null
            """)
    int revokeByIdIfActive(@Param("id") Long id, @Param("revokedAt") Instant revokedAt);

    /**
     * Invalidates every still-usable session for one account. This is used on
     * logout-all, account deactivation, and refresh-token replay detection.
     */
    @Modifying(flushAutomatically = true)
    @Query("""
            update RefreshToken refreshToken
               set refreshToken.revokedAt = :revokedAt
             where refreshToken.userId = :userId
               and refreshToken.revokedAt is null
               and refreshToken.expiresAt > :now
            """)
    int revokeActiveByUserId(
            @Param("userId") Long userId,
            @Param("revokedAt") Instant revokedAt,
            @Param("now") Instant now
    );
}
