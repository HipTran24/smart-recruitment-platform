package com.recruitment.app.modules.identity.application.port.out;

import com.recruitment.app.modules.identity.domain.model.AuditEventSnapshot;

import java.util.List;

public interface AuditEventStore {
    void recordEvent(AuditEventSnapshot event);
    List<AuditEventSnapshot> searchEvents(Long actorUserId, String action, String resourceType, int page, int size);
    long countEvents(Long actorUserId, String action, String resourceType);
}
