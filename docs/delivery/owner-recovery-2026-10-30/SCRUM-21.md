# SCRUM-21 — Authentication / authorization verification

Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-21
Existing PR: https://github.com/HipTran24/smart-recruitment-platform/pull/2

Historical implementation: 1ad6141993d3952999dae5e6e2a28ea42468d9c0 (recovered snapshot already incorporated), 10544d7a3a571cd9637925b3bc4cca9a29e096ae (later auth/security and workflow code). Historical commit messages lack Jira keys; attribution is a trace, not a rewritten history. Original recovery evidence remains in ../pr-2-recovery.

## Confirmed gap and implementation

Candidate endpoints previously accepted an arbitrary application/offer ID. A role check alone did not enforce ownership. A transactional application service now checks candidate ownership before detail reads, withdrawal, accept/decline and both legacy response methods. Foreign and missing resources both return 404; no owner identifiers are exposed. Database-backed regression tests use two synthetic candidates and prove rejected mutations leave both records unchanged, while the owner can still read and accept.

Submission also manufactured a completed AI score of 85 and implicitly opted a newly created profile into AI processing. Those values are removed. New profiles deny consent. Actual screening must use the existing provider workflow and explicit consent; this patch does not claim the submission-to-worker integration is complete.

Implementation branch: codex/SCRUM-21-candidate-ownership. Its commit is also fast-forwarded to the existing recovery head for PR #2, preserving that PR and all ancestor commits. No duplicate PR, amend, force push or merge into main.

## Actual validation

- JDK Amazon Corretto 25.0.4.1; Testcontainers MySQL 8.4.11; Docker Desktop.
- Focused ownership + architecture: 11 tests, zero failures/errors/skips.
- Full `JAVA_HOME=<JDK25> DOCKER_HOST=unix://<Docker Desktop socket> ./mvnw -B -ntp -Dsmartrecruit.build.directory=/tmp/smartrecruit-owner-build clean verify`: **PASS**; Tests run: 111, Failures: 0, Errors: 0, Skipped: 0.
- `git diff --check`: PASS.
- Independent human review and current-head remote checks are separate gates; no approval is invented.

Per owner clarification, delivery targets CI verification only; no deployment or alert recipient setup is required in this execution.
