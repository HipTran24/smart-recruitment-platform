# SCRUM-78 — Live application ranking

Owner: Trần Gia Bảo. Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-78

Replaces the candidate fixture screen with GET /api/v1/recruiter/applications. Reads the actual ApplicationResponse fields `status`, `screeningScore`, `matchedCriteria`, `missingCriteria`, recommendation and summary. Uses totalElements/totalPages, status/jobId filters and POST /{id}/transitions with `{stage,note}` rather than the old mismatched /stage contract. No backend contract is changed.

Fetches all pages before ranking/search/pagination, with a 10,000-record guard and explicit rejection of duplicates, incomplete pages or changed totals. Does not present a single server page as global ranking. Null/missing score is unknown, 0 stays 0. Rejects invalid numeric scores. Client filters/sort paginate the loaded set; API filters cancel obsolete requests and ignore late responses. Failed writes remain errors; success requires a matching response and a reload from the server.

Unit coverage: canonical endpoint/parameters, transition body, multiple pages, changing totals, duplicates, maximum size, criteria parsing and invalid scores. Browser coverage: 0 vs null, real HTTP request shape with route interception, saved status refresh, 409 error, empty/503, modal keyboard and 3 widths. Combined verification: 44 unit tests, 24 browser tests, typecheck and build passed.

Remaining acceptance: backend does not expose queued/failed/completed screening status on this response. No claim is made that unknown score means pending or failed. Backend apply() currently writes a hardcoded completed score of 85 for consented applicants (ApplicationService.java); backend owner must fix/verify scoring before these values are treated as actual AI results. Live database/API UAT and independent review remain required. The source is readable in `recruiter-pipeline.service.ts`; no production data was accessed or changed during tests.
