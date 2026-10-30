# SCRUM-79 — KPI API

Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-79
Branch: codex/SCRUM-79-filtered-kpi; stacked on existing PR #2.

Historical 10544d7 introduced unfiltered status counts in ApplicationService, but had no cohort/source/timezone API. Newly implemented contract is [KPI API](../../api/kpi.md). Added source capture, append-only V011 migration, aggregate port/store/service/controller, validation and Recruiter authorization. Existing auth PR is reused rather than duplicated. CI PR triggers now accept any base so stacked PRs run the same backend/frontend checks.

Actual full JDK25/MySQL8.4 `./mvnw -B -ntp -Dsmartrecruit.build.directory=/tmp/smartrecruit-owner-build clean verify`: **PASS**; Tests run: 117, Failures: 0, Errors: 0, Skipped: 0. Includes fresh migration and V010 data-preserving upgrade, invalid inputs, timezone boundary, DST, deduplication, RBAC, attribution and zero-result tests.

Measured synthetic benchmark: `KPI_BENCHMARK rows=10000 histories=10000 warmup=5 samples=20 p50_ms=16.657 p95_ms=17.558`. Local JVM timezone Asia/Ho_Chi_Minh, Docker Desktop MySQL8.4, one thread, 10,000 synthetic candidates/applications and 10,000 histories, 5 warmups then 20 aggregate service calls. SQL roundtrip and validation are measured; network/TLS/UI are excluded. Observed p95 is below the master plan's generic list target 500 ms. No agreed KPI-specific production dataset or load target was supplied; this is reproducible local evidence, not a production SLA certification. Exact benchmark runs in CI and prints measured results without a flaky wall-time assertion.

Risk: schema/index deployment needs the normal backup/migration review. Historical source remains unknown. Stage counts reflect current cumulative history of the selected cohort, not a reconstructed past snapshot.
