package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.port.out.AuditEventStore;
import com.recruitment.app.modules.identity.domain.model.AuditEventSnapshot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class AuditEventService {

    private final AuditEventStore auditStore;

    public AuditEventService(AuditEventStore auditStore) {
        this.auditStore = Objects.requireNonNull(auditStore, "auditStore must not be null");
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void recordSecurityEvent(AuditEventSnapshot event) {
        recordEvent(event);
    }

    @Transactional
    public void recordEvent(AuditEventSnapshot event) {
                Objects.requireNonNull(event, "event");
        if (event.action() == null || !event.action().matches("[A-Z_]{1,64}") ||
                event.resourceType() == null || !event.resourceType().matches("[A-Z_]{1,50}")) {
            throw new IllegalArgumentException("Invalid audit classification");
        }
        String id = event.resourceId();
        if (id == null || !id.matches("[0-9]{1,20}")) id = "0";
        auditStore.recordEvent(new AuditEventSnapshot(null, java.time.Instant.now(), event.actorUserId(),
                event.action(), event.resourceType(), id, AuditMetadataSanitizer.sanitize(event.metadataJson()), null));
    }

    @Transactional(readOnly = true)
    public List<AuditEventSnapshot> searchEvents(Long actorUserId, String action, String resourceType, int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Invalid audit page");
        return auditStore.searchEvents(actorUserId, action, resourceType, page, size);
    }

    @Transactional(readOnly = true)
    public long countEvents(Long actorUserId, String action, String resourceType) {
        return auditStore.countEvents(actorUserId, action, resourceType);
    }
}
