package com.recruitment.app.modules.applications.application.screening;

import com.recruitment.app.modules.applications.application.screening.port.out.ScreeningSubmissionStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.RejectedExecutionException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ScreeningSubmissionServiceTests {
    private final ScreeningSubmissionStore store = mock(ScreeningSubmissionStore.class);
    private final CvScreeningWorkflow workflow = mock(CvScreeningWorkflow.class);
    @SuppressWarnings("unchecked")
    private final ObjectProvider<CvScreeningGateway> provider = mock(ObjectProvider.class);
    private final CvScreeningRequest request = new CvScreeningRequest("Java", "Backend", List.of("Java"), "Java experience");

    @Test
    void aFullWorkerPoolKeepsTheDurableRequestPendingAndReturnsAcceptedState() {
        when(provider.getIfAvailable()).thenReturn(mock(CvScreeningGateway.class));
        when(store.prepare(1L, 2L)).thenReturn(new ScreeningSubmissionStore.Prepared(3L, request, true));
        var pending = new ScreeningSubmissionStore.Status(3L, "PENDING", null, null, null, null, false);
        when(store.status(1L, 2L)).thenReturn(pending);
        var service = new ScreeningSubmissionService(store, workflow, task -> { throw new RejectedExecutionException(); }, provider);
        assertEquals(pending, service.submit(1L, 2L));
        assertEquals(pending, service.submit(1L, 2L));
        verifyNoInteractions(workflow);
    }

    @Test
    void duplicateClicksCannotOccupyMultipleWorkersForTheSameAttempt() {
        when(provider.getIfAvailable()).thenReturn(mock(CvScreeningGateway.class));
        when(store.prepare(1L, 2L)).thenReturn(new ScreeningSubmissionStore.Prepared(3L, request, true));
        var tasks = new ArrayList<Runnable>();
        var service = new ScreeningSubmissionService(store, workflow, tasks::add, provider);
        service.submit(1L, 2L); service.submit(1L, 2L);
        assertEquals(1, tasks.size());
        tasks.getFirst().run();
        verify(workflow).execute(3L, request);
    }

    @Test
    void recoveryRevalidatesQueuedApplicationsAndDoesNothingWhenProviderIsDisabled() {
        var service = new ScreeningSubmissionService(store, workflow, Runnable::run, provider);
        service.resumePending();
        verifyNoInteractions(store);
        when(provider.getIfAvailable()).thenReturn(mock(CvScreeningGateway.class));
        when(store.due(8)).thenReturn(List.of(new ScreeningSubmissionStore.Queued(1L, 2L)));
        when(store.prepare(1L, 2L)).thenReturn(new ScreeningSubmissionStore.Prepared(3L, request, true));
        service.resumePending();
        verify(store).prepare(1L, 2L);
        verify(workflow).execute(3L, request);
    }
}
