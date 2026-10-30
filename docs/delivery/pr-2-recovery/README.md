# PR #2 — Hồ sơ recovery cho SCRUM-21

PR: [https://github.com/HipTran24/smart-recruitment-platform/pull/2](https://github.com/HipTran24/smart-recruitment-platform/pull/2). Jira chính: [SCRUM-21 — Authentication/Authorization với Spring Security và JWT](https://tranthanhhiep.atlassian.net/browse/SCRUM-21).

## Kết quả và phạm vi được duyệt

Người dùng đã chọn giữ PR #2 và chuyển phần diff sang hồ sơ recovery. Nhánh `codex/recovery/stash-20261003-001645` giữ nguyên hai commit stash/index gốc; cập nhật mới tích hợp main vào nhánh bằng merge có hai parent. Phần thay đổi so với main chỉ gồm hồ sơ kiểm toán này, bảng đối chiếu file và kết quả kiểm thử.

Hai commit gốc:

- [`1c9a425`](https://github.com/HipTran24/smart-recruitment-platform/commit/1c9a425ff6fe5cf6b75839eb9d6a43f3b8c3f92b): index on main: 48e561b refactor: update recruiter layout, dashboard and reorganize recruiter pages; ngày gốc 2026-10-03T00:16:45+07:00; tác giả myproject.
- [`66e908c`](https://github.com/HipTran24/smart-recruitment-platform/commit/66e908c7ea4c5e23820fb3fb9ee755bf35064cc3): WIP on main: 48e561b refactor: update recruiter layout, dashboard and reorganize recruiter pages; ngày gốc 2026-10-03T00:16:45+07:00; tác giả myproject.

## Vì sao 22 file cũ không còn là thay đổi chức năng mới

PR ban đầu có 2 commit, 22 file, 462 dòng thêm và 96 dòng xóa. Cả 21 phiên bản file còn tồn tại của stash đã có đúng nội dung, đúng đường dẫn trong tổ tiên main tại [`1ad6141`](https://github.com/HipTran24/smart-recruitment-platform/commit/1ad6141993d3952999dae5e6e2a28ea42468d9c0). Việc xóa `SecurityConfiguration.java` cũng đã có trên main.

Tại baseline main `ad9ef2b12dd05efcacac91ad975c9858ead94a23`: 6 file còn giống stash, 15 file đã được cập nhật tiếp và 1 file vẫn được xóa. Merge thử phát hiện 13 file conflict vì snapshot cũ và main đã sửa cùng nội dung. Các file mới mà stash chưa chứa — gồm cấu hình security thay thế, migration và key fixture test — đã tồn tại trong main.

Từng file conflict được đối chiếu với phiên bản đã tích hợp trong lịch sử, rồi giữ implementation mới hơn của main. Chín file còn lại được kiểm tra sau auto-merge. Trước khi thêm hồ sơ, toàn bộ Git tree của kết quả giải quyết conflict khớp tree main `e07e43d353c41e5af8a87051dc1e8264e5025b13`. Điều này kiểm chứng rằng ứng dụng được giữ ở baseline main đã thử nghiệm.

## Đối chiếu Jira

- **SCRUM-21:** phạm vi chính của snapshot là cấu hình authentication/JWT, OAuth, security boundary, environment và tài liệu identity. Hồ sơ mới chứng minh lịch sử của các phần này; không tuyên bố triển khai lại authentication.
- **SCRUM-27 / SCRUM-63:** cấu hình Gemini và lifecycle/lease/failure metadata của screening.
- **SCRUM-39:** wiring Docker Compose cho các biến và JWT secrets.
- **SCRUM-89:** cấu hình môi trường, key validation và runbook readiness liên quan; chưa chứng nhận vận hành production.
- Snapshot không thay đổi file frontend hoặc chức năng dashboard. SCRUM-81 không được dùng làm issue chính. Dockerfile không nằm trong 22 file nên SCRUM-38 không được nhận là thay đổi của PR này.

## Giải quyết từng file

| File | Tình trạng so với main | Conflict | Quyết định |
| --- | --- | --- | --- |
| `.dockerignore` | identical main | Không | Giữ loại trừ .local và cấu hình local; nội dung đang trùng main. |
| `.env.example` | superseded on main | Có | Giữ các biến và mặc định cấu hình mới hơn trên main; cấu hình JWT/OAuth/Gemini từ stash đã có trong lịch sử. |
| `.gitignore` | identical main | Không | Giữ loại trừ secrets local và tệp công cụ; nội dung đang trùng main. |
| `README.md` | superseded on main | Có | Giữ mô tả khả năng hiện tại của main, tránh quay lại mô tả baseline identity cũ. |
| `docs/README.md` | superseded on main | Không | Giữ mục lục tài liệu mới hơn trên main; liên kết runbook xác thực/AI đã được tích hợp. |
| `docs/api/README.md` | superseded on main | Có | Giữ contract và danh mục API hiện hành trên main; bảng identity cũ không thay thế tài liệu API mới. |
| `docs/architecture/backend.md` | superseded on main | Có | Giữ tài liệu kiến trúc hiện hành; mô tả identity và Gemini cũ đã nằm trong lịch sử main. |
| `docs/database/schema.md` | superseded on main | Có | Giữ ghi chú schema/migration hiện hành; không đưa tài liệu về phạm vi migration V001–V006 cũ. |
| `docs/runbooks/local-development.md` | superseded on main | Có | Giữ chỉ dẫn Maven Wrapper, JDK và verification output mới hơn của main. |
| `docs/runbooks/production-readiness.md` | identical main | Không | Giữ checklist production readiness hiện có; nội dung đang trùng main. |
| `docs/runbooks/troubleshooting.md` | identical main | Không | Giữ hướng dẫn JWT/OAuth/Gemini hiện có; nội dung đang trùng main. |
| `infra/docker/compose.local.yml` | superseded on main | Có | Giữ wiring dịch vụ và cấu hình hiện hành của main; phần JWT secrets của stash đã tích hợp trước đây. |
| `pom.xml` | superseded on main | Có | Giữ dependency, plugin và toolchain hiện hành trên main; không hạ về POM trong stash. |
| `scripts/lib/common.sh` | superseded on main | Không | Giữ xử lý Java/Maven mới hơn; kiểm tra JWT environment trong stash đã được tích hợp. |
| `scripts/run-local.sh` | identical main | Không | Giữ biến môi trường JWT/OAuth/Gemini hiện hành; nội dung đang trùng main. |
| `src/main/java/com/recruitment/app/common/security/SecurityConfiguration.java` | deleted in stash | Không | Giữ việc xóa cấu hình deny-all cũ; main đã có IdentitySecurityConfiguration thay thế, còn stash không chứa file thay thế. |
| `src/main/java/com/recruitment/app/modules/applications/infrastructure/persistence/entity/ApplicationScreening.java` | superseded on main | Có | Giữ implementation hiện hành; phiên bản lease/failure của stash đã được tích hợp tại 1ad6141 và sau đó được cập nhật. |
| `src/main/resources/application-local.yml.example` | identical main | Không | Giữ placeholder cấu hình local; nội dung đang trùng main. |
| `src/main/resources/application.yml` | superseded on main | Có | Giữ toàn bộ cấu hình hiện hành trên main, bao gồm các thay đổi sau snapshot ngày 03/10. |
| `src/test/java/com/recruitment/app/ApplicationTests.java` | superseded on main | Có | Giữ assertions phù hợp với code/schema hiện hành; test auth từ snapshot đã có trong lịch sử. |
| `src/test/java/com/recruitment/app/DomainLifecycleTests.java` | superseded on main | Có | Giữ bộ kiểm thử lifecycle hiện hành; không quay về test fixture và chữ ký method cũ. |
| `src/test/resources/application-test.yml` | superseded on main | Có | Giữ cấu hình test và key fixture hiện hành trên main; snapshot không chứa các key fixture được tham chiếu. |

## Kiểm thử trên kết quả sau xử lý conflict

| Kiểm tra | Kết quả |
| --- | --- |
| Frontend production build | PASS; có cảnh báo chunk lớn đã tồn tại |
| Frontend typecheck | PASS |
| Frontend Vitest | PASS: 3 file / 22 test, gồm route/role và dashboard Recruiter với mocked API |
| Backend Maven clean verify, JDK 25 + MySQL Testcontainers | PASS: 109 test, 0 failure, 0 error, 0 skipped |
| Git diff check | PASS |
| Lint | Chưa có script lint |
| Browser/backend E2E thật | Chưa chạy; thư mục mà script test:e2e tham chiếu không tồn tại |
| GitGuardian trên head gốc | PASS; kết quả head mới xem Checks của PR |
| npm audit | 3 finding high ở dependency phát triển đã có trên main: source-map-js, undici, vite |

Lần verify trước bị lỗi môi trường Docker. Sau khi daemon hoạt động và đặt DOCKER_HOST tới socket của Docker Desktop, clean verify đạt toàn bộ 109 test. Không skip test hoặc sửa expected result để đạt kết quả này.

Kết quả frontend chứng minh bộ regression hiện có; không thay thế kiểm thử E2E với backend thật. Các finding npm vẫn cần được sửa hoặc được owner đánh giá trong hạng mục dependency/security riêng. PR này không thay đổi dependency hay lockfile.

## Jira và bằng chứng đồng bộ

Title/description của PR mới chứa SCRUM-21 và URL issue. Điều đó chuẩn bị điều kiện nhận diện PR; chỉ xác nhận đồng bộ khi Jira Development Panel hiển thị đúng PR #2, repository và liên kết GitHub. Kết quả đọc sau khi push được cập nhật trong PR description. Không thay đổi trạng thái Jira trong công việc này.

## Rủi ro và rollback

- Không merge hai bản stash WIP vào production như một bản phát hành riêng. Source/config sau xử lý khớp main; hồ sơ là phần diff mới.
- Khi rollback riêng hồ sơ, tạo commit xóa thư mục `docs/delivery/pr-2-recovery/`. Giữ các thay đổi ứng dụng đang có trên main.
- Không revert merge về parent stash để rollback tài liệu: cách đó có thể phục hồi snapshot thiếu code hiện hành.
- Hai SHA gốc luôn là tổ tiên của commit recovery. Bản Git bundle trước xử lý được giữ local, không đưa vào repository.

## Checklist review

- [x] Kiểm toán đủ 22 file và đối chiếu exact blob với lịch sử main.
- [x] Xử lý 13 conflict, giữ hai parent và SHA gốc.
- [x] Kiểm tra tree ứng dụng khớp main, chạy build/typecheck/test thực tế.
- [x] Công bố finding bảo mật và giới hạn kiểm thử.
- [ ] Reviewer độc lập xác nhận hồ sơ và phạm vi Jira.
- [ ] Xem kết quả CI/GitGuardian cho head mới trong Checks.
- [ ] Xác minh PR #2 trong Jira Development Panel.
- [ ] Owner xử lý/chấp nhận finding dependency theo quy trình dự án.

Bộ bằng chứng gồm `file-lineage.csv` (22 file, blob SHA, trạng thái, conflict và quyết định) và `verification.json` (baseline, metadata commit gốc, lệnh và kết quả kiểm thử).
