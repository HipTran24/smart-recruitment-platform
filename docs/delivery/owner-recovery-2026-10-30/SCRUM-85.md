# SCRUM-85 — rate limiting, audit and safe application errors

Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-85
Branch: codex/SCRUM-85-security-audit; stacked on SCRUM-79.

Historical 10544d7 implemented separate in-memory namespaces and 429/Retry-After, but check-then-record was not an atomic reservation and security requests were not persisted as audit events. Newly implemented reservations run before credential/provider work. Login checks/counts IP/account/pair atomically; registration, reset request/confirmation, email verification, refresh, OAuth exchange, password change and logout have pre-work reservations. Fixed windows expire at the exact boundary. Keys are hashed; a full 10,000-entry store rejects new keys instead of evicting active lockouts.

Policy per 15 minutes, per application process: login 5/account-IP pair, 25/account, 50/IP; registration 20/IP; reset dispatch 3/email and 20/IP; verify 20/IP; refresh 30/IP; OAuth exchange 30/IP; reset confirmation/password change 20/IP; logout 30/IP. Reservations include successful attempts; successful login releases account/pair counters, but preserves the IP budget. Invalid requests rejected before controller validation do not reserve work. X-Forwarded-For is untrusted by default. This is a bounded single-instance limiter, not a distributed/edge DDoS control.

A filter wraps security and records known authentication routes and API mutations, including denied/throttled results, in an independent transaction. Audit carries action, internal actor ID when authenticated by JWT, status, method and server-generated request ID. Anonymous attempts have no actor. Resource ID 0 means no identified resource; raw path/query/body, email, token, password and IP are excluded. Admin role/status mutations keep their specific event and allowed role/active metadata. Persistence-boundary allowlisting drops unknown metadata and enforces bounded pagination. Request failures and provider error bodies are never copied into audit.

Unexpected application error logs now record exception type and correlation ID without arbitrary exception messages/stack traces. The local notification gateway no longer logs recipient emails. This does not assert redaction of every third-party DEBUG logger; production logging must keep SQL/bind and request payload logging disabled.

Actual full JDK25/MySQL8.4 Maven clean verify **PASS**; Tests run: 121, Failures: 0, Errors: 0, Skipped: 0. New tests prove 32 simultaneous requests reserve exactly 5 login slots (27 denied), saturated storage stays bounded, persistence redacts credential/PII fields, and six real failed logins produce five 401 plus one 429 and six durable sanitized audit rows with Retry-After. Full run has no audit persistence failure. Existing reset/refresh/XFF/Argon2/replay tests remain included.

Audit-store outage logs a safe error and does not reverse an already completed mutation; observability must alert on this loss of evidence. No existing migration or historical commit was edited. Independent review and exact-head CI remain separate gates.
