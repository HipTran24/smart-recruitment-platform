# Recruiter KPI contract — SCRUM-79

`GET /api/v1/recruiter/kpis?from=2026-10-01&to=2026-10-30&timezone=Asia%2FHo_Chi_Minh&jobId=123&source=PORTAL`

Authorization: Bearer JWT, ROLE_RECRUITER. Shared recruiting team (ADR 0003); company is not an authorization boundary. Candidates/admin receive 403; unauthenticated callers 401. Response contains aggregate counts only, no CV, email or name.

Required `from`, `to`: ISO local dates, inclusive, years 2000–2100, 1–366 days. Optional `timezone`: IANA ID, default UTC. Convert each local midnight using timezone rules (including DST) into a UTC half-open interval. Optional positive existing `jobId`. Optional `source`: case-insensitive slug `[A-Z0-9][A-Z0-9_-]{0,63}`. Invalid filters return 400 `INVALID_KPI_FILTER` with a safe fieldErrors entry. Valid filters with no matches return zero counts. Database failure propagates as a safe error, never a fake zero result.

The date interval selects the **submission cohort**. `stageReachCounts` counts distinct applications that have reached each stage through the current query, including current status when older history is incomplete. SUBMITTED always counts all submissions; a repeated history entry never double-counts an application. Rejected/withdrawn are separate outcomes, not sequential funnel stages. This is not a historical point-in-time snapshot. `generatedAt` makes this explicit.

Response: `{filters:{from,to,timezone,startInclusive,endExclusive,jobId,source},generatedAt,applications,stageReachCounts:{SUBMITTED,IN_REVIEW,SHORTLISTED,INTERVIEW,OFFERED,REJECTED,WITHDRAWN},bySource:{PORTAL:42}}`. Counts are nonnegative integers. Each application appears in one source bucket and can reach several stages.

`Cache-Control: no-store`: aggregate is computed from live data without application caching. Avoids stale decisions and cross-role cached responses. Query uses bound arguments, one grouped aggregate, existing history index plus V011 date/job/source indexes.

Candidate apply request gains an optional `source` with the same slug normalization; omission becomes UNKNOWN. Attribution is self-reported, never trusted for access or billing. V011 backfills existing rows to UNKNOWN because historical source data does not exist. V001–V010 remain unchanged. Apply migration in staging after backup; it adds one column and three indexes. Previous code ignores the added column, so application rollback leaves V011 in place; never automatically drop source data.

The existing hand-authored `/v3/api-docs` covers identity only. This document is the KPI contract; expanding that general spec is a separate documentation gap and does not imply all routes were already documented.
