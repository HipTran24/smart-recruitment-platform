# Release candidate pipeline — SCRUM-88

The owner requested CI verification only. This pipeline builds reviewable candidates; it does not create tags/releases, publish a registry package, deploy, change a DB, configure paging or approve promotion.

`release-ci.yml` runs for PRs, existing `v*` tag pushes and manual version input. PR versions are `0.0.0-ci.<run_number>`; manual/tag versions must pass a strict semver/path validation. Maven `${revision}` embeds that same version in the JAR. Build entry timestamps derive from the existing source commit timestamp; no Git date is modified. Source SHA, PR review-head SHA, clean-tree status and actual build time are recorded separately.

Required stages: JDK25 Maven clean verify with tests/coverage → resolved dependency OSV audit → Node22 npm install/audit/typecheck/22 tests/build → quality and release negative controls → bundle creation/checksum verification → pinned non-root runtime image → isolated missing-config safety smoke → retained CI artifacts. CodeQL runs as a separate required check; an artifact is explicitly `UNAPPROVED_CI_ARTIFACT` regardless of this packaging job's success.

Bundle contains the tested `api.jar`, deterministic static frontend and migration archives, manifest and SHA-256 inventory. It preserves V001–V011 as source files; no migration executes during packaging. JAR version, artifact hashes, archive member paths, migration inventory and committed source are verified. Checksums detect changes; they are not a substitute for signatures, trusted artifact provenance or independent review.

The runtime image copies the already tested JAR, uses a pinned Temurin25 base digest and UID/GID 10001. Packaging does not rebuild with skipped tests. `image-provenance.json` reports the local image ID/platform and non-root/config-rejection smoke. It is not a registry manifest digest or a production deployment proof. The image is saved as an archive; no registry credentials are needed. Container OS vulnerability scanning is a future promotion prerequisite; Maven OSV does not cover the base OS.

## Artifact selection and CI rollback protocol

`scripts/release/bundle.py` manages only verified artifact copies and symlinks inside an explicitly supplied state directory. It never starts/restarts a service, touches a DB, sends mail or runs cloud commands. Always use a new isolated temporary directory for a CI drill:

```sh
python3 scripts/release/bundle.py verify <downloaded-bundle>
python3 scripts/release/bundle.py activate <downloaded-bundle> --state-dir <new-isolated-ci-state-directory>
# Only when a previous verified candidate was genuinely activated:
python3 scripts/release/bundle.py rollback --state-dir <same-ci-state-directory>
```

Six synthetic fixture tests verify two-version activation/rollback, tamper rejection without changing the current selection, refusal when no previous artifact exists, version traversal rejection, preservation of existing regular files and embedded-version consistency. Fixtures are explicitly synthetic archives, not two real deployed versions. The service selector changes atomically after validation; a file lock serializes cooperating selector operations. The two current/previous links are not a transactional deployment across processes/hosts.

Before real promotion, the owner/admin must bind independent review and all required checks to the exact source, verify artifact provenance/digest and base-image scan, approve a version/tag, configure environment approval and external secrets, back up and rehearse restoration, confirm DB compatibility and deploy the same immutable artifact in staging. No approval environment was silently created: an unprotected GitHub Environment would not establish human approval.

A real rollback chooses a previously verified, still security-acceptable artifact and restarts the service through an approved deployment adapter, then checks readiness, role smoke tests and metrics. Additive V011 remains in place. There is no previously approved production artifact/environment in this CI scope, so a two-version service/DB deployment rollback is not claimed. Never roll back to a known vulnerable dependency set solely because it is older.

Release logs/reports and artifacts are retained for 30 days by Actions. Archive accepted evidence elsewhere before expiration if longer retention is required. This runbook and candidate output are review inputs, not a release acceptance signature.
