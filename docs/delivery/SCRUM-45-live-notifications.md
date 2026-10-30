# SCRUM-45 — Notifications without simulated audit events

Owner: Trần Gia Bảo. Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-45

Replaces fabricated audit rows and simulated actions on the recruiter notifications page with the current user's notification API. Reads GET /api/v1/notifications?page=&size=20 and unreadCount; read mutations use the existing PUT /{id}/read and /read-all endpoints. Reloads after confirmation; failed writes show an error rather than reporting success. Includes loading, error/retry, empty state, page navigation, accessible names/status messages and safe local recruiter action links. No recruiter call to an admin audit endpoint is introduced.

Tests: browser mark-read request and server-response refresh, viewport/WCAG checks at 360/768/1440, plus unit rejection of external/script/backslash/control-character action links. Full combined verification: 44 unit and 24 browser tests passed. No real recipient was notified.

Remaining: no recruiter audit history endpoint is available in the inspected controllers. The page states that audit history is unavailable rather than presenting fake events. End-to-end database-backed delivery and independent review are not certified.
