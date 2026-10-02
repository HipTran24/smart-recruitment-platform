package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationScreening;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Locks one screening row while a worker changes its durable state. The lock is deliberately
 * acquired only by the short state-transition transactions; it must never surround an AI HTTP
 * request.
 */
@Repository
public interface ApplicationScreeningRepository extends JpaRepository<ApplicationScreening, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select screening
            from ApplicationScreening screening
            join fetch screening.jobApplication
            where screening.id = :screeningId
            """)
    Optional<ApplicationScreening> findByIdForUpdate(@Param("screeningId") Long screeningId);
}
