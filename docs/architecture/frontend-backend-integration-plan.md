# Kế hoạch triển khai tích hợp Frontend–Backend SmartRecruit

**Trạng thái: Target — kế hoạch giao cho agent code, chưa phải báo cáo triển khai.**
Ngày lập: 05/10/2026. Phạm vi: frontend React hiện tại và backend Spring Boot trong cùng repository.

## 1. Kết quả cần đạt

Hoàn thành một sản phẩm có thể chạy và kiểm thử xuyên suốt:

**Đăng ký → xác minh email → hoàn thiện hồ sơ/consent → tải CV và kiểm tra file → ứng tuyển → sàng lọc hỗ trợ → recruiter đánh giá → phỏng vấn → gửi offer → ứng viên phản hồi.**

Đồng thời hoàn thành các luồng quản trị tài khoản, taxonomy, audit và vận hành trong đúng phạm vi quyền. Màn hình lấy dữ liệu từ API, thao tác được lưu ở backend, tải lại trang phản ánh dữ liệu đã lưu sau khi đăng nhập lại theo chính sách phiên hiện hành.

“Vận hành tốt và tối ưu” được đánh giá bằng các cổng kiểm thử ở mục 10–12, không chỉ bằng việc build thành công hoặc giao diện hiển thị được.

Nguồn quyết định:

1. [ADR 0003](../adr/0003-backend-mvp-baseline.md): kiến trúc, quyền truy cập, worker và phạm vi MVP.
2. [Backend backlog](implementation-backlog.md): G0–G2 đã được ghi nhận hoàn thành; G3–G9 còn pending. Kết quả test lịch sử cần được chạy lại với checkout hiện tại.
3. [Frontend mapping](../api/frontend-mapping.md), [API convention](../api/README.md), [schema](../database/schema.md).
4. [Kịch bản UI/UX](../ui-ux-redesign-script.md): tái sử dụng layout và component đang được cải tiến.

## 2. Hiện trạng và khoảng trống đã xác minh

| Khu vực | Bằng chứng trong repository | Việc cần giải quyết |
| --- | --- | --- |
| Frontend | React 19, React Router, Tailwind 4, Vite; các page còn dùng mảng dữ liệu mẫu và `src/data/mock.ts` | Thay nguồn dữ liệu theo từng luồng, giữ giao diện và hành vi hợp lệ |
| API client | `frontend/src/lib/api.ts` ném `Error('MOCK')` khi base URL rỗng; luôn gọi `res.json()`; chưa gắn token hoặc parse lỗi | Hỗ trợ same-origin, `204`, auth, cancel, timeout, lỗi có cấu trúc |
| Session/router | `frontend/src/App.tsx` chưa có luồng login và route guard; nhiều route chi tiết chưa mang ID | Thêm auth state, quyền, return URL và route định danh tài nguyên |
| Backend | Controller nghiệp vụ hiện có tập trung ở Identity/Account Security; có health và OpenAPI | Xây thêm API ứng viên, jobs, applications, interviews, offers, notifications và admin |
| OpenAPI | `OpenApiController` có request schemas, nhưng success responses chủ yếu là description | Bổ sung response schema, enum, validation, error và policy theo từng operation |
| Kiểu ID | Mapping mục tiêu dùng string; `/auth/me` hiện trả `Long id` | Giữ tương thích endpoint hiện có; có adapter và kiểm tra số nguyên an toàn |
| Enum UI | `types/index.ts` dùng `Published`, `Fill`, `Applied`, `Offer Accepted` và tên role hiển thị | Tách DTO khỏi view model; dùng enum backend và mapping nhãn tường minh |
| Quyền Admin | Admin UI có các trang jobs/applications/candidates; ADR không cho Admin đọc CV/dossier | Sửa route/menu và response theo quyền, không mở backend để khớp mock |
| Database | Có entity tuyển dụng và V001–V009; jobs vẫn chịu compound FK tới company membership | Hoàn tất chuyển đổi theo shared recruiting team bằng migration mới, bảo toàn dữ liệu |
| Email local | `LoggingAccountNotificationGateway` giữ token trong memory, log sự kiện gửi; không log raw token, chưa gửi thư thật | Cần test gateway/mailbox local để browser và Postman hoàn tất verify/reset |
| AI | Có Gemini adapter và screening workflow/lease | Thiếu orchestration bền vững, API điều phối và màn hình lấy kết quả thật |
| CORS/cổng | Vite mặc định 8443; `.env.example` CORS mẫu là 3000; client chưa có proxy API | Chốt URL/origin đúng môi trường; kiểm tra preflight trong browser |
| CI | `.github/workflows/backend-ci.yml` kiểm tra backend; chưa có frontend/E2E gate trong workflow này | Bổ sung frontend, contract và luồng browser với backend thật |
| Postman | Có collection request mẫu, nhưng chuỗi hiện tại logout trước đổi mật khẩu, thiếu token cho verify/reset, OAuth cần điều kiện riêng | Chỉnh thành suite có fixture, thứ tự, trạng thái kỳ vọng chính xác và báo cáo chạy |

Đánh giá dựa trên mã nguồn và cấu hình; lần lập kế hoạch này chưa chạy kiểm thử tích hợp hay benchmark. Repository đang có thay đổi backend và UI chưa commit: agent phải ghi nhận và bảo toàn các thay đổi đó.

## 3. Quyết định kiến trúc tích hợp

### 3.1 Luồng dữ liệu và tổ chức code

```text
Page / form
  → feature hook / view-model mapper
  → feature API service
  → HTTP client + session trong bộ nhớ
  → Spring Security → Controller DTO → Application use case
  → Domain rules / ports → MySQL, storage, notification adapter

Tác vụ dài: use case → durable job trong MySQL → worker → trạng thái/kết quả
UI đọc trạng thái qua API, dừng polling khi hoàn tất hoặc rời trang.
```

Cấu trúc frontend đề xuất; chỉ tạo file khi có trách nhiệm thực tế:

```text
frontend/src/
  lib/api.ts                    # Entry point tương thích cho HTTP client
  lib/api-error.ts              # HTTP/network/timeout/cancel và requestId
  auth/                        # Session store, AuthProvider, guards, refresh
  services/                    # auth, candidates, jobs, applications, admin...
  contracts/                   # DTO theo wire contract
  features/<feature>/          # Hooks và mapper; tách dần khỏi page lớn
  pages/                       # Giữ page/layout hiện có; thêm trang auth
  components/ui/               # Loading, error, empty, form, table hiện có
```

Backend giữ modular monolith và ports/adapters hiện có. API không trả JPA entity; transaction nằm tại application use case; module gọi nhau qua input port, không lấy repository nội bộ của nhau. Tuân thủ giới hạn class/method và ArchUnit trong ADR.

Chưa cần đổi framework hay thêm state library lớn. Dùng `fetch` hiện có, session store rõ vòng đời, feature hooks có cancel/deduplication. Nếu chọn thư viện quản lý server state, ghi quyết định trong ticket, kiểm tra tương thích/lockfile và dùng nhất quán, tránh hai tầng cache cạnh tranh.

### 3.2 Contract chung

- Đường dẫn mới theo `/api/v1`; mỗi operation phải có method, quyền, request DTO, response DTO, lỗi, ví dụ và test.
- DTO thành công là object trực tiếp; danh sách là `{items,page,size,totalElements,totalPages}`. Loại bỏ kỳ vọng envelope `{data,total,pageSize}` của client cũ nếu không được backend trả.
- `page` bắt đầu từ 0, mặc định `size=20`, tối đa 100; sort whitelist và có ID làm tie-breaker để thứ tự ổn định.
- Resource ID mới là string ở JSON. `/auth/me` hiện có ID dạng số: giữ wire contract, validate `Number.isSafeInteger` rồi chuẩn hóa ở adapter; không ép đổi backend âm thầm. Nếu cần hỗ trợ ID lớn hơn giới hạn an toàn, lập thay đổi contract riêng trước khi dùng.
- Thời gian là ISO-8601 UTC; lịch hiển thị kèm múi giờ. Số tiền/đơn vị/currency phải có schema rõ; không tính tiền từ chuỗi hiển thị đã format.
- Các update tài nguyên có version gửi version hiện tại; stale write trả `409`, UI cho tải bản mới và giữ dữ liệu đang sửa.
- `null` biểu thị chưa có kết quả/không có dữ liệu; AI chưa chạy không được hiển thị `0%`.
- Mã lỗi giữ `{code,message,fieldErrors,requestId}`; UI dùng `code` cho điều khiển hành vi, không phân tích chuỗi message.
- `204` không parse JSON. Nếu gateway trả HTML hoặc response không đúng schema, hiện lỗi kết nối/contract thay vì crash hay chuyển sang mock.
- State application, screening và offer độc lập. Các chuyển trạng thái mới phải được định nghĩa trong domain và migration trước khi UI sử dụng.
- Mutations dễ bị gửi trùng như apply, tạo offer, gửi feedback cần unique constraint/transaction và cơ chế idempotency được contract hóa. Không tự động retry ghi dữ liệu chỉ vì timeout.

### 3.3 Auth, refresh và quyền

1. Token chỉ giữ trong bộ nhớ. Reload/tab mới yêu cầu login theo baseline hiện hành; không tự thêm “remember me” bằng localStorage hoặc sessionStorage.
2. Sau login/register, nhận token rồi gọi `/auth/me`; điều hướng bằng role thực tế. Không suy ra quyền từ nhãn sidebar hoặc role mock.
3. Khi cần refresh, mọi request trong cùng phiên dùng chung một promise. Thay token pair nguyên tử; không gửi đồng thời nhiều request refresh vì reuse sẽ thu hồi phiên.
4. Chỉ refresh khi lỗi thuộc phiên xác thực, không refresh cho login sai mật khẩu, lỗi validation, `403` hay endpoint refresh thất bại. Request đủ điều kiện chỉ phát lại tối đa một lần; mutation chỉ phát lại khi contract bảo đảm lần `401` chưa chạy use case hoặc có idempotency.
5. Timeout refresh là kết quả không chắc chắn: không thử lại token cũ vô hạn; xóa phiên và yêu cầu login nếu không xác định được token mới.
6. Logout, đổi mật khẩu, reset mật khẩu hoặc account bị vô hiệu hóa phải xóa session/cache riêng tư và cancel request. Session generation ngăn response cũ khôi phục token/dữ liệu sau logout hoặc sau khi đổi account.
7. Đổi mật khẩu thành công phải yêu cầu login lại: backend thu hồi refresh sessions và làm JWT cũ mất hiệu lực. Logout thường chỉ thu hồi refresh token được gửi; không mô tả là mọi access token bị vô hiệu hóa ngay.
8. Candidate chỉ truy cập tài nguyên sở hữu; Recruiter xem ứng viên đã ứng tuyển trong shared team; Admin quản trị nền tảng, không đọc CV/dossier, không đồng thời có role Recruiter. Kiểm tra tại API/use case/query, không chỉ ở router.
9. Frontend cần trạng thái `initializing`, `anonymous`, `authenticated`, `refreshing`; không chớp dữ liệu của role khác trong lúc khởi tạo.
10. OAuth là luồng có điều kiện: tắt thì ẩn lựa chọn; bật thì giữ PKCE transaction riêng, kiểm tra callback và xóa handoff code khỏi URL ngay. Verifier phục vụ redirect phải có thiết kế lưu tạm theo tab/TTL riêng; không persist access/refresh token. Account linking chỉ bật khi có endpoint và test riêng.

### 3.4 Cấu hình môi trường

| Môi trường | Cấu hình mục tiêu | Điều kiện kiểm tra |
| --- | --- | --- |
| Local chạy riêng | Frontend `http://localhost:8443`, API `http://localhost:8080`; `VITE_API_BASE_URL=http://localhost:8080`; CORS cho đúng origin 8443 | Kiểm tra cổng thực tế từ `PORT`, không giả định frontend luôn 5173 hoặc 3000 |
| Preview Figma | Giữ plugin hiện có; origin dùng cấu hình thực tế | Không đưa origin không kiểm soát vào CORS production |
| Staging/production | Ưu tiên cùng origin qua Nginx; `/api` tới backend; SPA ở `/`; base URL rỗng có nghĩa same-origin | API 404/error không bị rewrite thành `index.html`; deep link UI hoạt động |
| E2E/CI | DB, storage, mailbox và provider stub riêng | Dữ liệu tổng hợp; reset fixture bằng cơ chế riêng của test |

Thêm file mẫu env frontend, phân biệt public config `VITE_*` với secret server. CORS bổ sung expose `Retry-After` nếu UI đọc header cho `429`. Chỉ cho phép `Idempotency-Key` sau khi đã chốt và triển khai cơ chế này; signed upload có cấu hình CORS riêng tại storage. Access token chỉ gửi tới origin API đã cấu hình, không chuyển sang URL upload/download có chữ ký.

## 4. Ma trận giao diện → backend → phạm vi

Các endpoint tuyển dụng dưới đây là **đề xuất Target**, cần chốt OpenAPI tại INT-01 và triển khai trước khi gọi thật. Những prefix đã có trong frontend mapping được giữ. Bảng bao phủ các page nghiệp vụ hiện có; alias route không phải chức năng riêng.

### 4.1 Candidate

| Page hiện tại | Contract cần có | Kết quả cần thấy trên UI |
| --- | --- | --- |
| `ExploreJobs.tsx` | `GET /jobs`, `GET /jobs/{id}`; nếu giữ lưu việc: `GET/PUT/DELETE /candidates/me/saved-jobs[/{jobId}]` | Lọc/sort/phân trang từ server; chỉ job OPEN còn hạn; saved job tồn tại sau login lại |
| `ViewDetails.tsx` | `GET /jobs/{id}`, `POST /jobs/{id}/applications` | Đọc đúng job ID, chọn CV hợp lệ, ứng tuyển một lần |
| `ProfileResume.tsx` | `GET/PUT /candidates/me`; resources skills/experiences/educations/consents/resumes thuộc `/candidates/me` | Lưu hồ sơ, phiên bản CV, tình trạng upload/scan/parse và consent |
| `MyApplication.tsx` | `GET /candidates/me/applications`, `GET /candidates/me/applications/{id}`, `POST .../{id}/withdraw` | Trạng thái và lịch sử thật; rút hồ sơ theo rule |
| `InterviewsOffer.tsx` | `GET /candidates/me/interviews`, `GET /candidates/me/offers` | Lịch và offer của đúng account; hiện timezone, deadline |
| `ReviewOffer.tsx` | `GET /candidates/me/offers/{id}`, `POST .../{id}/accept`, `POST .../{id}/decline` | Kiểm tra version/deadline; hai thao tác đồng thời chỉ một kết quả hợp lệ |
| `CandidateSettings.tsx` | Password API hiện có; đề xuất `GET/PUT /candidates/me/preferences` cho setting được hỗ trợ | Lưu thật, phản hồi đúng; ẩn MFA/SSO chưa trong MVP |

### 4.2 Recruiter

| Page hiện tại | Contract cần có | Kết quả cần thấy trên UI |
| --- | --- | --- |
| `RecruiterConsole.tsx` | `GET /recruiter/reports/overview` | KPI có khoảng thời gian và nguồn thống kê; nhiệm vụ có đích điều hướng thật |
| `JobRequisitionsDashboard.tsx` | `GET /recruiter/jobs`; các command publish/close | Bộ lọc/trạng thái/count đồng bộ với DB |
| `JobCreationRecruiter.tsx` | `POST /recruiter/jobs`, `GET/PUT /recruiter/jobs/{id}`, `POST .../{id}/publish` | Draft → preview → publish; version conflict được xử lý |
| `CandidateManagement.tsx` | `GET /recruiter/applications` có filter job/stage/score | Chỉ applicant đã ứng tuyển; tổng số theo filter; phân trang thật |
| `ApplicationDetailRecruiter.tsx` | `GET /recruiter/applications/{id}`; download CV có quyền; `POST .../{id}/transitions` | CV đúng bản ứng tuyển, lịch sử append-only, hành động hợp lệ |
| `Evaluation&FeedbackRecruiter.tsx` | `GET/POST /recruiter/applications/{id}/evaluations` | Lưu rubric, người đánh giá và nội dung; dùng version khi cập nhật |
| `BulkCandidatesRecruiter.tsx` | Nếu giữ sàng lọc hàng loạt: `POST /recruiter/screening-batches`, `GET .../{id}` | Chọn applicant hiện có, trả kết quả từng phần; bulk upload CV vẫn ngoài MVP |
| `AIFeedbackRecruiter.tsx` | `GET/POST /recruiter/feedback-drafts`, detail/update/approve/send | Draft AI → review → approve đúng version → send, có trạng thái delivery |
| `InterviewCalendarRecruiter.tsx` | `GET/POST /recruiter/interviews`, `PUT .../{id}`, command cancel | Lịch thật, chống xung đột theo rule đã chốt, không lệch múi giờ |
| `HiringAnalyticsRecruiter.tsx` | `GET /recruiter/reports/funnel` và báo cáo cần cho UI | Count/tỷ lệ thống nhất bộ lọc và định nghĩa metric |
| `NotifucationRecruiter.tsx` | `GET /notifications`, command read; audit hoạt động recruiter được lọc theo quyền | Không expose platform security log cho recruiter |

Phần tạo và quản lý offer chưa có page Recruiter riêng: bổ sung section trong dossier hoặc page nhỏ sử dụng `GET/POST /recruiter/offers`, detail/update/send/cancel. Đây là phần bắt buộc để luồng offer của Candidate có dữ liệu thực.

### 4.3 Admin và route kế thừa

| Page hiện tại | Quyết định tích hợp |
| --- | --- |
| `AdminConsole.tsx` | `GET /admin/operations/overview`; số liệu vận hành thật, không trả nội dung tuyển dụng |
| `UserDirectory.tsx` | `GET /admin/users`, detail theo dữ liệu định danh cho phép |
| `UserRoleManagement.tsx` | Cùng user resource, commands roles/status; bảo vệ last admin và role xung đột |
| `SkillTaxonomy.tsx` | `GET/POST /admin/skills`, update/deprecate; thêm `GET /skills` cho taxonomy active dùng ở form |
| `AuditEventExplorer.tsx` | `GET /admin/audit-events`, detail metadata đã lọc; không trả token/raw CV |
| `SettingsConfiguration.tsx` | `GET/PUT /admin/operations/settings` chỉ cho setting thật; secret chỉ hiện trạng thái configured |
| `JobManagement.tsx` | Chuyển chức năng tuyển dụng sang Recruiter hoặc chỉ dùng aggregate quản trị nếu contract cho phép; Admin không có mutation tuyển dụng |
| `ApplicationManagement.tsx` | Đưa luồng hồ sơ vào Recruiter; bỏ truy cập Admin vào dossier |
| `CandidateDirectory.tsx` | Đưa danh sách applicant vào Recruiter và giới hạn người đã ứng tuyển |
| `RecruiterDashboard.tsx` tại `/operations` | Chuyển về workspace Recruiter hoặc thay bằng metrics vận hành không chứa hồ sơ |

Thiết kế URL chi tiết có ID: ví dụ `/explore-jobs/:jobId`, `/my-applications/:applicationId`, `/recruiter/candidates/:applicationId`. Duy trì alias cũ khi có đủ ID; thiếu ID thì về danh sách thích hợp. Không chọn ngẫu nhiên record đầu tiên. Root và fallback phải điều hướng theo session/role thay vì luôn mở Admin.

Ngoài MVP: OCR, bulk CV import, ATS, SAML/Okta, MFA; không hiển thị trạng thái “đã kết nối/đã bật” giả. Chốt inventory cả các nút phụ như export, bookmark, reschedule, notification preference: hoặc có contract/test hoặc được ẩn với phạm vi ghi rõ.

## 5. Các quyết định phải giải quyết sớm

| Quyết định | Hướng mặc định giao cho agent | Bằng chứng phải có |
| --- | --- | --- |
| Company FK và shared team | Theo ADR 0003; company là metadata. Migration mới gỡ phụ thuộc creator-membership không còn phù hợp, giữ FK user và dữ liệu lịch sử cần thiết | Fresh DB + upgrade DB đã có jobs/applications đều pass; không còn membership dùng để cấp quyền |
| Trạng thái xác minh email | Bổ sung trường `emailVerified` theo cách tương thích vào account DTO nếu cần cho UI; backend vẫn kiểm tra điều kiện apply | Contract test, test account chưa verify, UI dẫn tới hành động phù hợp |
| Policy profile/consent | Định nghĩa trường cần để apply, phiên bản consent, thao tác thu hồi và ảnh hưởng tới AI | Test revoke trong khi đang queue/đang chạy; không chỉ kiểm tra checkbox UI |
| File storage/parser | Local có storage riêng, scanner/parser cô lập; production theo S3/private storage ADR | Giới hạn dung lượng/loại file cấu hình ở cả API, storage và parser |
| Offer và trạng thái tuyển dụng | Offer state độc lập; quyết định terminal status application trước khi triển khai accept | State transition table, race/expiry tests; không map `Offer Accepted` vào enum chưa tồn tại |
| Retry AI | Theo ADR: tối đa 3 provider attempts ở worker boundary; rà code/runbook để thống nhất | Test đếm số lần gọi provider khi lỗi, không nhân retry qua nhiều lớp |
| Toolchain frontend | Có cả npm và pnpm lockfile; xác định luồng đang dùng, chọn một lockfile chuẩn trong thay đổi riêng | Install lặp lại được trên local/CI; không nâng major dependency trong task tích hợp |
| Email verify/reset cho local | Thêm test mailbox/gateway dùng trong local/E2E, không dựa vào raw token trong log | Browser + Postman lấy token test được qua harness; tính năng test không có ở production |

## 6. Work breakdown cho agent code

Mỗi ticket chỉ hoàn thành khi đã có code, contract, kiểm thử, hướng dẫn chạy và giới hạn còn lại. Thứ tự dưới đây đủ cho một agent thực hiện tuần tự; không yêu cầu nhiều agent. Mỗi ticket lớn có thể chia tiếp theo resource, giữ backend và frontend của một luồng trong cùng thay đổi có thể review.

### INT-00 — Khóa baseline và lập inventory

- **Phụ thuộc:** không.
- Đọc `AGENTS.md`, ADR, backlog, diff hiện tại; ghi files do công việc khác đang thay đổi. Không reset/ghi đè hoặc sửa migration đã áp dụng.
- Kiểm tra JDK theo `pom.xml`, Node theo cấu hình/lockfile, Docker và cổng đang chạy; ghi chính xác lệnh build/test dùng được.
- Liệt kê từng page, nút, dữ liệu mock, input/validation và route; phân loại existing/target/deferred. Ghi baseline lỗi có trước.
- **Đầu ra:** bảng inventory, baseline test report, danh sách điểm quyết định ở mục 5 và lộ trình migration.
- **Nghiệm thu:** mỗi trang/nút trọng yếu có resource, quyền và ticket sở hữu; không tuyên bố đã chạy khi môi trường thiếu.

### INT-01 — Chốt contract và quyền

- **Phụ thuộc:** INT-00.
- Hoàn thiện success/error schemas của auth trước; đưa validation DTO thật vào OpenAPI thay vì để tất cả chỉ là string.
- Chốt method/path/DTO cho từng feature ở mục 4; trạng thái, paging, version, idempotency và lỗi cần xử lý.
- Tạo role/ownership matrix; chọn `404` cho resource không sở hữu nhằm tránh tiết lộ sự tồn tại, `403` cho sai vai trò; áp dụng nhất quán.
- Rà migration V009 với ADR shared team; thêm migration mới khi thay đổi, kèm upgrade test. Giữ tài liệu hiện hành và target phân biệt rõ.
- **Đầu ra:** OpenAPI theo từng increment, type contract frontend, sơ đồ trạng thái và migration plan. Không công bố route target là implemented trước khi có controller.
- **Nghiệm thu:** response mẫu qua schema check, security matrix có test case; `/me` không bị đổi kiểu phá tương thích.

### INT-02 — HTTP client, config và lớp dữ liệu

- **Phụ thuộc:** INT-01.
- Sửa `frontend/src/lib/api.ts`: URL join, query serializer, JSON/body-less/FormData, headers merge, auth flag, AbortSignal, timeout, typed errors và `204`.
- Chỉ đặt `Content-Type: application/json` cho body JSON; browser tự đặt multipart boundary. Giữ `X-Request-Id` và đọc requestId response.
- Không gửi token cho public auth endpoint hoặc external signed URL. Public jobs có thể đọc khi phiên hết hạn.
- Lỗi mạng, timeout, cancel, validation, unauthorized và server error có nhánh riêng; cancel không hiện toast lỗi.
- Bổ sung CORS/config mẫu; cho same-origin hoạt động. Không dùng `Error('MOCK')` hay fallback mock khi backend thất bại.
- **Đầu ra:** HTTP client, `ApiError`, DTO base, services skeleton chỉ cho feature đang làm, test client.
- **Nghiệm thu:** test JSON success/204/HTML lỗi/400/401/403/409/429/500, request bị abort và FormData; browser preflight hoạt động.

### INT-03 — Auth và điều hướng theo quyền

- **Phụ thuộc:** INT-02.
- Tạo login/register/forgot/reset/verify; AuthProvider/session/refresh single-flight; route guard và sidebar theo quyền.
- Form bám validation backend; không cho registration truyền role/active/verified ngoài contract.
- Hoàn thiện mailbox test cho verify/reset; credential test dùng dữ liệu tổng hợp. Cập nhật `/me` cho verified state nếu đã chốt.
- Thêm return URL chỉ nhận đường dẫn nội bộ hợp lệ. Sau đổi mật khẩu, logout hoặc session mất hiệu lực, clear cache và đăng nhập lại.
- Tách OAuth test có điều kiện khỏi suite password auth mặc định.
- **Nghiệm thu:** đăng ký → verify → login → me; login thất bại; hết hạn token; 10 request đồng thời chỉ một refresh; logout khi request đang chạy không khôi phục dữ liệu cũ; reload về login là hành vi có chủ đích.

### INT-04 — Hồ sơ Candidate và taxonomy tối thiểu

- **Phụ thuộc:** INT-03, phần taxonomy read của INT-01.
- Xây profile/skills/experiences/educations/preferences/consents API và ownership query. Full name thuộc Identity thì cập nhật qua input port, không truy cập chéo repository.
- Đưa skill active có thật vào form; danh mục đầy đủ thuộc INT-06.
- Nối `ProfileResume.tsx`, `CandidateSettings.tsx`; lưu có version, fieldErrors và dirty-state. Chưa upload thì hiển thị chưa có CV.
- **Nghiệm thu:** account A sửa hồ sơ A; B không đọc/sửa được; refresh dữ liệu giữ đúng giá trị; stale update trả 409; withdraw consent được lưu và audit.

### INT-05 — CV upload, scan, parse và worker nền tảng

- **Phụ thuộc:** INT-04.
- Triển khai storage port, upload session, signed upload, complete/verify upload, metadata và phiên bản CV bất biến.
- Thêm durable queue dùng MySQL; API/worker có runtime mode riêng, claim/complete transaction ngắn, lease fencing và retry schedule theo ADR.
- File vào quarantine; kiểm MIME/signature/size thực tế; scan rồi parse trong môi trường giới hạn thời gian/bộ nhớ; parser không gọi URL từ nội dung file.
- Chốt status machine upload/scan/parse riêng; API chỉ cho dùng CV hợp lệ theo rule. UI có progress và trạng thái chờ/thất bại/thử lại; không đổi thành “upload xong” khi mới nhận upload URL.
- Không xóa bản CV đang được application active tham chiếu. Thu hồi/xóa phải nhất quán DB/storage, có recovery cho upload bỏ dở.
- **Nghiệm thu:** file đúng/sai loại/quá lớn/có malware; download trái quyền; worker crash/restart; object thiếu; expired signed URL; CV application trỏ đúng version.

### INT-06 — Jobs, revisions, tìm kiếm và saved jobs

- **Phụ thuộc:** INT-03, quyết định schema INT-01.
- Hoàn thiện skill lifecycle; shared-team draft/create/edit/publish/close, revision snapshot và public job query.
- Công khai job OPEN chưa hết hạn ngay tại query và apply check, không phụ thuộc scheduler đã đổi nhãn EXPIRED hay chưa.
- Nối ExploreJobs, ViewDetails, JobRequisitionsDashboard và JobCreationRecruiter; bộ lọc/paging lưu trong URL.
- Saved jobs có persistence nếu giữ nút lưu; dữ liệu company/department chỉ hiện khi contract cung cấp.
- **Nghiệm thu:** public không đọc draft; Candidate không publish; Recruiter shared team xử lý được theo ADR; hết hạn không apply; edit conflict không ghi đè; job ID route đúng; bookmark có thể đọc lại.

### INT-07 — Applications, dossier và đánh giá thủ công

- **Phụ thuộc:** INT-04, INT-05, INT-06.
- Apply transaction kiểm identity/verification/consent/CV/job/revision và constraint chống trùng; không lấy candidate ID từ client làm authority.
- Lưu immutable input references, status history/actor/time. Đồng thời ghi tác vụ screening bền vững để không mất job giữa commit và enqueue.
- Xây candidate list/detail/withdraw; recruiter list/detail/transitions/evaluations. AI đang chờ vẫn cho theo dõi và đánh giá thủ công.
- Nối MyApplication, CandidateManagement, ApplicationDetail và Evaluation. PDF/dossier chỉ cấp cho đúng role/applicant context.
- **Nghiệm thu:** double-click/concurrent apply tạo đúng một application; B không xem hồ sơ A; Admin bị chặn dossier; transition sai bị từ chối; worker/provider hỏng không làm mất application hợp lệ.

### INT-08 — Screening AI và kết quả hỗ trợ

- **Phụ thuộc:** INT-05, INT-07.
- Tích hợp workflow hiện có vào durable worker, kiểm lại consent khi claim và trước persist result; fencing bỏ kết quả từ lease cũ.
- Đóng băng CV/job/prompt/model phiên bản; hoàn thiện evidence validation và fingerprint theo ADR, không expose raw fingerprint ra client.
- Adapter phân loại retryable; worker kiểm soát tổng attempts. Có provider stub thành công/chậm/lỗi/schema sai; Gemini thật chỉ dùng smoke test được cấu hình riêng.
- API trả pending/processing/success/failure cùng kết quả được phép; UI polling có backoff, pause khi hidden, dừng khi terminal/unmount.
- **Nghiệm thu:** score không tự chuyển application stage; missing score là null; malformed output không lưu thành thành công; worker bị kill và retry không ghi trùng; consent revoked chặn xử lý tiếp.

### INT-09 — Interviews và Offers

- **Phụ thuộc:** INT-07; không buộc AI thành công mới phỏng vấn.
- Triển khai interview create/edit/cancel/list cho recruiter, read theo owner cho candidate; chốt rule trùng lịch và timezone.
- Tạo offer theo application, terms/version/deadline và command send/cancel/accept/decline; phản hồi chỉ cho candidate sở hữu.
- Bổ sung UI tạo offer cho Recruiter; nối InterviewCalendar, InterviewsOffer, ReviewOffer và lịch sử hồ sơ.
- **Nghiệm thu:** accept/decline chạy đồng thời chỉ một quyết định; offer hết hạn hoặc bị rút không accept; stale terms yêu cầu xem lại; thông báo phản ánh kết quả commit.

### INT-10 — Feedback, delivery, notifications và reports

- **Phụ thuộc:** INT-07, INT-08 cho AI draft; INT-09 cho sự kiện lịch/offer.
- Xây draft → edited → approved → queued/sent/failed. Approval gắn đúng nội dung/version; sửa sau approval phải duyệt lại.
- Dùng outbox/delivery ledger và khóa chống gửi trùng; xử lý trường hợp provider đã nhận nhưng response bị mất, không tuyên bố exactly-once khi provider không hỗ trợ.
- Email adapter local/E2E và production qua port; notifications theo owner, unread count và read action có dữ liệu thật.
- Reports từ query/aggregate backend, metric có time range/timezone/định nghĩa rõ; không tính KPI toàn bộ từ một page dữ liệu.
- **Nghiệm thu:** feedback chưa duyệt không gửi; retry không gửi trùng ở các trạng thái xác định; refresh trang giữ unread state; tổng funnel khớp fixture.

### INT-11 — Admin và vận hành nghiệp vụ

- **Phụ thuộc:** INT-03, INT-06; mở rộng metrics sau INT-07–10.
- User directory/roles/status, audit filtered metadata, operations overview/settings theo allowlist.
- Kiểm last active admin, role conflict, stale version; thay đổi role/status khiến JWT cũ bị từ chối theo credential version.
- Chuyển các màn hình tuyển dụng khỏi Admin theo bảng 4.3; links đổi workspace chỉ xuất hiện cho role hợp lệ.
- **Nghiệm thu:** Admin làm được thao tác nền tảng, không download CV/read dossier; Recruiter/Candidate bị chặn API admin; audit không chứa credentials/raw CV.

### INT-12 — Hoàn thiện UI và loại dữ liệu mẫu khỏi luồng thật

- **Phụ thuộc:** các feature đang được nghiệm thu INT-03–11.
- Rà từng page và nút theo inventory; chuyển inline arrays, identity mặc định, count hard-code, fake success và fake “Live Sync” sang dữ liệu thật.
- Mapper tách DTO với avatar initials, nhãn trạng thái, thời gian tương đối và màu. Không gửi những trường UI này ngược backend nếu DTO không nhận.
- Giữ design token/layout/component mới; thêm loading/empty/error/retry, thông báo field error, pending submit, focus và keyboard.
- Phân biệt không có dữ liệu, không có kết quả lọc, chưa có quyền và API chưa sẵn sàng. Mock chỉ nằm trong fixture/test hoặc preview tách rõ.
- **Nghiệm thu:** mọi action đang hiển thị có contract hoặc trạng thái deferred được ghi; không có dữ liệu account cũ sau switch/logout; thử màn hình 360/768/1440px và tên dài.

### INT-13 — Bộ test tích hợp, Postman và CI

- **Phụ thuộc:** triển khai tăng dần từ INT-02; gate cuối sau INT-12.
- Sửa collection theo mục 10.2; thêm coverage cho từng endpoint mới cùng thay đổi triển khai.
- Viết E2E browser với backend/MySQL/storage thật trong môi trường test; external email/AI dùng adapter test có kiểm soát.
- Thêm frontend typecheck/test/build, contract checks và smoke E2E vào CI. Chọn browser runner tại ticket, pin dependency và cập nhật lockfile.
- Lưu report đã lọc dữ liệu nhạy cảm, screenshot khi lỗi, test summary và migration results.
- **Nghiệm thu:** luồng UAT hoàn chỉnh và negative security cases pass; suite chạy lặp lại với account/fixture riêng, không phụ thuộc dữ liệu máy người viết.

### INT-14 — Hiệu năng, staging và bàn giao vận hành

- **Phụ thuộc:** INT-13.
- Đo baseline theo mục 11, xác định query/request chậm bằng evidence rồi tối ưu; không thêm cache hoặc index theo phỏng đoán.
- Mở rộng Compose cho frontend/reverse proxy, worker, storage, scanner, mailbox theo nhu cầu test; healthcheck phân biệt liveness/readiness.
- Chuẩn bị build artifact, runtime config, migration step, backup/restore, rollback/forward-fix, worker recovery và alerts.
- Chỉ deploy cloud/chạy provider trả phí khi có inputs và quyền triển khai; chuẩn bị script/runbook trước, không tự `terraform apply` chỉ vì ticket tích hợp.
- **Nghiệm thu:** staging smoke pass, SLA mục tiêu được đo, restore/recovery có bằng chứng, không còn blocker trước bàn giao.

## 7. Thứ tự triển khai và mốc bàn giao

| Mốc | Ticket | Demo phải thực hiện được |
| --- | --- | --- |
| M0 — Baseline/contract | INT-00–01 | Danh sách gap, quyền, DTO và migration có thể review |
| M1 — Kết nối và phiên | INT-02–03 | UI login → `/me`, refresh đồng thời và logout đúng |
| M2 — Dữ liệu tuyển dụng nền | INT-04–06 | Profile, CV hợp lệ, recruiter publish, candidate tìm job |
| M3 — Luồng hồ sơ | INT-07–08 | Apply → recruiter review; AI lỗi vẫn theo dõi application được |
| M4 — Hoàn tất tuyển dụng | INT-09–11 | Interview → offer → accept; admin đúng quyền; notification/report thật |
| M5 — Chất lượng/bàn giao | INT-12–14 | Không mock trong luồng thật; CI, E2E, Postman, đo tải và staging smoke |

INT-06 có thể làm trước INT-05 sau khi contract/schema đã chốt; INT-09 không phụ thuộc AI thành công. Kiểm thử được viết theo mỗi ticket, không dồn đến M5. Chỉ ước lượng thời gian sau INT-00 vì phần backend còn thiếu bao gồm storage/worker/communications; không xem đây là một task đổi URL API ngắn.

## 8. Quy tắc tối ưu truy vấn và state

- Filter/sort/paging ở backend; debounce search khoảng 300ms làm điểm khởi đầu, hủy request trước và không cho response cũ ghi đè filter mới.
- Deduplicate request cùng resource/query/session; cache key chứa account/role, filters, page và resource version khi cần. Clear private cache khi session thay đổi.
- Invalidate có mục tiêu sau mutation: apply cập nhật application list/job action/count; transition cập nhật dossier/list/report liên quan; không reload toàn bộ app.
- Cache dữ liệu công khai và taxonomy lâu hơn dữ liệu riêng tư; token/CV/signed URL không đưa vào persistent cache hoặc telemetry. Không cache lỗi auth như dữ liệu thành công.
- Tối đa một GET retry cho lỗi mạng/5xx với backoff làm mặc định ban đầu; `429` theo `Retry-After` và giới hạn retry; không retry `400/403/409` tự động.
- DTO list gọn, không mang CV text, lịch sử đầy đủ hay provider payload. Tách detail và heavy content; query projection/batch fetch tránh N+1.
- Index dựa trên WHERE/ORDER BY và EXPLAIN: owner+updatedAt, job+stage, status+expiresAt chỉ là ứng viên cần đo. Kiểm tra index trùng trước khi thêm migration.
- API submit không giữ DB transaction trong upload, scan, parse, email hoặc Gemini call. Queue payload chứa ID/version, không chứa raw CV.
- Lazy-load trang lớn theo route/role; xem bundle report trước khi tối ưu. Không để bảng tải hàng nghìn record vào browser rồi lọc cục bộ.

## 9. Bất biến dữ liệu cần kiểm tra

1. Một candidate không tạo hai application cho cùng job nếu contract MVP quy định duy nhất; chốt rõ chính sách reapply khi đã withdraw/reject.
2. CV được tham chiếu thuộc candidate, đã qua kiểm tra và là version bất biến; job revision khi apply có thể audit lại.
3. Mọi transition có actor/time/from/to/reason phù hợp; client không thể tự đặt stage tùy ý.
4. AI output chỉ hỗ trợ, không tự reject/hire hoặc gửi phản hồi. Consent được xét lại khi tác vụ chạy và lưu kết quả.
5. Offer terms thay đổi không dùng approval/acceptance cũ; thời gian hết hạn do server quyết định.
6. Command commit và enqueue/outbox không bị tách thành hai bước có thể mất tác vụ khi crash.
7. Worker cũ không thể ghi đè worker mới; retries có trần và trạng thái để vận hành xử lý.
8. Delete/retention có trạng thái durable; xóa storage thất bại không được báo đã purge toàn bộ.

## 10. Chiến lược kiểm thử

### 10.1 Ma trận test bắt buộc

| Lớp | Kịch bản trọng yếu | Điều kiện đạt |
| --- | --- | --- |
| Contract | Schema request/response, enum/null/date, auth ID, paging, 204/error | FE types và wire response khớp, không nới assert để che mismatch |
| HTTP/session frontend | Refresh đồng thời, timeout refresh, logout race, abort, HTML error, fieldErrors | Không loop, không treo loading, không hồi sinh session |
| API authorization | Anonymous, A/B Candidate, Recruiter, Admin, inactive/role changed | Endpoint và field projection đúng quyền; direct HTTP không vượt guard |
| Persistence | Flyway fresh/upgrade từ schema đang triển khai, Hibernate validate, stale version | Không mất dữ liệu/backfill sai, không sửa checksum migration cũ |
| Concurrency | Apply trùng, offer accept/decline, token dùng lại, worker reclaim | Constraint/lock/version tạo đúng một kết quả hợp lệ |
| Files/provider | Signed URL, object thiếu, malware, parser timeout, AI 429/5xx/schema lỗi | Không expose file trái quyền, không đánh dấu kết quả sai là success |
| Browser E2E | Login → profile/CV → apply → human review → interview → offer → accept | Không dùng UI mock hay intercept fake API làm bằng chứng tích hợp |
| Vận hành | Worker crash, API restart, DB/storage mất kết nối, restore, provider chậm | Có recovery, trạng thái lỗi và alert đủ để xử lý |

Luồng kiểm tra chéo bắt buộc: Candidate A nộp hồ sơ; Recruiter thấy đúng application; Candidate B không truy cập được bằng cách sửa ID; Admin bị từ chối CV; AI bị lỗi nhưng application vẫn tồn tại; Recruiter xử lý thủ công; A nhận và phản hồi offer; kết quả xuất hiện ở cả hai workspace.

### 10.2 Chỉnh Postman thành bộ test chạy được

Collection hiện tại là request mẫu đã kiểm tra JSON, chưa có bằng chứng toàn bộ Runner pass. Agent phải sửa:

- Dùng biến email/password thống nhất; tạo email test duy nhất mỗi run, giữ duplicate-email case dùng đúng account đó.
- Nhóm smoke public; auth flow; account mutations; recruitment flows; negative authorization; OAuth/manual prerequisites riêng.
- Sau đổi/reset password, login lại bằng password mới trước khi dùng API cần auth. Đặt logout cuối luồng tương ứng.
- Token verify/reset lấy từ test mailbox/harness cô lập; token không có trong log hiện tại. Không thêm production endpoint public để đọc token.
- OAuth disabled kỳ vọng chính xác lỗi cấu hình; OAuth enabled có code/PKCE thật mới kỳ vọng 200. Không chấp nhận `[200,404]` chung như thành công của cùng một tình huống.
- Tách deny-all anonymous `401` và authenticated `403`. Khi `/jobs` đã thành public API, chuyển negative case sang một route sentinel chưa khai báo.
- Assert status, error code, đủ các trường error, schema thành công, token no-store headers, ID/version và state transitions. Các assertion không phụ thuộc tên request làm khóa mong manh.
- Kiểm tra token rotation bằng cách lưu token cũ có kiểm soát; replay làm mất session nên có login độc lập cho case sau. Không log token.
- Respect rate limits; không chạy stress login/refresh trong smoke mặc định. Case thiếu prerequisite phải được báo skipped/manual rõ, không ghi “all pass”.
- Xuất báo cáo số passed/failed/skipped và endpoint coverage theo method+path; không xuất environment chứa token sau test vào Git.

### 10.3 Lệnh kiểm tra và CI

Các lệnh đã có, chạy từ root với toolchain đúng:

```sh
./scripts/verify.sh
npm --prefix frontend run test
npm --prefix frontend run build
git diff --check
```

`verify.sh` cần Docker và JDK 25, dùng MySQL Testcontainers cô lập. Frontend hiện chưa có script `typecheck` và E2E: INT-13 thêm chúng rồi ghi đúng lệnh vào runbook/CI; không ghi lệnh chưa có như thể đã chạy được. Kiểm tra type riêng vì Vite build không thay thế kiểm tra toàn bộ TypeScript.

Sau khi chọn package manager ở INT-00, CI dùng install frozen/immutable lockfile tương ứng, build frontend và backend, contract checks, DB upgrade tests, E2E smoke. Không tắt test hoặc nới security matcher để làm pipeline xanh.

## 11. Mục tiêu hiệu năng và ổn định

Đây là **ngưỡng mục tiêu đề xuất**, chưa phải số đo hay cam kết production. Chốt máy chạy/cấu hình/seed sau INT-00 và lưu report để so sánh.

| Hạng mục | Mục tiêu nghiệm thu ban đầu |
| --- | --- |
| Dataset đo | 1.000 jobs, 10.000 applications tổng hợp, 20 session hoạt động; seed mô tả rõ phân bố dữ liệu |
| API list/detail thường | p95 ≤ 500ms, p99 ≤ 1.000ms trên staging đã chốt, không tính upload/provider call |
| Mutation thường | p95 ≤ 800ms, xử lý dài trả acknowledgement/trạng thái async |
| Tải thử | Warm-up 2 phút, đo 10 phút; lỗi 5xx ngoài fault injection < 1%; lưu throughput và tỷ lệ lỗi |
| Payload list | 20 records mặc định, mục tiêu ≤ 100KB JSON chưa nén; không kèm raw file/extraction text |
| Search | Debounce khoảng 300ms; kết quả cũ không ghi đè mới; phân trang không reset nhầm filter |
| Refresh | 10 API request cùng hết hạn trong một phiên → đúng 1 refresh call |
| Worker | Job đang xử lý được reclaim trong lease TTL + một polling interval + sai số đo đã ghi; completion không trùng |
| UI | Loading xuất hiện ngay; có retry sau timeout; không cần reload toàn trang để thấy mutation |

Không áp ngân sách list API cho login có Argon2 hoặc file/AI; đo chúng riêng. Theo dõi pool DB, slow queries, API latency, queue age, lease expiry, retry count và delivery failures. Không dùng user ID/email làm label metrics có cardinality lớn. Alert threshold lấy từ baseline, ghi rõ người xử lý trong runbook.

## 12. Release gate và bàn giao

Chỉ ghi **hoàn thành tích hợp MVP** khi:

- [ ] Inventory các page/action đã được nối hoặc ghi deferred rõ; không có mock/fake success trong luồng đang phát hành.
- [ ] OpenAPI, DTO, runtime response và collection đồng bộ; các target endpoint đã triển khai mới được đánh dấu Current.
- [ ] Baseline backend test, frontend typecheck/test/build, contract, migration và E2E pass trên checkout bàn giao.
- [ ] Role/ownership/ID tampering, revoked account và concurrent state-change được kiểm tra.
- [ ] Verify/reset có đường vận hành thật trong môi trường test; không dựa vào đọc token từ log.
- [ ] Provider failure, file lỗi, worker restart và queue recovery có test và trạng thái UI tương ứng.
- [ ] Kiểm thử Postman có report, số skip nêu rõ; các case manual không được tính đã pass.
- [ ] Performance report có môi trường/seed/load và kết quả; mỗi tiêu chí chưa đạt có blocker hoặc quyết định phạm vi minh bạch.
- [ ] Env mẫu, local runbook, reverse proxy route, healthcheck và cách khởi tạo test account được ghi đầy đủ.
- [ ] Có hướng dẫn migrate/backup/restore/rollback; không rollback bằng sửa/xóa lịch sử Flyway.
- [ ] Staging smoke có bằng chứng; production deployment là bước riêng theo inputs/quyền của môi trường.

Hồ sơ bàn giao mỗi ticket:

```text
Ticket / trạng thái:
Luồng người dùng đã hoạt động:
Files và endpoint thay đổi:
Migration / backfill / tác động dữ liệu:
Quyền và state transitions:
Lệnh test + kết quả thực tế:
Ảnh/report hoặc bước tái hiện:
Giới hạn / prerequisite còn thiếu:
Ticket tiếp theo và dependency:
```

Không đánh dấu complete chỉ dựa vào compile hoặc ảnh UI. Thiếu môi trường test phải báo “chưa xác minh” cùng điều kiện còn thiếu.

## 13. Prompt giao việc cho agent code

> Hãy triển khai tích hợp frontend React và backend Spring Boot của SmartRecruit theo `docs/architecture/frontend-backend-integration-plan.md`. Đọc ADR 0003, frontend mapping, backend backlog và AGENTS.md trước khi sửa. Bắt đầu INT-00 để ghi baseline và bảo toàn các thay đổi đang có, sau đó thực hiện lần lượt các ticket theo dependency. Dùng contract thực tế; API chưa có thì xây use case, persistence, authorization và test trước khi nối UI. Ưu tiên hoàn thành một luồng có backend và frontend cùng hoạt động ở mỗi increment. Giữ design system/layout hiện có; bỏ dữ liệu mẫu khỏi luồng thật. Triển khai session trong bộ nhớ, refresh single-flight, typed errors, xử lý 204, ownership, version conflicts và trạng thái bất đồng bộ. Tôn trọng Admin không đọc CV/dossier, Recruiter shared team và Candidate ownership. Hoàn thiện local mailbox/storage/worker để luồng verify/upload/apply có thể kiểm thử. Cập nhật OpenAPI, Postman và tài liệu cùng mỗi feature. Chạy kiểm tra phù hợp và ghi kết quả thực tế; không tắt test, không trả thành công giả, không sửa migration đã áp dụng. Hoàn thành luồng register–verify–profile–CV–apply–review–interview–offer–accept và các release gate; khi một hạng mục bị chặn, ghi điều kiện thiếu và tiếp tục phần độc lập. Chuẩn bị deployment/runbook trong repository; chỉ thực hiện cloud apply, gửi thông báo tới người thật hoặc chạy provider trả phí khi được cho phép. Báo cáo theo mẫu handoff, nêu rõ phần đã kiểm chứng và phần còn chưa xác minh.
