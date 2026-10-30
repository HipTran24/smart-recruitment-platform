# Recovery and incident procedure

This is a procedure for review, not evidence that a real environment was restored. The current owner scope is CI only; see [release candidate checks](release-ci.md) and [observability triage](../../infra/observability/README.md).

For a failed migration or schema drift, stop the rollout and preserve the exact artifact SHA, Flyway history, sanitized error class/request ID and backup reference. Validate configuration and migration checksums against the accepted source. Never automatically run `Flyway repair`, edit deployed V001–V010, set Hibernate update/create, clean a shared DB or run Compose down with volume deletion. Resolve drift through an approved forward migration or a restoration plan reviewed by the data owner.

For auth incidents, live account/credential-version validation invalidates old tokens after status/role/password changes. Verify with synthetic accounts or an explicitly authorized real account. Do not print bearer/refresh/reset tokens or alter the last administrator without a reviewed recovery path. Admin and Recruiter remain mutually exclusive; Admin cannot read CVs/dossiers.

For Gemini quota/timeouts, preserve submission and the durable failure/lease metadata, monitor retries, quota and consent, and use the fenced screening workflow. There is **no automatic deterministic score fallback**. Never manufacture a completed score, change recruitment status or send AI feedback without recruiter approval. Actual dispatcher/submission integration must be accepted separately; an empty metrics queue does not prove successful screening.

Backups must use the deployment's approved secret references, private storage, encryption, retention and scoped DB account. Prefer a protected client option file over passwords in shell arguments. A future drill must restore into a new isolated database, validate migration history and row/invariant checks, then verify application readiness and synthetic role flows. Do not restore over a shared DB as an exploratory check. Record actual timings/data checks; RPO/RTO and retention approval belong to the owner. No real backup/restore was performed by this CI task.

Application rollback retains additive schema/data and selects a previously verified immutable artifact. Rehearse compatibility first; a binary rollback is not a schema rollback. Do not select an old artifact with known security findings as an automatic response. Check health/error rate/latency/audit loss and stalled leases after mitigation. Preserve evidence and obtain owner acceptance before closing the incident.
