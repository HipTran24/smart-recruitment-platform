# SCRUM-87 — Accessible authentication forms

Owner: Trần Gia Bảo. Base: `ad9ef2b12dd05efcacac91ad975c9858ead94a23`.
Jira: https://tranthanhhiep.atlassian.net/browse/SCRUM-87
Branch: `fix/SCRUM-87-accessible-auth-forms`.

## Reproduced defects

- Login, Register, ForgotPassword, ResetPassword and VerifyEmail rendered visible labels without an associated input ID. A label-based accessible query failed on each form.
- Two shared Input instances with the same label received the same ID.
- Shared Input did not associate helper/error messages with the field or expose invalid state.
- Login rejection rendered visible text without an alert role.

## Change

Associate all 12 authentication fields with their existing visible labels. Use React useId for shared Input fallback IDs, preserving explicit caller IDs. Combine caller aria-describedby with the rendered message and set aria-invalid on validation errors. Expose authentication errors as alerts and success messages as status updates. Authentication APIs, roles and password policy are unchanged.

## Verification, 30 October 2026

Node 24.21.0, npm 11.19.0; Windows. No browser/computer automation used.

- Regression before fix: `npm run test -- src/pages/auth/accessibility.test.tsx`: 9 failed tests, with jsdom enabled. An initial test harness invocation without jsdom also failed; it is not defect evidence.
- After fix: `npm run test`: 4 files, 31 tests passed (22 existing + 9 new).
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0; existing warning about chunks over 500 kB remains.
- `git diff --check`: passed.

Tests verify label-based field lookup, DOM focusability, rejected-login announcements and preservation of email, unique generated IDs, invalid state and message associations. These are component tests with mocked auth, not real-server login or browser keyboard/screen-reader certification. No backend test, UAT, mobile screenshot or contrast measurement was performed. Existing test:e2e points to an absent test directory on base and is not used as PASS evidence.

## Review, rollback and remaining acceptance

Request independent review from repository owner HipTran24. CI must be checked on the actual commit; do not infer success from local results. Revert this issue's commit to roll back. No dependency, workflow, database or deployment change is included.

SCRUM-87 remains only partially verified: browser keyboard order, focus visibility, contrast, mobile/tablet layouts and the remaining recruiting screens need validation. Jira currently says Done; this report does not certify the full acceptance criteria or change that status. Development Panel branch/SHA/PR matching must be verified before expanding recovery PR rollout. No merge is authorized by this report.

## Other tasks assigned to Trần Gia Bảo

## Follow-up: keyboard, contrast and mobile defects

The follow-up adds unique/error-linked Select IDs, modal focus containment and focus restoration, Escape dismissal, scroll locking, mobile drawer inert state and keyboard containment, global focus-visible outlines, darker auth submit buttons and sidebar caption contrast. Button becomes a positioning container so its visually hidden accessible name does not overflow the viewport from a horizontally scrolling table.

Real Chromium tests on the combined frontend verification branch passed for auth screens and recruiter ranking/analytics/notifications. WCAG 2 A/AA and 2.1 A/AA axe scans returned zero violations on those tested views, including open dialog/drawer. 360/768/1440 viewport screenshots and no-document-overflow assertions are included. This is automated evidence on synthetic API fixtures, not live-backend UAT or certification of all repository screens. See `docs/delivery/bao-frontend-verification.md` for the consolidated report and remaining dependencies.

Source inspection at the base revision found static metric/funnel arrays in HiringAnalyticsRecruiter.tsx (SCRUM-37/81) and static candidate/ranking fixtures in CandidateManagement.tsx (SCRUM-78). These are not live API evidence. API contract/owner coordination and integration tests are required before claiming completion. SCRUM-42 responsive and SCRUM-45 UI fixes need reproducible viewport/defect evidence. This PR addresses the concrete auth accessibility defects under SCRUM-87 only; it does not claim credit for those other issues.
