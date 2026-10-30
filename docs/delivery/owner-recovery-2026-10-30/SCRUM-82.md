# SCRUM-82 — CI quality gates and dependency remediation

Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-82
Branch: codex/SCRUM-82-ci-quality-gates; stacked on SCRUM-86.

Historical backend workflow ran Maven verify; shared recovery added frontend install/audit/typecheck/tests/build. It lacked coverage/SAST/report artifacts and backend dependency auditing. New workflows run all pull-request bases, preserve reports for 30 days and fail when tests, coverage, complete dependency audit or blocking SAST findings fail. No test/scanner is disabled to produce a green status.

## Published initial policy

- Maven JaCoCo 0.8.14, JDK25: total LINE >=55%, BRANCH >=40%; KpiService, CandidateApplicationAccessService, AuditEventService and ProductionEnvironmentGuard each LINE >=80%; legacy AuthenticationThrottlingService LINE >=65%. No production packages are excluded. These are explicit initial floors for review, not a claim of comprehensive coverage.
- Measured full 131-test run: 2533/4319 lines (58.65%), 879/1948 branches (45.12%). `security/coverage-measured.json` stores all counters. Forcing the four critical class floors to 100% produces exit 1 with all four violations; restoring the published policy produces exit 0. Thus the class rules actually match the intended classes.
- CodeQL v4 security-extended, Java/Kotlin manual build with required tests and JavaScript/TypeScript analysis. High/critical security score >=7.0 or error-level results block. All lower-severity results remain in the report. Missing/malformed/failed SARIF is a failed scan. Reports are artifacts; `upload: never` avoids depending on repository code-scanning upload settings, and databases are not published. Real remote SAST results are pending at the initial commit and must be checked in the final batch report.
- OSV audits **all resolved Maven dependencies including test scope**, fails on any active advisory or incomplete/unavailable scan. npm audit fails at high/critical in frontend CI; the actual current full npm audit has zero findings at every severity.
- Four synthetic unit tests prove gate rejection of missing/failed analysis, high/error results, empty dependency inventory and active advisory responses. They are negative controls, not a substitute for real scans.

## Actual security remediation

Initial resolved graph: 206 packages, 16 active OSV advisory occurrences across 5 packages. `security/osv-before.json` lists exact IDs and links. Updated Spring Boot 4.1.1→4.1.2, bringing Tomcat 11.0.24→11.0.27 and Jackson core/databind 3.1.5→3.1.7; Bouncy Castle 1.80→1.85; aligned OpenTelemetry BOM 1.62.0→1.67.0 (GHSA-ccrj-gw8r-854m fixed in 1.67.0). No framework major/runtime architecture change. All dependencies remain locked by Maven resolution/version management; no advisory allowlist.

Patched graph: **205 resolved package/version coordinates, complete OSV scan, 0 findings** at the timestamp in `security/osv-after.json`. Actual full Maven clean verify PASS, 131 tests, 0 failures/errors/skips, published coverage checks met. Argon2 migration, token/replay/live authorization, KPI, audit, readiness and trace tests all run with patched libraries. Fresh npm audit: 0 total findings. These are known-advisory checks at that time, not certification that every dependency/application path is safe.

Primary release reference: https://github.com/spring-projects/spring-boot/releases/tag/v4.1.2. OSV advisory sources and fixed ranges were read from the provider API; every before finding links its exact record. JaCoCo Java25 support: https://www.jacoco.org/jacoco/trunk/doc/changes.html.

## Merge enforcement remains an administrative gate

Repository ruleset list returned empty. Legacy main branch-protection GET returned **403 Resource not accessible by integration**. This does not prove legacy protection absent; its actual configuration is unverified. No admin setting was changed. `proposed-required-checks.json` is a concrete reviewable proposal, not applied state. Independent review remains required; no reviewer is fabricated. Earlier stacked PR heads have their own basic CI results; complete new gates are validated on this combined descendant tree and future PRs after the workflow is adopted.

## SAST triage and corrected gate

The first remote Java analysis produced two CSRF results. Its initial gate incorrectly read only driver rules and gave missing extension metadata a zero severity. That earlier PASS is **superseded**, not final security evidence. GitHub query help rates both `java/spring-disabled-csrf-protection` and `java/csrf-unprotected-request-type` at 8.8. The parser now reads driver and extension rules and fails on unresolved/missing security metadata. A fifth synthetic regression test proves an extension rule with severity 8.8 blocks and missing metadata fails.

Remediation enables Spring CSRF protection with narrow exemptions for explicit API Bearer credentials (still independently validated by JWT/live-account authorization) and the exact public JSON auth routes. Simple form requests and cookie-style protected mutations remain CSRF-protected. Request-attribute security context prevents OAuth sessions from becoming application credentials. Candidate application GET now reads existing profiles only; it never creates a profile or consent.

Full Maven clean verify after this correction **PASS: 133 tests, 0 failures/errors/skips**, all published coverage checks met. New tests verify read-only GET, rejected simple form/missing-CSRF mutation, and preserve owner/foreign-resource behavior. The existing 415 converter test retains its expected result and supplies a valid CSRF precondition; a separate security test covers rejection before conversion. No scanner suppression or expected-result relaxation. Remote CodeQL is being rerun on this correction and must be verified in the final report.
