# Production Readiness

This repository provides only a local Compose environment. Before a production deployment, an accountable platform owner must approve the following controls:

- A managed secret store and a non-root database account with least privilege.
- TLS termination, network restrictions, encryption at rest, and tested database backup/restore procedures.
- Centralized structured logs with PII redaction, metrics/alerts, and a documented incident owner.
- Object-storage policy for CV uploads: private buckets, signed URLs, malware scanning, retention/deletion workflow, and access audit.
- A deployment-specific health/readiness strategy, resource limits, graceful shutdown, migration procedure, and rollback/forward-fix policy.
- Data retention, candidate consent, and access-control requirements reviewed for the deployment jurisdiction.
- JWT RSA private/public key pair from a managed secret store, rotation runbook, unique issuer/audience/key id per environment, and an access-token TTL no longer than the configured 30-minute maximum.
- Exact CORS origin allow-list. Set `SERVER_FORWARD_HEADERS_STRATEGY=framework` only behind a trusted proxy/load balancer that overwrites and strips untrusted forwarded headers; otherwise leave it `none`.
- Google Cloud OAuth consent screen, redirect URI, client secret rotation, and an authenticated account-link policy. The implementation deliberately refuses email-only auto-linking to an existing local account.
- Gemini vendor assessment, API-key secret rotation, rate-limit/incident behavior, human recruiter review, and candidate consent/retention policy. CV scores must remain advisory; do not use them as an automated hiring decision.
- A durable scheduler/outbox or external worker trigger for pending CV screening. The current application has a recoverable workflow primitive, but deployment must supply execution cadence and monitoring.

No credential, cloud account identifier, or production endpoint belongs in this repository.
