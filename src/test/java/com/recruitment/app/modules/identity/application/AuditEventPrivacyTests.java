package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.port.out.AuditEventStore;
import com.recruitment.app.modules.identity.domain.model.AuditEventSnapshot;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AuditEventPrivacyTests {
    @Test
    void redactsUnknownFieldsAndRawIdentifiersAtThePersistenceBoundary() {
        var store=mock(AuditEventStore.class);
        var service=new AuditEventService(store);
        service.recordEvent(new AuditEventSnapshot(null,null,1L,"AUTH_LOGIN","API","private@example.test",
                "{\"password\":\"SECRET\",\"accessToken\":\"SECRET\",\"email\":\"private@example.test\",\"status\":401,\"method\":\"POST\"}","192.0.2.1"));
        var event=ArgumentCaptor.forClass(AuditEventSnapshot.class);verify(store).recordEvent(event.capture());
        assertEquals("0",event.getValue().resourceId());assertNull(event.getValue().ipAddress());
        assertEquals("{\"status\":401,\"method\":\"POST\"}",event.getValue().metadataJson());
        assertThrows(IllegalArgumentException.class,()->service.searchEvents(null,null,null,0,101));
        assertThrows(IllegalArgumentException.class,()->service.searchEvents(null,null,null,-1,25));
    }
}
