# Production Readiness

This repository provides only a local Compose environment. Before a production deployment, an accountable platform owner must approve the following controls:

- A managed secret store and a non-root database account with least privilege.
- TLS termination, network restrictions, encryption at rest, and tested database backup/restore procedures.
- Centralized structured logs with PII redaction, metrics/alerts, and a documented incident owner.
- Object-storage policy for CV uploads: private buckets, signed URLs, malware scanning, retention/deletion workflow, and access audit.
- A deployment-specific health/readiness strategy, resource limits, graceful shutdown, migration procedure, and rollback/forward-fix policy.
- Data retention, candidate consent, and access-control requirements reviewed for the deployment jurisdiction.

No credential, cloud account identifier, or production endpoint belongs in this repository.
