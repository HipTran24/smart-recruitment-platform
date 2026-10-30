package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.infrastructure.persistence.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    @Query("select a from AuditEvent a where " +
            "(:actorId is null or a.actorUserId = :actorId) and " +
            "(:action is null or a.action = :action) and " +
            "(:resourceType is null or a.resourceType = :resourceType) " +
            "order by a.createdAt desc")
    Page<AuditEvent> searchEvents(
            @Param("actorId") Long actorId,
            @Param("action") String action,
            @Param("resourceType") String resourceType,
            Pageable pageable
    );
}
