# SmartRecruit operational signals — SCRUM-86

CI-validated configuration, not an installed production monitoring service. Per owner, real alert delivery is outside this execution.

- HTTP: `/actuator/prometheus` and `/actuator/metrics/**` require PLATFORM_ADMIN JWT; anonymous 401 and Candidate/Recruiter 403. Health probes stay public with no details. Keep collector access on a private network/TLS. `prometheus.yml` references an external, rotated short-lived collector JWT file; no token is committed. Do not grant candidate/CV access to a collector. Choose a workload credential/rotation policy before real installation.
- Metrics: HTTP response/error counts and latency histogram, JVM/pool metrics, pending/processing/failed screening, oldest pending age, expired leases, queue query availability and audit persistence failure counter. Queue queries share a five-second snapshot, use bounded labels, and return unavailable/NaN on DB failure rather than healthy zero. A FAILED gauge is an inventory count; incident alerting uses stalled pending/expired leases.
- Tracing: Boot-managed OpenTelemetry/Micrometer produces HTTP and screening spans, traceId/spanId correlation and bounded outcome labels. Full HTTP URL/query attributes are dropped to avoid OAuth-code/resource-ID capture. No application code adds CV text, email, bearer token, raw request body, application/user IDs or remote baggage. OTLP tracing export is disabled until `OTEL_TRACES_EXPORT_ENABLED=true` and an approved `MANAGEMENT_OPENTELEMETRY_TRACING_EXPORT_OTLP_ENDPOINT` are provided. OTLP metric/log exporters are disabled. No real trace backend connection is claimed.
- Logs: production ECS JSON includes server-generated requestId and available trace/span context. Application error/audit paths log safe classifications. Keep SQL/bind, HTTP wire and request body DEBUG logging off. Technical logs 30 days and audit 180 days follow ADR0003; this change does not implement automated retention/storage.
- Dashboard: import `dashboard.json` into Grafana and select a Prometheus data source. Eight panels cover API scrape health, error ratio, p95 latency, queue depth/age/leases, audit loss and queue-query health. The JSON is a configuration artifact, not fabricated screenshots or live data.

## Alert policy and incident steps

`alerts.yml` defines 7 rules. Both unhealthy and healthy synthetic cases for every rule are evaluated by promtool in CI. Thresholds: scrape down 2m (critical), >5% 5xx for 5m (critical), p95 >800ms for 10m (warning), pending age >300s for 5m (warning), expired lease for 2m (warning), any audit loss over 5m (critical), queue query unavailable for 2m (critical). These are initial reviewable operating thresholds, not observed production SLOs.

Owner label `project-owner` maps to Tran Thanh Hiep (Backend/AI/DevOps coordination); no Alertmanager receiver or personal channel is configured. A future owner-approved installation must bind routing/severity/escalation and test receipt before claiming alert delivery.

1. Acknowledge the fired rule and record time, release SHA/digest and environment. Check `/actuator/health/readiness` and `/liveness`, scrape auth/expiry, database connectivity and pool saturation. Never attach raw CVs, tokens, email lists or provider bodies to an incident.
2. Follow requestId/traceId from safe logs. Compare error/latency to the previous release. If a recent artifact correlates with impact, stop rollout and restore the previous verified immutable artifact; retain additive schema changes. Do not automatically repair Flyway or clean a database.
3. For pending/expired screening: verify dispatcher cadence, consent, provider quota and lease state. Reclaim only through the fenced workflow. Do not blindly requeue completed work, fabricate scores or send feedback. This instrumentation does not supply the missing durable dispatcher/submission integration.
4. For audit loss/queue query unavailable: protect available evidence, check storage/DB permissions and connectivity, restrict new sensitive mutations if evidence loss continues, and escalate to the project owner. The API deliberately does not retry a completed business mutation after an audit write fails.
5. Verify readiness, role smoke tests, error rate and queue recovery after mitigation. Record root cause and follow-up; close only after the owner confirms recovery. Real paging/rollback is not executed by this CI configuration.

Local CI commands:

```sh
docker run --rm -v "$PWD/infra/observability:/work:ro" -w /work --entrypoint /bin/promtool prom/prometheus:v3.15.1 check config --syntax-only /work/prometheus.yml
docker run --rm -v "$PWD/infra/observability:/work:ro" -w /work --entrypoint /bin/promtool prom/prometheus:v3.15.1 test rules /work/alerts.test.json
```

Workflow pins the validated image digest. Upstream configuration reference: https://docs.spring.io/spring-boot/reference/actuator/metrics.html and https://docs.spring.io/spring-boot/reference/actuator/tracing.html. Structured logging: https://docs.spring.io/spring-boot/reference/features/logging.html.
