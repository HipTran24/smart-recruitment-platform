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

    @Transactional
    public void recordEvent(AuditEventSnapshot event) {
        auditStore.recordEvent(event);
    }

    @Transactional(readOnly = true)
    public List<AuditEventSnapshot> searchEvents(Long actorUserId, String action, String resourceType, int page, int size) {
        return auditStore.searchEvents(actorUserId, action, resourceType, page, size);
    }

    @Transactional(readOnly = true)
    public long countEvents(Long actorUserId, String action, String resourceType) {
        return auditStore.countEvents(actorUserId, action, resourceType);
    }
}
