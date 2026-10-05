package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.application.port.out.AuditEventStore;
import com.recruitment.app.modules.identity.domain.model.AuditEventSnapshot;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JpaAuditEventStore implements AuditEventStore {

    private final AuditEventRepository auditEventRepository;

    public JpaAuditEventStore(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Override
    public void recordEvent(AuditEventSnapshot event) {
        AuditEvent entity = new AuditEvent(
                event.actorUserId(),
                event.action(),
                event.resourceType(),
                event.resourceId(),
                event.metadataJson(),
                event.ipAddress()
        );
        auditEventRepository.save(entity);
    }

    @Override
    public List<AuditEventSnapshot> searchEvents(Long actorUserId, String action, String resourceType, int page, int size) {
        Page<AuditEvent> paged = auditEventRepository.searchEvents(actorUserId, action, resourceType, PageRequest.of(page, size));
        return paged.getContent().stream().map(this::toSnapshot).toList();
    }

    @Override
    public long countEvents(Long actorUserId, String action, String resourceType) {
        return auditEventRepository.searchEvents(actorUserId, action, resourceType, PageRequest.of(0, 1)).getTotalElements();
    }

    private AuditEventSnapshot toSnapshot(AuditEvent a) {
        return new AuditEventSnapshot(
                a.getId(),
                a.getCreatedAt(),
                a.getActorUserId(),
                a.getAction(),
                a.getResourceType(),
                a.getResourceId(),
                a.getMetadataJson(),
                a.getIpAddress()
        );
    }
}
