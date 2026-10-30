# Frontend → backend contract mapping

Status: Target; recruitment endpoints are not yet implemented. Existing UI mock
fields are not an API contract. Do not catch HTTP failures and silently use mocks
when a backend URL is configured.

| UI area | Target API prefix | Access |
|---|---|---|
| Login/register/session | `/api/v1/auth` | Public auth actions; authenticated `/me` |
| Candidate profile/settings/resumes | `/api/v1/candidates/me` | Candidate owner |
| Explore jobs/job details | `/api/v1/jobs` | Public OPEN, unexpired jobs only |
| My applications/status tracker | `/api/v1/candidates/me/applications` | Candidate owner |
| Candidate interview/offer | `/api/v1/candidates/me/interviews`, `/offers` | Candidate owner |
| Recruiter job list/studio | `/api/v1/recruiter/jobs` | Recruiter shared team |
| Candidate ranking/dossier/evaluation | `/api/v1/recruiter/applications` | Recruiter; applied candidates only |
| Interview calendar | `/api/v1/recruiter/interviews` | Recruiter |
| Offer management | `/api/v1/recruiter/offers` | Recruiter |
| AI feedback/review | `/api/v1/recruiter/feedback-drafts` | Recruiter; approval required |
| Notifications | `/api/v1/notifications` | Authenticated owner |
| Hiring analytics/overview | `/api/v1/recruiter/reports` | Recruiter |
| Admin user directory/role/status | `/api/v1/admin/users` | Platform Admin |
| Admin skill taxonomy | `/api/v1/admin/skills` | Platform Admin writes; active taxonomy readable by users |
| Admin audit explorer | `/api/v1/admin/audit-events` | Platform Admin; filtered metadata |
| Admin overview/settings | `/api/v1/admin/operations` | Platform Admin; no recruitment content |

IDs are strings; times are ISO-8601 UTC. Page responses are
`{items,page,size,totalElements,totalPages}` (default 20, maximum 100). Mutations
of versioned resources require the current version; stale updates return 409.
Resource responses are direct DTOs. Errors use code/message/fieldErrors/requestId.

Preserve the current auth route/request contract. SPA credentials remain in memory
and never go into localStorage, URLs, logs or analytics. Reload requires login.
Concurrent refresh must be serialized to avoid triggering token-reuse protection.

UI status labels must map explicitly to backend enums. AI status is separate from
application stage. Missing score is null, not zero. No UI status mock may grant
permissions. SAML/Okta, MFA, bulk CV imports, ATS integration and OCR remain outside
MVP. Candidate-directory browsing must not expose candidates who did not apply.
