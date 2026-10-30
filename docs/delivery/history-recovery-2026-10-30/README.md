# Hồ sơ phục hồi lịch sử Git và đối chiếu Jira — 30/10/2026

Repository: https://github.com/HipTran24/smart-recruitment-platform. Chủ phạm vi Jira: **Thanh Hiệp Trần** (người dùng xác nhận Trần Thanh Hiệp).

## Kết quả thực hiện

- Đã đọc toàn bộ 92 issue của dự án SCRUM; 36 issue giao cho Hiệp gồm 34 Done và 2 To Do (SCRUM-50, SCRUM-70).
- Đã đọc comment và Web links của cả 36 issue: tất cả đều rỗng tại thời điểm kiểm kê.
- Đã fetch toàn bộ nhánh/tag origin; checkout không shallow. Ba nhánh gốc chứa 28 commit khác nhau, main chứa 27. Recruiter có thêm commit 9559eb7 ngoài main.
- Đã tìm 4 commit stash/index không còn reachable từ branch, tag hoặc reflog, rồi phục hồi nguyên SHA lên hai nhánh lưu trữ GitHub dưới đây. Tổng lịch sử gốc được giữ lại: **32 commit**.
- Hai stash có cùng tree 4ccc03a387e0b345ecb2bd0a83a8ef96b295035c. Đây là bản chụp WIP cũ, không phải hai tính năng mới và không phải nhánh để merge vào main.
- Tất cả blob thay đổi còn tồn tại trong hai stash đều đã reachable từ lịch sử origin trước khi recovery; không tìm thấy chữ ký private key/GitHub token/Google API key/AWS access key trong các file thay đổi.
- Đã tạo bundle local chứa các nhánh gốc và nhánh phục hồi; không đưa bundle vào GitHub. SHA-256: `9c83d33af9d2048f623919e3ea2334d798248d43f71312ac4e8171c8219180e7`.
- GitHub có 11 CI run lịch sử: 9 success, 2 failure. Kết quả gốc được giữ nguyên, không gọi lại thành công để che run lỗi.

## Nhánh phục hồi

| Nhánh GitHub | SHA gốc | Thời điểm gốc (+07:00) |
| --- | --- | --- |
| [codex/recovery/stash-20261003-001259](https://github.com/HipTran24/smart-recruitment-platform/tree/codex/recovery/stash-20261003-001259) | [afbfda5](https://github.com/HipTran24/smart-recruitment-platform/commit/afbfda5d3a0c9ae0a140102d5be1c4229bd652c5) | 2026-10-03T00:12:59+07:00 |
| [codex/recovery/stash-20261003-001645](https://github.com/HipTran24/smart-recruitment-platform/tree/codex/recovery/stash-20261003-001645) | [66e908c](https://github.com/HipTran24/smart-recruitment-platform/commit/66e908c7ea4c5e23820fb3fb9ee755bf35064cc3) | 2026-10-03T00:16:45+07:00 |

Mỗi stash giữ cả commit index ở parent thứ hai: `812895d188062d5c7939581b869cad18db000871` và `1c9a425ff6fe5cf6b75839eb9d6a43f3b8c3f92b`. Không apply stash lên mã nguồn hiện tại.

## Phân loại bằng chứng

- **A:** lịch sử có SCRUM-XX, còn reachable, có thể thử backfill. Hiện **0 commit lịch sử** có Jira key.
- **B:** có file/tài liệu liên quan và commit gốc truy được, nhưng thiếu Issue Key: **29 issue**. Quan hệ được suy luận từ nội dung/path hiện tại; chưa có xác nhận lịch sử của owner cho từng mapping.
- **C:** chưa tìm thấy bằng chứng thực hiện đúng phạm vi hoặc Jira vẫn To Do: **7 issue**.
- Tỷ lệ có artifact liên quan là 29/36 (80.6%). Đây không phải tỷ lệ hoàn thành chức năng, chất lượng hoặc tỷ lệ đồng bộ Jira.
- Jira assignee và Git author là hai dữ liệu độc lập. Tên Git gốc `myproject` được bảo toàn; việc issue giao cho Hiệp không tự chứng minh tác giả commit.
- Jira resolutiondate không phải commit date. Không có bằng chứng commit mới từ 07–30/10 trong các nhánh gốc được kiểm kê. Code có từ đầu tháng có thể liên quan issue đóng sau đó, nhưng không chứng minh có review/test/deploy tại ngày đóng issue.

## Đối chiếu toàn bộ 36 issue

`code-present` = có artifact triển khai liên quan; `partial` = có phần nền/tài liệu nhưng còn thiếu phạm vi; `unverified` = chưa có bằng chứng phù hợp; `not-started` = Jira To Do. Không trạng thái nào tự thay thế acceptance hoặc kiểm thử runtime.

| Jira | Trạng thái Jira | Nhóm / đánh giá | Bằng chứng chính | Phần chưa xác minh |
| --- | --- | --- | --- | --- |
| [SCRUM-1](https://tranthanhhiep.atlassian.net/browse/SCRUM-1) | Done | B / code-present | [pom.xml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/pom.xml) | Có source base/Maven; chưa chạy lại build trong đợt kiểm kê lịch sử. |
| [SCRUM-2](https://tranthanhhiep.atlassian.net/browse/SCRUM-2) | Done | B / partial | [compose.local.yml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/infra/docker/compose.local.yml) | Có Compose local; không có bằng chứng kết nối server triển khai. |
| [SCRUM-7](https://tranthanhhiep.atlassian.net/browse/SCRUM-7) | Done | B / code-present | [application.yml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/resources/application.yml) | Có cấu hình datasource/JPA và repository; không suy ra runtime MySQL từ file. |
| [SCRUM-10](https://tranthanhhiep.atlassian.net/browse/SCRUM-10) | Done | B / partial | [compose.local.yml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/infra/docker/compose.local.yml) | Có Docker local; AWS/server thực tế chưa được chứng minh. |
| [SCRUM-11](https://tranthanhhiep.atlassian.net/browse/SCRUM-11) | Done | C / unverified | Chưa có | Chưa tìm thấy Project Charter đã ký hoặc biên bản kick-off trong Git/Jira được đọc. |
| [SCRUM-14](https://tranthanhhiep.atlassian.net/browse/SCRUM-14) | Done | B / partial | [GeminiCvScreeningClient.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/applications/infrastructure/integration/gemini/GeminiCvScreeningClient.java) | Có Gemini client/structured output; chưa có bằng chứng PoC provider thật trên các mẫu CV. |
| [SCRUM-15](https://tranthanhhiep.atlassian.net/browse/SCRUM-15) | Done | B / code-present | [backend.md](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/docs/architecture/backend.md) | Có tài liệu kiến trúc/API; không chứng minh thời điểm họp phê duyệt. |
| [SCRUM-20](https://tranthanhhiep.atlassian.net/browse/SCRUM-20) | Done | B / partial | [pom.xml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/pom.xml) | Có Spring/JPA/test source; kết quả CI được liệt kê riêng; thiếu biên bản review Sprint 2. |
| [SCRUM-21](https://tranthanhhiep.atlassian.net/browse/SCRUM-21) | Done | B / code-present | [IdentitySecurityConfiguration.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/identity/infrastructure/security/IdentitySecurityConfiguration.java) | Có JWT/RBAC/auth source; không xác nhận toàn bộ acceptance bằng kiểm kê tĩnh. |
| [SCRUM-23](https://tranthanhhiep.atlassian.net/browse/SCRUM-23) | Done | B / code-present | [RecruiterJobController.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/jobs/api/RecruiterJobController.java) | Có API/use case Job; chức năng filter/contract cần kiểm thử theo acceptance. |
| [SCRUM-26](https://tranthanhhiep.atlassian.net/browse/SCRUM-26) | Done | B / partial | [CandidateController.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/candidates/api/CandidateController.java) | API hiện nhận metadata JSON và sinh storageKey; chưa chứng minh upload bytes PDF/DOCX, parser/scanner và lưu file an toàn. |
| [SCRUM-27](https://tranthanhhiep.atlassian.net/browse/SCRUM-27) | Done | B / code-present | [GeminiCvScreeningClient.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/applications/infrastructure/integration/gemini/GeminiCvScreeningClient.java) | Có Gemini adapter/workflow; provider thật chưa được gọi trong đợt này. |
| [SCRUM-31](https://tranthanhhiep.atlassian.net/browse/SCRUM-31) | Done | B / partial | [CvScreeningResult.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/applications/application/screening/CvScreeningResult.java) | Có score trong kết quả Gemini; chưa có bằng chứng nghiệm thu thuật toán CV–JD hoặc đánh giá chất lượng scoring theo tiêu chí dự án. |
| [SCRUM-35](https://tranthanhhiep.atlassian.net/browse/SCRUM-35) | Done | B / partial | [AccountNotificationGateway.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/identity/application/port/out/AccountNotificationGateway.java) | Chỉ tìm thấy gateway/logging cho account notification; không có JavaMailSender hay bằng chứng gửi email tuyển dụng/lịch hẹn thật. |
| [SCRUM-38](https://tranthanhhiep.atlassian.net/browse/SCRUM-38) | Done | B / code-present | [backend.Dockerfile](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/infra/docker/backend.Dockerfile) | Có Dockerfile backend/frontend; không chạy build image mới trong đợt kiểm kê. |
| [SCRUM-39](https://tranthanhhiep.atlassian.net/browse/SCRUM-39) | Done | B / code-present | [compose.local.yml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/infra/docker/compose.local.yml) | Có cấu hình local API/frontend/MySQL/Nginx; chưa chạy lại stack. |
| [SCRUM-40](https://tranthanhhiep.atlassian.net/browse/SCRUM-40) | Done | B / partial | [backend-ci.yml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/.github/workflows/backend-ci.yml) | Workflow chạy Maven verify; chưa tìm thấy SAST/coverage gate/frontend gate hoặc deployment tự động. |
| [SCRUM-44](https://tranthanhhiep.atlassian.net/browse/SCRUM-44) | Done | B / partial | [ThrottlingRateLimitingAndSecurityTests.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/test/java/com/recruitment/app/modules/identity/ThrottlingRateLimitingAndSecurityTests.java) | Có security/throttling test source; thiếu báo cáo OWASP và bằng chứng rate-limit Gemini đã nghiệm thu. |
| [SCRUM-46](https://tranthanhhiep.atlassian.net/browse/SCRUM-46) | Done | C / unverified | Chưa có | Không tìm thấy bằng chứng provision cloud, domain hoặc TLS đang hoạt động trong Git/Jira được đọc. |
| [SCRUM-47](https://tranthanhhiep.atlassian.net/browse/SCRUM-47) | Done | C / unverified | Chưa có | Không tìm thấy URL production, artifact deploy hoặc log triển khai/giám sát cloud có thể xác minh. |
| [SCRUM-50](https://tranthanhhiep.atlassian.net/browse/SCRUM-50) | To Do | C / not-started | Chưa có | Jira To Do; chưa có biên bản retrospective/nghiệm thu/đóng dự án. Hồ sơ recovery là đầu vào rà soát mới. |
| [SCRUM-59](https://tranthanhhiep.atlassian.net/browse/SCRUM-59) | Done | B / code-present | [AuthController.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/identity/api/AuthController.java) | Có auth/reset source; cần kiểm thử runtime theo vai trò. |
| [SCRUM-60](https://tranthanhhiep.atlassian.net/browse/SCRUM-60) | Done | B / code-present | [RecruiterJobController.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/jobs/api/RecruiterJobController.java) | Có API quản lý Job; cần xác minh đủ CRUD/filter theo story. |
| [SCRUM-63](https://tranthanhhiep.atlassian.net/browse/SCRUM-63) | Done | B / code-present | [CvScreeningWorkflow.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/applications/application/screening/CvScreeningWorkflow.java) | Có luồng screening và client Gemini; chưa chứng minh provider thật hoạt động. |
| [SCRUM-65](https://tranthanhhiep.atlassian.net/browse/SCRUM-65) | Done | B / code-present | [RecruiterInterviewOfferController.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/applications/api/RecruiterInterviewOfferController.java) | Có controller/service đánh giá và vòng tuyển dụng; chưa kiểm thử E2E. |
| [SCRUM-66](https://tranthanhhiep.atlassian.net/browse/SCRUM-66) | Done | B / partial | [UserNotificationService.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/identity/application/UserNotificationService.java) | Có notification source; logging provider không gửi external email; story kết quả/lịch hẹn chưa được chứng minh trọn vẹn. |
| [SCRUM-70](https://tranthanhhiep.atlassian.net/browse/SCRUM-70) | To Do | C / not-started | Chưa có | Jira To Do; chưa có URL cloud/HTTPS và kết quả truy cập theo vai trò. |
| [SCRUM-71](https://tranthanhhiep.atlassian.net/browse/SCRUM-71) | Done | B / code-present | [GoogleOAuth2SuccessHandler.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/identity/infrastructure/security/oauth/GoogleOAuth2SuccessHandler.java) | Có Google OAuth/PKCE source; chưa thực hiện provider login thật trong đợt này. |
| [SCRUM-72](https://tranthanhhiep.atlassian.net/browse/SCRUM-72) | Done | B / partial | [ApplicationService.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/applications/application/ApplicationService.java) | Có CRUD/approval feedback draft; chưa chứng minh gợi ý feedback bằng AI và gửi phản hồi thực tế. |
| [SCRUM-74](https://tranthanhhiep.atlassian.net/browse/SCRUM-74) | Done | B / code-present | [CandidateController.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/candidates/api/CandidateController.java) | Có API/profile/skill/experience source; paging, validation và quyền cần kiểm thử theo acceptance. |
| [SCRUM-79](https://tranthanhhiep.atlassian.net/browse/SCRUM-79) | Done | C / unverified | Chưa có | Không tìm thấy API/query tổng hợp funnel KPI theo Job/time/source trong backend; UI hoặc backlog không chứng minh API đã triển khai. |
| [SCRUM-82](https://tranthanhhiep.atlassian.net/browse/SCRUM-82) | Done | B / partial | [backend-ci.yml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/.github/workflows/backend-ci.yml) | Có Maven test workflow; chưa có coverage threshold/SAST hay bằng chứng required checks chặn merge. |
| [SCRUM-85](https://tranthanhhiep.atlassian.net/browse/SCRUM-85) | Done | B / code-present | [AuthenticationThrottlingService.java](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/java/com/recruitment/app/modules/identity/application/AuthenticationThrottlingService.java) | Có throttling/audit/error source; chính sách endpoint và redaction cần kiểm thử theo acceptance. |
| [SCRUM-86](https://tranthanhhiep.atlassian.net/browse/SCRUM-86) | Done | C / unverified | Chưa có | Không tìm thấy cấu hình dashboard/alert/traces/incident workflow đang vận hành; health/log mặc định chưa đủ chứng minh acceptance. |
| [SCRUM-88](https://tranthanhhiep.atlassian.net/browse/SCRUM-88) | Done | B / partial | [go-live.md](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/docs/runbooks/go-live.md) | Có hướng dẫn release/rollback; chưa có release pipeline có version/approval, deployment log hoặc rollback drill. |
| [SCRUM-89](https://tranthanhhiep.atlassian.net/browse/SCRUM-89) | Done | B / partial | [application.yml](https://github.com/HipTran24/smart-recruitment-platform/blob/ad9ef2b12dd05efcacac91ad975c9858ead94a23/src/main/resources/application.yml) | Có health probes, env/key configuration và hướng dẫn; chưa chứng minh production profile/dependency readiness/migration và rollback runtime. |

## Khi Hiệp kết nối Jira

1. Kết nối GitHub for Atlassian vào đúng repo/site; xác nhận quyền View development tools và Development feature.
2. Cho ứng dụng nhập lịch sử đủ điều kiện. Các commit cũ ở hồ sơ này không có SCRUM-XX nên chưa đủ điều kiện tự ghép theo commit message. Phục hồi SHA không tự bổ sung Issue Key.
3. Dùng CSV đối chiếu và commit URL để thêm Web links vào issue sau khi owner xác nhận mapping. Web links không tương đương native Development Panel và không thay đổi tác giả/ngày tạo commit.
4. Commit/PR hồ sơ recovery được tạo vào ngày thực hiện thật. Các Jira key trong PR mô tả phạm vi kiểm kê tài liệu, không chứng nhận các tính năng đã được hoàn thành hoặc review trước đây.
5. Thử một thay đổi thật thuộc issue phù hợp, có Issue Key ở branch/commit/PR. Xác minh branch, SHA, PR và trạng thái sau merge trực tiếp trong Development Panel trước khi mở rộng.
6. Nếu cần phục hồi thêm lịch sử ngoài phạm vi tìm thấy: thu thập Git bundle/reflog/nhánh chưa push từ máy thành viên hoặc bản backup khác. Chỉ khôi phục object gốc tồn tại trong nguồn đó.

## Bộ dữ liệu đi kèm

- `jira-hiep-snapshot.json`: mô tả, tiêu chí hiện có, trạng thái và mốc thời gian Jira của 36 issue; đã loại email/account ID.
- `hiep-jira-traceability.csv`: toàn bộ issue, SHA/URL lịch sử, nguồn file, CI và khoảng trống; PR/review lịch sử để trống vì không tồn tại trong truy vấn GitHub.
- `file-evidence.csv`: file URL cố định theo baseline SHA và các commit đã chạm vào đúng path đó. Commit chạm file là bằng chứng thay đổi file, không chứng nhận toàn bộ acceptance.
- `original-and-recovered-commits.csv`: 32 commit, parent SHA, author/committer gốc, thời điểm, nhánh và các file thay đổi.
- `historical-ci-runs.csv`: 11 run lịch sử và kết quả gốc; một run chỉ kiểm chứng revision/workflow tương ứng, không chứng nhận mọi issue liên quan.
- `audit-manifest.json`: baseline, đầu nhánh gốc/phục hồi, số liệu và checksum bundle.

## Kiểm chứng và giới hạn

Đã kiểm tra Git object integrity, parent/tree của các stash, khả năng đọc bundle và đầu nhánh remote. Hồ sơ là kiểm kê lịch sử và tài liệu; không chạy lại backend/frontend/UAT hoặc deploy. Các kết quả CI trong CSV là run có thật đã đọc từ GitHub.
Baseline của hồ sơ là main `ad9ef2b12dd05efcacac91ad975c9858ead94a23`; commit hồ sơ mới được tạo sau baseline và không nằm trong 32 commit lịch sử nêu trên. Ref nội bộ của Codex không được tính là lịch sử tác giả và không được publish.
Không thay đổi trạng thái Jira trong đợt này. Kết nối app/OAuth và kiểm thử Development Panel chưa thực hiện vì Hiệp sẽ kết nối sau. Hồ sơ không chứng nhận toàn bộ công việc tháng 10 đã hoàn thành hoặc đã đồng bộ.
