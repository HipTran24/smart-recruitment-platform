# SCRUM-81 — Analytics from a complete application cohort

Owner: Trần Gia Bảo. Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-81
Related chart task: https://tranthanhhiep.atlassian.net/browse/SCRUM-37

Removes static benchmark/accuracy/offer-rate/skill figures from HiringAnalyticsRecruiter. Uses the actual paginated applications endpoint, loads all pages with completeness/size guards, then applies job and submitted-date filters. The URL preserves filters through reload/back. Local date boundaries are explicit. Invalid/unsupported URL filters show an error; empty/error/loading have separate visible states. Missing scores are excluded from averages, while valid zero scores remain included.

Chart.js renders current application-status distribution with a semantic table containing the same values. A second table counts stages actually recorded in each application's history/current state; it does not infer skipped stages or invent conversion/hire rates. Chart.js is dynamically imported. The report labels cohorts by submission date, not by stage-event date. It never uses first-page counts as global KPIs.

Dependencies are proposed for lead review in this branch: Chart.js 4.6.1; npm and pnpm locks are included. Browser/test tooling is documented in the verification report. No dependency upgrade, workflow or code is merged automatically.

Verification: model tests for date/job intersection, invalid days, empty cohorts, current vs historical counts. Browser checks URL reload/back, empty/API failure, source-disabled state, accessible table/chart and 3 widths. The combined branch passed 44 unit/24 browser tests, typecheck and build.

BLOCKED acceptance: the inspected application DTO has no acquisition source and no normalized candidate-skill distribution. The report endpoints accept no job/date/source filters; a complete large-scale KPI API belongs to SCRUM-79. Source filtering and candidate skill distribution are explicitly unavailable. Chart.js status charts do not substitute for SCRUM-37 skill distribution acceptance. Do not sign off SCRUM-37/81 until the backend contract provides those fields/aggregates and a live test environment verifies them.
