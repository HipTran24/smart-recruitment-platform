# Reviewed CodeQL results

The security gate still fails on high, critical and error-level results. It also fails
when analysis output is missing or invalid. Every result remains visible in the gate
report, including results reviewed as false positives.

`.github/codeql/reviewed-findings.json` records eight existing Java results reviewed
by Codex against the source and the passing negative controls:

- The deliberately weak RSA key in `RsaJwtKeyLoaderTests` is an in-memory input to
  `rejectsWeakRsaKeysAtStartup`; the test requires the production loader to reject it.
- `JdbcKpiStore` builds SQL only from literals and its immutable hardcoded `STAGES`
  list. Dates, job IDs and source filters are passed as JDBC bind arguments. The
  KPI filter and integration tests exercise the parameterized queries.
- The two throttling results select between IP/account/pair limits and an account
  fallback limit. Neither branch omits the limit. Login validation rejects empty
  email/password values, and the public proxy replaces client-supplied IP headers.
- The four JWT filter results are authentication control flow that the rule does
  not model: absent tokens still go through Spring Security route authorization;
  already-authenticated contexts are reused; new authorities are created only
  after token signature/claims and live-account checks. Invalid tokens receive 401.
  `JwtAccessTokenServiceTests` and `LiveAccountAuthorizationIntegrationTests` cover
  denial, token validation and account revocation.

Each reviewed result is restricted to its exact rule, file and source line, plus
the SHA-256 of that source file and relevant safeguards. Any guarded source change
invalidates the review and fails the gate until the finding is evaluated again.
New results never inherit a file-wide or rule-wide exemption. Gate tests verify
that changed source invalidates reviews and that a result on another line still
blocks.

The newly introduced Python clear-text migration-password finding was fixed in
the deployment implementation: the password now lives only in the deployment
process and temporary migration container. It is not covered by a review exemption.
The migration identity is locked after success or failure, and its credential is
absent from the runtime container.
