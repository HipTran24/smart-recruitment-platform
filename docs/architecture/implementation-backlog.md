# Backend implementation backlog

This file tracks implementation, not just design. A stage is complete only when
its acceptance checks pass. The authoritative decisions are ADR 0003.

| Stage | Depends on | Deliverables | Acceptance | Status |
|---|---|---|---|---|
| G0 baseline | — | Java 25 Maven/CI/Docker/scripts, ADR, documentation and frontend mapping | Java 25 verify, consistent active docs | Complete: Java 25 clean verify, 47 tests passed |
| G1 foundations | G0 | Ports/domain refactor, architecture/style checks, request context/errors, OpenAPI, V007+ schema | Empty and V006 upgrades; Hibernate validate; no layer violations | Complete: Java 25 clean verify, 63 tests passed, V007 backfill validated, ArchUnit quality gates passing |
| G2 identity | G1 | Live account authorization, credential version, admin bootstrap, verification/reset/change password, Google linking, Argon2id migration and throttling | Replay/race/escalation/disabled account tests | Complete: Java 25 clean verify, 75 tests passed, live authorization, Argon2id migration, brute-force throttling, single-use token replay protection |
| G3 candidates/files | G2 | Profile/skills/history/consent, signed uploads, immutable versions, quarantine/ClamAV/parser isolation/deletion | Ownership, malware, parser limits, crash recovery | Pending |
| G4 taxonomy/jobs | G2 | Skill lifecycle, shared team jobs, immutable revisions, public search and expiry | Draft privacy, expiry race and revision invariants | Pending |
| G5 applications | G3,G4 | Apply/withdraw, status history, evaluation, ranking | Uniqueness under concurrency, valid transitions, actor history | Pending |
| G6 AI | G5 | Extraction, structured Gemini screening, evidence validation, HMAC fingerprint, durable execution | Provider failure, stale lease, revoked consent, no automatic decision | Pending |
| G7 communications | G5,G6 | Interviews, offers, feedback approval, SES delivery ledger, notifications/reporting | Offer race/expiry, no unapproved send, role-safe metrics | Pending |
| G8 operations | G7 | Safe audit, retention/purge, metrics/alerts and readiness | Idempotent purge, PII redaction and stalled-work detection | Pending |
| G9 deployment | G8 | Local services, Terraform, OIDC CD, migration step, TLS, backup/restore and rotation | Deployment/rollback/restore/rotation and worker recovery drills | Pending |

## Handoff requirements

Each implementation change records migration impact, endpoints, authorization,
checks run and remaining limitations. Do not mark stages complete after compile
alone, disable required tests, edit old migration checksums, or add placeholder
success responses. Keep replacement and callers in one coherent change.

The complete UAT path is register → verify → profile/consent → upload/scan → apply
→ screen → human review → interview → offer → accept. Test fixtures use synthetic
data. Cloud apply and real-provider smoke tests are opt-in deployment actions.

## Verification record (2026-10-03)

- G0: Java 25 `clean verify`: 47 tests, zero failures/errors/skips; MySQL 8.4
  Testcontainers, Flyway V001–V006 and Hibernate validate passed.
- G1: Java 25 `clean verify`: 63 tests, zero failures/errors/skips:
  - Ports/adapters hexagonal refactor for Identity (`OAuthAuthorizationCodeStore`)
    and Applications Screening (`ApplicationScreeningStore`), with atomic locking.
  - ArchUnit 1.4.1 quality gates: domain independence, application-infrastructure
    separation, api-persistence isolation, zero cyclic module dependencies, and
    production/controller/method line budget rules passing.
  - Public OpenAPI 3.1 endpoint at `/v3/api-docs` and `/v3/api-docs/openapi.json`.
  - Flyway V007 migration converting job creator membership to user references with
    tested upgrade backfill (`SchemaMigrationUpgradeTests` on MySQL 8.4 Testcontainers).
- G2: Java 25 `clean verify`: 75 tests, zero failures/errors/skips:
  - Schema V008: `credential_version`, `email_verified`, seed roles (`ROLE_RECRUITER`,
    `ROLE_PLATFORM_ADMIN`), and `email_verification_tokens` table.
  - Live account authorization: `LiveAccountValidator` checks user status and credential
    version on every request, immediately revoking active JWT access upon deactivation
    or password change.
  - Argon2id migration: `Argon2idMigratingPasswordEncoder` upgrades BCrypt hashes on login.
  - Authentication throttling: sliding-window rate limiter (5 failed attempts per 15 min,
    returning HTTP 429).
  - Password and verification workflows: password reset, email verification, and password
    change endpoints with single-use replay protection and session revocation.
  - Role escalation prevention: domain invariant prevents holding both `ROLE_PLATFORM_ADMIN`
    and `ROLE_RECRUITER`.
  - Google account linking uniqueness enforced at application service layer with HTTP 409 conflict handling (HTTP endpoint mapping scheduled for Sprint 3 frontend integration).
  - Initial admin bootstrap runner configurable via `app.identity.bootstrap-admin`.
- G3–G9 remain pending. Docker image build and AWS/provider smoke tests have not been run.
