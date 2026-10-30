# SCRUM-88 — versioned CI release candidates

Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-88
Branch: codex/SCRUM-88-release-ci; stacked on SCRUM-82.

Historical Dockerfiles built local snapshots but no versioned release/approval/rollback pipeline existed. Added a CI candidate workflow with validated semver, Maven revision, actual source timestamp/SHA, mandatory backend/frontend/security checks, deterministic payload archives and checksums, migration inventory and a pinned non-root tested-JAR runtime image. No tag, registry package, approval environment or deployment is created automatically.

[Pipeline contract and rollback procedure](../../runbooks/release-ci.md). `recovery.md` now removes unsafe automatic Flyway repair/destructive shared-DB instructions, command-line example passwords and the incorrect claim of automatic deterministic AI score fallback.

Actual local validation before publication: six synthetic fixture release tests PASS, five quality-gate tests PASS; frontend clean install/audit/typecheck, 22 tests and build PASS. Combined current backend source after the SCRUM-82 security follow-up: full Maven clean verify **133 tests PASS**, no failure/error/skips and coverage gates met. Earlier 131-test versioned-JAR build is superseded by that security correction. Bundle/image smoke and exact-head remote candidate job are pending at the initial publication and will be recorded in the final report.

The six release tests demonstrate isolated artifact selection, two-version synthetic rollback, tamper rejection, absent-previous refusal, path validation and regular-file preservation. They are not a real two-version application/DB deployment rollback. Per owner clarification, only CI acceptance is required. Real environment approvals, runtime secret/provider setup, base-OS security scan, staging smoke, backup/restore and service restart remain prerequisites for future production promotion. Checksums are not signatures. Candidate promotion status is explicitly UNAPPROVED_CI_ARTIFACT.

Local real bundle verification and activation also PASS using the 133-test JAR: clean source 5cf5ed8, version 0.0.1-SNAPSHOT, all 11 migrations hashed and archived. A local linux/arm64 runtime image built from the pinned base runs as 10001:10001; the actual container exits 1 at the missing-production-config guard before a DB pool starts. No registry publication. Python CodeQL is added for the operational release/quality scripts; exact final-head reports remain a separate gate.
