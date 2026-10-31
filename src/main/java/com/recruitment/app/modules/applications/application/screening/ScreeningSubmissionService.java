package com.recruitment.app.modules.applications.application.screening;

import com.recruitment.app.modules.applications.application.screening.port.out.ScreeningSubmissionStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import java.util.Set;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ScreeningSubmissionService {
    private final ScreeningSubmissionStore store;
    private final CvScreeningWorkflow workflow;
    private final Executor executor;
    private final ObjectProvider<CvScreeningGateway> provider;
    private final Set<Long> inFlight = ConcurrentHashMap.newKeySet();
    public ScreeningSubmissionService(ScreeningSubmissionStore store, CvScreeningWorkflow workflow,
            @Qualifier("screeningExecutor") Executor executor, ObjectProvider<CvScreeningGateway> provider) {
        this.store = store; this.workflow = workflow; this.executor = executor; this.provider = provider;
    }
    public ScreeningSubmissionStore.Status submit(Long user, Long application) {
        if (provider.getIfAvailable() == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI screening is not configured");
        var prepared = store.prepare(user, application);
        if (prepared.dispatch()) dispatch(prepared);
        return store.status(user, application);
    }
    public ScreeningSubmissionStore.Status status(Long user, Long application) { return store.status(user, application); }

    public Map<Long, ScreeningSubmissionStore.Status> statuses(Long user, List<Long> ids) {
        if (ids.size() > 100 || ids.stream().anyMatch(id -> id == null || id <= 0))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide up to 100 application IDs");
        return store.statuses(user, ids);
    }

    /** DB-backed dispatch also recovers pending work and expired leases after a restart. */
    public void resumePending() {
        if (provider.getIfAvailable() == null) return;
        for (var queued : store.due(8)) {
            try { submit(queued.userId(), queued.applicationId()); }
            catch (ResponseStatusException ignored) { /* Consent/ownership/input is revalidated before dispatch. */ }
        }
    }

    private void dispatch(ScreeningSubmissionStore.Prepared prepared) {
        if (!inFlight.add(prepared.id())) return;
        try {
            executor.execute(() -> {
                try { workflow.execute(prepared.id(), prepared.request()); }
                finally { inFlight.remove(prepared.id()); }
            });
        } catch (RejectedExecutionException full) {
            // Pending work remains in the DB; the dispatcher retries when a worker is free.
            inFlight.remove(prepared.id());
        }
    }
}
