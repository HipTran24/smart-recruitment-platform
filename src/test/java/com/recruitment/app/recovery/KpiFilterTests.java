package com.recruitment.app.recovery;

import com.recruitment.app.modules.applications.application.*;
import com.recruitment.app.modules.applications.application.port.out.KpiStore;
import com.recruitment.app.modules.applications.domain.model.KpiQuery;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class KpiFilterTests {
    @Test
    void respectsDaylightSavingAndRejectsOversizedOrReversedRanges() {
        var store = mock(KpiStore.class);
        var service = new KpiService(store);
        service.report("2026-11-01","2026-11-01","America/New_York",null,null);
        var query = ArgumentCaptor.forClass(KpiQuery.class);
        verify(store).aggregate(query.capture());
        assertEquals(25*3600,java.time.Duration.between(query.getValue().startInclusive(),query.getValue().endExclusive()).toSeconds());
        assertThrows(KpiFilterException.class,()->service.report("2026-01-01","2027-01-02","UTC",null,null));
        assertThrows(KpiFilterException.class,()->service.report("2026-01-02","2026-01-01","UTC",null,null));
    }
}
