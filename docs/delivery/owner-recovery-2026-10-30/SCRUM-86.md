# SCRUM-86 — observability verified in CI

Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-86
Branch: codex/SCRUM-86-observability; stacked on SCRUM-89.

Historical application.yml exposed health/info and correlation IDs, but lacked a metrics registry, trace bridge, queue signals, dashboards and tested alert rules. Added Boot-managed Prometheus/OpenTelemetry, protected metrics endpoints, HTTP histograms, privacy convention dropping full URLs/query attributes, screening observation spans and bounded queue/audit-loss signals. Production uses ECS JSON; OTLP exporters remain off until explicitly configured.

[Operational config, dashboard, thresholds and incident runbook](../../../infra/observability/README.md). No real receiver/backend or hosted dashboard was configured; owner explicitly requested CI only. The dashboard JSON contains queries, not invented live results.

Actual full JDK25/MySQL8.4 Maven verify **PASS**; Tests run: 131, Failures: 0, Errors: 0, Skipped: 0. Tests verify Admin-only Prometheus access, queue and audit metrics, actual trace/span context, full-URL attribute removal, and unavailable/NaN on DB metrics failure. A deliberate unit-test audit outage increments its counter while preserving the completed 201 response; its safe ERROR log is expected. Existing workflow transaction-boundary tests still pass.

Prometheus 3.15.1 promtool rule tests **PASS** for 7 unhealthy firing and 7 healthy non-firing assertions; config syntax PASS; dashboard JSON valid. Validated image digest `sha256:fa3302279710be2f21a8301ec17a8b4f2301fd829bd113839b3b6b02b6f191a2` is pinned in the CI workflow.

Scope limit: metrics describe the actual queue/workflow; they do not implement missing durable dispatch/submission wiring or certify a real alert recipient, retention job, collector JWT rotation, production load or trace export. These are future deployment/feature acceptance inputs, outside the owner's CI-only clarification.
