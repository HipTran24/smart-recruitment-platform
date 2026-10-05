# SmartRecruit — Kịch bản tổng thể cho AI agent hoàn thiện và đưa website vào vận hành

**Ngày chuẩn bị:** 06/10/2026. **Trạng thái:** Kịch bản giao việc; chưa phải chứng nhận hệ thống đã hoàn thành hoặc đã triển khai.

**Cách sử dụng:** Giao toàn bộ tài liệu này cho AI coding agent đang mở repository SmartRecruit. Agent phải thực hiện công việc và cung cấp bằng chứng kiểm thử theo từng chặng. Các đường dẫn/script được ghi là “đề xuất” phải được triển khai trước khi sử dụng; không giả định chúng đã tồn tại.

## 1. Nhiệm vụ và kết quả cuối cùng

Bạn là AI coding agent chịu trách nhiệm triển khai và kiểm chứng SmartRecruit từ frontend, backend, database đến môi trường chạy. Hãy tiếp tục trên code hiện có, hoàn thiện các chức năng còn thiếu, sửa lỗi tích hợp, chuẩn hóa dữ liệu và đưa sản phẩm đến trạng thái có thể sử dụng thực tế.

Luồng nghiệp vụ bắt buộc:

**Recruiter tạo và đăng tin → Candidate đăng ký/xác minh → hoàn thiện hồ sơ/consent → tải CV → ứng tuyển → xử lý CV/AI hỗ trợ → Recruiter đánh giá → phỏng vấn → gửi offer → Candidate phản hồi → hai bên xem kết quả và lịch sử.**

Luồng Admin bắt buộc: quản lý tài khoản, role/status, skill taxonomy, audit metadata và vận hành nền tảng trong đúng phạm vi quyền.

Ba mức bàn giao cần phân biệt:

| Mức | Kết quả | Bằng chứng tối thiểu |
| --- | --- | --- |
| **L1 — Local hoàn chỉnh** | Một môi trường local chạy được toàn bộ luồng bằng dữ liệu tổng hợp | Lệnh khởi động, URL truy cập, database thật, browser E2E, Postman report, restart không mất dữ liệu |
| **L2 — Sẵn sàng phát hành** | Artifact có phiên bản, môi trường staging kiểm chứng, migration/backup/restore và cấu hình production đầy đủ | CI report, image digest, cấu hình được kiểm tra, release checklist, staging smoke và recovery drill |
| **L3 — Website đã hoạt động công khai** | Domain/HTTPS hoạt động, artifact đã kiểm chứng được triển khai đúng môi trường, dịch vụ cần thiết chạy thật | URL đã mở từ mạng ngoài, TLS, role smoke test, provider test được phép, monitoring và người nhận bàn giao |

Không gọi L1 hoặc L2 là “đã đưa website lên production”. Nếu chưa có domain, tài khoản triển khai hoặc quyền thao tác môi trường, hoàn thành phần độc lập, chuẩn bị gói release có thể review và ghi chính xác điều kiện còn thiếu để đạt L3.

## 2. Nguồn chuẩn và nguyên tắc thực hiện

Đọc trước khi chỉnh sửa:

- [ADR 0003 — quyết định MVP](docs/adr/0003-backend-mvp-baseline.md).
- [Kế hoạch tích hợp chi tiết INT-00–INT-14](docs/architecture/frontend-backend-integration-plan.md).
- [Backend backlog](docs/architecture/implementation-backlog.md), [baseline inventory](docs/architecture/integration-baseline-inventory.md).
- [API mapping](docs/api/frontend-mapping.md), [API convention](docs/api/README.md), [database schema](docs/database/schema.md).
- [Kịch bản UI/UX](docs/ui-ux-redesign-script.md), [local runbook](docs/runbooks/local-development.md), [production readiness](docs/runbooks/production-readiness.md).
- Các `AGENTS.md` áp dụng cho thư mục đang làm và cấu hình build thực tế.

Tài liệu ngày 05/10 là baseline lịch sử; mã nguồn đã thay đổi. Đối chiếu code trước khi kết luận một tính năng “chưa có” hoặc “đã xong”. Báo cáo test cũ không thay thế kiểm thử checkout bàn giao.

Quy tắc làm việc:

1. Bảo toàn thay đổi chưa commit của người dùng; xem diff trước khi sửa file liên quan. Không reset repository hoặc ghi đè công việc khác.
2. Duy trì React, TypeScript, Tailwind, Spring Boot, Java, MySQL và Flyway theo cấu hình/ADR. Không đổi framework hoặc nâng major dependency chỉ để thuận tiện triển khai.
3. Làm từng luồng xuyên suốt database → backend → frontend → kiểm thử. Mỗi increment phải có thể review và chạy được.
4. Mọi API mới có contract, quyền, validation, use case, persistence, lỗi, request mẫu và test. Không trả thành công từ placeholder.
5. Không coi JPA entity, mock UI, OpenAPI description hoặc test dùng mock là bằng chứng đã có API hoạt động.
6. Không bỏ qua test bắt buộc, sửa expected result để che lỗi, mở `permitAll` diện rộng hay tự gỡ chức năng cốt lõi để đạt trạng thái hoàn thành.
7. Tiếp tục công việc đã được giao trong repository và môi trường test. Chỉ hỏi khi thiếu lựa chọn ảnh hưởng thực chất tới nghiệp vụ hoặc thiếu quyền/đầu vào triển khai; hỏi một lần với kết quả đã chuẩn bị cụ thể.
8. Nếu bị chặn ở một dịch vụ ngoài, tiếp tục phần độc lập và kiểm thử adapter bằng môi trường test. Ghi rõ integration thật chưa được xác minh.
9. Không tự tạo dịch vụ trả phí, đổi DNS, thay đổi database chia sẻ, deploy production hoặc gửi thông báo tới người thật nếu chưa có quyền cho đúng hành động đó. Khi đã được cho phép trong phiên, không hỏi lại cho cùng phạm vi.
10. Dùng dữ liệu tổng hợp trong local/CI. Các test tạo, đổi mật khẩu, khóa tài khoản hoặc xóa file chỉ tác động tới fixture được xác định rõ.

## 3. Điểm phải kiểm tra ngay trên checkout hiện tại

Các quan sát dưới đây dựa trên mã nguồn ngày 06/10/2026, chưa thay thế kiểm thử runtime:

| Mức ưu tiên | Hiện trạng | Yêu cầu đối với agent |
| --- | --- | --- |
| P0 | Backend `/auth/me` trả `roles`; frontend `AuthenticatedUser`, login và guards đọc `roleCodes`; auth service hiện chưa map | Giữ wire contract tương thích, thêm adapter rõ ràng hoặc thống nhất frontend; test bằng response backend thật |
| P0 | Có `RequireAuth`/`RequireRole` nhưng `App.tsx` chưa gắn chúng vào các route workspace | Đặt guard vào cây route; API vẫn kiểm tra quyền độc lập; public job browsing vẫn public |
| P0 | Test mailbox endpoint đang public và chỉ chặn khi active profile tên `prod`/`production` | Tắt mặc định, chỉ tạo controller/allowlist trong cấu hình test/local tường minh, ngăn truy cập từ deployment công khai |
| P0 | Refresh đã có shared promise, nhưng chưa thấy session generation bảo vệ response đến muộn; refresh fetch chưa có timeout riêng | Kiểm thử và sửa logout/login race, timeout, token rotation; không cho response cũ khôi phục phiên |
| P1 | Có route chi tiết mang ID nhưng điều đó chưa chứng minh page đọc đúng resource từ API | Kiểm tra `useParams`, service, loading/404 và dữ liệu thực cho từng route |
| P1 | Có cả `infra/docker/nginx.conf` và `frontend/nginx.conf`; Dockerfile đang có thay đổi chọn file sau | Chốt một nguồn cấu hình hiệu lực, bảo toàn diff, test proxy/SPA/OAuth và ghi đúng đường dẫn |
| P1 | Có auth UI/API client/Docker frontend; nghiệp vụ tuyển dụng vẫn thiếu controller | Tái sử dụng nền tảng, xây phần còn thiếu theo ticket thay vì viết lại auth từ đầu |
| P1 | Toolchain inventory ghi Node 26, nhưng `.mise.toml` và frontend Dockerfile dùng Node 22 | Chọn bản tương thích dependency đã khóa; chứng minh install/test/build cả local và container |
| P1 | Một số tài liệu/Postman vẫn nói lấy token từ log và chưa phản ánh mailbox mới | Cập nhật theo cơ chế thực tế; không đưa token vào log để khớp tài liệu cũ |

Phân loại mỗi quan sát thành `confirmed`, `resolved`, `needs reproduction`; lưu bằng chứng. Không mở rộng công việc thành một cuộc viết lại toàn bộ chỉ vì có lỗi nền tảng.

## 4. Phạm vi chức năng và quyền

### 4.1 Candidate

- Đăng ký, đăng nhập, xác minh email, quên/đặt lại/đổi mật khẩu, logout.
- Tìm kiếm/lọc/sắp xếp/phân trang tin tuyển dụng; xem đúng job; lưu/bỏ lưu nếu UI giữ chức năng này.
- Hồ sơ cá nhân, kỹ năng, học vấn, kinh nghiệm, consent và preference được hỗ trợ.
- CV PDF/DOCX theo contract: upload, scan, parse, xem trạng thái, chọn phiên bản dùng để ứng tuyển.
- Apply, theo dõi application và history, withdraw khi rule cho phép.
- Xem lịch phỏng vấn, thông tin offer, accept/decline đúng phiên bản và hạn phản hồi.
- Chỉ đọc/sửa tài nguyên sở hữu; đổi ID trên URL/body không vượt được quyền.

### 4.2 Recruiter

- Shared recruiting team theo ADR; company là metadata, không là cơ chế cấp quyền.
- Tạo/sửa draft, publish/close job, xem revisions, quản lý danh sách và các bộ lọc.
- Xem applicant đã ứng tuyển, dossier và đúng phiên bản CV, review/evaluation, chuyển stage hợp lệ.
- Xem AI score/evidence, phân biệt pending/failed/missing data; AI không tự quyết định kết quả tuyển dụng.
- Lập/sửa/hủy lịch phỏng vấn; tạo, kiểm tra, gửi và thu hồi offer theo rule.
- Feedback AI hoặc thủ công phải được người dùng duyệt đúng version trước khi gửi.
- Notifications, report, funnel và overview dùng số liệu server thống nhất khoảng thời gian.

### 4.3 Platform Admin

- User directory, role/status, bảo vệ last active admin và các tổ hợp role bị cấm.
- Taxonomy lifecycle, audit metadata, operational overview và settings nằm trong allowlist.
- Không đọc CV/dossier, không can thiệp quyết định tuyển dụng và không đồng thời mang role Recruiter.
- Chuyển các màn hình tuyển dụng cũ khỏi workspace Admin; không mở rộng quyền backend để khớp mock UI.

Các chức năng ngoài MVP đã được tài liệu xác định gồm OCR, ATS, SAML/Okta, MFA và bulk CV import. Không âm thầm bổ sung hoặc hiển thị là đã hoạt động. Screening batch của các application đã tồn tại có thể triển khai nếu thuộc UI được chốt; phân biệt với upload CV hàng loạt.

Core scope chỉ được thay đổi khi có quyết định được ghi nhận. Thiếu API không phải lý do tự chuyển một chức năng cốt lõi thành “deferred”.

## 5. Đầu vào để triển khai thật

Agent lập một hồ sơ cấu hình, chỉ ghi reference hoặc placeholder, không yêu cầu đưa secret vào chat/Git:

| Đầu vào | Local/test | Để đạt L3 |
| --- | --- | --- |
| Đích triển khai | Compose cô lập | Hosting/account/region được phép dùng, owner và quyền thao tác |
| Domain | localhost | Domain/subdomain, quyền DNS, phương án cấp/gia hạn TLS |
| Ngân sách | Không tự phát sinh cloud resource | Hạn mức hạ tầng, email, AI và thông báo khi gần ngưỡng |
| Database | MySQL test/local riêng | Host/schema, secret reference, runtime/migration identity, backup policy |
| CV storage | Storage riêng cho test | Private storage, signing, CORS, retention, scanner và quyền truy cập |
| Email | Mailbox/test gateway | Sender/domain đã xác minh, provider credential reference, sandbox/quota và người nhận test được phép |
| Gemini | Provider stub cho kiểm thử | Key reference, model được chọn, quota/cost cap, quyền chạy smoke |
| OAuth nếu bật | Tắt hoặc test cấu hình riêng | Client reference, callback URL, account-link policy |
| Vận hành | Console/test reports | Owner trực, nơi xem log/metrics, kênh cảnh báo đã được phép cấu hình |
| Dữ liệu thật | Dữ liệu tổng hợp | Consent/retention, lịch backup và RPO/RTO được chủ hệ thống xác nhận |

Hướng hạ tầng được ADR chấp nhận là AWS demo trên một EC2 cho Nginx/API/worker/scanner, RDS private, S3, ECR, SSM, SES và CloudWatch. Chỉ tạo hạ tầng theo target đã được xác nhận; không tự thêm Kubernetes hoặc kiến trúc đa dịch vụ. Một EC2 không được mô tả là high availability.

Thông tin còn thiếu cho L3 không chặn hoàn thiện L1, kiểm thử, build artifact hoặc chuẩn bị tài liệu cấu hình. Không dùng giá trị giả để giả lập một deployment production đã hoàn thành.

## 6. Cách tổ chức công việc và lưu tiến độ

Tạo hoặc cập nhật các artifact sau khi thực thi, không ghi trước trạng thái PASS:

```text
docs/delivery/implementation-status.md    # Ticket, dependency, bằng chứng, blocker
docs/delivery/feature-inventory.md        # Page/action ↔ API ↔ role ↔ test
docs/delivery/test-report.md              # Lệnh và kết quả thực tế theo revision
docs/delivery/release-manifest.md         # Revision, migration, image digest, env
docs/runbooks/go-live.md                  # Trình tự triển khai đã kiểm chứng
docs/runbooks/recovery.md                 # Restore, rollback và worker recovery
```

Với mỗi ticket: xác định đầu vào → chốt contract/invariant → triển khai DB/use case/API/UI → test đúng rủi ro → cập nhật tài liệu → ghi kết quả → chuyển việc tiếp theo. Không dừng chỉ vì hoàn thành một page hoặc một lớp kỹ thuật.

Sau mỗi mốc, báo ngắn gọn: luồng nào đã chạy, kiểm tra nào pass, điều gì chưa xác minh và việc tiếp theo. Nếu context bị gián đoạn, đọc trạng thái và diff để tiếp tục; không tự khởi động lại từ đầu hoặc đánh dấu complete theo trí nhớ.

## 7. Kịch bản thực hiện theo 12 chặng

### Chặng 00 — Audit thực tế và khởi động baseline

**Tương ứng:** INT-00–01. **Phụ thuộc:** không.

1. Đọc hướng dẫn, diff, package/lockfile, backend controller, migrations, Compose và router.
2. Rà lại toàn bộ page/action; ghi trạng thái `existing`, `partial`, `missing`, `outside accepted MVP` dựa trên code và hành vi.
3. Chạy baseline backend/frontend theo toolchain thực tế; ghi lỗi đã có trước, không coi báo cáo cũ là kết quả mới.
4. Kiểm tra nguồn cấu hình Nginx, hai cơ chế chạy dev/container, port trùng và origin thực tế. Không dừng tiến trình không thuộc task.
5. Chốt status machines, role/ownership matrix, ID wire format, paging, version và lộ trình migrations.

**Đầu ra:** inventory, baseline report, danh sách P0/P1, thứ tự triển khai có dependency.

**Cổng Q0:** có thể tái hiện baseline bằng lệnh; mỗi luồng core có ticket sở hữu; ghi rõ các thay đổi người dùng cần bảo toàn.

### Chặng 01 — Sửa nền tảng tích hợp và bảo vệ phiên

**Tương ứng:** INT-02–03. **Phụ thuộc:** Q0.

1. Sửa mismatch `roles`/`roleCodes`, giữ endpoint auth tương thích; kiểm tra ID số của `/me`, không cast TypeScript để che sai JSON.
2. Gắn `RequireAuth`/`RequireRole` vào router. Root/fallback và menu chuyển workspace theo role; trang tìm việc công khai vẫn truy cập được khi chưa login.
3. API client xử lý `204`, JSON không hợp lệ, body HTML lỗi, fieldErrors/requestId, timeout, abort và request cancellation đã xảy ra trước khi gọi fetch.
4. Refresh chỉ một request cho cùng phiên; thêm session generation, timeout riêng và xử lý response cũ. Không refresh vô hạn, không retry mutation không an toàn.
5. Login/logout/đổi mật khẩu/reset account clear private cache đúng lúc. Điều hướng nội bộ không dùng full reload làm mất token trong bộ nhớ ngoài ý muốn.
6. Tắt test mailbox mặc định. Chỉ bật khi profile/config local/E2E rõ ràng; production/default public deployment không đọc được token qua API. UI lấy token test không xuất hiện trong luồng production.
7. Kiểm chứng verify/reset và lỗi expired/reused token; chức năng thật dùng notification adapter phù hợp môi trường.

**Cổng Q1:** login/register → `/me` → đúng workspace; 10 request cùng hết hạn chỉ có một refresh; logout khi refresh pending không khôi phục phiên; Candidate không vào Admin; production config không expose mailbox.

### Chặng 02 — Database hoàn chỉnh và migration an toàn

**Tương ứng:** phần schema của INT-01, INT-04–11. **Phụ thuộc:** Q0; triển khai schema tăng dần cùng feature.

1. So sánh invariant với schema V001–V009 và những migration xuất hiện sau thời điểm audit. Không dựa trên mục tiêu cố định bao nhiêu bảng.
2. Thêm migration số tiếp theo còn trống, không sửa migration đã chạy. Kiểm tra fresh install và upgrade từ phiên bản đang sử dụng.
3. Hoàn thiện shared-team migration: creator tham chiếu user, company là metadata, không để membership FK cũ vô tình chặn nghiệp vụ mới; bảo toàn historical references.
4. Thiết kế resource/version cho profile, consent, CV immutable versions, job revisions, applications/history, evaluations, interviews, offers, notifications, audit, work queue và delivery ledger theo từng feature.
5. Unique constraints, FK ownership, check constraints, optimistic version và state transition không chỉ tồn tại ở frontend.
6. UTC, charset, decimal/money, nullable field, chỉ mục và data backfill phải có test. IDs mới theo contract string; không âm thầm đổi JSON của API hiện hành.
7. Runtime DB user không có quyền quản trị rộng; migration identity riêng cho deployment. `ddl-auto=validate`; không xóa volume để làm migration “pass”.

**Cổng Q2:** DB trống và DB upgrade có fixture đều migrate/validate được; invariant/chống trùng/optimistic conflict pass; restart ứng dụng giữ dữ liệu.

### Chặng 03 — Hồ sơ, CV và dịch vụ nền

**Tương ứng:** INT-04–05. **Phụ thuộc:** Q1 và migration liên quan thuộc Q2.

1. Triển khai profile, skills, education, experience, preferences và consent theo ownership; nối form bằng service/hook và mapper.
2. Tạo upload session → signed upload → complete → quarantine/scan → parse → metadata/immutable version. Kiểm MIME/signature/size ở server/storage, không chỉ extension.
3. CV chỉ download bằng quyền hợp lệ; signed URL ngắn hạn, không cấp bucket public. Access token không gửi theo URL storage.
4. Parser/scanner có timeout, resource limit và cô lập; PDF scan cần OCR thì báo unsupported/needs action theo MVP, không sinh text giả.
5. Hoàn thiện MySQL durable queue và worker process dùng cùng image; short transactions, lease/fencing, retry schedule, status và recovery.
6. UI có upload progress, pending/failed, chọn phiên bản và sửa dữ liệu extraction. Không xóa CV đang được application active tham chiếu.
7. Upload bỏ dở và xóa storage/DB có cleanup durable, retry được; provider/network call không chạy trong transaction dài.

**Cổng Q3:** CV hợp lệ đi hết pipeline; file lỗi/quá lớn/malware bị chặn; khác owner không đọc được; worker crash có recovery; application chỉ dùng file đúng điều kiện.

### Chặng 04 — Jobs, taxonomy và tìm kiếm

**Tương ứng:** INT-06. **Phụ thuộc:** Q1 và migration liên quan Q2.

1. Taxonomy active/deprecated và form lựa chọn kỹ năng theo API.
2. Recruiter tạo/sửa draft, publish/close, revisions và optimistic conflict. Public chỉ thấy OPEN chưa hết hạn.
3. Search/filter/sort/page phía server, có sort whitelist và tie-breaker; query phản ánh URL để quay lại danh sách đúng trạng thái.
4. Nối JobCreation, JobRequisitions, ExploreJobs và ViewDetails; route lấy đúng resource ID.
5. Saved jobs có persistence nếu nút giữ trong scope; không chỉ đổi icon trong state local.

**Cổng Q4:** Recruiter đăng tin → browser Candidate tìm được → detail đúng dữ liệu; anonymous không đọc draft; candidate không publish; job hết hạn không nhận application.

### Chặng 05 — Applications và đánh giá thủ công

**Tương ứng:** INT-07. **Phụ thuộc:** Q3, Q4.

1. Apply kiểm role/ownership/verification/consent/CV và job revision ngay trong use case, có transaction chống race.
2. Unique constraint/idempotency bảo vệ double-submit. Snapshot references cho CV/job bất biến; lịch sử actor/time/from/to rõ ràng.
3. Lưu application cùng enqueue/outbox trong ranh giới transaction thích hợp để không mất tác vụ sau commit.
4. Candidate list/detail/withdraw; Recruiter list/dossier/transitions/evaluation/ranking; quyền truy cập thực thi tại query/use case.
5. Nối MyApplication, CandidateManagement, ApplicationDetail và Evaluation; count/filter/state từ server.

**Cổng Q5:** nộp trùng đồng thời chỉ tạo một hồ sơ theo policy; B không xem hồ sơ A; Admin không đọc CV; transition sai bị từ chối; đánh giá thủ công hoạt động khi AI chưa có.

### Chặng 06 — AI hỗ trợ tuyển dụng có thể phục hồi

**Tương ứng:** INT-08. **Phụ thuộc:** Q5 và worker Q3.

1. Dùng adapter/workflow hiện có, rà consent khi claim và trước persist output; khóa input/prompt/model version để có thể audit.
2. AI output phải qua schema và evidence validation; lỗi hoặc thiếu dữ liệu không thành score giả. Fingerprint bảo vệ theo ADR, không expose nội bộ ra API.
3. Retry chỉ ở worker boundary theo ADR, tối đa ba provider attempts cho một lượt công việc đã định nghĩa. Rà adapter/workflow để không nhân số lần gọi giữa các lớp.
4. Reject stale lease completion; backoff và queue state rõ. Dừng/loại bỏ kết quả khi consent đã bị thu hồi theo policy.
5. UI polling có giới hạn, pause khi hidden và dừng khi terminal/unmount; hiển thị pending/failed/retryable, score null khi chưa có.
6. AI score không tự chuyển recruitment stage, không auto-reject và không tự gửi feedback.

**Cổng Q6:** provider stub thành công/chậm/429/5xx/schema sai đều có test; job crash được reclaim; CV provider failure không ngăn apply hợp lệ; human review vẫn làm được. Provider thật được kiểm tra riêng khi có quyền và cấu hình.

### Chặng 07 — Phỏng vấn, offer, phản hồi và notifications

**Tương ứng:** INT-09–10. **Phụ thuộc:** Q5; AI draft phụ thuộc Q6, phỏng vấn thủ công không phụ thuộc AI.

1. Interview tạo/sửa/hủy, timezone, conflict rule, candidate read theo owner và notification tương ứng.
2. Offer có terms/version/deadline; Recruiter có UI tạo/gửi/thu hồi; Candidate có accept/decline. Application state và offer state là hai state machines có mapping rõ.
3. Accept/decline/cancel/expiry cạnh tranh được khóa/version hóa; chỉ một kết quả hợp lệ, không chấp nhận nội dung đã đổi sau khi candidate xem.
4. Feedback draft → edit → approve đúng version → queued/send/failure. Edit sau approval phải duyệt lại.
5. Transactional outbox/delivery ledger, provider adapter và đối soát kết quả không chắc chắn; không hứa exactly-once khi provider không bảo đảm.
6. Notifications/read/unread và dashboard/report theo dữ liệu DB; số tổng không tính từ riêng page frontend.

**Cổng Q7:** Recruiter đặt lịch và gửi offer → Candidate đúng account nhận thông tin → accept → Recruiter thấy kết quả; unapproved feedback không gửi; test email dùng người nhận được kiểm soát.

### Chặng 08 — Admin và hoàn thiện toàn bộ UI

**Tương ứng:** INT-11–12. **Phụ thuộc:** Q1 và các feature Q4–Q7 liên quan.

1. User directory/role/status, last-admin guard, taxonomy, audit metadata, operations/settings allowlist.
2. Thay đổi quyền/khóa account khiến JWT cũ bị từ chối như backend policy; frontend clear state và hướng dẫn login khi cần.
3. Gỡ quyền truy cập tuyển dụng khỏi Admin đúng ADR; mọi menu/nút tác động nghiệp vụ phải cùng policy với API.
4. Rà toàn bộ page/action theo inventory, bao gồm search, filter, paging, export nếu được giữ, bookmark, profile, settings, notification và nút phụ.
5. Loại mock/identity mặc định/KPI hard-code/fake success khỏi luồng production. Không thay lỗi API bằng dữ liệu mẫu.
6. Dùng lại design system; hoàn thiện mobile, keyboard, focus, label, contrast, loading/empty/error/disabled. Form lỗi giữ dữ liệu đã nhập.
7. Chọn ngôn ngữ UI nhất quán, không tự dịch từng trang gây trộn nội dung. Backend enum tách nhãn hiển thị.

**Cổng Q8:** tất cả core page/action có API và test; logout/đổi account không còn dữ liệu account cũ; kiểm tra desktop/mobile và direct URL theo role.

### Chặng 09 — Tự động hóa kiểm thử và tối ưu có đo lường

**Tương ứng:** INT-13 và phần hiệu năng INT-14. **Phụ thuộc:** kiểm thử tăng dần từ Q1; gate cuối sau Q8.

1. Backend unit/domain/API/persistence/ArchUnit; fresh/upgrade migration; contract checks; frontend typecheck/unit/integration.
2. Browser E2E dùng backend/MySQL/storage thật trong môi trường test; chỉ external provider được stub. Không dùng intercept trả fake data cho core flow rồi gọi là end-to-end integration.
3. Postman có Body cho từng request cần payload, biến môi trường, token chaining, response examples và assert chính xác. Nhóm manual/provider prerequisite tách khỏi runner tự động.
4. Fixture account riêng mỗi run; đổi/reset password phải login lại bằng password mới; logout ở cuối luồng; replay token có session riêng.
5. Khi `/jobs` trở thành public, deny-all test phải dùng route sentinel khác. Test mailbox chỉ dùng môi trường đã khóa cho test.
6. Thêm frontend/E2E/contract gate vào CI; không chỉ build backend. Build container từ lockfile chuẩn; pin image/artifact release theo version/digest.
7. Đo query count, payload, p95/p99, queue age và bundle theo mục 10. Tối ưu N+1/index/projection/pagination/cancel/cache có mục tiêu; đo lại sau thay đổi.

**Cổng Q9:** report có passed/failed/skipped, revision và lệnh thực; UAT xuyên role pass; không còn P0/P1 ảnh hưởng core flow/data/access control; hiệu năng có baseline và kết quả.

### Chặng 10 — Đóng gói local/staging và kiểm chứng vận hành

**Phụ thuộc:** Q9.

1. Chuẩn hóa Compose chạy frontend/reverse proxy, API, worker, MySQL, storage, scanner và mailbox cho local/test theo nhu cầu thật.
2. Chốt một Nginx config: SPA deep links, `/api`, OpenAPI có policy, OAuth authorization/callback nếu bật, body limits và timeouts phù hợp; API lỗi không trả `index.html`.
3. Healthcheck riêng frontend/API/worker; liveness không phụ thuộc provider bên ngoài, readiness phản ánh dependency cần nhận request. Theo dõi provider failure bằng metric/capability state.
4. Rà toàn bộ env được truyền từ config → container → app. `VITE_*` là public build config, không chứa secret; build same-origin nếu target dùng reverse proxy.
5. Chạy local từ cấu hình sạch, seed test rõ ràng, restart và mở deep link. Script khởi động chỉ báo thành công sau health/smoke, không chỉ dựa vào `docker compose up -d`.
6. Staging dùng email/storage/DB riêng, hạn chế người truy cập; kiểm tra migration, rollback artifact, restore DB và worker recovery.

**Cổng Q10:** người khác làm theo runbook có thể chạy L1; L2 cần thêm staging thật đã kiểm chứng. Artifact và manifest xác định chính xác bản có thể phát hành.

### Chặng 11 — Go-live và bàn giao

**Phụ thuộc:** Q10, cấu hình/quyền mục 5 và quyết định release.

1. Tạo release manifest: revision, frontend/backend image digest, migration range, config references, feature flags, known limitations và người phụ trách.
2. Xác minh backup/restore và khả năng tương thích app/schema trước khi migration; có maintenance/cutover procedure nếu thay đổi không tương thích.
3. Chuẩn bị infrastructure plan đúng target; thực hiện cloud/DNS/deploy theo quyền đã có. Tách migrate job khỏi runtime để tránh migration cạnh tranh khi khởi động nhiều process.
4. Deploy chính artifact đã qua staging; nạp runtime secrets; start API/worker, xác minh readiness, rồi chuyển traffic theo chiến lược đã chốt.
5. Domain/HTTPS, deep links, API, login, role, upload/download, queue và email phải được smoke test từ bên ngoài bằng account/dữ liệu test được phép.
6. Tắt test mailbox/seed/demo fallback; không còn credentials mặc định. Kiểm tra log không ghi token/password/CV và không công khai dữ liệu vận hành nhạy cảm.
7. Theo dõi một khoảng ổn định đã thỏa thuận; mặc định đề xuất 30 phút cho smoke release, không coi đó là cam kết uptime dài hạn. Ghi lỗi, latency, queue backlog, mail failures và rollback trigger.
8. Bàn giao URL, phiên bản, tài liệu vận hành, dashboard/alert, lịch backup, owner và cách xử lý sự cố. Secret truyền qua kênh quản lý phù hợp, không đưa vào báo cáo.

**Cổng Q11:** chỉ công bố L3 khi URL công khai được kiểm chứng và các bước trên có bằng chứng. Không tự lên lịch theo dõi dài hạn nếu chưa được yêu cầu; ghi lịch vận hành/owner trong runbook.

## 8. Contract và dữ liệu — các quy tắc không được bỏ qua

| Chủ đề | Quy tắc |
| --- | --- |
| API hiện có | Giữ tương thích auth; mapping frontend bám response thật, không tự đổi field server để khớp fixture |
| API mới | Đề xuất method/path/DTO được chốt trước khi gọi; cập nhật OpenAPI đồng thời, không công bố endpoint rỗng |
| Thành công/lỗi | DTO trực tiếp; paging `{items,page,size,totalElements,totalPages}`; lỗi `{code,message,fieldErrors,requestId}`; 204 body rỗng |
| Version | Stale write trả 409 và UI có cách tải bản mới; giữ nội dung đang sửa |
| ID/ownership | Actor từ phiên backend; client không chọn owner bằng cách truyền ID khác; resource projection theo quyền |
| Session | Access/refresh token trong bộ nhớ theo baseline; reload đăng nhập lại. Không thêm persistence trái policy để làm UX có vẻ tiện hơn |
| Retry | Safe GET retry có giới hạn; mutation cần idempotency hoặc xác minh outcome trước khi gửi lại |
| Đồng thời | Apply/offer/role update/token consume có constraint/lock/version theo use case; UI disable nút chỉ là lớp phụ |
| File | Private, immutable version, signed access, quarantine; external URL không nhận Bearer token của ứng dụng |
| Job/CV snapshot | Dữ liệu dùng để quyết định có version audit được; chỉnh hồ sơ hiện tại không sửa ngược hồ sơ ứng tuyển đã nộp |
| AI/offer | AI state, application stage, interview và offer state tách biệt; điểm null không thành zero |
| Queue/email | Enqueue/outbox bền vững, lease fencing, bounded attempts, trạng thái đối soát khi kết quả gửi không chắc chắn |
| Retention | Theo ADR cho demo, policy riêng cho dữ liệu thật; xóa có audit và recovery, không xóa CV đang được sử dụng |

## 9. Kịch bản UAT bắt buộc để xác nhận website hoạt động

Mỗi case ghi precondition, bước chạy, expected, actual, revision và bằng chứng. Mật khẩu/token không xuất hiện trong screenshot/report.

| ID | Kịch bản | Kết quả cần đạt |
| --- | --- | --- |
| UAT-01 | Register → verify → login → me | Đúng identity/role, không crash do field mismatch |
| UAT-02 | Anonymous mở route riêng; Candidate mở route Admin | UI hướng dẫn đúng, API chặn độc lập |
| UAT-03 | 10 request cùng hết hạn token; logout giữa refresh | Một refresh, không hồi sinh session sau logout |
| UAT-04 | Reset/change password rồi dùng token/password cũ | Credential cũ bị từ chối theo policy; login mới thành công |
| UAT-05 | Recruiter draft → publish → Candidate search/detail | Draft private, dữ liệu công khai đúng revision và hạn |
| UAT-06 | Candidate A sửa profile, upload CV hợp lệ | Persist thật; trạng thái file chuyển đúng; chọn đúng version |
| UAT-07 | File quá lớn/sai loại/malware; B truy cập CV A | Bị chặn, không lộ file, có thông báo dùng được |
| UAT-08 | Hai request apply đồng thời vào cùng job | Không tạo hồ sơ trùng trái policy; UI phản ánh resource đã tồn tại |
| UAT-09 | Job đóng/hết hạn ngay khi submit | Server kiểm tra lại và trả lỗi nghiệp vụ ổn định |
| UAT-10 | Gemini chậm/lỗi/schema sai; worker bị kill | Application còn nguyên, worker recovery đúng, recruiter review thủ công được |
| UAT-11 | Thu hồi consent khi AI queued/processing | Không dùng kết quả trái consent; trạng thái được phản ánh rõ |
| UAT-12 | Recruiter đánh giá và chuyển stage | Chỉ transition hợp lệ, có actor/time/history |
| UAT-13 | Tạo/sửa/hủy lịch trên hai múi giờ | Cùng một thời điểm thực tế; Candidate xem đúng lịch |
| UAT-14 | Gửi offer → accept/decline cạnh tranh và hết hạn | Chỉ một quyết định hợp lệ; không chấp nhận terms cũ |
| UAT-15 | AI feedback chưa duyệt; sửa sau duyệt; retry send | Chặn gửi chưa duyệt, yêu cầu duyệt lại, xử lý gửi trùng/kết quả mơ hồ |
| UAT-16 | Admin khóa user/gán role/đổi last-admin | Policy được bảo vệ, JWT cũ phản ánh thay đổi, audit đầy đủ |
| UAT-17 | Admin gọi dossier/download CV trực tiếp | Bị từ chối dù thay ID/header bằng client riêng |
| UAT-18 | Filters/paging/count/report/notifications sau mutation | Dữ liệu DB và hai workspace thống nhất, không hard-code |
| UAT-19 | Reload/deep link, API down, HTML gateway error, 429 | Không trang trắng, không mock fallback, không retry vô hạn |
| UAT-20 | Restart containers; fresh DB và upgrade DB | Dữ liệu tồn tại, migration đúng, worker tiếp tục công việc |
| UAT-21 | Production/default public config gọi test mailbox | Không đọc được token, không chỉ dựa vào tên profile do người vận hành nhớ đặt |
| UAT-22 | Domain HTTPS, upload/email ngoài mạng local, rollback/restore | Đúng artifact và môi trường; phục hồi được theo runbook |

## 10. Hiệu năng, chất lượng UI và tiêu chí tối ưu

Ngưỡng dưới đây là **mục tiêu ban đầu**, không phải kết quả đo. Agent phải ghi phần cứng, dữ liệu và workload; điều chỉnh cần có lý do và kết quả so sánh, không tự hạ ngưỡng để pass.

- Seed đo tải: 1.000 jobs, 10.000 applications tổng hợp; 20 session đồng thời với tỷ lệ read/write được ghi rõ. Warm-up 2 phút, đo 10 phút.
- List/detail thông thường: p95 ≤ 500ms, p99 ≤ 1.000ms; mutation thường p95 ≤ 800ms. Auth hashing, upload và AI đo riêng.
- Lỗi 5xx ngoài fault injection < 1%; báo riêng lỗi kỳ vọng 4xx, throughput và timeout.
- Pagination mặc định 20, tối đa 100; payload danh sách 20 record mục tiêu ≤ 100KB chưa nén, không chứa CV text/provider payload.
- Worker recovery trong lease TTL + một polling interval + sai số đã ghi; queue có alert theo tuổi job và retries.
- Search debounce khoảng 300ms; stale response không ghi đè filter mới. Invalidate cache theo resource, không reload toàn bộ app sau mỗi action.
- Query projections/batch tránh N+1, index sau khi EXPLAIN và đo; không thêm Redis hoặc kiến trúc cache mới khi chưa có bằng chứng cần thiết.
- Route lớn được lazy-load khi bundle analysis cho thấy lợi ích. Cache assets có hash; `index.html` cập nhật được; auth/private API không bị proxy cache ngoài policy.
- UI kiểm tra ở 360, 768 và 1440px; zoom, keyboard, focus, label và lỗi form. Giữ Admin tối, Recruiter sáng xanh dương, Candidate sáng emerald theo hệ thiết kế hiện có.
- Không chuyển credential/CV/PII vào analytics, log frontend, artifact CI hoặc metrics label.

## 11. Build, kiểm thử và cách khởi động

Các lệnh hiện có cần kiểm tra trên checkout thực tế:

```sh
./scripts/check-env.sh
./scripts/verify.sh
npm --prefix frontend run test
npm --prefix frontend run build
git diff --check
```

`verify.sh` yêu cầu JDK đúng major trong `pom.xml` và Docker để chạy MySQL Testcontainers. Nếu đã có dependencies thì không tải lại vô cớ; CI/cài mới dùng package manager và lockfile chuẩn sau khi được chốt. Frontend hiện chưa có script typecheck/E2E trong `package.json`: phải thêm và ghi đúng lệnh trước khi dùng chúng làm quality gate.

Khởi động local hiện có:

```sh
./scripts/docker-up.sh
```

Trước khi chạy, kiểm tra script hiện tại, `.env` đã cấu hình và key path; không ghi đè `.env` hoặc tái tạo JWT key nếu đã có cấu hình hợp lệ. Script hiện có thao tác reconcile Compose; không dùng nó với project/container chia sẻ chưa xác định. Sau chạy, kiểm tra readiness, frontend URL và request auth thật qua reverse proxy.

Mục tiêu sau hoàn thiện: người nhận dùng một trình tự được tài liệu hóa để cấu hình local lần đầu, build, start, seed dữ liệu test, chạy smoke và mở website. Seed phải opt-in và chỉ vào DB test/local; không có thao tác xóa toàn bộ database trong script khởi động thông thường.

Docker không chạy, dependency không tải được hoặc provider chưa cấu hình phải được báo đúng nguyên nhân. Không sử dụng `skipTests` để gọi là bản phát hành đã kiểm chứng.

## 12. Runbook go-live, rollback và khôi phục

Runbook phải ghi rõ trước/sau mỗi bước, ai thực hiện và điều kiện dừng:

1. **Preflight:** xác nhận target, release manifest, secrets references, DNS/TLS, storage/email/AI capability, test routes disabled và backup gần nhất.
2. **Migration:** kiểm schema version/checksum, migration identity, lock/concurrency và duration; dùng expand/backfill/contract nếu phải giữ tương thích nhiều phiên bản.
3. **Deploy:** kéo đúng image digest, inject config, start runtime bằng quyền tối thiểu; API/worker cùng hiểu schema/job version.
4. **Traffic:** readiness → smoke bên trong → chuyển traffic → smoke bên ngoài. OAuth cookie/redirect và forwarded headers chỉ tin proxy kiểm soát được.
5. **Quan sát:** latency/errors/queue/email/storage, không chỉ homepage status 200. Có trigger rollback do auth thất bại, data corruption risk hoặc lỗi core flow.
6. **Rollback app:** dùng artifact trước chỉ khi schema tương thích. Không tự downgrade schema hay sửa checksum Flyway.
7. **Database recovery:** restore vào môi trường tách để xác minh; thao tác thay DB đang dùng cần quyết định rõ vì có nguy cơ mất dữ liệu phát sinh sau backup. Nếu rollback schema không an toàn, dùng forward-fix/maintenance theo runbook.
8. **Worker recovery:** job pending/leased có thể reclaim, fencing từ chối worker cũ, không gửi email/chạy mutation trùng ngoài policy.
9. **Credential recovery:** có quy trình rotate/revoke JWT key, DB/storage/email secret; không log private key/token trong quá trình chẩn đoán.
10. **Handoff:** owner, lịch backup, retention, thời hạn cert, cost alerts và cách mở incident. Chỉ kết nối kênh thông báo bên ngoài khi đã được cho phép.

RPO/RTO, SLA và chi phí vận hành phải được chốt theo hệ thống thật, không tự ghi “99.99%” hoặc “không mất dữ liệu” chỉ vì có backup cấu hình.

## 13. Definition of Done

Chỉ đánh dấu phần việc hoàn tất khi có bằng chứng tương ứng:

- [ ] Core flow Q1–Q8 hoạt động với DB thật; mọi nút được phát hành có backend hoặc hành vi thực tế rõ ràng.
- [ ] Frontend contract khớp runtime backend, gồm role, ID, enum, null, paging, validation và lỗi.
- [ ] Role/ownership enforced ở backend; direct API/ID tampering không vượt quyền; test mailbox không hoạt động trên môi trường công khai.
- [ ] Migration fresh/upgrade, concurrency, worker recovery và retention/deletion invariants đã được kiểm tra.
- [ ] Không mock fallback, fake success, identity/KPI hard-code hoặc connection status giả trong luồng sản phẩm.
- [ ] Test report cho đúng revision có frontend/backend/contract/E2E/Postman; case skipped/manual không được tính pass.
- [ ] Performance report, UI review và operational runbook đầy đủ; blocker P0/P1 chưa xử lý ngăn release.
- [ ] L1 có URL local và bước tái hiện; L2 có staging evidence và release artifacts; L3 có domain/HTTPS được kiểm chứng bên ngoài.
- [ ] File env mẫu không chứa secret; package lock/config runtime nhất quán; test/seed không bị đưa vào production ngoài ý muốn.
- [ ] Gói bàn giao có feature inventory, endpoint/body examples, migration notes, lệnh chạy, limitations và recovery procedure.

Không hứa “không còn bug” hoặc “tối ưu tuyệt đối”. Ghi rõ phạm vi đã đo, các tình huống đã kiểm thử và rủi ro còn lại được chấp nhận.

## 14. Mẫu cập nhật và báo cáo cuối của agent

Mỗi mốc cập nhật ngắn:

```text
Mốc / ticket:
Luồng đã hoạt động:
Thay đổi chính và tác động dữ liệu:
Lệnh kiểm tra + passed / failed / skipped:
Bằng chứng: report / screenshot / runtime response đã lọc secret
Blocker hoặc nội dung chưa xác minh:
Bước tiếp theo:
```

Báo cáo cuối:

```text
1. Mức bàn giao: L1 / L2 / L3 và lý do.
2. URL thực tế đã kiểm chứng, revision/image digest.
3. Chức năng đã hoàn thành cho Candidate / Recruiter / Admin.
4. Schema/migrations, seed và lưu trữ đã triển khai.
5. Cách khởi động, cách chạy test và điều kiện môi trường.
6. Kết quả frontend/backend/E2E/Postman/security/performance.
7. Backup/restore/rollback/monitoring và người nhận vận hành.
8. Giới hạn, case chưa chạy, blockers và inputs còn thiếu.
```

## 15. Lệnh giao việc ngắn để bắt đầu

Sao chép đoạn sau vào chat của agent có quyền làm việc trong repository:

> Hãy thực thi toàn bộ `SMARTRECRUIT_MASTER_AGENT_SCRIPT.md` để hoàn thiện SmartRecruit từ frontend, backend, database đến môi trường chạy. Đây là yêu cầu triển khai code và kiểm chứng, không chỉ lập thêm kế hoạch. Bắt đầu bằng audit checkout hiện tại, bảo toàn các thay đổi đang có và sửa các lỗi contract/auth/routing trước. Tái sử dụng UI và kiến trúc hiện có; thực hiện các chặng 00–11 theo dependency, đối chiếu kế hoạch INT-00–INT-14 khi cần chi tiết. Hoàn thành luồng recruiter đăng tin → candidate verify/profile/CV/apply → human review/AI hỗ trợ → interview → offer → phản hồi; đồng thời hoàn thiện quản trị nền tảng đúng quyền. Xây API/persistence/worker còn thiếu, loại mock khỏi luồng thật, cập nhật OpenAPI/Postman với body mẫu và kiểm thử. Duy trì tiến độ và bằng chứng trong `docs/delivery/`; kiểm tra thực tế trước khi đánh dấu hoàn thành. Đưa local tới L1, chuẩn bị/kiểm chứng staging để đạt L2 và triển khai công khai L3 khi có target, cấu hình và quyền tương ứng. Không tự phát sinh chi phí, đổi DNS, sửa dữ liệu chia sẻ hoặc gửi thông báo tới người thật ngoài phạm vi được cho phép. Nếu thiếu điều kiện deploy, hoàn thành phần độc lập, trình bày release package cụ thể và nêu chính xác đầu vào còn thiếu. Báo cáo kết quả theo mức L1/L2/L3, không dừng ở việc tạo file, build thành công hoặc screenshot giao diện.
