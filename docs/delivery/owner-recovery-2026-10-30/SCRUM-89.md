# SCRUM-89 — CI validation of production configuration

Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-89
Branch: codex/SCRUM-89-production-configuration; stacked on SCRUM-85.

Historical application.yml provided secure defaults and externally required DB/JWT values but no production profile or early policy validation. Added production/prod profile, bounded DB pool, graceful shutdown, DB-aware readiness independent from process liveness, forced safe error defaults and disabled SQL/bind logging. Runtime Flyway is off by default; migrations use a separate identity in an explicit step.

An EnvironmentPostProcessor runs after config loading and before beans/DB/migrations. It rejects unsafe effective settings, mixed local/test profiles, missing secrets, non-verified MySQL TLS, root runtime identity, shared migration identity, schema mutation, classpath JWT keys, HTTP issuer/CORS, mailbox/bootstrap admin, insecure AI transport and logging notification provider. Rejection lists property names only, never values. Existing RSA key loader still verifies actual key contents and pairing. `.env.production.example` contains references/placeholders only.

Actual full JDK25/MySQL8.4 Maven verify **PASS**; Tests run: 126, Failures: 0, Errors: 0, Skipped: 0. Tests include effective profile loading, policy rejection/acceptance using synthetic configuration references, and actual health endpoints under a simulated DB contributor failure: readiness 503, liveness 200, no internal details. Packaged JAR launched with missing production configuration exits 1 with the guard rejection before any Hikari pool starts.

The positive guard unit test validates the configuration contract only; it does not provision secret files, TLS or a notification provider. No SES/SMTP runtime adapter exists in this repository, so setting that provider alone will still fail bean wiring rather than silently use the test gateway. This remains a deployment prerequisite. Per owner clarification, only CI verification is required here; real production deployment is not claimed.

Before any future rollout: snapshot and restore the DB in isolation, validate V011 against a production-sized copy, run Flyway with migrator credentials, start runtime with non-DDL credentials, verify readiness and smoke auth/KPI, retain the old immutable artifact and backup. Roll back application binaries while retaining additive V011; do not drop source data, disable validation, run automatic Flyway repair, or restore over a shared DB without explicit authorization. Runtime→migration identity separation and input contract are reviewable; actual cloud permissions/backup/RPO/RTO are outside this CI execution.
