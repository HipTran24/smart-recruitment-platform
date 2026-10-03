# Backend Audit & Fix Plan — SmartRecruitment

| Thuộc tính | Giá trị |
| :--- | :--- |
| **Ngày audit** | 2026-10-03 (vòng 1: 38 case) |
| **Ngày kiểm thử lại** | 2026-10-03 lần 2 — sau khi chủ dự án fix (vòng 2: +10 case mới, xem §0.5) |
| **Phạm vi** | Toàn bộ backend Spring Boot tại repository root (`src/main/java`, `src/main/resources/db/migration`, `src/test/java`) |
| **Đối chiếu với** | `docs/SMARTRECRUIT_PROJECT_SETUP.md`, `docs/architecture/*`, `docs/adr/0001-0003`, `docs/api/*`, `docs/database/*`, `docs/runbooks/*` |
| **Môi trường kiểm thử** | Java 25 (Corretto 25.0.4.1) + MySQL 8.4.11 (Docker) + app thật trên `127.0.0.1:8080` |
| **Baseline test** | Vòng 1: 75 tests / 0 failures. **Vòng 2: 85 tests / 0 failures** |
| **Số case** | **48** — gốc 38 (6 × P0, 10 × P1, 14 × P2, 8 × P3) + 10 case mới ở vòng 2 (2 × P0, 4 × P1, 3 × P2, 1 × P3) |
| **Cách phát hiện** | Đọc toàn bộ source + test, chạy app thật, smoke test 100% endpoint, A/B reproduction, mutation test gate, ký JWT bằng chính private key của app, upgrade migration trên DB có dữ liệu, kiểm tra DB live, đối chiếu tài liệu chính thức của Google |
| **Trạng thái sau vòng 2** | 22/38 case gốc FIXED hoàn toàn · 14 case FIX MỘT PHẦN · 2 case CHƯA FIX (BE-003→BE-044, BE-019/020/021) |

> **File này là kịch bản fix code.** Mỗi case có template cố định: Mức độ → Trạng thái xác minh → File → Hiện tượng → Bằng chứng → Nguyên nhân gốc → Ảnh hưởng → Cách sửa → Acceptance test.
>
> **Quy ước trạng thái xác minh**
> - ✅ **Đã tái hiện** — đã trigger được trên app thật hoặc tái hiện bằng A/B test. Bằng chứng nằm trong mục *Bằng chứng*.
> - 🔍 **Phân tích tĩnh** — khẳng định được đọc trực tiếp từ code/schema, không cần chạy.
> - ⚠️ **Cần xác minh** — cần gọi provider/API bên ngoài hoặc quyết định của team trước khi sửa.

---

## 0. Thứ tự thực thi đề xuất (Wave plan)

| Wave | Case | Lý do ưu tiên | Thời lượng ước tính |
| :--- | :--- | :--- | :--- |
| **Wave 1 — Auth/P0** | BE-001, BE-005, BE-006, BE-007, BE-008 | Ảnh hưởng trực tiếp đến xác thực và khả năng bị DoS; là nền cho mọi endpoint G3+ sắp xây | 2–3 ngày |
| **Wave 2 — DevEx & Config/P0** | BE-002, BE-004, BE-018 | Chặn việc verify đúng cách và chặn bootstrap admin → mọi PR sau đó đều bị ảnh hưởng | 0.5 ngày |
| **Wave 3 — Luồng nghiệp vụ/P0-P1** | BE-003, BE-011, BE-013, BE-019, BE-020, BE-022 | Luồng account recovery và screening chưa dùng được thật | 2–3 ngày |
| **Wave 3b — Schema integrity/P1** | BE-028, BE-029 | FK bị vô hiệu và ID bị gán lẫn module — phải sửa **trước** khi G4 (jobs) bắt đầu ghi dữ liệu | 0.5 ngày |
| **Wave 4 — AI adapter/P1** | BE-009, BE-010 | Ảnh hưởng chất lượng điểm screening (điểm số đưa cho recruiter) | 1 ngày |
| **Wave 4b — Kiến trúc & quan sát/P1-P2** | BE-030, BE-031, BE-032, BE-033, BE-034, BE-035, BE-036 | Gate kiến trúc đang bỏ lọt vi phạm thật; không có log để chẩn đoán sự cố | 1–2 ngày |
| **Wave 5 — Dọn dẹp/P2-P3** | BE-012, BE-014, BE-015, BE-016, BE-017, BE-021, BE-023 → BE-027, BE-037 → BE-039 | Nợ kỹ thuật, dead code, drift tài liệu | 1–2 ngày |

**Definition of Done chung cho mọi case**
1. `JAVA_HOME=<jdk25> ./mvnw -B -ntp clean verify` → BUILD SUCCESS, 75+ tests, 0 failures.
2. `JAVA_HOME=<jdk25> ./mvnw -B -ntp -Dsmartrecruit.build.directory=/tmp/sr-verify clean verify` → **cũng phải BUILD SUCCESS** (xem BE-002).
3. Có test khẳng định lại hành vi đã sửa (không chỉ test thủ công bằng curl).
4. Nếu case đụng tới API contract → cập nhật `docs/api/` trong cùng PR (quy định tại `docs/README.md`).
5. Nếu case đụng tới schema → thêm migration `V009+`, **không sửa migration cũ**.

---

## 0.5. KẾT QUẢ KIỂM THỬ LẠI — VÒNG 2 (sau khi chủ dự án fix)

| Thuộc tính | Giá trị |
| :--- | :--- |
| **Revision kiểm thử** | working tree trên `e07e7f7` (chưa commit) — 59 file đổi, +882/−3206 |
| **Test suite** | **85 tests, 0 failures** (trước: 75) — `clean verify` BUILD SUCCESS |
| **ArchUnit A/B** | `target/` **và** build dir tùy biến đều **BUILD SUCCESS** (trước: build dir tùy biến FAIL 61 vi phạm) |
| **Migration** | V001–**V009** apply sạch trên MySQL 8.4.11; Hibernate `validate` pass (entity ↔ schema khớp sau khi bỏ `created_by_member_id`) |
| **Smoke test API** | 100% endpoint — phát hiện **1 regression mới** (405/415 → 500) |
| **Kết luận** | **22/38 case FIXED hoàn toàn**, 14 case fix một phần, 2 case chưa fix; fix đã **sinh ra 10 case mới** (6 ở mức P0/P1) |

### Bảng trạng thái 38 case gốc

| Case | Trạng thái | Bằng chứng kiểm chứng lại |
| :--- | :--- | :--- |
| BE-001 Bearer cũ chặn endpoint public | ✅ **FIXED** | A/B: `login` không header và có Bearer hỏng → **cùng 200** (trước: 200 vs 401); `health`/`openapi` + Bearer hỏng → 200; `/me` + Bearer hỏng → vẫn **401**. Có test `authenticationFilterBypassesPublicEndpointsWhenBearerIsMalformedOrInvalid` |
| BE-002 ArchUnit fail theo build dir | ✅ **FIXED** | `EXCLUDE_TEST_OUTPUT` predicate thay `DO_NOT_INCLUDE_TESTS` + test chặn hồi quy `productionClassesContainNoTestClasses`. A/B cả 2 build dir → **BUILD SUCCESS**, 9 tests |
| BE-003 Reset/verify không dùng được | ❌ **CHƯA FIX** (tệ hơn) | Xem **BE-044**: gateway mới chỉ `log.info` và **vứt bỏ `rawToken`**; vẫn không có đường lấy token; response + log nay **khẳng định đã gửi** |
| BE-004 Admin bootstrap sai prefix | ✅ **FIXED** | prefix → `app.identity.bootstrap-admin`; `application.yml` bind 4 property; `.env.example` document; `AdminBootstrapTests` thêm `ApplicationContextRunner` |
| BE-005 Throttle map vô hạn | ✅ **FIXED** | `MAX_ENTRIES=10_000` + `ensureCapacity()` evict entry hết hạn rồi evict cũ nhất; `size()` expose cho test |
| BE-006 Throttle theo email | ⚠️ **FIX MỘT PHẦN** | Đa chiều `ip:`/`account:`/`pair:` ✓ nhưng **spoofable** (**BE-041**), **chia sẻ key với login** (**BE-042**), một số endpoint **no-op** (**BE-043**) |
| BE-007 `credential_version` fail-open | ✅ **FIXED** | 8/8 kịch bản đúng: thiếu claim → 401, dạng **string → 401**, 0/âm/999 → 401, đúng → 200. Có 2 test mới |
| BE-008 Đổi role không thu hồi token | ⚠️ **FIX CODE, THIẾU TEST** | `addRole`/`removeRole`/`deactivate` nay bump `credentialVersion`; live: cv lệch → **401**. **Nhưng 0 test** cho đường role→revoke |
| BE-009 Regex PII xóa mốc thời gian | ✅ **FIXED** | 11/11 assertion PASS: `(03/2019 - 07/2023)`, `(2013 - 2017)`, `2020-2022` giữ nguyên; `+84 912 345 678`, `0912345678`, `(028) 3822 1234` vẫn bị khử |
| BE-010 Sai field structured output | ✅ **FIXED** | Đổi sang `generationConfig.responseMimeType` + `responseSchema` (đúng đặc tả `generateContent`) |
| BE-011 Không có 3 provider attempt | ✅ **FIXED** | vòng lặp `MAX_PROVIDER_ATTEMPTS=3` + `isRetryable()`; 2 test mới. Lưu ý: cột `attempt` vẫn chưa được dùng |
| BE-012 OpenAPI hardcode | ⚠️ **FIX MỘT PHẦN** | 10/10 path ✓, `ApiErrorResponse` schema ✓, `security` toàn cục ✓, lỗi 400/401/403 ✓. **`requestBody` vẫn thiếu ở mọi POST** |
| BE-013 Sai mã HTTP / DIVE→409 | ✅ **FIXED** | current-password sai → **422 `INVALID_CURRENT_PASSWORD`**; `DataIntegrityViolationException` thu hẹp → 409 chỉ cho constraint đã biết, còn lại **500 + log.error** |
| BE-014 Profile `local` no-op | ⚠️ **FIX MỘT PHẦN** | collation local khớp CI (`utf8mb4_0900_ai_ci`) ✓, `LOGGING_LEVEL_ORG_HIBERNATE_SQL: warn` ✓. **`SPRING_PROFILES_ACTIVE: local` vẫn còn** trong khi `application-local.yml` vẫn bị dockerignore |
| BE-015 Dead schema Envers + CHECK sai tên | ✅ **FIXED** | V009 `DROP TABLE revchanges, revinfo`; CHECK đổi thành `chk_candidate_experiences_dates_valid` với ngữ nghĩa đúng |
| BE-016 Dead code domain | ✅ **FIXED** | overload `complete()` 6 tham số đã xoá (test cập nhật theo) |
| BE-017 JSON property lạ | ✅ **FIXED** | `fail-on-unknown-properties: true`; field lạ → **400 `VALIDATION_ERROR`** + `fieldErrors`; payload đúng → 200 |
| BE-018 Gate method ≤60 dòng | ✅ **FIXED** | `checkMethodSizeBudget()` thêm; **mutation test**: method 73 dòng → FAIL với thông báo đúng; `createSpecification()` tách thành 7 method, file 342→118 dòng |
| BE-019 Access token sống sau logout | ❌ **CHƯA XỬ LÝ** | không đổi code; `docs/runbooks/authentication-and-ai.md` **không được sửa** |
| BE-020 Reuse refresh revoke cả phiên | ❌ **CHƯA XỬ LÝ** | logic giữ nguyên; "rate limit refresh" được thêm nhưng **là no-op** → **BE-043** |
| BE-021 Enumeration qua register | ❌ **CHƯA XỬ LÝ** | 409 vẫn tiết lộ email tồn tại; throttle register **no-op** → **BE-043** |
| BE-022 Thông điệp reset-request không trung thực | ❌ **CHƯA FIX** | chỉ đổi câu chữ; vẫn khẳng định điều không xảy ra (**BE-044**) |
| BE-023 `transactionId` 43 vs tài liệu | ⚠️ **FIX MỘT PHẦN → GÂY BẤT NHẤT** | DTO + filter + service nay nhận `{43,128}`, **nhưng entity `OAuthAuthorizationCode` vẫn bắt đúng 43** → **BE-046** |
| BE-024 Instance throttle thứ hai | ✅ **FIXED** | `IdentityAuthenticationService` chỉ còn 1 constructor |
| BE-025 `validatePassword` mất field error | ✅ **FIXED** | `InvalidPasswordPolicyException` → **400 `VALIDATION_ERROR`** + `fieldErrors.newPassword` |
| BE-026 `.env` chứa credential | ✅ không đổi (đúng thiết kế) | vẫn gitignored + dockerignored |
| BE-027 Tài liệu `application-local.yml` | ⚠️ **FIX MỘT PHẦN** | `overview.md` cập nhật cây thư mục + `frontend/`; profile `local` vẫn khai báo mà không có file |
| BE-028 V007 vô hiệu FK compound | ⚠️ **FIX ĐÚNG NHƯNG NGUY HIỂM** | V009 drop `created_by_member_id` + thêm FK `(company_id, created_by_user_id)` → invariant khôi phục. **Nhưng V009 FAIL trên DB không rỗng** → **BE-039** |
| BE-029 `Job` lẫn member ID | ✅ **FIXED** | field + constructor 7 tham số đã xoá; chỉ còn 1 constructor buộc truyền `createdByUserId` |
| BE-030 ArchUnit bỏ lọt layer inversion | ✅ **FIXED** | thêm `apiDoesNotDependOnInfrastructure` + `infrastructureDoesNotDependOnApi`; `JwtPrincipal` → `application`; grep xác nhận **0 import chéo** |
| BE-031 Route `link-google` không tồn tại | ✅ **FIXED** (route) | đã xoá khỏi `IdentitySecurityConfiguration`; `linkGoogleAccount` vẫn là dead code |
| BE-032 `datetime` precision 0 | ✅ **FIXED** | V009 đổi 8 nhóm cột lifecycle sang `datetime(6)` |
| BE-033 Không log `requestId` | ⚠️ **FIX + REGRESSION** | log `requestId` ✓ (header == body == log), fallback `INTERNAL_ERROR` ✓, `Retry-After: 899` ✓. **Catch-all `Exception` biến 405/415 thành 500** → **BE-040** |
| BE-034 Test rỗng / không chạm nhánh | ⚠️ **FIX MỘT PHẦN** | `contextLoads` có assert ✓; `GoogleOAuth2SuccessHandlerTests` set PKCE transaction ✓; `AdminBootstrapTests` có `ApplicationContextRunner` ✓; thêm test JWT ✓. **Vẫn thiếu test CORS header** |
| BE-035 Trùng lặp hash/token | ⚠️ **FIX MỘT PHẦN** | `TokenDigest` ra đời (1 `SecureRandom`, `sha256Hex`/`sha256Base64Url`, 2 regex constant). **Còn regex hardcode ở 6 nơi**; `REFRESH_TOKEN_PATTERN` thành dead code; `FLEXIBLE_TOKEN_REGEX` chưa dùng ở entity |
| BE-036 Tài liệu migration lỗi thời | ⚠️ **FIX MỘT PHẦN** | `schema.md`/`README.md`/`overview.md` liệt kê đủ V001–V009 ✓. **`docs/api/README.md` ghi sai 3 path/field** → **BE-047** |
| BE-037 Nợ schema | ⚠️ **FIX MỘT PHẦN** | 3 index trùng prefix đã drop ✓; 9 CHECK constraint thêm mới và **giá trị enum khớp 100% với Java enum** ✓. **`ON DELETE` vẫn không có** (27 FK) |
| BE-038 pom thừa + `scripts/` lẫn tạp | ✅ **FIXED** | bỏ `starter-json` + `starter-security-oauth2-resource-server` (build vẫn pass); metadata điền đủ; 12 script Python chuyển sang `tools/` |

### Nhận xét tổng thể vòng 2

**Điểm mạnh của lần fix này:** chất lượng kỹ thuật cao và đúng trọng tâm. Những case khó nhất được xử lý **đúng gốc** chứ không vá bề mặt — BE-002 fix bằng predicate đúng bản chất (không hardcode thêm đường dẫn) kèm test chặn hồi quy; BE-008 fix bằng invariant ở tầng domain (`addRole`/`removeRole`/`deactivate` tự bump `credentialVersion`) thay vì rải lời gọi ở service; BE-009 fix bằng regex có negative lookahead thật sự phân biệt được "khoảng năm" với "số điện thoại". Test suite tăng 75 → 85 và các test mới **kiểm chứng đúng hành vi đã sửa** (`rejectsTokenMissingCredentialVersion`, `retriesUpToMaxAttemptsOnRetryableProviderError`, `authenticationFilterBypassesPublicEndpointsWhenBearerIsMalformedOrInvalid`, `productionClassesContainNoTestClasses`). Gate mới của BE-018 đã được tôi mutation-test và bắt lỗi thật.

**Ba vấn đề hệ thống còn lại:**

1. **"Fix trông giống fix nhưng không enforce gì"** — pattern nguy hiểm nhất còn lại, xuất hiện **3 lần**:
   - `AuthController` gọi `checkThrottled("register:…")`, `"refresh:…"`, `"oauth:…"` nhưng **không bao giờ gọi `recordFailure`** cho các key space đó → 30/30 register và 30/30 refresh **không có 429**. Throttle là no-op (**BE-043**).
   - `LoggingAccountNotificationGateway` **chỉ log** rồi vứt `rawToken` → luồng reset/verify vẫn không dùng được, và nay **cả log lẫn response đều khẳng định đã gửi** (**BE-044**).
   - `docs/api/README.md` tuyên bố "các endpoint nhạy cảm được bảo vệ bởi Rate Limiting" — không đúng với register/refresh/oauth.
2. **Fix tạo rủi ro vận hành mới** — V009 thêm FK compound **không có bước kiểm tra dữ liệu**: tái hiện được `ERROR 1452` khi upgrade một DB có job row hợp lệ theo schema V007/V008. Flyway fail ⇒ **ứng dụng không khởi động**. **Không test nào phủ** vì test upgrade có dữ liệu **dừng ở V008** (**BE-039**).
3. **Catch-all exception handler lấn át Spring MVC** — `@ExceptionHandler(Exception.class)` biến 405/415 thành **500 `INTERNAL_ERROR`** kèm `log.error` + stack trace cho lỗi phía client (**BE-040**).

**Đánh giá mức độ:** 22/38 case đóng hoàn toàn, nhưng trong 16 case còn lại có **6 case P0/P1 mới** (BE-039 → BE-044) và **1 case P0 chưa fix** (BE-044, tức BE-003). Vì vậy **chưa nên coi G2 là hoàn tất**; nên xử lý hết Wave A và B dưới đây trước khi bắt đầu G3.

### Thứ tự ưu tiên vòng 3 (Wave A → C)

| Wave | Case | Lý do |
| :--- | :--- | :--- |
| **A — chặn triển khai** | **BE-039, BE-040** | BE-039 làm app không start được khi upgrade môi trường có dữ liệu; BE-040 trả sai mã lỗi + spam ERROR log |
| **B — bảo mật & chức năng** | **BE-041, BE-042, BE-043, BE-044** | Throttle bị bypass / khóa chéo / no-op; luồng account recovery vẫn không dùng được |
| **C — hoàn thiện** | **BE-045 → BE-048** + các mục ⚠️ còn lại (BE-008 test, BE-012 `requestBody`, BE-019/020 docs, BE-034 CORS test, BE-035/037 nợ) | Chất lượng hợp đồng, tài liệu và test |

---

## 1. Tóm tắt điều hành

Backend này **không phải là code non tay**. Cấu trúc modular monolith được tuân thủ nghiêm, transaction boundary cho luồng AI screening được thiết kế đúng, security baseline (deny-all, CORS allowlist, PKCE, Argon2id, refresh token chỉ lưu SHA-256) đều hoạt động thật. 75/75 test pass trên môi trường sạch, Flyway V001–V008 apply thành công trên MySQL 8.4, Hibernate `validate` pass.

Vấn đề nằm ở **tính đúng đắn ở rìa hệ thống** (edge correctness) và **khoảng cách giữa tài liệu và code**:

| Hạng mục | Kết quả | Bằng chứng |
| :--- | :--- | :--- |
| Kiến trúc phân lớp (api/application/domain/infrastructure) | 🟠 Có vi phạm | 2 hướng phụ thuộc bị đảo mà ArchUnit **không** bắt: `api→infrastructure` và `infrastructure→api` (BE-030) |
| Transaction boundary & lease cho AI screening | 🟢 Tốt | `@Transactional(NOT_SUPPORTED)` + `REQUIRES_NEW` + pessimistic lock + lease token |
| Security baseline (deny-all, CORS, PKCE, JWT RS256) | 🟢 Tốt | 401/403 đúng; CORS origin lạ → 403; `alg=none` → 401; PKCE S256 bắt buộc |
| Flyway migration chạy + Hibernate validate | 🟢 Tốt | 8/8 migrations apply trên MySQL 8.4.11, `validate` pass, không có mapping drift |
| Schema integrity & invariants | 🔴 Lỗi | BE-028: V007 vô hiệu hóa FK compound → invariant "job creator thuộc company" **không còn được enforce**; BE-029 lẫn ID giữa 2 module |
| Rìa xác thực (public endpoint + header lạ) | 🔴 Lỗi | BE-001: `login` 200 → 401 chỉ vì có header Bearer cũ |
| Chống brute-force | 🔴 Lỗi | BE-005 rò rỉ bộ nhớ (2 → 20.002 object); BE-006 khóa được tài khoản người khác |
| Vòng đời credential (thu hồi quyền) | 🔴 Lỗi | BE-007 fail-open; BE-008 đổi role không thu hồi token |
| Luồng account recovery & linking | 🔴 Chưa dùng được | BE-003: token reset/verify tạo ra rồi bị vứt bỏ; BE-031 route `link-google` không tồn tại |
| AI adapter | 🟠 Có vấn đề | BE-009 regex xóa mất mốc thời gian; BE-010 sai field schema |
| Khả năng quan sát (observability) | 🔴 Lỗi | BE-033: không handler nào log; `requestId` không bao giờ vào log; `IllegalStateException` rò body mặc định của Boot |
| Chất lượng kiểm thử | 🟠 Có lỗ hổng | BE-002 gate fail theo build dir; BE-004 test không bind config; BE-010 test khóa cứng bug; BE-034 test rỗng/không chạm nhánh cần test |
| Chi tiết schema (precision, index, CHECK, charset) | 🟠 Nợ kỹ thuật | BE-032 làm tròn ±0.5s; BE-037 index trùng prefix, không CHECK cho enum, collation lệch giữa CI và local |
| Dead code & drift tài liệu | 🟠 Nhiều | BE-015, BE-016, BE-012, BE-018, BE-035, BE-036, BE-038 |

**Kết luận:** không có lỗ hổng cho phép chiếm quyền từ ngoài (không tìm thấy bypass xác thực, không SQL injection, không rò rỉ secret qua image). Rủi ro thực tế tập trung vào 4 nhóm:

1. **DoS** — BE-005 (cạn heap từ endpoint công khai, đã đo được 2 → 20.002 object vĩnh viễn) và BE-006 (khóa tài khoản người khác từ xa).
2. **Thu hồi quyền không hiệu lực** — BE-007 (claim `credential_version` fail-open) và BE-008 (`incrementCredentialVersion()` không có caller → đổi role không thu hồi token). Hai case này sẽ trở thành lỗ hổng leo thang đặc quyền thật ngay khi G3+ thêm Admin Console mutation **và** BE-030 cho thấy gate kiến trúc đang không thực thi điều ADR tuyên bố.
3. **Luồng nghiệp vụ không chạy được** — BE-003 (token reset/verify tạo ra rồi bị vứt bỏ, không có adapter email), BE-031 (route `link-google` không tồn tại), BE-011 (quy tắc 3 provider attempt không được hiện thực ở đâu).
4. **Mất toàn vẹn dữ liệu ở tầng schema** — BE-028 (V007 làm `created_by_member_id` NULLABLE → FK compound bị vô hiệu, invariant mà ADR 0002 và `docs/database/README.md` tuyên bố "currently enforced" nay **không được enforce ở bất kỳ tầng nào**) và BE-029 (constructor `Job` gán `company_members.id` vào `created_by_user_id`). Cả hai nằm đúng trên đường đi của G4 nên phải sửa trước khi G4 bắt đầu ghi dữ liệu.

Điểm đáng lưu ý về phương pháp: **hai phát hiện nghiêm trọng nhất về mặt "gate đang nói dối"** — BE-002 (ArchUnit fail theo build dir) và BE-030 (ArchUnit bỏ lọt vi phạm hướng phụ thuộc thật) — đều nằm ở tầng kiểm thử, không phải tầng code. Nghĩa là bộ test 75/75 xanh đang tạo cảm giác an toàn cao hơn thực tế: nó xác nhận code làm đúng những gì code làm, chứ không xác nhận code tuân thủ các quy tắc mà ADR đã phê duyệt. Đây là mức chất lượng "G2 tốt nhưng chưa sẵn sàng cho G3–G4".

---

## 2. Bối cảnh & cách tái hiện môi trường audit

### 2.1 Đã đọc

| Nhóm | File |
| :--- | :--- |
| Kịch bản dự án | `docs/SMARTRECRUIT_PROJECT_SETUP.md`, `GEMINI.md` |
| Kiến trúc | `docs/architecture/overview.md`, `backend.md`, `conventions.md`, `implementation-backlog.md` |
| Quyết định | `docs/adr/0001-modular-monolith.md`, `0002-cross-module-persistence-references.md`, `0003-backend-mvp-baseline.md` |
| API | `docs/api/README.md`, `docs/api/frontend-mapping.md`, `docs/postman/README.md` |
| Database | `docs/database/README.md`, `docs/database/schema.md` |
| Runbook | `local-development.md`, `authentication-and-ai.md`, `troubleshooting.md`, `production-readiness.md` |

### 2.2 Tái hiện môi trường

```bash
# 1) MySQL 8.4 LTS (đúng phiên bản tài liệu yêu cầu)
#    Thay <MYSQL_*> bằng giá trị tương ứng trong .env — không ghi credential vào file này.
docker run -d --name sr-mysql \
  -e MYSQL_DATABASE=<MYSQL_DATABASE> -e MYSQL_USER=<MYSQL_USER> \
  -e MYSQL_PASSWORD=<MYSQL_PASSWORD> -e MYSQL_ROOT_PASSWORD=<MYSQL_ROOT_PASSWORD> \
  -p 127.0.0.1:${MYSQL_PORT}:3306 mysql:8.4.11 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --default-time-zone=+00:00

# 2) Build + chạy (dùng .env sẵn có, JWT key local tại .local/secrets/jwt)
export JAVA_HOME=/Users/ProM2/Library/Java/JavaVirtualMachines/amazon-corretto-25.jdk/Contents/Home
./mvnw -B -ntp -DskipTests package
# nạp .env, set SPRING_DATASOURCE_URL trỏ 127.0.0.1:3307, chạy jar
```

**Kết quả khởi động (đạt):** 8/8 Flyway migration apply thành công, Hibernate `validate` pass, Tomcat lên port 8080 sau 6.06s, không có `Application run failed`.

### 2.3 Giới hạn của audit này

- **Không gọi Google OAuth thật** và **không gọi Gemini thật** (không dùng credential của bạn để tiêu quota). Các kết luận về hai provider này là phân tích tĩnh + đối chiếu tài liệu chính thức.
- API nghiệp vụ tuyển dụng (G3–G9) **chưa tồn tại**, nên không thể test. Audit này phủ 100% endpoint đang tồn tại.
- `docs/postman/Smart_Recruitment_API.postman_collection.json` không được dùng; thay vào đó API được test trực tiếp bằng `curl` để kiểm soát được header và status code.

---

## 3. Trạng thái API — kết quả smoke test toàn bộ

Toàn bộ endpoint đang tồn tại đã được gọi trên app thật.

| # | Endpoint | Kỳ vọng | Thực tế | Kết luận |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET /actuator/health`, `/liveness`, `/readiness`, `/info` | 200 | 200 | ✅ |
| 2 | `GET /v3/api-docs`, `/v3/api-docs/openapi.json` | 200 | 200, OpenAPI 3.1.0 | ✅ (nội dung thiếu — BE-012) |
| 3 | `POST /api/v1/auth/register` | 201 + token, `Cache-Control: no-store` | 201, `no-store` + `Pragma: no-cache` | ✅ (BE-003, BE-021) |
| 4 | `POST /api/v1/auth/login` | 200 | 200 | ✅ (BE-001, BE-006) |
| 5 | `POST /api/v1/auth/refresh` | 200, token cũ bị revoke | 200, rotation đúng | ✅ (BE-020) |
| 6 | `POST /api/v1/auth/logout` | 204, idempotent | 204, 204, 204 (token rác) | ✅ |
| 7 | `GET /api/v1/auth/me` | 200 + roles | 200, đọc role từ DB | ✅ |
| 8 | `POST /api/v1/auth/password/change` | 204 + revoke session | 204, token cũ → 401 | ✅ (BE-013) |
| 9 | `POST /api/v1/auth/password/reset-request` | 200 | 200 nhưng **không gửi token** | ❌ BE-003 |
| 10 | `POST /api/v1/auth/password/reset-confirm` | 204 / 400 | 400 cho token rác | ✅ (không thể thành công — BE-003) |
| 11 | `POST /api/v1/auth/verify-email` | 204 / 400 | 400 cho token rác | ❌ không thể thành công — BE-003 |
| 12 | `POST /api/v1/auth/oauth/exchange` | 401 khi code sai | 401 `AUTHENTICATION_FAILED`; 400 `VALIDATION_ERROR` khi format sai | ✅ |
| 13 | `GET /oauth2/authorization/google` | 302 + PKCE | 302, `code_challenge_method=S256`; thiếu PKCE → 400 | ✅ |
| 14 | `GET /login/oauth2/code/google` (không state) | 401 | 401 | ✅ |
| 15 | Route chưa khai báo (`/api/v1/jobs`, `/api/v1/admin/users`) | 401 ẩn danh / 403 đã xác thực | 401 / 403 | ✅ deny-all đúng |
| 16 | Method sai (`GET /auth/login`, `PUT`, `DELETE`) | 405 | 405 | ✅ |
| 17 | `Content-Type` sai (`text/plain`, form-urlencoded) | 415 | 415 | ✅ |
| 18 | Malformed JSON | 400 | 400 `INVALID_REQUEST` | ✅ |
| 19 | Token JWT giả mạo hợp lệ chữ ký nhưng sai claim | 401 | 401 cho `aud`/`iss`/`exp`/`token_use`/`roles`/`sub` sai | ✅ (trừ BE-007) |

**Negative test đã chạy:** chữ ký sai, `alg=none`, 2 header Bearer, header Bearer rỗng, chữ thường `bearer`, `sub=-1`, `sub` không tồn tại, `exp` quá khứ, `aud` sai, `iss` sai, token >8192 ký tự, SQL injection trong email, body 1MB, tài khoản bị vô hiệu hóa.

---

## 4. Những gì đã tốt — KHÔNG cần sửa

| Hạng mục | Bằng chứng |
| :--- | :--- |
| **Deny-all mặc định** | `GET /api/v1/jobs` → 401 (ẩn danh) / 403 (đã xác thực). Đúng như `docs/api/README.md` mô tả. |
| **CORS allowlist chính xác** | Origin hợp lệ → `Access-Control-Allow-Origin` + `Vary`; origin lạ → **403**. Không có wildcard. |
| **X-Request-ID chống log injection** | Client gửi `X-Request-ID: attacker-injected-value` → server **bỏ qua**, sinh UUID mới. `requestId` trong body lỗi khớp header response. |
| **Không rò rỉ secret vào Docker image** | `.dockerignore` loại `.env`, `.env.*`, `/.local/`, `target`, `docs`, `infra`, `scripts`. Dockerfile chỉ `COPY pom.xml` + `COPY src`. |
| **Refresh token là credential opaque** | 43 ký tự base64url (32 byte), chỉ lưu SHA-256 (hex) trong DB, không phải JWT. |
| **`Cache-Control: no-store`** trên mọi response chứa token + `Pragma: no-cache`. |
| **Vô hiệu hóa tài khoản có hiệu lực tức thì** | Set `is_active=0` trong DB → request kế tiếp với token cũ → **401**. Đúng như `implementation-backlog.md` tuyên bố. |
| **Đổi mật khẩu thu hồi đúng cách** | Password change → token cũ 401, mật khẩu cũ 401, mật khẩu mới 200, toàn bộ refresh session bị revoke. |
| **PKCE Google OAuth** | Bắt buộc `code_challenge` 43 ký tự + `S256` + `transaction_id`; tối đa 16 transaction song song; `Referrer-Policy: no-referrer` trên response lỗi; session state bind theo transaction. |
| **Không auto-link Google theo email** | `IdentityAuthenticationService.java:122-124` từ chối link ngầm; đúng như `authentication-and-ai.md` yêu cầu. |
| **Argon2id + migration BCrypt** | `Argon2PasswordEncoder(16,32,1,19456,2)` đúng khuyến nghị OWASP; `matches()` nhận cả BCrypt và nâng cấp khi login. |
| **Transaction boundary cho AI screening** | `CvScreeningWorkflow` `NOT_SUPPORTED`; store `REQUIRES_NEW` + `findByIdForUpdate`; lease token + expiry chống worker cũ ghi đè. Đây là phần thiết kế tốt nhất của backend. |
| **Fail-safe cho provider** | `catch (RuntimeException)` → `unexpectedProviderFailure()`, không persist message thô của provider (tránh lọt CV/credential vào `error_message`). |
| **Validation cấu hình Gemini** | Bắt buộc HTTPS, chỉ cho HTTP với loopback + `allowInsecureEndpoint`, validate range của mọi tham số, regex cho model/version. |
| **Optimistic locking** | `BaseEntity` có `@Version Long version`. |
| **DB integrity** | 11 CHECK constraints (score 0–100, salary range, date ordering, headcount > 0, file size > 0...) khớp với `docs/database/README.md`. |
| **Không trả stack trace** | Mọi response lỗi chỉ có `code`/`message`/`fieldErrors`/`requestId`. |

---

## 5. DANH SÁCH CASE CẦN FIX

---

## P0 — Blocker

### BE-001 — Header `Authorization: Bearer` cũ/hỏng chặn toàn bộ endpoint công khai

- **Mức độ:** P0 — Blocker
- **Trạng thái xác minh:** ✅ Đã tái hiện (A/B trên app thật)
- **File:** `src/main/java/com/recruitment/app/modules/identity/infrastructure/security/JwtAuthenticationFilter.java:50-58`, `:119-127`; `IdentitySecurityConfiguration.java:79-97`

**Hiện tượng**
`JwtAuthenticationFilter` chạy trước `FilterSecurityInterceptor` và **short-circuit bằng 401 cho MỌI request có header Bearer không hợp lệ**, kể cả những path đã được `permitAll()`. Filter không biết path nào là public.

**Bằng chứng**

```bash
# A) không có header Authorization
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"tester1@example.com","password":"Passw0rdSecure12"}'
# => 200

# B) CÙNG request, chỉ thêm một Bearer cũ
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:8080/api/v1/auth/login \
  -H 'Authorization: Bearer stale.expired.token' \
  -H 'Content-Type: application/json' \
  -d '{"email":"tester1@example.com","password":"Passw0rdSecure12"}'
# => 401  {"code":"INVALID_ACCESS_TOKEN","message":"Access token is invalid or expired."}
```

Kết quả tương tự (401 thay vì 200) với:
- `POST /api/v1/auth/refresh` — quan trọng nhất
- `POST /api/v1/auth/register`
- `GET /actuator/health`
- `GET /v3/api-docs`

**Nguyên nhân gốc**
`JwtAuthenticationFilter.doFilterInternal` (dòng 50-58): nếu `resolution.malformed()` hoặc token giải mã thất bại → `writeInvalidToken(response); return;`. Việc này xảy ra **trước** khi `AuthorizationFilter` của Spring Security đánh giá matcher `permitAll()`.

**Ảnh hưởng**
1. **Vỡ luồng refresh token của SPA.** Access token TTL là `PT15M`. Sau 15 phút, SPA còn token cũ trong memory, gọi `/api/v1/auth/refresh` **kèm header Authorization** → nhận 401 `INVALID_ACCESS_TOKEN` chứ không phải refresh thành công → người dùng bị đá ra ngoài mỗi 15 phút. Đây là bug sẽ xuất hiện ngay khi nối frontend vào backend.
2. **Vỡ health probe** nếu load balancer/giám sát gửi kèm header Authorization → 401 → orchestrator restart container liên tục.
3. **Vỡ tài liệu công khai** (`/v3/api-docs`) với client đã hết hạn token.

**Cách sửa (chọn 1 trong 2, khuyến nghị cách 1)**

*Cách 1 — filter chỉ xử lý khi path cần xác thực.* Bơm danh sách public path vào filter và bỏ qua (`filterChain.doFilter` rồi return) khi path nằm trong danh sách, trước cả bước `resolveBearerToken`. Nên tách danh sách này thành một bean dùng chung để `IdentitySecurityConfiguration` và filter không lệch nhau.

*Cách 2 — chỉ 401 khi path thực sự yêu cầu xác thực.* Thay vì tự ghi 401, cho filter **bỏ qua token không hợp lệ** trên public path và chỉ set authentication khi token hợp lệ; để `AuthorizationFilter` quyết định 401/403. Cách này giữ nguyên tắc "một nguồn quyết định authorization duy nhất".

Bổ sung bắt buộc: token hỏng vẫn phải bị từ chối trên path **không** public (giữ hành vi hiện tại).

**Acceptance test**
- `POST /api/v1/auth/login` + header Bearer hỏng → **200**, và header đó không ảnh hưởng kết quả.
- `POST /api/v1/auth/refresh` + access token đã hết hạn → **200** (refresh thành công).
- `GET /actuator/health` + Bearer hỏng → **200**.
- `GET /api/v1/auth/me` + Bearer hỏng → vẫn **401 INVALID_ACCESS_TOKEN**.
- `GET /api/v1/jobs` (path không public) + Bearer hỏng → vẫn **401**.

---

### BE-002 — ArchUnit gate FAIL khi dùng đúng lệnh build cách ly trong runbook

- **Mức độ:** P0 — Blocker (chặn quy trình verify)
- **Trạng thái xác minh:** ✅ Đã tái hiện (A/B trên cùng source, cùng commit)
- **File:** `src/test/java/com/recruitment/app/ModuleArchitectureTests.java:28-30`; `docs/runbooks/local-development.md:62-72`

**Hiện tượng**
`ModuleArchitectureTests` fail với **61 vi phạm** khi build bằng output directory tùy biến — đúng lệnh mà runbook khuyến nghị khi có tiến trình khác ghi vào `target/`.

**Bằng chứng (A/B, cùng source đã commit `e07e7f7`)**

```bash
export JAVA_HOME=/Users/ProM2/Library/Java/JavaVirtualMachines/amazon-corretto-25.jdk/Contents/Home

# A) build dir mặc định
./mvnw -B -ntp -Dtest=ModuleArchitectureTests test
# => Tests run: 6, Failures: 0  |  BUILD SUCCESS

# B) build dir cách ly (đúng như runbook khuyến nghị)
./mvnw -B -ntp -Dtest=ModuleArchitectureTests -Dsmartrecruit.build.directory=/tmp/sr-arch-custom test
# => Architecture Violation ... 'no classes that reside in a package '..application..' should depend on
#    classes that reside in a package '..infrastructure..'' was violated (61 times)
# => Tests run: 6, Failures: 1  |  BUILD FAILURE
```

Full `clean verify` với build dir cách ly: **`Tests run: 75, Failures: 1` → BUILD FAILURE**.

**Nguyên nhân gốc (đã xác định chính xác)**
`ModuleArchitectureTests` lọc class production bằng `ImportOption.Predefined.DO_NOT_INCLUDE_TESTS`. Trong ArchUnit 1.4.1, tiêu chí này chỉ khớp 3 regex đường dẫn cố định:

```
MAVEN_TEST_PATTERN    = .*/target/test-classes/.*
GRADLE_TEST_PATTERN   = .*/build/classes/([^/]+/)?test/.*
INTELLIJ_TEST_PATTERN = .*/out/test/.*
```

(trích từ `ImportOption$Predefined` trong `archunit-1.4.1.jar`)

Với `-Dsmartrecruit.build.directory=/tmp/sr-arch-custom`, test class nằm ở `/tmp/sr-arch-custom/test-classes/...` → **không khớp regex nào** → ArchUnit import cả test class. Vì test class `CvScreeningWorkflowTests` và `CvScreeningWorkflowTransactionBoundaryTests` được đặt **trùng package production** (`...modules.applications.application.screening`), chúng khớp `..application..` và tham chiếu entity/repository ở `..infrastructure..` → 61 vi phạm giả.

Đây là **lỗi của test, không phải lỗi của code production**. Không có class production nào vi phạm ranh giới.

**Ảnh hưởng**
- Lệnh verify cách ly được tài liệu hóa (`local-development.md`) **luôn thất bại**, kèm thông báo gây hiểu nhầm là code vi phạm kiến trúc → mất thời gian debug sai hướng, và dev sẽ bỏ qua gate này.
- Gate kiến trúc chỉ đúng khi build dir tên `target/`. Bất kỳ ai đổi `smartrecruit.build.directory` (CI matrix, build song song, sandbox) đều vô tình **tắt hiệu lực của gate** hoặc làm nó fail giả.

**Cách sửa**
Thay `ImportOption.Predefined.DO_NOT_INCLUDE_TESTS` bằng predicate tường minh dựa trên **hậu tố đường dẫn**, không phụ thuộc tên thư mục build:

```java
// Ví dụ: loại mọi location chứa "/test-classes/" hoặc "/test/" bất kể build dir
private static final ImportOption EXCLUDE_TEST_OUTPUT =
        location -> !location.contains("/test-classes/") && !location.contains("/test/");

private static final JavaClasses PRODUCTION_CLASSES = new ClassFileImporter()
        .withImportOption(EXCLUDE_TEST_OUTPUT)
        .importPackages("com.recruitment.app");
```

Hoặc chắc chắn hơn: import trực tiếp từ thư mục production classes do Maven cung cấp qua system property, thay vì dò classpath.

**Bổ sung chống hồi quy:** thêm một test khẳng định rằng `PRODUCTION_CLASSES` **không chứa** class nào có tên kết thúc bằng `Tests`. Nếu test đó fail, nghĩa là bộ lọc đang hỏng.

**Acceptance test**
- Cả hai lệnh sau đều **BUILD SUCCESS**:
  - `./mvnw -B -ntp clean verify`
  - `./mvnw -B -ntp -Dsmartrecruit.build.directory=/tmp/sr-verify clean verify`
- Test mới khẳng định không có class `*Tests` nào lọt vào `PRODUCTION_CLASSES`.

---

### BE-003 — Password reset và email verification là code chết: token được tạo rồi bị vứt bỏ, không có kênh gửi

- **Mức độ:** P0 — Blocker (tính năng không dùng được)
- **Trạng thái xác minh:** ✅ Đã tái hiện (kiểm tra DB + grep toàn repo)
- **File:** `src/main/java/com/recruitment/app/modules/identity/api/AccountSecurityController.java:48-56`; `application/PasswordManagementService.java:83-97`; `application/EmailVerificationService.java:33-64`

**Hiện tượng**
`PasswordManagementService.requestPasswordReset()` sinh token thô rồi `return Optional.of(rawToken)` — nhưng controller **bỏ qua giá trị trả về**:

```java
// AccountSecurityController.java:52
passwordManagement.requestPasswordReset(request.email());   // <- Optional<String> bị vứt
return ResponseEntity.ok(Map.of(
        "message", "If an active account exists with this email, a reset token has been dispatched."
));
```

Không có bất kỳ adapter email/notification nào trong codebase (`JavaMailSender`, SES, `notification_events`... đều không tồn tại). Tương tự, `EmailVerificationService.createVerificationToken()` **không có caller nào trong `src/main`** — chỉ có test gọi.

**Bằng chứng**

```sql
-- Sau khi đã gọi /password/reset-request nhiều lần và đăng ký 11 user:
SELECT COUNT(*) FROM password_reset_tokens;       -- => 8   (token được tạo và lưu)
SELECT COUNT(*) FROM email_verification_tokens;   -- => 0   (chưa từng được tạo)
SELECT COUNT(*) FROM users WHERE email_verified = 1; -- => 0
```

```bash
grep -rn "createVerificationToken" src/
# src/test/.../PasswordAndReplayProtectionIntegrationTests.java:145   <- chỉ test
# src/main/.../EmailVerificationService.java:55                       <- chỉ định nghĩa
```

**Nguyên nhân gốc**
Token được thiết kế đúng (sinh bằng `SecureRandom`, chỉ lưu SHA-256, có TTL 15 phút / 24 giờ, single-use) nhưng **kênh phân phối chưa được xây**. Controller trả về thông điệp mô tả một hành vi không xảy ra.

**Ảnh hưởng**
1. Người dùng quên mật khẩu **vĩnh viễn không thể khôi phục tài khoản** — không có cách nào lấy token qua API.
2. Email verification **không bao giờ thành công** với bất kỳ ai: mọi user đều có `email_verified = 0`, và `email_verified` không được kiểm tra ở login (xem BE-021).
3. API trả lời sai sự thật ("a reset token has been dispatched") → client và QA bị lừa; bug ẩn rất lâu.
4. Toàn bộ `PasswordManagementService.confirmPasswordReset` và `EmailVerificationService.verifyEmail` là code không thể tiếp cận từ luồng thật.

**Cách sửa**
Chọn hướng theo phạm vi MVP, và ghi lại quyết định vào `docs/adr/`:

- **Nếu email nằm trong MVP:** tạo adapter `EmailNotificationGateway` (port ở `application`, impl ở `infrastructure/integration/email`), truyền token thô vào đó, và ghi `notification_events`. Controller **không** được nhận/trả token thô. Cập nhật `docs/api/README.md`.
- **Nếu email ngoài MVP:** xóa `EmailVerificationService`, `EmailVerificationStore`, `email_verification_tokens` (bằng migration mới) và endpoint `/verify-email`, **hoặc** giữ lại nhưng sửa response thành trung thực và ghi rõ giới hạn trong tài liệu.

Bất kể chọn hướng nào:
- Sửa response của `/password/reset-request` để **không** khẳng định đã gửi khi chưa gửi.
- Thêm test end-to-end: reset-request → nhận token → reset-confirm → login bằng mật khẩu mới → token cũ không dùng lại được.

**Acceptance test**
- Có đường đi lấy được token reset (qua email adapter hoặc qua cơ chế được ADR phê duyệt) và `confirmPasswordReset` thành công.
- `confirmPasswordReset` với token đã dùng lần 2 → 400, và toàn bộ refresh session của user bị revoke.
- `verify-email` với token hợp lệ → 204 và `email_verified = 1` trong DB.
- Response của `/password/reset-request` phản ánh đúng hành vi thực tế.

---

### BE-004 — Admin bootstrap dùng sai config prefix; tài liệu mô tả một knob không tồn tại

- **Mức độ:** P0 — Blocker (không thể tạo admin theo tài liệu)
- **Trạng thái xác minh:** ✅ Đã tái hiện (DB có 0 admin + grep prefix)
- **File:** `src/main/java/com/recruitment/app/modules/identity/infrastructure/bootstrap/BootstrapAdminProperties.java:5`; `docs/architecture/implementation-backlog.md:57`; `src/main/resources/application.yml`

**Hiện tượng**
Code bind prefix `recruitment.identity.bootstrap-admin`, tài liệu lại ghi `app.identity.bootstrap-admin`.

```java
// BootstrapAdminProperties.java:5
@ConfigurationProperties(prefix = "recruitment.identity.bootstrap-admin")
```

```text
// docs/architecture/implementation-backlog.md:57
- Initial admin bootstrap runner configurable via `app.identity.bootstrap-admin`.
```

Trong `application.yml` chỉ có nhánh `app:` (với `app.web`, `app.security`, `app.ai`) — **không có** nhánh `app.identity` và cũng **không có** nhánh `recruitment:`. `.env.example` cũng không có biến bootstrap nào.

**Bằng chứng**

```sql
SELECT u.email, r.code FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  WHERE r.code LIKE '%ADMIN%';
-- => (rỗng)  : không có ROLE_PLATFORM_ADMIN nào tồn tại
```

Và test hiện có **không thể** bắt được lỗi này vì nó khởi tạo properties trực tiếp, không bind từ config:

```java
// AdminBootstrapTests.java:28-33
BootstrapAdminProperties properties = new BootstrapAdminProperties(
        true, "admin@smartrecruit.org", "super-secret-password-123", "Admin Boss");
```

**Nguyên nhân gốc**
Prefix trong `@ConfigurationProperties` bị đặt sai (hoặc tài liệu sai), và **không có test nào bind properties từ nguồn cấu hình**, nên sai lệch không bị phát hiện.

**Ảnh hưởng**
1. Deployment theo tài liệu (set `APP_IDENTITY_BOOTSTRAP_ADMIN_ENABLED=true`, `..._EMAIL`, `..._PASSWORD`) → **im lặng không làm gì**. Không có warning, không có log, hệ thống lên với 0 admin.
2. Kết hợp với `anyRequest().denyAll()` → không ai có `ROLE_PLATFORM_ADMIN` → mọi endpoint admin (khi G3+ xây) sẽ không thể truy cập.
3. `@ConfigurationProperties` không được `@Validated` → password ngắn/thiếu bị bỏ qua chỉ bằng một `log.warn`.

**Cách sửa**
1. Chọn một prefix duy nhất và dùng nhất quán. Khuyến nghị theo tài liệu: `app.identity.bootstrap-admin` (thêm nhánh `identity:` dưới `app:` trong `application.yml`).
2. Thêm biến vào `.env.example` để knob này **khám phá được**:
   ```text
   APP_IDENTITY_BOOTSTRAP_ADMIN_ENABLED=false
   APP_IDENTITY_BOOTSTRAP_ADMIN_EMAIL=
   APP_IDENTITY_BOOTSTRAP_ADMIN_PASSWORD=
   APP_IDENTITY_BOOTSTRAP_ADMIN_FULL_NAME=
   ```
3. Thêm `@Validated` và ràng buộc: nếu `enabled=true` thì `password` phải ≥ 12 ký tự và `email` hợp lệ — **fail-fast khi khởi động** thay vì `log.warn` rồi bỏ qua.
4. Thêm test bind thật, ví dụ dùng `ApplicationContextRunner` với `TestPropertyValues` để khẳng định prefix hoạt động.

**Acceptance test**
- Test bind properties từ `app.identity.bootstrap-admin.*` → `BootstrapAdminProperties.enabled() == true`.
- Chạy app với `APP_IDENTITY_BOOTSTRAP_ADMIN_ENABLED=true` + password hợp lệ → log `Platform administrator bootstrapped successfully` và DB có **đúng 1** user `ROLE_PLATFORM_ADMIN`.
- Chạy lại app → không tạo admin thứ hai.
- `enabled=true` + password 8 ký tự → **app fail-fast khi khởi động**, không im lặng bỏ qua.

---

### BE-005 — Bộ nhớ throttle tăng vô hạn: DoS làm cạn heap, khoá bởi key do kẻ tấn công kiểm soát

- **Mức độ:** P0 — Blocker (DoS)
- **Trạng thái xác minh:** ✅ Đã tái hiện (đo trực tiếp bằng `jcmd GC.class_histogram`)
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/AuthenticationThrottlingService.java:26`, `:43-66`

**Hiện tượng**
`attempts` là `ConcurrentHashMap` **không bao giờ được dọn**. Entry chỉ bị thay thế khi **cùng một key** được thử lại sau khi hết cửa sổ — nếu không, entry ở lại vĩnh viễn. Key là email do client gửi.

**Bằng chứng (đo trên app thật)**

```bash
# Trước khi flood
jcmd 6235 GC.class_histogram | grep AttemptRecord
# =>   2:   2   48  ...AuthenticationThrottlingService$AttemptRecord

# Bắn 20.000 login attempt với 20.000 email KHÁC NHAU (không cần xác thực)
seq 1 20000 | xargs -P 40 -I{} curl -s -o /dev/null -X POST http://127.0.0.1:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"flood{}@nowhere.test","password":"WrongPassword123"}'

# Sau khi flood
jcmd 6235 GC.class_histogram | grep AttemptRecord
# =>  20:   20002   480048  ...AuthenticationThrottlingService$AttemptRecord
```

**Tăng 1:1**: 20.000 request → **20.002 object được giữ lại vĩnh viễn**, cộng thêm ~20.000 `ConcurrentHashMap$Node` (~640 KB). Các entry vẫn còn nguyên sau khi cửa sổ 15 phút trôi qua (đã kiểm tra lại sau `sleep`).

**Nguyên nhân gốc**
`recordFailure` (dòng 54-66) chỉ `compute` trên key hiện tại; `checkThrottled` (dòng 43-52) chỉ đọc; **không có** cơ chế eviction/expiry sweep nào. `resetAll()` chỉ được test gọi.

**Ảnh hưởng**
- **DoS cạn heap từ endpoint không cần xác thực.** Kẻ tấn công chỉ cần gửi `POST /api/v1/auth/login` với email ngẫu nhiên; mỗi request thêm một object vĩnh viễn. Heap sẽ chết (OOM) → toàn bộ API sập. Đây là vector tấn công rẻ nhất trong toàn bộ danh sách case.
- Xấu hơn: throttle **không có hiệu lực đa instance**. ADR 0003 mô tả deployment "one EC2 host for Nginx/API/worker" và có thể scale nhiều process; map là per-JVM nên brute-force qua nhiều instance sẽ không bị chặn.
- `attempts.remove` chỉ xoá đúng key đăng nhập thành công — không giúp dọn rác.

**Cách sửa (khuyến nghị làm cả 3)**
1. **Bounded map có eviction:** thay `ConcurrentHashMap` bằng cache có giới hạn kích thước và TTL (ví dụ Caffeine `maximumSize` + `expireAfterWrite(windowDuration * 2)`), hoặc tự viết sweep định kỳ (`@Scheduled` hoặc `evict` lazy) dọn entry đã hết hạn.
2. **Giới hạn theo kích thước cứng:** nếu map đạt ngưỡng (ví dụ 100.000 key), từ chối/throttle toàn cục thay vì tiếp tục phình.
3. **Chuyển sang lưu trữ chia sẻ** khi có nhiều instance (bảng `auth_throttle_state` trong MySQL hoặc Redis). Ghi lại quyết định này vào ADR vì nó ảnh hưởng mô hình deployment.

**Acceptance test**
- Test: gọi `recordFailure` với 100.000 key khác nhau → số entry trong cache **không vượt** ngưỡng cấu hình; bộ nhớ ổn định sau khi TTL trôi qua.
- Test: sau `windowDuration`, entry hết hạn được loại bỏ tự động (không cần cùng key quay lại).
- Đo lại `jcmd GC.class_histogram` sau flood 20.000 request → số `AttemptRecord` bị chặn trần.

---

### BE-006 — Throttle chỉ theo email → khóa tài khoản người khác từ xa; không throttle đăng ký và reset-request

- **Mức độ:** P0 — Blocker (DoS có chủ đích + brute-force)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/IdentityAuthenticationService.java:65-85`; `AuthenticationThrottlingService.java:43-52`

**Hiện tượng**
Key throttle là **email của nạn nhân** (`throttling.checkThrottled(email)`, `:70`). Chỉ cần biết email, kẻ tấn công gửi 5 mật khẩu sai → nạn nhân **bị khóa đăng nhập 15 phút**, kể cả khi nhập đúng mật khẩu.

**Bằng chứng**

```bash
# 5 lần sai liên tiếp trên email nạn nhân
for i in 1 2 3 4 5; do curl -s -o /dev/null -w '%{http_code} ' -X POST .../auth/login \
  -H 'Content-Type: application/json' -d '{"email":"rot1@example.com","password":"WrongPassword123"}'; done
# => 401 401 401 401 401

# lần thứ 6, thậm chí với MẬT KHẨU ĐÚNG
curl -s -X POST .../auth/login -H 'Content-Type: application/json' \
  -d '{"email":"rot1@example.com","password":"Passw0rdSecure12"}'
# => 429 {"code":"TOO_MANY_REQUESTS","message":"Too many failed attempts. Please try again later."}
```

Throttle **không** áp dụng cho các endpoint khác:

```bash
# reset-request × 7  -> 200 200 200 200 200 200 200   (không có 429)
# register      × 7  -> 201 201 201 201 201 201 201   (không có 429)
```

**Nguyên nhân gốc**
1. Không gian key là "email nạn nhân" — tức là **đầu vào do kẻ tấn công chọn**. Đây là mô hình chống brute-force ngược: thay vì chặn kẻ tấn công, nó cho kẻ tấn công chặn nạn nhân.
2. Không có throttle theo **IP** hoặc theo **cặp (IP, email)**.
3. `register` và `password/reset-request` không gọi `checkThrottled`/`recordFailure`.
4. `checkThrottled` chạy **trước** khi kiểm tra mật khẩu, nên khi đã bị khóa thì không có cách nào phân biệt.

**Ảnh hưởng**
- **Account-lockout DoS:** bất kỳ ai biết email (rất dễ — email là public với ứng viên/recruiter) đều khóa được tài khoản đó, lặp lại vô hạn. Không tốn chi phí, không để lại dấu vết ở tầng account (chỉ 429).
- **Password spraying không bị chặn:** 1 mật khẩu thử trên 1000 account khác nhau → mỗi account chỉ 1 lần sai → chưa bao giờ chạm ngưỡng 5.
- **Mail bombing (tương lai):** khi BE-003 sửa xong và có email adapter, `reset-request` không throttle → kẻ tấn công spam hàng loạt, đồng thời đốt quota email.
- **Spam tạo tài khoản:** `register` không throttle.

**Cách sửa**
1. **Throttle theo nhiều chiều:** đặt ngưỡng trên (a) cặp `(IP, email)`, và (b) `IP` toàn cục, bên cạnh (c) `email`. Ngưỡng IP/global phải rộng hơn ngưỡng email.
2. **Không trả 429 cho nạn nhân khi kẻ tấn công gây ra.** Với `(IP,email)`: nếu IP lạ sai nhiều lần, chỉ chặn IP đó, **không** khóa tài khoản. Chỉ khóa mềm theo email sau ngưỡng cao hơn nhiều, và nên ưu tiên CAPTCHA/proof-of-work thay vì chặn cứng.
3. **Áp throttle cho `register`, `password/reset-request`, `verify-email`, `oauth/exchange`** — nhất là `reset-request` (chống enumeration qua timing + chống spam email).
4. Cân nhắc `Retry-After` header trên 429 (hiện chưa có) để client biết khi nào thử lại.

**Acceptance test**
- 5 lần sai từ IP-A trên email victim → **IP-A** bị 429; đăng nhập đúng mật khẩu **từ IP-B** vẫn **200**.
- 1000 email khác nhau, mỗi email 1 lần sai, cùng 1 IP → IP đó bị chặn.
- 7 lần `password/reset-request` liên tiếp cùng email → có 429 (hoặc cơ chế chống spam tương đương).
- Response 429 có header `Retry-After`.

---

## P1 — High

### BE-007 — Claim `credential_version` fail-open: thiếu hoặc sai kiểu đều được coi là version 1

- **Mức độ:** P1 — High (thu hồi credential không đảm bảo)
- **Trạng thái xác minh:** ✅ Đã tái hiện (ký JWT bằng chính private key của app)
- **File:** `src/main/java/com/recruitment/app/modules/identity/infrastructure/security/JwtAccessTokenService.java:79-81`; `ApplicationAccessTokenValidator.java:36-50`

**Hiện tượng**
`ApplicationAccessTokenValidator` kiểm tra `typ`, `aud`, `token_use`, `sub`, `jti`, `roles` — nhưng **không** kiểm tra `credential_version`. `JwtAccessTokenService` lại mặc định về `1` khi claim thiếu hoặc không phải số:

```java
// JwtAccessTokenService.java:80
int credentialVersion = cvClaim instanceof Number number ? number.intValue() : 1;
```

**Bằng chứng** (token ký bằng `.local/secrets/jwt/private.pem` — chính key của app, user id 1 có `credential_version = 1`)

| # | Payload | Kỳ vọng | Thực tế |
| :--- | :--- | :--- | :--- |
| A | **không có** `credential_version` | 401 | **200** ❌ fail-open |
| B | `credential_version: 1` (giá trị thật) | 200 | 200 ✅ |
| C | `credential_version: 999` | 401 | 401 ✅ |
| E | `credential_version: "1"` (**string**) | 401 | **200** ❌ fail-open |
| — | `token_use: refresh`, `roles: []`, `aud` sai, `iss` sai, `exp` quá khứ | 401 | 401 ✅ |

**Nguyên nhân gốc**
Cơ chế thu hồi dựa vào claim **không bắt buộc**. Validator chỉ allowlist `roles` mà không ràng buộc `credential_version` phải là số nguyên dương. Mọi token không có claim này (ví dụ phát bởi phiên bản cũ hơn, hoặc do lỗi phát hành trong tương lai) đều được chấp nhận với version 1 — nghĩa là **miễn nhiễm với thu hồi** cho mọi user có `credential_version = 1` (tức mọi user chưa từng đổi mật khẩu).

**Ảnh hưởng**
- Kiểm soát "thu hồi ngay access token đang hoạt động khi deactivate hoặc đổi mật khẩu" (`implementation-backlog.md:47-48`) **không được đảm bảo bằng thiết kế**, chỉ đúng nhờ may mắn là code phát hành luôn set claim. Một thay đổi nhỏ ở `JwtAccessTokenService.issue()` sẽ âm thầm vô hiệu hóa toàn bộ cơ chế thu hồi mà không test nào phát hiện.
- `credential_version` dạng string bị nuốt → che giấu lỗi tích hợp (ví dụ token do hệ thống khác phát).

**Cách sửa**
1. `ApplicationAccessTokenValidator.validate()`: yêu cầu claim **tồn tại, là số, và > 0** — từ chối nếu thiếu hoặc sai kiểu. Không mặc định.
2. `JwtAccessTokenService.authenticate()`: bỏ fallback `: 1`, ném `InvalidAccessTokenException` khi claim thiếu/sai kiểu.
3. Thêm test: token thiếu claim → 401; claim dạng string → 401; claim 0/âm → 401.

**Acceptance test**
- Token thiếu `credential_version` → **401**.
- Token `credential_version = "1"` → **401**.
- Token `credential_version = 0` / âm → **401**.
- Token `credential_version` khớp DB → **200**.

---

### BE-008 — Đổi role trong DB không thu hồi token: `incrementCredentialVersion()` là dead code, authorization tin claim trong JWT

- **Mức độ:** P1 — High (leo thang đặc quyền tồn dư)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/infrastructure/persistence/entity/User.java:92-99`; `JwtAuthenticationFilter.java:60-66`; `ApplicationAccessTokenValidator.java:63-68`

**Hiện tượng**
`LiveAccountValidator` chỉ kiểm tra `active` + `credentialVersion`. `credential_version` chỉ tăng trong `changePassword()`. `User.incrementCredentialVersion()` **không có caller nào** trong `src/main`. Vì vậy khi role của user thay đổi trong DB, JWT cũ vẫn mang role cũ và vẫn được `@PreAuthorize` tin.

**Bằng chứng**

```bash
# Token phát cho user id 4 với roles=["ROLE_PLATFORM_ADMIN"], credential_version=1
# Bước 1 — đổi role trong DB từ ROLE_CANDIDATE sang ROLE_RECRUITER
# Bước 2 — dùng LẠI token cũ
curl -H "Authorization: Bearer <token-cu>" .../api/v1/auth/me
# => 200  {"id":4,...,"roles":["ROLE_RECRUITER"]}
#     ^ 200 nghĩa là authority ROLE_PLATFORM_ADMIN trong token VẪN được @PreAuthorize chấp nhận,
#       dù DB đã đổi role. Quyền cũ tồn tại đến khi access token hết hạn (tối đa 30 phút, mặc định 15).
```

```bash
grep -rn "incrementCredentialVersion" src/main
# chỉ có định nghĩa tại User.java:97 — KHÔNG có caller
grep -rn "removeRole" src/main
# chỉ có định nghĩa tại User.java:80 — KHÔNG có caller
```

Đối chứng tốt: **deactivate** hoạt động đúng.

```bash
UPDATE users SET is_active=0 WHERE id=4;   # -> /me => 401  ✅
UPDATE users IS_ACTIVE=1 ...;              # -> /me => 200  ✅
```

**Nguyên nhân gốc**
Nguồn sự thật cho authorization là **claim `roles` trong JWT**, không phải DB. Cơ chế thu hồi (`credential_version`) không được gọi khi role thay đổi — vì tính năng đổi role (G3+) chưa tồn tại, nên đây là **lỗ hổng tiềm ẩn sẽ thành lỗi thật ngay khi Admin Console mutation được xây**.

**Ảnh hưởng**
Khi G3/G4 thêm chức năng Admin đổi role/status:
- Hạ quyền một admin (hoặc thu hồi `ROLE_RECRUITER`) **không có hiệu lực** cho tới khi token hết hạn → cửa sổ leo thang đặc quyền tồn dư 15–30 phút.
- Gỡ `ROLE_PLATFORM_ADMIN` khỏi một tài khoản bị xâm phạm **không** ngăn được kẻ tấn công tiếp tục dùng quyền admin.
- `removeRole` chết nghĩa là chưa có đường đi hợp lệ nào để hạ quyền.

**Cách sửa**
1. Gọi `incrementCredentialVersion()` trong **mọi** use case biến đổi đặc quyền hoặc trạng thái bảo mật: thay đổi role, deactivate, revoke session hàng loạt, admin reset mật khẩu, đổi email.
2. **Phòng thủ theo chiều sâu:** cân nhắc cho các endpoint admin (`/api/v1/admin/**`) đọc role **từ DB** trong cùng request thay vì tin claim — hoặc giữ `credential_version` là cơ chế thu hồi duy nhất nhưng bắt buộc test.
3. Thêm test hồi quy: phát token → đổi role trong DB → bump credential_version → token cũ phải 401.
4. Ghi lại quyết định (claim vs DB là nguồn sự thật) vào `docs/adr/`, vì đây là ranh giới kiến trúc bảo mật.

**Acceptance test**
- Phát token có `ROLE_PLATFORM_ADMIN` → gỡ role trong DB + tăng `credential_version` → token cũ dùng lại phải **401**.
- Test khẳng định mọi use case đổi role/status đều tăng `credential_version` (ví dụ test parameterized trên từng use case).

---

### BE-009 — Regex khử PII xóa mất mốc thời gian kinh nghiệm học vấn trước khi gửi Gemini

- **Mức độ:** P1 — High (sai lệch chất lượng điểm AI)
- **Trạng thái xác minh:** ✅ Đã tái hiện (chạy regex trên CV mẫu thực tế)
- **File:** `src/main/java/com/recruitment/app/modules/applications/infrastructure/integration/gemini/GeminiCvScreeningClient.java:35`, `:310-316`

**Hiện tượng**
`PHONE` pattern quá rộng — nó khớp cả **khoảng thời gian dạng số**:

```java
// GeminiCvScreeningClient.java:35
private static final Pattern PHONE =
    Pattern.compile("(?<![A-Za-z0-9])(?:\\+?\\d[\\d().\\s-]{6,}\\d)(?![A-Za-z0-9])");
```

`\d[\d().\s-]{6,}\d` chỉ cần ≥ 8 ký tự số/khoảng trắng/chấm/gạch. `2019 - 2023` khớp hoàn hảo.

**Bằng chứng** (chạy đúng 4 regex của `minimizeSensitiveData` trên CV mẫu)

```
----- TRƯỚC -----
Email: a.nguyen@example.com | Phone: +84 912 345 678 | LinkedIn: https://linkedin.com/in/anguyen
Address: 12 Le Loi, District 1, Ho Chi Minh City

EXPERIENCE
Senior Backend Engineer, VinGroup (03/2019 - 07/2023)
- Built microservices in Java 17 and Spring Boot
- Managed a team of 5 engineers, budget 2,000,000,000 VND

EDUCATION
BSc Computer Science, HCMUT (2013 - 2017), GPA 3.6/4.0

----- SAU minimizeSensitiveData() -----
Senior Backend Engineer, VinGroup (03/[redacted-phone]/2023)     <-- mất "2019 - 07"
BSc Computer Science, HCMUT ([redacted-phone]), GPA 3.6/4.0      <-- mất TOÀN BỘ "2013 - 2017"
```

Ghi chú: email/URL/dòng `Address:` được khử **đúng**. Vấn đề nằm ở nhánh PHONE.

**Nguyên nhân gốc**
Regex nhận dạng số điện thoại dựa trên độ dài chuỗi ký tự số mà không neo vào ngữ cảnh (nhãn "phone", dấu `+`, hoặc pattern phân tách quốc tế), nên bao phủ cả năm/tháng và khoảng thời gian.

**Ảnh hưởng**
- **Mất bằng chứng về thâm niên** trước khi model chấm điểm. Trọng số "Experience & Seniority Tenure" chiếm 25% trong rubric hiển thị ở `SettingsConfiguration` của frontend. Model sẽ báo "Employment duration was not stated" hoặc tự suy diễn — chính xác là điều mà system instruction yêu cầu **không** được làm.
- Hệ quả là **điểm thấp giả tạo một cách hệ thống** cho ứng viên có định dạng ngày kiểu `MM/YYYY - MM/YYYY` — phổ biến ở CV Việt Nam.
- Test hiện tại không bắt được: `GeminiCvScreeningClientTests` chỉ dùng `DOB: 1990-01-01` (một mốc đơn, bị khử bởi rule nhãn chứ không phải rule PHONE).

**Cách sửa**
1. Thu hẹp `PHONE`: yêu cầu ngữ cảnh rõ ràng — có nhãn (`phone|tel|mobile|điện thoại|số điện thoại`), hoặc bắt đầu bằng `+` với mã quốc gia, hoặc 9–15 chữ số **liền mạch** (cho phép tối đa 1–2 dấu phân tách, không cho phép khoảng trắng quanh `-`).
2. Thêm **negative lookahead** loại trừ khoảng năm/tháng: không khử nếu chuỗi nằm trong ngoặc đơn đóng vai trò khoảng thời gian, hoặc nếu chỉ toàn số 4 chữ số ngăn bởi `-`/`/`.
3. Mở rộng `PHONE` **sau** khi bảo vệ mốc thời gian: khử ngày tháng không phải mục tiêu của chính sách PII (mốc thời gian công việc không phải direct identifier).
4. Thêm test với CV mẫu có `(03/2019 - 07/2023)` và `(2013 - 2017)` → khẳng định prompt **vẫn chứa** các mốc này sau khi khử.

**Acceptance test**
- Test khẳng định `(03/2019 - 07/2023)` và `(2013 - 2017)` còn nguyên trong prompt.
- Test khẳng định `+84 912 345 678`, `0912345678`, `(028) 3822 1234` vẫn bị khử.
- Test khẳng định email, URL, dòng `Address:`/`DOB:` vẫn bị khử như cũ.

---

### BE-010 — Request tới Gemini dùng sai đường dẫn field cho structured output; test đang khóa cứng shape sai

- **Mức độ:** P1 — High (rủi ro; cần xác minh với API thật)
- **Trạng thái xác minh:** ⚠️ Cần xác minh — đối chiếu tài liệu chính thức, chưa gọi provider thật
- **File:** `src/main/java/com/recruitment/app/modules/applications/infrastructure/integration/gemini/GeminiCvScreeningClient.java:125-134`; `src/test/java/.../GeminiCvScreeningClientTests.java:91-97`

**Hiện tượng**
Payload gửi JSON schema nằm trong `generationConfig.responseFormat.text.{mimeType,schema}`:

```java
// GeminiCvScreeningClient.java:125-134
payload.put("generationConfig", Map.of(
        "temperature", 0,
        "maxOutputTokens", properties.getMaxOutputTokens(),
        "responseFormat", Map.of(
                "text", Map.of(
                        "mimeType", "application/json",
                        "schema", responseSchema()
                )
        )
));
```

Endpoint được gọi là `POST /{apiVersion}/models/{model}:generateContent` (dòng 75) — tức Gemini **generateContent**.

**Đối chiếu tài liệu chính thức**
- `generateContent` (Gemini Developer API) dùng `generationConfig.responseMimeType` + `generationConfig.responseSchema`.
- API mới (Interactions) dùng `response_format` ở **top level** của request, dạng `{"type":"text","mime_type":"application/json","schema":{...}}` — xem [Gemini API — Structured output](https://ai.google.dev/gemini-api/docs/structured-output).
- Tài liệu Google lưu ý: nếu dùng một field không được hỗ trợ, model **vẫn xử lý request nhưng bỏ qua field đó**.

Shape trong code là biến thể lai: đặt tên kiểu Interactions (`responseFormat.text`) nhưng vị trí lại nằm trong `generationConfig` (kiểu generateContent), và dùng `camelCase` thay vì `snake_case`.

**Nguyên nhân gốc**
Không có test nào kiểm tra payload so với **hợp đồng của provider thật**. `GeminiCvScreeningClientTests` chạy một `HttpServer` stub trả 200 vô điều kiện và **khẳng định lại chính shape sai đó**:

```java
// GeminiCvScreeningClientTests.java:91-97
assertEquals("application/json",
        payload.path("generationConfig").path("responseFormat").path("text").path("mimeType").asText());
assertTrue(payload.path("generationConfig").path("responseFormat").path("text").path("schema")
        .path("required").isArray());
```

Stub `handleRequest` cũng không kiểm tra path nên không phát hiện gì thêm.

**Ảnh hưởng**
- Nếu field bị provider bỏ qua: **ràng buộc JSON schema không có hiệu lực ở phía provider**. Model trả text tự do, adapter phải chống đỡ bằng `parseProviderResponse`. Hệ quả: tỷ lệ `INVALID_PROVIDER_RESPONSE` cao hơn, tốn token, và trải nghiệm "structured output" chỉ còn là validate phía sau — trái với mô tả ở `SMARTRECRUIT_PROJECT_SETUP.md` ("JSON Schema structured output") và `implementation-backlog.md` G6.
- Nếu provider từ chối field lạ bằng 400: **toàn bộ luồng screening fail** khi bật Gemini.
- An toàn: adapter **có** validate output và `score` bị chặn 0–100 cả ở schema lẫn domain (`ApplicationScreening.complete`), nên đây **không** phải lỗi làm sai lệch quyết định tuyển dụng — chỉ là lỗi độ bền vững/chất lượng.

**Cách sửa**
1. Chốt phiên bản API mục tiêu (generateContent vs Interactions) và sửa payload theo đúng đặc tả của phiên bản đó.
   - Nếu generateContent: `generationConfig.responseMimeType = "application/json"` và `generationConfig.responseSchema = responseSchema()`.
2. Viết **contract test** xác thực payload so với đặc tả (JSON Schema của request) thay vì chỉ assert lại payload mình tự tạo.
3. Thêm smoke test opt-in (gate sau env var) gọi provider thật với prompt tối thiểu trong CI nightly — theo đúng tinh thần "Cloud apply and real-provider smoke tests are opt-in deployment actions" ở `implementation-backlog.md:28`.
4. Sửa test hiện tại: nếu shape đổi, assert theo shape mới **và** thêm ràng buộc rằng stub kiểm tra path + chỉ trả 200 khi payload hợp lệ.

**Acceptance test**
- Contract test xác nhận payload khớp đặc tả của API mục tiêu.
- Smoke test opt-in: gọi provider thật → trả `score` + `recommendation` parse được, không có `INVALID_PROVIDER_RESPONSE`.
- Test khẳng định stub **từ chối** (400) khi payload thiếu/sai field schema, để bắt được hồi quy.

---

### BE-011 — Không có chỗ nào thực thi quy tắc "tối đa 3 provider attempt"; cột `attempt` và cờ `retryable` là dead data

- **Mức độ:** P1 — High (quyết định baseline không được hiện thực)
- **Trạng thái xác minh:** ✅ Đã tái hiện (grep toàn bộ `src/main`)
- **File:** `src/main/java/com/recruitment/app/modules/applications/infrastructure/persistence/entity/ApplicationScreening.java:80`; `application/screening/CvScreeningWorkflow.java:60-77`; `docs/adr/0003-backend-mvp-baseline.md:27-28`

**Hiện tượng**
ADR 0003 quy định: *"Screening allows three provider attempts; retries exist only at the worker boundary."*
Trong code:
- `CvScreeningWorkflow.execute()` gọi `gateway.screen(request)` **đúng một lần**, không có vòng lặp, không đếm attempt, không nhận tham số attempt.
- Cột `attempt` (`ApplicationScreening.java:80`) **không có reader/writer nào** trong `src/main`.
- Cờ `retryable` được ghi vào entity nhưng **không được đọc** để quyết định retry ở đâu cả.
- `new ApplicationScreening(...)` **chỉ xuất hiện trong test**, không có production code nào tạo bản ghi screening.

**Bằng chứng**

```bash
grep -rn "getAttempt\|attempt(" src/main | grep -v "maxAttempts\|AttemptRecord\|attempts"
# => (rỗng)

grep -rn "new ApplicationScreening(" src/
# => src/test/.../CvScreeningWorkflowTransactionBoundaryTests.java:59
# => src/test/.../CvScreeningWorkflowTests.java:198
# => src/test/.../DomainLifecycleTests.java:85
#    ^ chỉ test
```

**Nguyên nhân gốc**
G6 (AI) đang ở trạng thái **Pending** trong `implementation-backlog.md:14`. Phần đã xây là *primitive* (claim/complete/fail với lease) chứ chưa phải dispatcher. Tuy nhiên cột `attempt` + unique constraint `(job_application_id, attempt)` + cờ `retryable` đã có nghĩa là **schema hứa một hành vi chưa tồn tại**.

**Ảnh hưởng**
- Một lỗi provider tạm thời (429/5xx — được adapter đánh dấu `retryable = true`) khiến screening **thất bại vĩnh viễn** (`status = FAILED`) mà không có lần thử thứ 2, 3. Bản ghi cũng không thể claim lại vì `claim()` chỉ nhận `PENDING` hoặc lease hết hạn trên `PROCESSING` — `FAILED` là trạng thái cuối.
- Với mô hình deployment của ADR (API và worker là 2 process, cần scheduler/outbox), **không có gì** chuyển `FAILED`/`retryable` trở lại hàng đợi. Tài liệu `authentication-and-ai.md:98` thừa nhận "repository không tự chạy scheduler", nhưng ADR vẫn khẳng định 3 attempt là baseline.
- Rủi ro vận hành: ứng viên bị "mất" khỏi luồng screening mà không có cảnh báo, vì `retryable` không ai đọc.

**Cách sửa** (thuộc phạm vi G6 — cần ADR/backlog cập nhật trước khi code)
1. Thêm use case `enqueueRetry(screeningId)` tạo bản ghi `ApplicationScreening` mới với `attempt = previous + 1`, chặn khi `attempt >= 3`.
2. Thêm dispatcher (scheduler/outbox) chọn bản ghi `FAILED AND retryable = true AND attempt < 3` để claim lại — **ngoài** transaction chấm điểm.
3. Thêm test: provider fail retryable 3 lần → `attempt` = 1,2,3 và lần thứ 4 không được enqueue; provider fail non-retryable → không retry.
4. Nếu team quyết định **không** làm 3 attempt trong MVP: sửa ADR 0003 và `SMARTRECRUIT_PROJECT_SETUP.md` để không mô tả hành vi không tồn tại, và ghi rõ `attempt` là reserved column.

**Acceptance test**
- Test khẳng định tồn tại đường đi từ `FAILED + retryable` → `attempt` tăng và screening được chạy lại.
- Test khẳng định không vượt quá 3 attempt.
- Test khẳng định `retryable = false` không bao giờ được retry.

---

### BE-012 — OpenAPI hardcode, thiếu 4 endpoint và không có schema request/response → chắc chắn lệch

- **Mức độ:** P1 — High (contract không đáng tin)
- **Trạng thái xác minh:** ✅ Đã tái hiện (`curl /v3/api-docs`)
- **File:** `src/main/java/com/recruitment/app/common/api/openapi/OpenApiController.java:26-77`

**Hiện tượng**
`OpenApiController` giữ một `Map` hằng số mô tả spec. Spec công bố **6 path**:

```
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/oauth/exchange
POST /api/v1/auth/refresh
POST /api/v1/auth/register
```

Nhưng backend thật có **10** business endpoint (`AuthController` 6 + `AccountSecurityController` 4). **Thiếu:**
- `POST /api/v1/auth/password/change`
- `POST /api/v1/auth/password/reset-request`
- `POST /api/v1/auth/password/reset-confirm`
- `POST /api/v1/auth/verify-email`

Ngoài ra spec **không có**: `requestBody`, `components.schemas`, và **không** mô tả `400/401/403/409/415/429`. Response chỉ có 1 dòng description, ví dụ `"201": {"description": "Created"}`.

**Bằng chứng**

```bash
curl -s http://127.0.0.1:8080/v3/api-docs | wc -c
# => 1274   (spec hoàn chỉnh cho 10 endpoint + schema sẽ lớn hơn nhiều)
```

Spec cũng không đặt `security` toàn cục; chỉ `/me` có `security: [{bearerAuth: []}]` → mọi endpoint khác trông như không cần xác thực.

**Nguyên nhân gốc**
Spec được viết tay trong Java thay vì sinh từ source (springdoc/`@Operation`/`@Schema`). Spec viết tay luôn lệch khi controller thay đổi, và **không có test nào so sánh spec với các route thực tế**.

**Ảnh hưởng**
- `docs/api/README.md:83-84` yêu cầu *"Mỗi endpoint mới cần có mô tả request, response, quyền truy cập và lỗi có thể trả"* — yêu cầu này **không** được đáp ứng.
- Frontend/QA dùng `/v3/api-docs` để sinh client sẽ không thấy 4 endpoint quan trọng nhất của luồng account recovery.
- Rủi ro bảo mật nhỏ: endpoint không được document cũng không được review trong PR.
- `implementation-backlog.md:40` tuyên bố "Public OpenAPI 3.1 endpoint" là deliverable của G1 — đúng về sự tồn tại, sai về tính đầy đủ.

**Cách sửa**
1. **Ưu tiên:** thay `OpenApiController` hardcode bằng springdoc-openapi (sinh tự động từ annotation `@Operation`/`@Schema`), hoặc ít nhất là một nguồn duy nhất cho path.
2. Thêm **test contract**: liệt kê tất cả `@RequestMapping` của `@RestController` qua `RequestMappingHandlerMapping` và khẳng định mỗi route đều xuất hiện trong spec, với đủ `requestBody` (nếu có) và các mã lỗi chuẩn.
3. Khai báo `security` toàn cục = `bearerAuth`, và override `security: []` cho các endpoint public.
4. Bổ sung schema cho `ApiErrorResponse` (đã có contract ổn định: `code`/`message`/`fieldErrors`/`requestId`).

**Acceptance test**
- Test khẳng định số path trong spec == số route business trong `RequestMappingHandlerMapping`.
- Test khẳng định mỗi endpoint có ít nhất 1 response lỗi và (nếu là POST có body) có `requestBody`.
- `/v3/api-docs` chứa `components.schemas.ApiErrorResponse`.

---

### BE-013 — Mã HTTP sai cho lỗi mật khẩu hiện tại; `DataIntegrityViolationException` bị gộp thành 409 che lỗi thật

- **Mức độ:** P1 — High (contract & khả năng debug)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/api/IdentityApiExceptionHandler.java:33-39`, `:49-59`

**Hiện tượng**
1. Sai mật khẩu hiện tại → **400 `INVALID_REQUEST`**, không phải 401/422:

```java
// IdentityApiExceptionHandler.java:49-59
@ExceptionHandler({InvalidResetTokenException.class, InvalidVerificationTokenException.class,
                   InvalidCurrentPasswordException.class})
ResponseEntity<ApiErrorResponse> handleBadRequestTokens(RuntimeException exception) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponse.of(
            "INVALID_REQUEST", exception.getMessage()));
}
```

```bash
curl -s -X POST .../api/v1/auth/password/change -H "Authorization: Bearer $AT" \
  -H 'Content-Type: application/json' \
  -d '{"currentPassword":"WrongOne12345","newPassword":"BrandNewPassw0rd"}'
# => 400 {"code":"INVALID_REQUEST","message":"Current password does not match."}
```

2. **Mọi** `DataIntegrityViolationException` trong module identity → 409 với thông điệp "The requested account state already exists.":

```java
// IdentityApiExceptionHandler.java:33-39
@ExceptionHandler({EmailAlreadyRegisteredException.class, OAuthIdentityConflictException.class,
                   DataIntegrityViolationException.class})
ResponseEntity<ApiErrorResponse> handleConflict(RuntimeException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiErrorResponse.of(
            "CONFLICT", "The requested account state already exists."));
}
```

**Nguyên nhân gốc**
- `InvalidCurrentPasswordException` bị nhóm cùng lỗi token thay vì có status riêng. Đây là lỗi xác thực lại (re-authentication), không phải request hỏng.
- `DataIntegrityViolationException` là exception **rất rộng**: vi phạm unique, vi phạm FK, vi phạm CHECK, NOT NULL... Tất cả bị biến thành "account state already exists" với 409.

**Ảnh hưởng**
- Client không phân biệt được "mật khẩu hiện tại sai" (cần hiển thị lỗi ở field) với "request sai định dạng" (lỗi lập trình). Trải nghiệm đổi mật khẩu sẽ khó hiểu.
- **Che giấu bug thật:** nếu một FK constraint hoặc CHECK constraint bị vi phạm do lỗi lập trình, hệ thống trả 409 "The requested account state already exists." → log không có stack trace, thông điệp vô nghĩa → cực khó chẩn đoán. Thông điệp cũng **không chính xác** về mặt ngữ nghĩa trong các trường hợp đó.
- Không có test nào khẳng định các nhánh `DataIntegrityViolationException` khác nhau.

**Cách sửa**
1. Tách `InvalidCurrentPasswordException` → **401** (kèm `WWW-Authenticate`? không bắt buộc) hoặc **422 Unprocessable Entity**, mã riêng `INVALID_CURRENT_PASSWORD`. Không dùng chung với lỗi token.
2. Thu hẹp handler 409: chỉ map `EmailAlreadyRegisteredException` và `OAuthIdentityConflictException`. Với `DataIntegrityViolationException`, **phân tích `ConstraintViolationException.getConstraintName()`** để map đúng từng constraint, và **log ở mức ERROR/WARN kèm `requestId`** cho các constraint không nhận diện được; trả **500** cho trường hợp không rõ nguyên nhân.
3. Thêm test cho từng constraint (unique email, unique google subject, FK violation) để khẳng định status/mã lỗi.

**Acceptance test**
- Sai `currentPassword` → **401** (hoặc 422) với mã `INVALID_CURRENT_PASSWORD`.
- Đăng ký email trùng → **409 `CONFLICT`**.
- Vi phạm FK/CHECK không xác định → **500** + log có `requestId` và tên constraint (không lộ chi tiết cho client).
- Token reset/verify sai → 400 `INVALID_REQUEST` như cũ.

---

## P2 — Medium

### BE-014 — Profile `local` là no-op: compose bật profile nhưng file cấu hình bị `.dockerignore` loại khỏi image

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** 🔍 Phân tích tĩnh (đã kiểm tra file + dockerignore + grep)
- **File:** `infra/docker/compose.local.yml:38`; `.dockerignore`; `src/main/resources/application-local.yml.example`

**Hiện tượng**
`compose.local.yml` đặt `SPRING_PROFILES_ACTIVE: local`, nhưng repo chỉ ship `application-local.yml.example` (không phải `application-local.yml`), **và** `.dockerignore` loại luôn cả file thật nếu dev có tạo:

```text
# .dockerignore
/src/main/resources/application-local.yml
```

Vì Dockerfile dùng `COPY src ./src`, file này **không bao giờ** vào build context → trong container, profile `local` luôn không tìm thấy cấu hình.

**Ảnh hưởng**
- Profile `local` là no-op: `logging.level.org.hibernate.SQL: warn` trong `application-local.yml.example` **không** được áp dụng trong Compose → container log toàn bộ SQL ở mức mặc định, gây nhiễu log và tăng dung lượng log (đối lập với mục tiêu "technical logs 30 days" của ADR).
- Dev tạo `application-local.yml` kỳ vọng có hiệu lực trong container sẽ mất thời gian debug tại sao nó không được load.
- Tài liệu `overview.md:142` liệt kê file này trong cấu trúc resources như thể nó tồn tại.

**Cách sửa**
Chọn một hướng và làm rõ tài liệu:
- **Hướng A (khuyến nghị):** chuyển các thiết lập của profile `local` thành biến môi trường truyền qua `compose.local.yml` (`LOGGING_LEVEL_ORG_HIBERNATE_SQL: warn`), và **bỏ** `application-local.yml` khỏi cấu trúc tài liệu (hoặc ghi rõ là "chỉ dùng khi chạy ngoài container").
- **Hướng B:** nếu thật sự cần file profile trong container, bỏ dòng tương ứng khỏi `.dockerignore` và thêm `COPY src/main/resources/application-local.yml` — nhưng cách này dễ vô tình đẩy cấu hình local lên môi trường khác, **không khuyến nghị**.

Bổ sung: thêm kiểm tra khi khởi động (log WARN) nếu `SPRING_PROFILES_ACTIVE` chứa profile mà không có `application-<profile>.yml` tương ứng.

**Acceptance test**
- `docker compose -f infra/docker/compose.local.yml up` → log SQL ở mức `warn` như mong đợi.
- Tài liệu mô tả đúng cơ chế cấu hình thực tế của container.

---

### BE-015 — Dead schema và constraint sai ngữ nghĩa: bảng Envers không dùng, CHECK "not_negative" chỉ kiểm tra NOT NULL

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã tái hiện (query DB + kiểm tra `pom.xml`)
- **File:** `src/main/resources/db/migration/V001__initial_schema.sql:1-11`, `:51-52`; `V002__create_recruitment_domain_schema.sql:388`

**Hiện tượng 1 — bảng Envers chết**
`V001` tạo `revchanges` và `revinfo` (bảng audit của Hibernate Envers), nhưng:
- `hibernate-envers` **không** là dependency trong `pom.xml`.
- Không có `@Audited`, không có `@RevisionEntity`, không có `EnableEnvers`.

```bash
grep -n "envers" pom.xml              # => không có
grep -rn "Audited\|RevisionEntity" src/main/java   # => không có
```

```sql
SELECT COUNT(*) FROM revinfo;     -- => 0
SELECT COUNT(*) FROM revchanges;  -- => 0
```

**Hiện tượng 2 — constraint sai ngữ nghĩa**

```sql
-- V002__create_recruitment_domain_schema.sql:388
ALTER TABLE candidate_experiences
  ADD CONSTRAINT chk_candidate_experiences_dates_not_negative CHECK (start_date IS NOT NULL);
```

Tên nói "dates not negative" nhưng nội dung chỉ là `start_date IS NOT NULL` — **không liên quan đến số âm**. Nếu `start_date` vốn đã `NOT NULL` thì constraint này hoàn toàn dư thừa (dead constraint); nếu không, nó lặng lẽ biến cột thành bắt buộc, có thể mâu thuẫn với entity.

**Ảnh hưởng**
- Dead schema làm nhiễu: người đọc `SHOW TABLES` thấy `revinfo`/`revchanges` và tưởng hệ thống đang audit entity history — trong khi `docs/SMARTRECRUIT_PROJECT_SETUP.md:23` liệt kê `audit_events` là bảng Operations thuộc G8 (Pending). Hai cơ chế audit "trông giống nhau" nhưng đều chưa chạy.
- Constraint sai tên/ngữ nghĩa gây hiểu nhầm khi review migration và khi debug lỗi integrity.
- `docs/database/schema.md` không nhắc tới 2 bảng Envers này → tài liệu database không đầy đủ.

**Cách sửa**
1. Viết migration `V009` `DROP TABLE revchanges, revinfo` **nếu** team xác nhận Envers không nằm trong kế hoạch audit (khuyến nghị, vì ADR 0003 chọn `audit_events` + WORM ledger theo hướng khác). Nếu Envers **có** trong kế hoạch thì bổ sung dependency + `@Audited` + test, và ghi vào ADR.
2. Đổi tên/loại bỏ `chk_candidate_experiences_dates_not_negative`. Nếu ý định là bắt buộc `start_date`, thì để `NOT NULL` trên cột (rõ nghĩa hơn) và bỏ constraint; nếu ý định là kiểm tra ngày không ở tương lai, viết lại đúng ý định.
3. Cập nhật `docs/database/schema.md` cho khớp thực tế.

**Acceptance test**
- `SHOW TABLES` không còn `revinfo`/`revchanges` (hoặc có entity + `@Audited` tương ứng nếu chọn Envers).
- `docs/database/schema.md` liệt kê đầy đủ các bảng.
- Không còn constraint có tên không khớp nội dung.

---

### BE-016 — Dead code trong domain: overload `complete()` 6 tham số, `removeRole()`, `incrementCredentialVersion()` không có caller production

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã tái hiện (grep)
- **File:** `src/main/java/com/recruitment/app/modules/applications/infrastructure/persistence/entity/ApplicationScreening.java:156-176`; `src/main/java/com/recruitment/app/modules/identity/infrastructure/persistence/entity/User.java:80-82`, `:97-99`

**Hiện tượng**

| Thành phần | Caller trong `src/main` |
| :--- | :--- |
| `ApplicationScreening.complete(score, rec, summary, matched, missing, evaluatedAt)` | ❌ không (chỉ `DomainLifecycleTests`) |
| `User.removeRole(Role)` | ❌ không |
| `User.incrementCredentialVersion()` | ❌ không (xem BE-008) |
| `AuthenticationThrottlingService.resetAll()` | ❌ không (chỉ test) |
| `new ApplicationScreening(...)` | ❌ không (chỉ test) |

```java
// ApplicationScreening.java:156-176 — overload uỷ quyền cho bản 10 tham số với limitations=null
public void complete(Integer score, Recommendation recommendation, String summary,
                     String matchedCriteria, String missingCriteria, Instant evaluatedAt) {
    complete(score, recommendation, summary, matchedCriteria, missingCriteria,
             null, provider, modelVersion, promptVersion, evaluatedAt);
}
```

**Ảnh hưởng**
- Overload 6 tham số **âm thầm bỏ `limitations`**. Nếu một lập trình viên trong tương lai gọi nó (vì nó ngắn hơn), dữ liệu audit "limitations" sẽ bị mất mà không có cảnh báo — đúng loại bug khó phát hiện trong bản ghi audit AI.
- Code chết làm sai lệch số liệu coverage và gây hiểu nhầm rằng tính năng đã có đường đi (ví dụ `removeRole` khiến ta tưởng hạ quyền đã được hỗ trợ).
- `ApplicationScreening` không được tạo ở production nghĩa là "screening" chưa có điểm vào thật — nên ghi rõ trong backlog thay vì để test tạo ảo giác đã xong.

**Cách sửa**
- Xóa overload 6 tham số của `complete()`. Chỉ giữ một đường duy nhất bắt buộc truyền `limitations` (có thể nhận `null` tường minh nếu muốn).
- Giữ `incrementCredentialVersion()` nhưng **phải** gọi nó tại use case đổi quyền (BE-008) — nếu không sẽ xóa cùng `removeRole`.
- Giữ `removeRole` chỉ khi Admin Console mutation (G3+) được lên kế hoạch trong cùng milestone; nếu không, xóa và thêm lại khi cần.
- `resetAll()` chỉ dùng cho test → chuyển sang package-private hoặc dùng `@VisibleForTesting`.

**Acceptance test**
- Không còn method/field public không có caller trong `src/main` (có thể thêm ArchUnit rule hoặc dùng công cụ phân tích).
- Coverage của `ApplicationScreening` không còn phụ thuộc vào test tự tạo entity.

---

### BE-017 — JSON property lạ bị bỏ qua im lặng: lỗi chính tả của client biến thành 401/400 khó hiểu

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/resources/application.yml` (không bật `fail-on-unknown-properties`); các request DTO tại `modules/identity/api/request/`

**Hiện tượng**
Jackson bỏ qua field không xác định. Request kèm field lạ vẫn thành công:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST .../api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"tester1@example.com","password":"Passw0rdSecure12","role":"ROLE_PLATFORM_ADMIN","admin":true}'
# => 200
```

**Nguyên nhân gốc**
`spring.jackson.deserialization.fail-on-unknown-properties` mặc định `false`.

**Ảnh hưởng**
- **Hy vọng an toàn:** vì response là 200 và `role` không được dùng, **không có mass assignment**. Đây là điểm tốt.
- **Nhưng đánh đổi là khả năng debug:** client gửi `passwrod` (chính tả sai) → `password` là null → 400 `VALIDATION_ERROR` báo "password must not be blank", khiến client tưởng thiếu field thay vì sai tên. Client gửi `refresh_token` (snake_case) thay vì `refreshToken` → 400 khó hiểu.
- Trong bối cảnh có frontend riêng cần khớp contract (`docs/api/frontend-mapping.md`), việc im lặng bỏ qua field sẽ kéo dài thời gian tích hợp.

**Cách sửa**
Bật `spring.jackson.deserialization.fail-on-unknown-properties: true` (hoặc `FAIL_ON_UNKNOWN_PROPERTIES`) và ánh xạ lỗi Jackson thành `400 VALIDATION_ERROR` với tên field bị từ chối. Cân nhắc chỉ bật ở môi trường non-production nếu muốn giữ khả năng tương thích tiến (forward compatibility) — nhưng với API nội bộ đóng, bật là an toàn và hữu ích hơn.

**Acceptance test**
- `POST /login` với field `role` thừa → **400**, `fieldErrors` chỉ ra field không được hỗ trợ.
- `POST /login` với payload đúng → 200 như cũ.
- Test cho mỗi DTO khẳng định field lạ bị từ chối.

---

### BE-018 — ADR yêu cầu gate "method ≤ 60 dòng" nhưng ArchUnit không kiểm tra — và đã có 1 vi phạm thật

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** 🔍 Phân tích tĩnh
- **File:** `src/test/java/com/recruitment/app/ModuleArchitectureTests.java:93-134`; `docs/adr/0003-backend-mvp-baseline.md:22`

**Hiện tượng**
ADR 0003 quy định: *"One production Java file is limited to 400 lines, controllers to 200, **methods to 60 non-comment lines** and test files to 600 lines."*

`sourceAndTestFilesRespectSizeBudgets()` chỉ kiểm tra:
- file production > 400 dòng,
- file tên `*Controller.java` > 200 dòng,
- file test > 600 dòng.

**Không có** kiểm tra độ dài method. Vì vậy gate chỉ thực thi 3/4 quy tắc.

**Và đã có vi phạm thật:** `OpenApiController.createSpecification()` chiếm **65 dòng** (0 dòng comment) — vượt ngưỡng 60:

```bash
awk '/private static Map<String, Object> createSpecification/,/^    }$/' \
  src/main/java/com/recruitment/app/common/api/openapi/OpenApiController.java | wc -l
# => 65
```

**Ảnh hưởng**
- Quy tắc đã được phê duyệt trong ADR không có hiệu lực → method dài có thể lọt vào codebase mà CI vẫn xanh. Gate "đang pass" tạo cảm giác an toàn giả.
- `implementation-backlog.md:39` tuyên bố *"production/controller/method line budget rules passing"* — **sai** với quy tắc method: gate không tồn tại, và đã có 1 vi phạm.
- Lưu ý: đếm "non-comment lines" cần loại dòng comment và dòng trống — nếu implement sai sẽ báo động giả.

**Cách sửa**
1. Tách `OpenApiController.createSpecification()` thành các builder theo nhóm path (auth / account-security / components), mỗi method < 60 dòng.
2. Thêm test đếm dòng thân method (từ dòng khai báo đến dấu `}` đóng, trừ comment/blank). Khuyến nghị dùng JavaParser để chính xác thay vì đếm ngoặc thủ công.

**Acceptance test**
- Test mới fail khi có method > 60 dòng non-comment (kiểm chứng bằng một fixture cố ý).
- Test mới pass trên codebase hiện tại (sau khi tách `createSpecification`).
- Thông báo lỗi nêu rõ file + tên method + số dòng.

---

### BE-019 — Logout/refresh không thu hồi access token: token cũ còn dùng được đến hết TTL

- **Mức độ:** P2 — Medium (đánh đổi đã biết, cần ghi rõ)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/TokenSessionService.java:76-116`

**Hiện tượng**
Sau `POST /auth/refresh` (và sau `POST /auth/logout`), **access token cũ vẫn hợp lệ** cho tới khi hết hạn.

```bash
# Sau refresh #1 thành công với token mới:
curl -s -o /dev/null -w '%{http_code}\n' .../api/v1/auth/me -H "Authorization: Bearer $AT1"
# => 200    (access token CŨ vẫn dùng được)
```

**Nguyên nhân gốc**
JWT là stateless. `credential_version` chỉ tăng khi đổi mật khẩu; refresh/logout chỉ thu hồi **refresh session**, không bump `credential_version`.

**Ảnh hưởng**
- "Logout" không phải là logout thật: trên máy dùng chung hoặc khi token bị lộ, kẻ tấn công còn cửa sổ tối đa 15 phút (mặc định) / 30 phút (giới hạn cấu hình) để tiếp tục gọi API.
- Đây là **đánh đổi được biết trong thiết kế JWT**, không phải bug. Vấn đề là tài liệu không nêu rõ: `docs/api/README.md` mô tả logout là "revoke refresh session" (đúng) nhưng `docs/runbooks/authentication-and-ai.md` dễ khiến người đọc kết luận logout thu hồi phiên hoàn toàn.
- Frontend cần biết điều này để quyết định có xóa token khỏi memory ngay khi logout hay không.

**Cách sửa** (chọn theo mức rủi ro mong muốn)
1. **Tài liệu hóa (tối thiểu):** ghi rõ trong `docs/runbooks/authentication-and-ai.md` rằng access token tồn tại đến hết TTL sau logout/refresh, kèm ngưỡng TTL khuyến nghị cho production (`production-readiness.md` đã yêu cầu "access-token TTL no longer than the configured 30-minute maximum" — có thể siết xuống 5–10 phút).
2. **Thu hồi tức thì (nếu cần):** tăng `credential_version` khi logout → mọi access token cũ chết ngay. Đánh đổi: logout sẽ đá người dùng ra khỏi **mọi** thiết bị, và mỗi lần logout phải ghi DB.
3. **Trung gian:** duy trì danh sách `jti` bị thu hồi (denylist) trong cache có TTL ≤ access token TTL, kiểm tra trong `JwtAuthenticationFilter`.

**Acceptance test**
- Nếu chọn (2): sau logout, access token cũ → **401** trên mọi endpoint.
- Nếu chọn (1): tài liệu mô tả đúng hành vi, và có test khẳng định hành vi hiện tại (để không vô tình đổi).
- TTL access token trong cấu hình production ≤ 30 phút (đã được `JwtProperties` ép bằng `MAX_ACCESS_TOKEN_TTL`).

---

### BE-020 — Phát hiện reuse refresh token thu hồi cả phiên hợp lệ mới nhất → logout cưỡng bức / DoS phiên

- **Mức độ:** P2 — Medium (đánh đổi thiết kế có chủ đích, nhưng cần test & tài liệu)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/TokenSessionService.java:76-100`

**Hiện tượng**
Reuse một refresh token đã revoke → `revokeAllActiveForUser()` → **mọi** refresh session đang hoạt động của account bị thu hồi, **bao gồm token hợp lệ mới nhất**:

```bash
RT1 (đã dùng) --refresh--> RT2 (hợp lệ)
reuse RT1 --> 401   (đúng: phát hiện token theft)
dùng RT2  --> 401   (bị vô hiệu hoá lây)
```

**Nguyên nhân gốc**
Đây là hành vi **có chủ đích**, được ghi trong Javadoc `TokenSessionService:19-21` và `docs/database/schema.md:27`. Xác nhận qua test `TokenSessionServiceTests` (6 test).

**Ảnh hưởng**
- **Tự gây hại:** một lần retry mạng trùng lặp khi refresh (mobile, mạng chập chờn, hai tab cùng refresh) sẽ đăng xuất người dùng khỏi tất cả thiết bị. `docs/api/frontend-mapping.md:33` yêu cầu "Concurrent refresh must be serialized" — nghĩa là **client phải** làm đúng, nếu không sẽ gặp lỗi này.
- **Bị lợi dụng:** kẻ tấn công có được một refresh token cũ (đã revoke) có thể **liên tục đăng xuất nạn nhân** — một dạng DoS phiên, miễn phí và lặp lại.
- Không có rate limit trên `/auth/refresh` (xem BE-006).

**Cách sửa**
1. **Giữ nguyên hành vi** (đúng về bảo mật) nhưng bổ sung:
   - **Rate limit `/api/v1/auth/refresh`** để chặn lạm dụng revoke-all.
   - **Cửa sổ ân hạn (grace window) ngắn** cho token vừa bị revoke (ví dụ 5–10 giây): nếu cùng token được dùng lại trong cửa sổ đó và trả về **cùng** cặp token mới vừa phát, coi là retry trùng lặp của cùng client, không kích hoạt revoke-all. Đây là mẫu được nhiều hệ thống dùng để vừa giữ phát hiện theft vừa tránh false positive.
   - Ghi lại quyết định + đánh đổi vào ADR nếu thêm grace window (vì nó nới lỏng bảo mật).
2. **Tài liệu hóa rõ** trong `docs/api/README.md` rằng reuse = thu hồi toàn bộ chuỗi session.
3. Frontend **bắt buộc** serialize refresh (mutex/`navigator.locks`); thêm ghi chú trong `docs/api/frontend-mapping.md`.

**Acceptance test**
- Test: refresh song song 2 request cùng token → **chỉ một** thành công, và phiên mới **vẫn dùng được** (không bị revoke-all) nếu áp dụng grace window.
- Test: reuse token đã revoke **ngoài** grace window → revoke toàn bộ session (giữ hành vi bảo mật).
- `/auth/refresh` có rate limit.

---

### BE-021 — Enumeration qua `register` (409) và thông điệp reset-request không trung thực

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/IdentityAuthenticationService.java:57-59`; `api/AccountSecurityController.java:48-56`

**Hiện tượng**
- `POST /auth/register` với email đã tồn tại → **409 CONFLICT** → xác nhận được email nào đã có tài khoản.
- `POST /auth/password/reset-request` trả cùng thông điệp cho email tồn tại và không tồn tại (tốt), **nhưng** thông điệp khẳng định đã gửi token (sai — xem BE-003).

**Bằng chứng**

```bash
# register email đã tồn tại -> 409
# register email mới        -> 201
# => phân biệt được sự tồn tại của tài khoản
```

**Nguyên nhân gốc**
`register` phải báo trùng email để UX hợp lý — đây là đánh đổi giữa UX và chống enumeration. Vấn đề là **không có throttle trên register** (BE-006), nên enumeration ở quy mô lớn không tốn gì.

**Ảnh hưởng**
Kẻ tấn công dựng được danh sách email đã đăng ký (rò rỉ thông tin cá nhân: một người có tài khoản trên nền tảng tuyển dụng). Với ngành tuyển dụng, đây là dữ liệu nhạy cảm.

**Cách sửa**
1. Rate limit theo IP cho `register` (đã nằm trong BE-006).
2. Cân nhắc CAPTCHA/proof-of-work cho `register`.
3. Không đổi 409 → 201 giả (sẽ gây lỗi khác), nhưng **bắt buộc** thêm throttle và ghi nhận rủi ro trong tài liệu.
4. Sửa thông điệp `reset-request` phản ánh đúng hành vi (gắn với BE-003).

**Acceptance test**
- Sau N lần register từ cùng IP → 429.
- Thông điệp `reset-request` không khẳng định điều không xảy ra.

---

### BE-022 — Response của `/password/reset-request` mô tả hành vi không tồn tại

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/api/AccountSecurityController.java:53-55`

**Hiện tượng**

```java
return ResponseEntity.ok(Map.of(
    "message", "If an active account exists with this email, a reset token has been dispatched."
));
```

Nhưng **không có gì được dispatch** (xem BE-003).

**Ảnh hưởng**
Contract nói dối. QA/client tin rằng luồng hoạt động, bug ẩn rất lâu. Cũng làm sai lệch kết quả test tích hợp nếu chỉ assert status 200.

**Cách sửa**
Gộp vào BE-003. Nếu chưa có kênh gửi, trả về thông điệp trung thực (ví dụ `"If an active account exists with this email, reset instructions will be sent."` **chỉ khi** kênh gửi đã tồn tại), hoặc trả **501 Not Implemented** nếu tính năng chưa sẵn sàng — kèm ghi chú trong `docs/api/README.md`.

**Acceptance test**
- Thông điệp response khớp với hành vi thực tế đã kiểm chứng bằng test end-to-end.

---

## P3 — Low / Polish

### BE-023 — `transactionId` bắt buộc đúng 43 ký tự, tài liệu nói "ít nhất 32 byte ngẫu nhiên"

- **Mức độ:** P3
- **Trạng thái xác minh:** 🔍 Phân tích tĩnh
- **File:** `modules/identity/api/request/OAuthCodeExchangeRequest.java`; `OauthAuthorizationCodeService.java:122-127`; `docs/runbooks/authentication-and-ai.md:48`

**Hiện tượng**
`@Pattern(regexp = "[A-Za-z0-9_-]{43}")` — cứng đúng 43. Tài liệu nói "`transaction_id` base64url từ **ít nhất** 32 random bytes" (32 byte → 43 ký tự, nhưng 48 byte → 64 ký tự cũng hợp lệ theo tài liệu).

**Ảnh hưởng**
Client làm đúng theo tài liệu nhưng chọn 48 hoặc 64 byte ngẫu nhiên sẽ bị **từ chối 400** ở `/oauth/exchange` (và `400` ở `/oauth2/authorization/google`). Frontend dev sẽ mất thời gian.

**Cách sửa**
Hoặc nới regex thành `[A-Za-z0-9_-]{43,128}` ở cả DTO, filter và service (nhất quán), hoặc sửa tài liệu thành "**đúng** 32 random bytes (43 ký tự base64url)".

**Acceptance test**
- Test khẳng định giới hạn đã chọn, ở **cả ba** nơi (`OAuthCodeExchangeRequest`, `PkceGoogleAuthorizationRequestFilter`, `OAuthAuthorizationCodeService`) dùng cùng một ràng buộc — tốt nhất là một constant dùng chung.

---

### BE-024 — `IdentityAuthenticationService` tạo instance throttle riêng nếu dùng constructor 3 tham số

- **Mức độ:** P3
- **Trạng thái xác minh:** 🔍 Phân tích tĩnh
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/IdentityAuthenticationService.java:36-49`

**Hiện tượng**

```java
public IdentityAuthenticationService(IdentityAccountStore accounts, PasswordEncoder passwordEncoder,
        TokenSessionService tokenSessions) {
    this(accounts, passwordEncoder, tokenSessions, new AuthenticationThrottlingService());  // instance MỚI
}
```

**Ảnh hưởng**
Trong production, Spring dùng constructor có `@Autowired` (4 tham số) nên `AuthenticationThrottlingService` bean được inject đúng → **hiện tại không có bug**. Nhưng nếu ai đó vô tình đổi constructor mặc định (ví dụ khi thêm tham số), throttling state sẽ **tách thành hai instance** và một nửa request không bị throttle — lỗi bảo mật âm thầm. Đây là footgun.

**Cách sửa**
Bỏ constructor 3 tham số. Nếu cần cho test, đánh dấu `@VisibleForTesting` hoặc để test tự tạo `AuthenticationThrottlingService` và truyền vào.

**Acceptance test**
- Chỉ còn một constructor public. Test integration khẳng định chỉ tồn tại **một** bean `AuthenticationThrottlingService` và state dùng chung.

---

### BE-025 — `validatePassword` ném `IllegalArgumentException` làm mất thông tin field-level

- **Mức độ:** P3
- **Trạng thái xác minh:** 🔍 Phân tích tĩnh
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/PasswordManagementService.java:140-151`

**Hiện tượng**
`validatePassword` và `normalizeEmail` ném `IllegalArgumentException`. `ApiExceptionHandler` map `IllegalArgumentException` → **400 `INVALID_REQUEST`** không có `fieldErrors`, trong khi DTO validation ở lớp api lại trả **400 `VALIDATION_ERROR`** kèm `fieldErrors`.

**Ảnh hưởng**
Hai đường validation cho cùng một ràng buộc (độ dài mật khẩu 12–128) trả hai contract lỗi khác nhau. Client phải xử lý hai shape. Cũng dễ nhầm với lỗi lập trình vì `IllegalArgumentException` bao trùm nhiều nguyên nhân.

**Cách sửa**
- Đặt ràng buộc chỉ ở **một** nơi (khuyến nghị: DTO `@Size`), và ở service dùng exception domain có mã riêng (`InvalidPasswordPolicyException` → 400 `VALIDATION_ERROR` kèm `fieldErrors.password`).
- Thu hẹp handler `IllegalArgumentException` toàn cục: không nên map mọi `IllegalArgumentException` (bao gồm lỗi lập trình như `Long.parseLong` sai) thành 400. Chỉ map các exception domain cụ thể.

**Acceptance test**
- Mật khẩu mới quá ngắn ở `/password/change` và `/password/reset-confirm` → **400 `VALIDATION_ERROR`** với `fieldErrors.newPassword`.
- Lỗi lập trình (ví dụ parse sai) → **500**, không bị nuốt thành 400.

---

### BE-026 — `.env` đang chứa credential trông như thật (Google client secret + Gemini API key)

- **Mức độ:** P3 — Hygiene (không phải lỗi code)
- **Trạng thái xác minh:** ✅ Đã kiểm tra
- **File:** `.env` (root)

**Hiện tượng**
`.env` chứa `GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-…` và `GEMINI_API_KEY=AQ.…`, cùng client id OAuth thật. Với `GOOGLE_OAUTH_ENABLED=true` và `GEMINI_ENABLED=true`, app đã khởi động và **nạp** các giá trị này.

**Đánh giá (điểm tốt cần ghi nhận)**
- `.env` **được** `.gitignore` (`git check-ignore -v .env` → khớp `.gitignore:6`).
- `.env` **chưa từng** được commit (`git log --all -- .env` → rỗng).
- `.env` **được** `.dockerignore` loại khỏi image.
- `.env.example` chỉ chứa placeholder.

→ **Không có rò rỉ nào xảy ra.** Đây đúng là mô hình local mà `docs/runbooks/local-development.md` mô tả.

**Khuyến nghị (không bắt buộc)**
1. Nếu các giá trị này là credential thật của Google Cloud project, hãy **rotate** chúng sau khi kết thúc giai đoạn dev, vì chúng đã nằm ở dạng plaintext trên máy trạm.
2. Thêm cảnh báo vào `scripts/check-env.sh`: fail nếu `GOOGLE_OAUTH_CLIENT_SECRET`/`GEMINI_API_KEY` khớp pattern credential thật khi profile không phải local.
3. Cân nhắc dùng placeholder trong `.env` local và nạp credential thật từ secret manager ngay cả khi dev.

**Acceptance test**
- `git check-ignore .env` vẫn khớp; `.dockerignore` vẫn loại `.env`.
- `scripts/check-env.sh` phát hiện credential thật ngoài môi trường local.

---

### BE-027 — `application-local.yml.example` được tài liệu mô tả như file đang tồn tại

- **Mức độ:** P3
- **Trạng thái xác minh:** 🔍 Phân tích tĩnh
- **File:** `docs/architecture/overview.md:141-146`

**Hiện tượng**
`overview.md:142` liệt kê `application-local.yml.example` trong cây cấu hình `src/main/resources/` như một phần của baseline. Thực tế file tồn tại (đúng) nhưng **không có hiệu lực trong container** (BE-014) và tài liệu không nói rõ nó chỉ dùng ngoài Docker.

**Cách sửa**
Ghi rõ trong `overview.md`: file `.example` chỉ dùng khi chạy app trực tiếp (không qua Compose), và Comose cấu hình bằng biến môi trường. Liên kết tới BE-014.

**Acceptance test**
- Tài liệu mô tả đúng cơ chế cấu hình cho cả hai đường chạy (trực tiếp và container).

---

## 5b. CASE BỔ SUNG — vòng audit sâu (schema integrity, kiến trúc, khả năng quan sát)

> Các case dưới đây phát hiện ở vòng kiểm tra thứ hai: đối chiếu entity ↔ `information_schema` live, kiểm tra `SHOW CREATE TABLE`, phân tích phụ thuộc package, và rà soát test.

### BE-028 — V007 vô hiệu hóa FK compound: invariant "job creator thuộc company của job" không còn được enforce ở đâu

- **Mức độ:** P1 — High
- **Trạng thái xác minh:** ✅ Đã tái hiện (kiểm tra live schema + INSERT thử)
- **File:** `src/main/resources/db/migration/V007__convert_job_creator_membership_to_user_references.sql:18`; `V002__create_recruitment_domain_schema.sql:181`, `:350`

**Hiện tượng**
Invariant *"A job creator must be a member of that job's company"* chỉ được enforce bằng **một compound FK duy nhất**:

```sql
-- V002:181
created_by_member_id BIGINT NOT NULL,
-- V002:350
ADD CONSTRAINT FK_JOBS_CREATED_BY_MEMBER_COMPANY
  FOREIGN KEY (created_by_member_id, company_id) REFERENCES company_members (id, company_id);
```

V007 đổi cột này thành **NULLABLE**:

```sql
-- V007:18
MODIFY COLUMN created_by_member_id BIGINT NULL;
```

MySQL dùng ngữ nghĩa **MATCH SIMPLE**: nếu **bất kỳ** cột nào trong FK compound là `NULL`, FK **không được kiểm tra**. Vậy sau V007, mọi INSERT với `created_by_member_id = NULL` bỏ qua hoàn toàn ràng buộc.

**Bằng chứng (live schema, MySQL 8.4.11 sau đủ 8 migration)**

```sql
SELECT COLUMN_NAME, IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA='smartrecruit_db' AND TABLE_NAME='jobs' AND COLUMN_NAME LIKE 'created_by%';
-- created_by_member_id | YES     <-- đã nullable
-- created_by_user_id   | NO      <-- chỉ FK tới users(id), KHÔNG liên quan company

SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA='smartrecruit_db' AND TABLE_NAME='jobs' AND REFERENCED_TABLE_NAME IS NOT NULL;
-- FK_JOBS_CREATED_BY_MEMBER_COMPANY | created_by_member_id | company_members
-- FK_JOBS_CREATED_BY_MEMBER_COMPANY | company_id           | company_members
-- fk_jobs_created_by_user           | created_by_user_id   | users
```

`fk_jobs_created_by_user` chỉ ràng buộc `created_by_user_id` tồn tại trong `users` — **không** ràng buộc user đó thuộc `company_id` của job.

**Tài liệu vẫn khẳng định invariant đang được enforce:**

```text
docs/database/README.md:51  ## Integrity rules currently enforced
docs/database/README.md:53  - A job creator must be a member of that job's company.
docs/adr/0002:12            Compound foreign keys enforce invariants that span two references,
                            including job creator/company ...
```

**Và không có thay thế ở tầng application:** không có Job repository, không có job use case; `new Job(...)` chỉ xuất hiện trong `src/test/java/com/recruitment/app/DomainLifecycleTests.java:22`.

**Ảnh hưởng**
Invariant mà ADR 0002 và `docs/database/README.md` tuyên bố là "currently enforced" hiện **không được enforce ở bất kỳ tầng nào**. Khi G4 (jobs) bắt đầu ghi dữ liệu, một job có thể trỏ tới creator không thuộc company — phá vỡ ranh giới phân quyền mà ADR 0003 dựa vào (`docs/adr/0003:9-11`: "Company records are not an access-control boundary" + Recruiter dùng chung đội). Dữ liệu sai này sẽ chỉ lộ ra khi ranking/dossier dùng creator để quyết định quyền.

**Cách sửa** (chọn 1, ghi lại quyết định vào ADR)
1. **Nếu `created_by_member_id` vẫn cần cho G4:** giữ `NOT NULL`, và enforce invariant mới bằng một trong hai cách:
   - thêm cột `created_by_member_id` **generated** hoặc dùng trigger để suy ra member từ `created_by_user_id + company_id`, hoặc
   - thêm FK compound mới `(created_by_user_id, company_id) REFERENCES company_members (user_id, company_id)` (cần unique index trên `company_members(user_id, company_id)`), và giữ `NOT NULL`.
2. **Nếu `created_by_member_id` không còn cần (đúng tinh thần ADR 0003 chuyển sang user reference):** thêm migration `V009` `DROP FOREIGN KEY FK_JOBS_CREATED_BY_MEMBER_COMPANY`, rồi `DROP COLUMN created_by_member_id`; đồng thời **thêm FK compound trên `(created_by_user_id, company_id)`** để bảo toàn invariant đã tuyên bố.
3. Nếu team quyết định **không** giữ invariant này nữa: sửa `docs/database/README.md:53` và `docs/adr/0002:12` cho đúng, và ghi ADR mới giải thích vì sao bỏ.

**Acceptance test**
- Test integration: INSERT job với `created_by_user_id` là user **không** thuộc `company_id` → **phải bị từ chối** (FK error hoặc lỗi application).
- Test integration: INSERT job hợp lệ → thành công.
- `docs/database/README.md` và `docs/adr/0002` khớp với hành vi thực tế.

---

### BE-029 — Constructor `Job` gán `company_members.id` vào `created_by_user_id` (lẫn ID giữa hai module)

- **Mức độ:** P1 — High (latent, sẽ thành lỗi thật khi G4 ghi dữ liệu)
- **Trạng thái xác minh:** ✅ Đã xác minh (đọc code + `SHOW CREATE TABLE`)
- **File:** `src/main/java/com/recruitment/app/modules/jobs/infrastructure/persistence/entity/Job.java:89-99`, `:101-119`; `V007__…sql:11`, `:21`

**Hiện tượng**
Constructor 7 tham số (nhận `createdByMemberId`) truyền **chính giá trị đó** vào cả hai tham số của constructor 8 tham số:

```java
// Job.java:89-99
public Job(Long companyId, Long createdByMemberId, String title, String slug,
           String description, EmploymentType employmentType, WorkplaceType workplaceType) {
    this(companyId, createdByMemberId, createdByMemberId,   // <-- createdByUserId := createdByMemberId
         title, slug, description, employmentType, workplaceType);
}
```

`createdByUserId` sau đó được gán thẳng (`Job.java:113`) và là FK tới **`users(id)`**, không phải `company_members(id)`:

```sql
-- V007:21
ADD CONSTRAINT fk_jobs_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES users (id);
```

Cùng lỗi lẫn ID trong migration backfill:

```sql
-- V007:11
SET j.created_by_user_id = j.created_by_member_id
WHERE j.created_by_user_id IS NULL;
```

**Nguyên nhân gốc**
Hai ID là hai sequence AUTO_INCREMENT độc lập (`company_members.id` và `users.id`). Constructor giả định `company_members.id == users.id`, điều này chỉ đúng một cách tình cờ khi hai bảng có cùng thứ tự insert.

**Ảnh hưởng**
- **Nếu ID trùng nhau:** job được ghi với `created_by_user_id` là **một người dùng khác** → sai chủ sở hữu job. Vì `created_by_user_id` là mỏ neo phân quyền cho G4, đây là **lỗi phân quyền**, không chỉ là lỗi dữ liệu.
- **Nếu ID không trùng:** INSERT fail bằng FK error khó hiểu (`Cannot add or update a child row`), dev mất thời gian tìm nguyên nhân vì thông điệp không nói gì về việc lẫn ID.
- Hiện chưa reachable trong production (chỉ `DomainLifecycleTests.java:22` gọi), nên đây là **bug tiềm ẩn** — nhưng nằm đúng trên đường đi của G4.

**Cách sửa**
1. **Xóa constructor 7 tham số.** Chỉ giữ constructor 8 tham số bắt buộc truyền `createdByMemberId` và `createdByUserId` riêng biệt. Việc buộc gọi cả hai làm ý định trở nên tường minh.
2. Sửa backfill V007: nếu cần suy ra user từ member, phải JOIN `company_members` (đã có ở câu UPDATE thứ nhất) — câu `SET j.created_by_user_id = j.created_by_member_id` ở dòng 11 là **sai** và nên bị xóa hoặc thay bằng một xử lý tường minh cho các dòng không join được (ví dụ fail migration thay vì đoán).
3. Vì V007 đã chạy ở môi trường chung, **không sửa V007**; nếu cần sửa dữ liệu đã backfill sai, viết migration `V009` để kiểm tra và sửa.

**Acceptance test**
- Không còn constructor nhận `createdByMemberId` mà không nhận `createdByUserId`.
- Test integration: tạo company + member (id khác user id) + job → `jobs.created_by_user_id` đúng bằng `users.id` của creator, **không** bằng `company_members.id`.
- Test khẳng định `created_by_user_id` luôn là user thuộc company của job (liên kết với BE-028).

---

### BE-030 — ArchUnit bỏ lọt 2 vi phạm hướng phụ thuộc đang tồn tại thật (api→infrastructure và infrastructure→api)

- **Mức độ:** P1 — High (gate không thực thi điều ADR tuyên bố)
- **Trạng thái xác minh:** ✅ Đã xác minh (grep import)
- **File:** `src/main/java/com/recruitment/app/modules/identity/api/AuthController.java:16`; `api/AccountSecurityController.java:10`; `infrastructure/security/oauth/GoogleOAuth2SuccessHandler.java:5`; `src/test/java/com/recruitment/app/ModuleArchitectureTests.java:69-83`

**Hiện tượng**
Có **hai hướng phụ thuộc bị đảo**, và cả hai đều lọt qua CI:

**(a) `api` → `infrastructure`** — controller import class từ tầng infrastructure:

```java
// AuthController.java:16
import com.recruitment.app.modules.identity.infrastructure.security.JwtPrincipal;
// AccountSecurityController.java:10
import com.recruitment.app.modules.identity.infrastructure.security.JwtPrincipal;
```

**(b) `infrastructure` → `api`** — handler ở infrastructure import response DTO của tầng api:

```java
// GoogleOAuth2SuccessHandler.java:5
import com.recruitment.app.modules.identity.api.response.OAuthAuthorizationCodeResponse;
// dùng tại dòng 87
```

**Bằng chứng**

```bash
grep -rn "infrastructure\." src/main/java/com/recruitment/app/modules/identity/api/*.java
# AccountSecurityController.java:10:import ...infrastructure.security.JwtPrincipal;
# AuthController.java:16:import ...infrastructure.security.JwtPrincipal;

grep -rn "identity.api\." src/main/java/com/recruitment/app/modules/identity/infrastructure/
# GoogleOAuth2SuccessHandler.java:5:import ...identity.api.response.OAuthAuthorizationCodeResponse;
```

**Nguyên nhân gốc**
`ModuleArchitectureTests` chỉ có 2 rule hướng phụ thuộc:
- `applicationDoesNotDependOnInfrastructure` (dòng 70-75),
- `apiDoesNotDependDirectlyOnPersistenceEntities` (dòng 78-83, **chỉ** cấm `..infrastructure.persistence.entity..`).

Không có rule nào cấm `api → infrastructure` nói chung, và **không có rule nào** cấm `infrastructure → api`. Trớ trêu là `apiDoesNotDependDirectlyOnPersistenceEntities` chỉ cấm đúng một **package con** của infrastructure, nên `infrastructure.security` lọt qua.

**Ảnh hưởng**
- `docs/architecture/backend.md:82-92` và `overview.md:104-110` định nghĩa luồng `API → application → domain`, `infrastructure → domain/common`; **không** có cạnh `api → infrastructure` hay `infrastructure → api`. Code hiện vi phạm cả hai.
- `docs/adr/0003:20-21` tuyên bố *"ArchUnit must enforce layers and cycles beyond the existing entity reference test"* → tuyên bố này **chưa đúng**. Gate đang tạo cảm giác an toàn giả.
- Hệ quả thực tế: `JwtPrincipal` (một chi tiết infrastructure/servlet) bị ràng buộc vào chữ ký controller, và DTO của tầng api bị ràng buộc vào handler infrastructure → khó tách module, khó test, và khi tách service sẽ vướng.
- `implementation-backlog.md:38-39` ghi "ArchUnit 1.4.1 quality gates: ... api-persistence isolation" — đúng chữ nhưng hẹp hơn nhiều so với điều ADR yêu cầu.

**Cách sửa**
1. **Thêm rule mới** vào `ModuleArchitectureTests`:
   - `noClasses().that().resideInAPackage("..api..").should().dependOnClassesThat().resideInAPackage("..infrastructure..")`
   - `noClasses().that().resideInAPackage("..infrastructure..").should().dependOnClassesThat().resideInAPackage("..api..")`
2. **Sửa code để pass:**
   - Chuyển `JwtPrincipal` khỏi `infrastructure/security` sang `identity/application` (hoặc `identity/domain`) — nó là mô hình principal của ứng dụng, không phải chi tiết servlet. Giữ một adapter ở infrastructure map sang nó nếu cần.
   - Chuyển `OAuthAuthorizationCodeResponse` khỏi `api/response` sang `application` (hoặc để handler trả về một DTO ở `application`, còn controller/api map sang response riêng).
3. Thay `apiDoesNotDependDirectlyOnPersistenceEntities` bằng rule rộng hơn (api không được phụ thuộc **bất kỳ** package `infrastructure` nào) — rule hẹp hiện tại là một phần nguyên nhân của lỗ hổng này.

**Acceptance test**
- 2 rule mới pass trên codebase sau khi refactor.
- Thêm một fixture vi phạm cố ý để khẳng định rule thật sự fail khi có vi phạm (tránh rule "xanh giả" do viết sai cú pháp ArchUnit).
- Xóa `JwtPrincipal` khỏi package `infrastructure.security`; `grep -rn "infrastructure.security.JwtPrincipal" src/main/java/**/api/` → rỗng.

---

### BE-031 — Route `/api/v1/auth/oauth/link-google` được mở trong security config nhưng không có controller mapping

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã xác minh (grep toàn `src/main`)
- **File:** `src/main/java/com/recruitment/app/modules/identity/infrastructure/security/IdentitySecurityConfiguration.java:92-96`

**Hiện tượng**
Security config mở một route không tồn tại:

```java
// IdentitySecurityConfiguration.java:92-96
.requestMatchers(
        "/api/v1/auth/me",
        "/api/v1/auth/password/change",
        "/api/v1/auth/oauth/link-google"        // <-- không có @RequestMapping nào map path này
).authenticated()
```

`linkGoogleAccount` chỉ tồn tại ở tầng application và **không có controller nào gọi**:

```bash
grep -rn "link-google" src/main/java/
# chỉ: IdentitySecurityConfiguration.java:95

grep -rn "linkGoogleAccount" src/main/java/
# chỉ: IdentityAuthenticationService.java:133  (định nghĩa)
#      -> không có caller production
```

**Ảnh hưởng**
- Rule authorization cho một route không tồn tại → tài liệu/đọc code tưởng tính năng "link Google account" đã có. Client gọi sẽ nhận 404 (đã xác thực) hoặc 401 (ẩn danh), không phải thông báo "chưa hỗ trợ".
- Là một phần của cùng vấn đề với BE-003: luồng account linking chưa hoàn chỉnh nhưng đã có dấu vết trong security config và trong `implementation-backlog.md:56` (*"Google account linking uniqueness enforced with HTTP 409 conflict handling"*).
- Rủi ro bảo mật nhỏ: nếu sau này một controller vô tình map path này mà không review policy, nó sẽ **được authenticated() cho phép** nhưng thiếu kiểm tra ownership/conflict.

**Cách sửa**
- Nếu linking nằm trong MVP (G2): thêm controller method thật cho `/oauth/link-google` với policy rõ ràng (yêu cầu re-authentication, kiểm tra conflict 409), cùng OAuth callback riêng để lấy `GoogleIdentityProfile`.
- Nếu chưa: **xóa** dòng 95 khỏi security config và sửa `implementation-backlog.md:56` để không tuyên bố tính năng chưa giao.

**Acceptance test**
- `grep` khẳng định mọi path trong `requestMatchers` của `IdentitySecurityConfiguration` đều có controller mapping tương ứng (có thể viết thành test tự động đối chiếu với `RequestMappingHandlerMapping` — hữu ích và tái sử dụng được cho BE-012).
- Nếu xóa: `POST /api/v1/auth/oauth/link-google` → **401** (deny-all mặc định), không phải 404 sau khi đã xác thực.

---

### BE-032 — Toàn bộ 54 cột thời gian là `datetime` precision 0 trong khi entity map `Instant` → làm tròn tới ±0.5 giây

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã xác minh (đối chiếu `information_schema` + thử INSERT)
- **File:** `src/main/resources/db/migration/V002__…sql:5`; `V005__…sql:10`; `V003__…sql:23-24`; `V008__…sql:21-26`; `common/infrastructure/persistence/BaseEntity.java:30-36`

**Hiện tượng**
Mọi cột thời gian dùng `datetime` **không có fractional precision** (tức precision 0), nhưng entity map sang `java.time.Instant` là kiểu có độ phân giải nano giây.

```sql
-- V002:5
created_at         datetime              NOT NULL,
-- V002:157
withdrawn_at datetime NULL,
-- V005:10
ADD COLUMN processing_lease_expires_at datetime NULL,
```

**Bằng chứng (MySQL 8.4.11)** — MySQL **làm tròn** chứ không cắt:

```sql
INSERT ... VALUES ('2026-01-01 10:00:00.400');  -- lưu thành 2026-01-01 10:00:00
INSERT ... VALUES ('2026-01-01 10:00:00.600');  -- lưu thành 2026-01-01 10:00:01
```

**Ảnh hưởng**
- `refresh_tokens.expires_at`, `oauth_authorization_codes.expires_at`, `application_screenings.processing_lease_expires_at` có thể lệch tới **+0.5 giây** so với `Instant` dùng trong bộ nhớ để so sánh. Với token TTL ngắn (`GOOGLE_OAUTH_AUTHORIZATION_CODE_TTL=PT1M`) và lease 5 phút, sai số này nhỏ nhưng **không xác định** — nghĩa là biên của "hết hạn" không tất định, gây khó tái hiện bug race.
- `application_status_histories.created_at` mất thứ tự dưới giây, trong khi index sắp xếp là `idx_application_status_histories_application_created_at (job_application_id, created_at)` (`V002:307`) → nhiều bản ghi trong cùng một giây có thứ tự không xác định. Với một bảng **append-only** dùng để dựng lại lịch sử trạng thái, đây là mất mát thông tin thật.
- Hibernate `validate` **chấp nhận** `datetime`, nên sai lệch này im lặng — không có cảnh báo nào khi khởi động.

**Cách sửa**
1. Thêm migration `V009` chuyển các cột cần độ chính xác sang `datetime(6)` (hoặc `timestamp(6)`). Tối thiểu các cột sau **phải** có precision:
   - `refresh_tokens.expires_at`, `refresh_tokens.revoked_at`
   - `oauth_authorization_codes.expires_at`, `.consumed_at`
   - `password_reset_tokens.expires_at`, `.consumed_at`
   - `email_verification_tokens.expires_at`, `.consumed_at`
   - `application_screenings.processing_lease_expires_at`, `.evaluated_at`
   - `application_status_histories.created_at`
2. Cân nhắc dùng `timestamp(6)` thay `datetime(6)` để có ngữ nghĩa UTC tường minh ở tầng DB (hiện đang phụ thuộc `default-time-zone=+00:00` + `connectionTimeZone=UTC` của từng môi trường).
3. Ghi rõ trong `docs/database/README.md` rằng mốc thời gian lưu UTC với độ chính xác micro-giây.

**Acceptance test**
- `information_schema` khẳng định `DATETIME_PRECISION = 6` cho các cột trên.
- Test integration: lưu `Instant` có phần thập phân micro-giây → đọc lại khớp (không bị làm tròn).
- Test: hai `application_status_histories` trong cùng một giây giữ đúng thứ tự chèn.
- Hibernate `validate` vẫn pass.

---

### BE-033 — Không có log kỹ thuật kèm `requestId` ở bất kỳ handler lỗi nào; `IllegalStateException` rò ra body mặc định của Boot

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã xác minh (grep logger trên toàn `src/main`)
- **File:** `common/api/error/ApiExceptionHandler.java:13-35`; `modules/identity/api/IdentityApiExceptionHandler.java:22-72`; `common/api/context/RequestContext.java:12`; `common/infrastructure/persistence/…`; `JpaIdentityAccountStore.java:44`

**Hiện tượng**
`docs/architecture/conventions.md:25` yêu cầu: *"Log giữ request identifier và nguyên nhân kỹ thuật; không log password, token hay CV của ứng dụng."*

Thực tế:
- **Logger duy nhất trong toàn bộ `src/main` là `AdminBootstrapRunner.java:16`.** Không handler lỗi nào log gì.
- `RequestContext.requestId()` (`RequestContext.java:12`) chỉ được đọc bởi `ApiErrorResponse.java:12` để nhét vào response — **không bao giờ được ghi log**. Nghĩa là `requestId` trả cho client **không truy vết được** ngược lại log server.
- Lỗi không được handle sẽ rò ra body mặc định của Spring Boot, **không có `code`**:

```java
// JpaIdentityAccountStore.java:44
Role candidateRole = roles.findByCode("ROLE_CANDIDATE")
        .orElseThrow(() -> new IllegalStateException("Required candidate role is missing"));
```

`IllegalStateException` không có trong `@ExceptionHandler` nào → Boot trả body mặc định (`timestamp`/`status`/`error`/`path`) → vi phạm `conventions.md:23` (*"Mỗi lỗi API có mã lỗi ổn định"*).

Tương tự, `JpaIdentityAccountStore.java:82` và `:90` ném `IllegalArgumentException("User not found: " + userId)` → bị `ApiExceptionHandler.handleMalformedRequest` map thành **400 "The request is invalid."**, tức lỗi dữ liệu phía server bị báo cho client như lỗi request.

**Ảnh hưởng**
- **Không thể chẩn đoán sự cố production.** Client báo lỗi kèm `requestId`, nhưng log không chứa `requestId` → không tìm được gì. Đây là thiếu hụt vận hành nghiêm trọng đối với một hệ thống có yêu cầu audit (ADR 0003 G8: "stalled-work detection", `production-readiness.md`: "Centralized structured logs with PII redaction").
- Lỗi lập trình (role seed thiếu, user không tồn tại) bị che thành 400 hoặc body mặc định → mất tín hiệu cảnh báo.
- Không có log cũng nghĩa là không có bằng chứng khi điều tra sự cố bảo mật (ai gọi gì, thất bại vì sao).

**Cách sửa**
1. Thêm `private static final Logger log` vào cả hai advice. Ở mỗi handler:
   - log **WARN** cho lỗi client (400/401/403/409/415/429) với `requestId`, method, path, mã lỗi — **không** log body/PII/token;
   - log **ERROR** kèm stack trace cho 5xx và cho exception không nhận diện được.
2. Thêm handler fallback:
   ```java
   @ExceptionHandler(Exception.class)
   ResponseEntity<ApiErrorResponse> handleUnexpected(Exception e) {
       // log.error("requestId={} unexpected failure", RequestContext.requestId(), e);
       return ResponseEntity.status(500).body(ApiErrorResponse.of("INTERNAL_ERROR", "An unexpected error occurred."));
   }
   ```
   để mọi lỗi đều có `code` ổn định, không rò body mặc định của Boot.
3. Bổ sung MDC pattern vào cấu hình logging để `requestId` xuất hiện trong mọi dòng log (`RequestIdFilter` đã đặt MDC sẵn — chỉ cần pattern).
4. Rà lại: `IllegalStateException("Required candidate role is missing")` nên là lỗi khởi động (fail-fast khi seed thiếu) chứ không phải lỗi runtime 500.

**Acceptance test**
- Gây một lỗi 500 → log có dòng ERROR chứa **đúng** `requestId` trả về trong response header `X-Request-ID`.
- `POST` gây `IllegalStateException` → response **500 `INTERNAL_ERROR`** có `code`, không phải body mặc định của Boot.
- Log **không** chứa password, refresh token, access token hay nội dung CV (thêm assertion hoặc test bằng log appender).
- `logging.pattern` chứa `%X{requestId}`.

---

### BE-034 — Test rỗng và test không chạm nhánh cần kiểm chứng

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã xác minh (đọc code test)
- **File:** `src/test/java/com/recruitment/app/ApplicationTests.java:39-41`; `src/test/java/…/oauth/GoogleOAuth2SuccessHandlerTests.java:78-97`; `src/test/java/…/RoleEscalationAndGoogleLinkingTests.java:64-65`

**Hiện tượng**

1. **Test rỗng** — `contextLoads()` không assert gì:

```java
// ApplicationTests.java:39-41
@Test
void contextLoads() {
}
```

2. **Test không chạm nhánh cần kiểm chứng** — test được đặt tên `rejectsAnUnverifiedGoogleEmailWithoutProvisioningAnAccount`, nhưng request không có session/PKCE transaction nên `GoogleOAuth2SuccessHandler` ném lỗi **trước** khi tới nhánh unverified-email:

```java
// GoogleOAuth2SuccessHandler.java:64-66
if (transactionId == null || codeChallenge == null) {
    throw new OAuthIdentityException("OAuth session did not contain a PKCE transaction");
}
```

→ `verify(loginService, never()).complete(...)` **pass một cách tầm thường**; nhánh `IdentityAuthenticationService.java:118-120` (`if (!emailVerified) throw`) **không bao giờ được thực thi**. Test xanh nhưng không bảo vệ gì.

3. **Biến gán mà không dùng** — `RoleEscalationAndGoogleLinkingTests.java:64-65` gán `user1Tokens`/`user2Tokens` rồi không dùng.

**Ảnh hưởng**
- Coverage báo xanh nhưng lỗ hổng thật (nhánh unverified email, nhánh OAuth exchange, nhánh CORS) không được bảo vệ. Cụ thể các nhánh **không có test**: `GoogleOAuthClientConfiguration`, `GoogleOAuthCodeExchangeService`, `GoogleOAuth2FailureHandler`, `DiscardingOAuth2AuthorizedClientRepository`, nhánh `oauth2Login` của `IdentitySecurityConfiguration` (test không bao giờ set `app.security.oauth2.google.enabled`), và hành vi CORS của `common/security/CorsConfiguration`.
- `AuthController.exchangeGoogleAuthorizationCode` (`:74-81`) và nhánh 404 `OAUTH_NOT_CONFIGURED` (`IdentityApiExceptionHandler.java:41-47`) **không có test** — tôi đã test thủ công và nó đúng, nhưng không có gì chặn hồi quy.
- Test có tên mô tả hành vi không được kiểm chứng là **nguy hiểm hơn** không có test: người đọc tin rằng nhánh đó đã được bảo vệ.

**Cách sửa**
1. Sửa `GoogleOAuth2SuccessHandlerTests`: dựng request **có** session + `CALLBACK_TRANSACTION_ID` attribute hợp lệ để luồng thật sự tới nhánh unverified-email; assert `loginService.complete` không được gọi **và** `IdentityAuthenticationService.resolveGoogleAccount` ném đúng exception.
2. `contextLoads()`: assert ít nhất rằng context khởi động và `OpenApiController` bean tồn tại, hoặc xóa test (đã có `ApplicationTests.exposesHealthAndOpenApiSpecificationWithoutAuthentication` làm việc thật).
3. Thêm test cho `oauth/exchange` (thành công, sai verifier, code hết hạn, code dùng lại) và cho nhánh OAuth disabled → 404 `OAUTH_NOT_CONFIGURED`.
4. Thêm test CORS: origin được allow → có `Access-Control-Allow-Origin`; origin lạ → **403**; preflight `OPTIONS` trả đúng header.
5. Xóa biến không dùng; bật `-Werror` cho unused local nếu muốn chặn tái diễn.

**Acceptance test**
- Test `rejectsAnUnverifiedGoogleEmail…` **fail** nếu nhánh `!emailVerified` bị xóa (kiểm chứng bằng mutation test thủ công).
- Có test cho `/oauth/exchange` (4 kịch bản) và cho CORS (3 kịch bản).
- Không còn test với thân rỗng.

---

### BE-035 — Trùng lặp logic bảo mật/token: SHA-256 encode khác nhau, 6 `SecureRandom`, regex `{43}` xuất hiện ≥8 nơi

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã xác minh (grep + đọc code)
- **File:** `EmailVerificationService.java:88-99`; `PasswordManagementService.java:127-138`; `OAuthAuthorizationCodeService.java:59-61`, `:101-113`, `:143-155`; `TokenSessionService.java:26`, `:153-170`; `IdentityAuthenticationService.java:158-162`; `JpaApplicationScreeningStore.java:157-161`; `PkceGoogleAuthorizationRequestFilter.java:48`, `:71`, `:104`, `:125`; `OAuthCodeExchangeRequest.java:8`, `:14`

**Hiện tượng**

1. **SHA-256 được viết lại 3 lần**, và **hai class dùng hai encoding khác nhau cho cùng khái niệm "hash token"**:
   - hex (lowercase): `EmailVerificationService:88-99`, `PasswordManagementService:127-138`, `OAuthAuthorizationCodeService:101-113`
   - base64url: `TokenSessionService:159-170`
   - base64url cho PKCE challenge: `OAuthAuthorizationCodeService:143-155`

2. **Sinh token ngẫu nhiên lặp 6 lần**, mỗi lần một `SecureRandom` riêng: `IdentityAuthenticationService:158-162`, `TokenSessionService:153-157`, `OAuthAuthorizationCodeService:59-61`, `PasswordManagementService:121-125`, `EmailVerificationService:82-86`, `JpaApplicationScreeningStore:157-161`.

3. **Regex định dạng token `[A-Za-z0-9_-]{43}` lặp ≥8 nơi**, gồm cả DTO validation: `OAuthCodeExchangeRequest:8,14`, `OAuthAuthorizationCodeService:102,116,123,130`, `OAuthAuthorizationCode:63,66`, `PkceGoogleAuthorizationRequestFilter:48,71,104,125`, `TokenSessionService:26`.

4. **Hai bộ port/store/snapshot gần như trùng khít**: `JpaPasswordResetStore` vs `JpaEmailVerificationStore` (`saveToken`/`lockToken`/`consumeToken`/`toSnapshot` chỉ khác kiểu), và `PasswordResetToken`/`EmailVerificationToken` entity.

**Ảnh hưởng**
- **Rủi ro lệch hành vi:** chính vì regex `{43}` được copy 8 nơi, BE-023 (transactionId 43 vs tài liệu "ít nhất 32 byte") mới khó sửa — sửa một chỗ sẽ tạo ra không nhất quán. Tôi đã kiểm tra và hiện tại **chúng khớp nhau**, nhưng không có gì bảo đảm điều đó (không có hằng số dùng chung).
- Encoding khác nhau cho cùng khái niệm (hex vs base64url) làm tăng khả năng so sánh sai khi thêm luồng mới — ví dụ một store ghi hex nhưng store khác đọc base64url sẽ luôn "không tìm thấy token" mà không có lỗi biên dịch.
- 6 instance `SecureRandom` riêng: không sai về bảo mật, nhưng lặp code không cần thiết.
- Vi phạm `docs/architecture/conventions.md:11` (*"Không dùng hậu tố mơ hồ như Helper, Util, Manager nếu trách nhiệm chưa được nêu rõ"*) theo tinh thần: đây chính là loại logic cần một component có tên và chủ sở hữu rõ ràng.

**Cách sửa**
1. Tạo một component duy nhất, ví dụ `application/TokenDigest` (hoặc `domain/TokenMaterial`):
   - `String sha256Hex(String)` và `String sha256Base64Url(String)` — tường minh, có tài liệu nói khi nào dùng loại nào;
   - `String newOpaqueToken()` (32 byte, base64url, không padding);
   - `public static final String OPAQUE_TOKEN_PATTERN = "[A-Za-z0-9_-]{43}"` và một `Pattern` dùng chung;
   - một `SecureRandom` duy nhất.
2. Thay toàn bộ 3 bản SHA-256 hex, bản base64url, và 6 chỗ sinh token bằng component này.
3. Thêm ArchUnit rule hoặc test khẳng định **không** file nào ngoài `TokenDigest` dùng `MessageDigest.getInstance("SHA-256")`.
4. Gộp `JpaPasswordResetStore`/`JpaEmailVerificationStore` thành một generic store nếu việc này không làm mất ngữ nghĩa (hoặc chấp nhận trùng lặp có chủ đích và ghi rõ lý do).

**Acceptance test**
- `grep -rn 'MessageDigest.getInstance' src/main` chỉ còn trong `TokenDigest`.
- Mọi chỗ dùng regex định dạng token đều tham chiếu hằng số dùng chung.
- Test khẳng định `sha256Hex` và `sha256Base64Url` cho cùng input khớp với vector kiểm thử đã biết.

---

### BE-036 — Tài liệu migration và schema lỗi thời

- **Mức độ:** P3 — Low
- **Trạng thái xác minh:** ✅ Đã xác minh (đối chiếu file + git)
- **File:** `docs/database/schema.md:5-10`, `:16`; `docs/database/README.md:13-18`; `docs/architecture/overview.md:139-147`

**Hiện tượng**

| Vị trí | Nội dung sai | Thực tế |
| :--- | :--- | :--- |
| `docs/database/schema.md:5-10` | chỉ liệt kê V001–V006 | có **V001–V008**; thiếu V007 (đổi `created_by_member_id` thành NULLABLE — chính là BE-028) và V008 (`credential_version`, `email_verified`, `email_verification_tokens`) |
| `docs/database/README.md:13-18` | `Migration hiện có:` chỉ V001, V002 | có 8 migration |
| `docs/architecture/overview.md:145-146` | cây `db/migration/` chỉ V001, V002 | có 8 migration |
| `docs/architecture/overview.md:143` | `application-test.yml` nằm trong `src/main/resources/` | thực tế ở `src/test/resources/application-test.yml` |
| `docs/database/schema.md:16` | cross-module list chỉ có `created_by_member_id, company_id` | thiếu `created_by_user_id` (V007:4,15,21) — nay là reference **bắt buộc** tới `users` |
| `docs/architecture/overview.md:70` | cây repository không có `frontend/` | `frontend/` đã tồn tại |

**Ảnh hưởng**
- Vi phạm quy tắc của chính dự án: `docs/README.md:20` — *"Không ghi API, database table hoặc workflow như thể đã tồn tại nếu chúng mới chỉ là kế hoạch"* (ở đây là chiều ngược: có thật nhưng không ghi). Và `docs/README.md:24-25` yêu cầu thay đổi database phải cập nhật `docs/database/` trong cùng PR — V007/V008 đã không làm.
- **Nghiêm trọng hơn tác động của một lỗi tài liệu thông thường:** vì V007 không được ghi lại, thay đổi nullability phá vỡ invariant (BE-028) đã không bị ai review ở tầng tài liệu.
- Người mới đọc `overview.md` sẽ tìm file sai đường dẫn và tin rằng schema chỉ có 2 bảng migration.

**Cách sửa**
1. Cập nhật `docs/database/schema.md`, `docs/database/README.md`, `docs/architecture/overview.md` liệt kê đủ V001–V008 (và V009 khi thêm) kèm mô tả ngắn từng migration.
2. Sửa đường dẫn `application-test.yml` → `src/test/resources/`.
3. Bổ sung `created_by_user_id` vào mục Cross-module references của `schema.md`, kèm ghi chú hệ quả lên FK compound (liên kết BE-028).
4. Thêm `frontend/` vào cây repository trong `overview.md`.
5. Thêm bước kiểm tra vào PR template/CI: nếu có file mới trong `db/migration/` mà `docs/database/` không đổi trong cùng PR → cảnh báo.

**Acceptance test**
- Số file trong `src/main/resources/db/migration/` == số migration được liệt kê trong `docs/database/schema.md`.
- `grep -rn "application-test.yml" docs/` trỏ đúng `src/test/resources/`.
- `schema.md` liệt kê `created_by_user_id`.

---

### BE-037 — Nợ schema: index trùng prefix, index không dùng, không CHECK cho enum/varchar, không `ON DELETE`, charset không được pin

- **Mức độ:** P3 — Low (tổng hợp; nên tách PR nhỏ theo từng nhóm)
- **Trạng thái xác minh:** ✅ Đã xác minh (đối chiếu `information_schema` + đọc toàn bộ `@Query`)
- **File:** `V002__…sql:305`, `:307`, `:333`, `:255`, `:372`, `:379`, `:8`, `:10`, `:63`, `:110`, `:141`, `:187`, `:191`; `V003__…sql:43`, `:32`, `:8`, `:45`; `V005__…sql:12-13`; `V008__…sql:36-37`; `V001:1`; `V002:1`

**Hiện tượng và ảnh hưởng**

| # | Nhóm | Chi tiết | Ảnh hưởng |
| :--- | :--- | :--- | :--- |
| 1 | **Index trùng prefix** | `idx_application_status_histories_application_id` (`V002:305`) trùng prefix của `idx_…_application_created_at (job_application_id, created_at)` (`V002:307`); `idx_candidate_skills_profile_id` (`V002:333`) trùng prefix của `uk_candidate_skills_profile_skill (candidate_profile_id, skill_id)` (`V002:255`); `idx_user_oauth_identities_user_id` (`V003:43`) trùng prefix của `uk_user_oauth_identities_user_provider (user_id, provider)` (`V003:32`) | Tốn dung lượng và làm chậm ghi; trái `docs/database/README.md:29` ("không index theo thói quen"). **Đã kiểm chứng MySQL không tự tạo index FK dư**, nên chỉ 3 index này là dư |
| 2 | **Index không query nào dùng** | `password_reset_tokens.expires_at` (`V002:372`), `refresh_tokens.expires_at` (`V002:379`), `oauth_authorization_codes.expires_at` (`V003:45`), `email_verification_tokens.expires_at`/`.user_id` (`V008:36-37`), `application_screenings (status, processing_lease_expires_at)` (`V005:12-13`) | Đã rà **toàn bộ** `@Query` trong `src/main`: chỉ lọc theo `token_hash`, `code_hash`, `provider+provider_subject`, `user.id`, `active`, `credentialVersion`; claim screening lock theo PK. Không có `@Scheduled` cleanup. → Có thể là **dự phòng cho G8 purge** (`implementation-backlog.md:16`), nên **không nhất thiết là sai** — cần ghi rõ lý do tồn tại |
| 3 | **Không CHECK cho cột enum/format** | 11 CHECK hiện có chỉ là numeric/date/score. Không có CHECK cho `status VARCHAR(20)` (`V002:8`), `recommendation` (`:10`), `employment_type` (`:63`), `proficiency_level` (`:110`), `role` (`:141`), `workplace_type` (`:187`), `provider` (`V003:8`), `salary_currency VARCHAR(3)` (`V002:191`), `roles.code`, `application_screenings.failure_code` | DB chấp nhận chuỗi enum sai; lỗi chỉ lộ khi Hibernate convert enum lúc **load** (xa nguồn gốc). Trái tinh thần ADR 0002 ("invariants ở DB"). `salary_currency` đã được validate ở entity (`Job.java:202-204`) nhưng không ở DB |
| 4 | **Không FK nào khai `ON DELETE`** | `grep -n 'ON DELETE\|ON UPDATE' src/main/resources/db/migration/` → **rỗng**; có **27 FK**, tất cả mặc định `RESTRICT` | ADR 0003:37-39 yêu cầu purge retention bền vững (G8); hiện chưa có đường xóa nào. Khi làm G8, xóa parent sẽ fail cho tới khi xóa đúng thứ tự con → **cần quyết định chiến lược xóa trước khi G8**, không phải phát hiện lúc runtime. Không có rủi ro orphan hôm nay (RESTRICT ngăn orphan) |
| 5 | **Charset/collation không được pin** | `V001:1`, `V002:1` `CREATE TABLE` không có mệnh đề charset. Schema live chỉ có `utf8mb4_0900_ai_ci` nhờ cấu hình server. CI pin `utf8mb4_0900_ai_ci` (`ApplicationTests.java:31-32`), compose local pin `utf8mb4_unicode_ci` (`compose.local.yml:14`), production cấu hình ngoài repo | Ngữ nghĩa so sánh case/accent của `uk_users_email`, `uk_companies_slug`, `uk_skills_name` **khác nhau giữa dev và CI** → bug chỉ xuất hiện ở một môi trường. Nếu server default không phải utf8mb4, dữ liệu non-UTF8 bị lưu im lặng, trái `docs/database/README.md:28` |

**Cách sửa**
1. **Index:** migration `V009` drop 3 index trùng prefix (mục 1). Với mục 2, hoặc ghi comment trong migration giải thích index dành cho G8 purge, hoặc drop — đừng để "index không rõ lý do".
2. **CHECK cho enum/format:** thêm CHECK cho các cột enum (`status`, `recommendation`, `employment_type`, `workplace_type`, `proficiency_level`, `role`, `provider`) theo đúng tập giá trị của enum Java hiện tại, và `salary_currency REGEXP '^[A-Z]{3}$'`.
3. **`ON DELETE`:** quyết định và ghi vào ADR trước G8 (ví dụ: `CASCADE` cho dữ liệu con của application, `RESTRICT` cho users/companies là chủ thể pháp lý). Không nên để mặc định mà không có quyết định.
4. **Charset:** thêm `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci` tường minh vào `CREATE TABLE` của migration mới, và **thống nhất** collation giữa CI và compose local (hiện đang lệch `0900_ai_ci` vs `unicode_ci`).

**Acceptance test**
- Không còn index có tên trùng prefix của index/unique key khác (có thể kiểm bằng query `information_schema.STATISTICS`).
- INSERT một enum value sai → **bị DB từ chối**, không phải lỗi lúc load.
- CI và compose local dùng **cùng** collation.
- Có ADR ghi quyết định `ON DELETE` cho từng nhóm FK.

---

### BE-038 — `pom.xml` thừa dependency/metadata và `scripts/` chứa 15 file không liên quan

- **Mức độ:** P3 — Low
- **Trạng thái xác minh:** ✅ Đã xác minh (đọc `pom.xml` + liệt kê `scripts/`)
- **File:** `pom.xml:53-68`, `:14-28`; `scripts/`

**Hiện tượng**

1. **Dependency thừa:**
   - `spring-boot-starter-json` (`pom.xml:53-56`) là **transitive** qua `spring-boot-starter-webmvc` → `spring-boot-starter-jackson` → `spring-boot-jackson`. Khai báo tường minh là dư.
   - `spring-boot-starter-security-oauth2-resource-server` (`pom.xml:65-68`) **không được dùng**: không có import `org.springframework.security.oauth2.server.resource.*`, không gọi `oauth2ResourceServer()`, không có cấu hình `spring.security.oauth2.resourceserver.*`. Các class JOSE thực dùng đến từ `spring-boot-starter-security-oauth2-client`. (`JwtDecoder`/`NimbusJwtDecoder` là của `spring-security-oauth2-jose`, kéo theo bởi oauth2-client.)

2. **Metadata Initializr rỗng:** `<name/>`, `<description/>`, `<url/>`, `<licenses><license/></licenses>`, `<developers><developer/></developers>`, `<scm>` với 4 element rỗng (`pom.xml:14-28`).

3. **`scripts/` chứa 15 file Python không liên quan hỗ trợ local/CI:** `fill_pareto_docx.py`, `generate_qlda_work.py`, `generate_full_qlda_work.py`, `generate_pareto_excel.py`, `make_all_gemini.py`, `patch_helper.py`, `patch_table.py`, `fix_script.py`, `update_budget.py`, `update_to_gemini.py`, `upgrade_to_gemini_pro.py`, `add_pareto_section.py`, … — đây là script sinh tài liệu/báo cáo, không phải script hạ tầng.

**Ảnh hưởng**
- Dependency thừa làm tăng bề mặt tấn công và thời gian build; `oauth2-resource-server` khai báo nhưng không dùng gây hiểu nhầm về mô hình bảo mật (tưởng có resource-server validation trong khi thực tế dùng filter tự viết).
- Metadata rỗng làm `mvn` warning và thiếu thông tin khi publish.
- `scripts/` trái `docs/architecture/overview.md:56-57` (*"scripts/ # Script hỗ trợ local/CI, không có secret"*) và tinh thần `backend.md:47` (không có "dumping ground"). Dev mới sẽ không biết script nào dùng được cho việc gì.

**Cách sửa**
1. Xóa `spring-boot-starter-json`. Sau khi xóa, chạy `clean verify` để khẳng định không có compile error.
2. **Hoặc** xóa `spring-boot-starter-security-oauth2-resource-server`, **hoặc** dùng nó thật (chuyển `JwtAuthenticationFilter` tự viết sang `oauth2ResourceServer().jwt(...)`) — nhưng đó là thay đổi kiến trúc cần ADR. Trước mắt: nếu không dùng, xóa và ghi chú.
3. Điền metadata: `<name>`, `<description>`, `<url>`; xóa `<licenses>`/`<developers>`/`<scm>` rỗng nếu không có nội dung thật.
4. Chuyển 15 file Python sang `docs/tools/` hoặc `tools/` (không nằm trong thư mục hạ tầng), và cập nhật `docs/architecture/overview.md:56-57` cho khớp.

**Acceptance test**
- `./mvnw -B -ntp clean verify` pass sau khi xóa dependency thừa.
- `mvn help:effective-pom` không còn dependency trùng lặp không cần thiết.
- `scripts/` chỉ còn script local/CI (`run-local.sh`, `verify.sh`, `docker-*.sh`, `check-env.sh`, `generate-local-jwt-keys.sh`, `lib/`).
- `docs/architecture/overview.md` mô tả đúng nội dung `scripts/`.

---

## 5c. CASE MỚI PHÁT HIỆN Ở VÒNG 2 (sau khi fix)

> 10 case dưới đây **không tồn tại ở vòng 1**. Chúng hoặc do fix tạo ra (BE-039 → BE-043), hoặc là case gốc chưa được xử lý thật (BE-044 → BE-046), hoặc là drift mới trong tài liệu (BE-047, BE-048).

### BE-039 — V009 FAIL trên database không rỗng: ứng dụng không khởi động được khi upgrade

- **Mức độ:** P0 — Blocker (chặn triển khai)
- **Trạng thái xác minh:** ✅ Đã tái hiện (`ERROR 1452` trên MySQL 8.4.11)
- **File:** `src/main/resources/db/migration/V009__harden_schema_integrity_and_precision.sql:26-36`; `src/test/java/com/recruitment/app/SchemaMigrationUpgradeTests.java:138-146`

**Hiện tượng**
V009 khôi phục invariant của BE-028 bằng một FK compound mới, nhưng **không kiểm tra/backfill dữ liệu hiện có trước khi thêm constraint**:

```sql
-- V009, bước 4
ALTER TABLE jobs DROP FOREIGN KEY FK_JOBS_CREATED_BY_MEMBER_COMPANY;
ALTER TABLE jobs DROP COLUMN created_by_member_id;
ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_created_by_user_company
    FOREIGN KEY (company_id, created_by_user_id) REFERENCES company_members (company_id, user_id);
```

Dữ liệu **hoàn toàn hợp lệ theo schema V007/V008** vẫn có thể vi phạm FK mới, vì V007 đã làm `created_by_member_id` **NULLABLE** và chỉ ràng buộc `created_by_user_id → users(id)` — **không** ràng buộc user đó thuộc `company_id` của job.

**Bằng chứng (tái hiện đầy đủ)**
Áp V001→V008 theo thứ tự lên MySQL 8.4.11, seed dữ liệu hợp lệ theo V008, rồi chạy đúng 3 câu lệnh của bước 4:

```sql
-- user 1001 là member của company 2002, KHÔNG thuộc company 2001
INSERT INTO jobs (id,version,created_at,updated_at,company_id,created_by_user_id,
                  created_by_member_id,title,slug,description,employment_type,
                  workplace_type,salary_currency,status,headcount)
VALUES (4001,0,NOW(),NOW(),2001,1001,NULL,'Job X','job-x','d','FULL_TIME','REMOTE','USD','DRAFT',1);
-- INSERT thành công: schema V008 cho phép (created_by_member_id NULL, user 1001 tồn tại)
```
```text
ERROR 1452 (23000) at line 4: Cannot add or update a child row: a foreign key constraint fails
(`v009test`.`#sql-1_13`, CONSTRAINT `fk_jobs_created_by_user_company`
 FOREIGN KEY (`company_id`, `created_by_user_id`) REFERENCES `company_members` (`company_id`, `user_id`))
```

**Không test nào phủ tình huống này:**

| Test | Phạm vi | Có phủ V009 + dữ liệu? |
| :--- | :--- | :--- |
| `verifiesEmptyDatabaseMigrationUpToLatest` | DB **rỗng** → V009 | ❌ DB rỗng không thể lộ vi phạm FK |
| `verifiesUpgradeFromV006ToV007WithDataBackfill` | V006 → V007 → **V008 rồi DỪNG** | ❌ **không bao giờ chạy V009** |

```java
// SchemaMigrationUpgradeTests.java:139-146 — target("008") và assert "008"
Flyway flywayV8 = Flyway.configure()...target("008")...load();
flywayV8.migrate();
assertEquals("008", flywayV8.info().current().getVersion().getVersion());
// hết test — V009 không được chạy với dữ liệu
```

**Ảnh hưởng**
- Trên bất kỳ môi trường nào đã chạy V007/V008 **và có job row được tạo trong cửa sổ đó** (kể cả dữ liệu seed thủ công, script demo, hoặc job do G4 tạo sớm), Flyway sẽ **fail** ⇒ Spring Boot **không khởi động** ⇒ downtime cho tới khi có người sửa dữ liệu bằng tay.
- Đây là dạng lỗi tệ nhất của migration: chỉ lộ ra ở môi trường **có dữ liệu**, không lộ trong CI (DB rỗng) → **CI xanh nhưng deploy đỏ**.
- Bản thân V007 cũng có phần sai: `SET j.created_by_user_id = j.created_by_member_id WHERE created_by_user_id IS NULL` (V007:11) gán `company_members.id` vào cột FK tới `users(id)` — chính là nguồn dữ liệu không thoả FK mới.

**Cách sửa**
1. **Backfill trước, rồi mới thêm constraint** — thêm bước vào V009 (hoặc `V010` nếu V009 đã chạy ở đâu đó):
   ```sql
   -- Gán lại creator về một member hợp lệ của chính company đó (ví dụ OWNER đầu tiên),
   -- và ghi nhận các dòng đã bị sửa để audit.
   UPDATE jobs j
   JOIN company_members cm ON cm.company_id = j.company_id
   SET j.created_by_user_id = cm.user_id
   WHERE NOT EXISTS (
       SELECT 1 FROM company_members m
       WHERE m.company_id = j.company_id AND m.user_id = j.created_by_user_id
   );
   ```
   Nếu **không** tìm được member hợp lệ nào cho một company, **fail migration với thông báo rõ ràng** (kèm danh sách `jobs.id`) thay vì để MySQL báo `ERROR 1452` khó hiểu.
2. **Bổ sung test upgrade có dữ liệu đi hết V009** — mở rộng `verifiesUpgradeFromV006ToV007WithDataBackfill` tới **`target("009")`** và seed thêm một job row "xấu" (creator ngoài company) để khẳng định migration **tự sửa được** thay vì crash.
3. Cân nhắc thêm test thứ ba: V008 → V009 với job do V008 tạo (`created_by_member_id = NULL`, creator ngoài company) ⇒ phải upgrade thành công.

**Acceptance test**
- Test `V006 → V009 có dữ liệu` (gồm 1 job có creator ngoài company) → Flyway **migrate thành công**, và `jobs.created_by_user_id` sau migration **thuộc** `company_members` của `company_id`.
- `SELECT COUNT(*) FROM jobs j WHERE NOT EXISTS (SELECT 1 FROM company_members m WHERE m.company_id=j.company_id AND m.user_id=j.created_by_user_id)` → **0** sau khi migrate.
- Test khẳng định không có job row nào bị mất trong quá trình migration.

---

### BE-040 — Catch-all `@ExceptionHandler(Exception.class)` biến 405 và 415 thành 500 và spam ERROR log

- **Mức độ:** P0 — Blocker (sai hợp đồng lỗi trên mọi endpoint)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/common/api/error/ApiExceptionHandler.java:73-81`

**Hiện tượng**
Handler fallback `@ExceptionHandler(Exception.class)` (thêm để sửa BE-033) **lấn át các exception chuẩn của Spring MVC** mà `DefaultHandlerExceptionResolver` lẽ ra map thành 405/415/406:

```java
@ExceptionHandler(Exception.class)
ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
    log.error("Unhandled unexpected exception: requestId={}", RequestContext.requestId(), exception);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponse.of(
            "INTERNAL_ERROR", "An unexpected internal error occurred."));
}
```

**Bằng chứng (smoke test trên app thật)**

| Request | Trước fix (vòng 1) | Sau fix (vòng 2) |
| :--- | :--- | :--- |
| `GET /api/v1/auth/login` | **405** | **500 `INTERNAL_ERROR`** ❌ |
| `PUT /api/v1/auth/login` | **405** | **500 `INTERNAL_ERROR`** ❌ |
| `POST /api/v1/auth/login` + `Content-Type: text/plain` | **415** | **500 `INTERNAL_ERROR`** ❌ |
| `POST /api/v1/auth/login` + `form-urlencoded` | **415** | **500 `INTERNAL_ERROR`** ❌ |
| `POST /api/v1/auth/login` không body | 400 | 400 ✅ (không đổi) |

Và log bị spam ERROR + stack trace cho **lỗi phía client**:

```text
ERROR c.r.a.c.api.error.ApiExceptionHandler : Unhandled unexpected exception: requestId=3e0a1846-...
org.springframework.web.HttpRequestMethodNotSupportedException: Request method 'GET' is not supported
	at org.springframework.web.servlet.mvc.method.RequestMappingInfoHandlerMapping.handleNoMatch(...)
```

**Nguyên nhân gốc**
`@ExceptionHandler(Exception.class)` trong `@RestControllerAdvice` khớp **mọi** exception, kể cả `org.springframework.web.ErrorResponseException` (cha của `HttpRequestMethodNotSupportedException`, `HttpMediaTypeNotSupportedException`, `HttpMediaTypeNotAcceptableException`). Vì đã có `@ExceptionHandler` khớp, Spring **không** chạy `DefaultHandlerExceptionResolver` nữa → các status 405/415 bị mất.

**Ảnh hưởng**
1. **Sai mã lỗi**: client và monitoring nhận `500 INTERNAL_ERROR` cho lỗi do chính client gây ra. Trang thái 405/415 là thông tin cần thiết cho client tự sửa; 500 khiến họ tưởng server hỏng.
2. **Alert fatigue / che lỗi thật**: mỗi lần scanner/probe gửi sai method hoặc sai content-type đều sinh một dòng `ERROR` kèm stack trace. 500 thật sẽ chìm trong nhiễu, và `log.error` mất giá trị cảnh báo.
3. Vi phạm `docs/architecture/conventions.md:23` (*"Mỗi lỗi API có mã lỗi ổn định, thông điệp an toàn và HTTP status phù hợp"*) — 405/415 không còn mã lỗi riêng.
4. Có thể ảnh hưởng cả 406 (`HttpMediaTypeNotAcceptableException`) và 404 của `NoResourceFoundException` nếu đường dẫn đó không bị security chặn trước.

**Cách sửa (chọn 1)**
- **Cách 1 (khuyến nghị):** cho `ApiExceptionHandler` **kế thừa `ResponseEntityExceptionHandler`** và override `handleExceptionInternal`, hoặc thêm `@ExceptionHandler(ErrorResponseException.class)` chuyển tiếp đúng `exception.getStatusCode()` trước fallback. `ErrorResponseException` là cha chung nên chỉ cần 1 handler.
- **Cách 2:** loại trừ tường minh trong fallback:
  ```java
  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
      if (exception instanceof org.springframework.web.ErrorResponse er) {
          return ResponseEntity.status(er.getStatusCode()).body(ApiErrorResponse.of(
                  "REQUEST_REJECTED", "The request could not be processed."));
      }
      log.error("Unhandled unexpected exception: requestId={}", RequestContext.requestId(), exception);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponse.of(
              "INTERNAL_ERROR", "An unexpected internal error occurred."));
  }
  ```
- **Bổ sung bắt buộc:** đổi mức log cho lỗi 4xx thành `warn` **không kèm stack trace**; chỉ `log.error` + stack trace cho 5xx thật.

**Acceptance test**
- `GET`/`PUT /api/v1/auth/login` → **405**, không phải 500.
- `POST /api/v1/auth/login` với `text/plain` và `form-urlencoded` → **415**.
- `Accept: application/xml` trên endpoint JSON → **406**.
- Log cho 405/415 ở mức **WARN** và **không có stack trace**; log 5xx thật ở mức ERROR có stack trace.
- Test `MockMvc` khẳng định 405/415 cho ít nhất một endpoint.

---

### BE-041 — `X-Forwarded-For` không kiểm tra tin cậy: bypass throttle hoàn toàn và khóa được IP tuỳ chọn

- **Mức độ:** P1 — High (vô hiệu hoá brute-force protection + DoS có mục tiêu)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/application/AuthenticationThrottlingService.java:177-188`

**Hiện tượng**
Khoá throttle theo IP lấy trực tiếp từ header do client gửi, không kiểm tra có proxy tin cậy phía trước hay không:

```java
private static String currentClientIp() {
    RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
    if (attrs instanceof ServletRequestAttributes servletAttrs) {
        HttpServletRequest request = servletAttrs.getRequest();
        String forwarded = request.getHeader("X-Forwarded-For");   // <- đầu vào không tin cậy
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].strip();
        }
        return request.getRemoteAddr();
    }
    return null;
}
```

Cấu hình hiện tại **không** đứng sau proxy tin cậy: `.env` đặt `SERVER_FORWARD_HEADERS_STRATEGY=none`, và `docs/runbooks/production-readiness.md:12` ghi rõ chỉ đặt `framework` khi có proxy tin cậy loại bỏ header do client gửi.

**Bằng chứng**

```text
### (c1) XFF CỐ ĐỊNH -> pair throttle hoạt động
401 401 401 401 401 429 429        <- 429 ở lần 6 ✅

### (c2) XFF XOAY VÒNG, cùng 1 email -> BYPASS hoàn toàn
401 ×14 (không có 429)              <- pair throttle + ip throttle bị vô hiệu

### (c3) Spoof XFF của NGƯỜI KHÁC -> khóa IP đó
50 request reset-request với XFF=192.0.2.77 (không cần xác thực)
sau đó login (đúng thông tin) với XFF=192.0.2.77:
429 {"code":"TOO_MANY_REQUESTS", ...}
```

**Ảnh hưởng**
1. **Bypass brute-force protection bằng 1 header**: kẻ tấn công xoay `X-Forwarded-For` mỗi request → chỉ còn ngưỡng `account:` = **25 lần / 15 phút** thay vì 5. Đây là **nới lỏng 5×** so với thiết kế, đạt được bằng một dòng code.
2. **Password spraying hiệu quả trở lại**: mỗi account 1 lần thử, XFF ngẫu nhiên → không chạm ngưỡng nào.
3. **DoS có mục tiêu vào IP tuỳ chọn (mới)**: kẻ tấn công gửi 50 request ẩn danh với `X-Forwarded-For: <IP nạn nhân>` → mọi người dùng thật sau IP đó (NAT công ty, trường học, mạng di động) **bị khoá đăng nhập 15 phút**. Trước vòng 2, không có khả năng này.
4. Việc này làm **vô hiệu** tuyên bố trong `docs/api/README.md` rằng endpoint nhạy cảm được bảo vệ bởi rate limiting.

**Cách sửa**
1. **Chỉ tin `X-Forwarded-For` khi được cấu hình tường minh.** Thêm property `app.security.client-ip.trust-forwarded-header` (mặc định `false`) và/hoặc chỉ đọc header khi `server.forward-headers-strategy=framework`. Khi không tin cậy → dùng `request.getRemoteAddr()`.
2. Nếu cần tin cậy, dùng **danh sách proxy tin cậy** (CIDR) và lấy IP **ngoài cùng bên phải** trong chuỗi XFF (phần do proxy gần nhất thêm), không lấy phần đầu tiên do client kiểm soát.
3. Ghi lại quyết định này vào ADR/runbook vì nó gắn với mô hình triển khai (Nginx trên EC2 — cần cấu hình `proxy_set_header X-Forwarded-For` và strip header từ client).
4. Bổ sung test: với `trust-forwarded-header=false`, XFF xoay vòng **không** bypass được (429 ở lần 6).

**Acceptance test**
- Xoay `X-Forwarded-For` khi không cấu hình tin cậy → vẫn **429 ở lần thử thứ 6** cho cùng email.
- Bật `trust-forwarded-header=true` + XFF cố định → throttle theo IP hoạt động (429).
- Test khẳng định IP lấy từ `getRemoteAddr()` khi header không được tin cậy.

---

### BE-042 — Reset/verify dùng chung key throttle `ip:` với login → khoá đăng nhập toàn bộ một IP từ endpoint ẩn danh

- **Mức độ:** P1 — High (DoS chéo chức năng, không cần xác thực)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/api/AccountSecurityController.java:55`, `:75`; `AuthenticationThrottlingService.java:103-113`, `:164-175`

**Hiện tượng**
`recordFailure(ip, email)` ghi **cùng một key `ip:<ip>`** cho mọi luồng gọi nó. `reset-request` và `verify-email` đều gọi `recordFailure` với key tổng hợp (`"reset:<email>"`, `"verify:<token>"`) nhưng **phần `ip:` là chung** với login:

```java
// AccountSecurityController.java:55
throttling.checkThrottled("reset:" + request.email());
passwordManagement.requestPasswordReset(request.email());
throttling.recordFailure("reset:" + request.email());   // -> tăng "ip:<ip>" dùng chung với login

// AuthenticationThrottlingService.java:103-113
public void recordFailure(String ip, String email) {
    if (ip != null && !ip.isBlank()) recordKeyFailure("ip:" + ip.strip().toLowerCase());
    ...
}
```

`MAX_ATTEMPTS_IP = 50`. Không có `recordSuccess` cho các luồng này.

**Bằng chứng**

```text
############ (a) 7 lần reset-request cùng email
200 200 200 200 200 429 429        <- người dùng thật bị khoá luồng reset ở lần 6

############ (b) 50 reset-request (email khác nhau) rồi LOGIN đúng thông tin, cùng IP
login status = 429 {"code":"TOO_MANY_REQUESTS", ...}
```

**Ảnh hưởng**
- **DoS chéo chức năng ẩn danh:** bất kỳ ai gửi 50 request tới `/api/v1/auth/password/reset-request` (endpoint `permitAll`) đều **khoá đăng nhập** của **toàn bộ** người dùng cùng IP trong 15 phút. Với NAT/proxy dùng chung, đây là cách vô hiệu hoá hệ thống với chi phí gần bằng 0. Kết hợp **BE-041** thì kẻ tấn công còn chọn được IP nạn nhân.
- Ngược lại, người dùng thật bấm "quên mật khẩu" vài lần sẽ **tự khoá mình** (BE-045).
- `verify-email` cũng góp phần tương tự, và key `"verify:<token>"` cho phép sinh key mới vô hạn → tạo áp lực lên map (xem BE-043 mục eviction).

**Cách sửa**
1. **Tách không gian key theo mục đích.** Mỗi luồng có ngưỡng riêng và **không** dùng chung `ip:`:
   - login: `ip:login:<ip>`, `account:login:<email>`, `pair:login:<ip>:<email>`
   - reset: `ip:reset:<ip>` (ngưỡng riêng, ví dụ 20/giờ), `email:reset:<email>` (3/giờ)
   - verify: `ip:verify:<ip>` (ngưỡng riêng cao)
2. **Ngưng dùng `recordFailure` cho luồng không phải xác thực credential.** Reset/verify cần **rate limit phát/nhận**, không phải bộ đếm "lần đăng nhập thất bại". Đặt tên API rõ nghĩa: `checkDispatchLimit(key)` / `recordDispatch(key)`.
3. `verify-email` **không nên** throttle theo token (token là bí mật không đoán được, mỗi lần đoán là một key mới → vô nghĩa); throttle theo IP là đủ.
4. Thêm test: 50 `reset-request` từ một IP **không** ảnh hưởng tới login từ IP đó.

**Acceptance test**
- 50 `reset-request` (email khác nhau) từ IP-A → `login` **đúng** thông tin từ IP-A vẫn **200**.
- 7 `reset-request` cùng một email → **429** (rate limit phát) nhưng **không** ảnh hưởng login.
- Login sai 5 lần → 429 cho login; `reset-request` vẫn 200 (không bị khoá chéo).

---

### BE-043 — Throttle của `register`, `refresh`, `oauth/exchange` là no-op: gọi `checkThrottled` nhưng không bao giờ ghi counter

- **Mức độ:** P1 — High (bảo vệ tưởng có mà không có)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/api/AuthController.java:50`, `:69`, `:81`; `AuthenticationThrottlingService.java:66-101`

**Hiện tượng**
`AuthController` chỉ gọi `checkThrottled(...)` — **hàm chỉ đọc** — và **không** gọi `recordFailure(...)` cho các key space `register:`, `refresh:`, `oauth:`:

```java
// AuthController.java
throttling.checkThrottled("register:" + request.email());   // dòng 50 — chỉ đọc
throttling.checkThrottled("refresh:" + request.refreshToken()); // dòng 69 — chỉ đọc
throttling.checkThrottled("oauth:" + request.transactionId());  // dòng 81 — chỉ đọc
```

`checkKey()` chỉ ném 429 khi counter **đã** đạt ngưỡng; counter chỉ tăng trong `recordKeyFailure()`. Vì không luồng nào ghi các key này, ngưỡng **không bao giờ** đạt tới.

**Bằng chứng (test sạch, mỗi lần restart app để xoá state)**

```text
=== 30x register (email khác nhau, cùng IP) ===
codes: [201 ×30]
429 xuất hiện? False  -> throttle register KHÔNG hoạt động (no-op)

=== 30x refresh (token rác, cùng IP) ===
codes set: [401]
429 xuất hiện? False  -> throttle refresh KHÔNG hoạt động (no-op)

=== đối chứng: 8x login sai ===
codes: [401, 401, 401, 401, 401, 429, 429, 429]   <- login có recordFailure nên hoạt động ✅
```

**Ảnh hưởng**
- **BE-021 (enumeration qua register) không được giảm thiểu**: tạo tài khoản/email enumeration không giới hạn.
- **BE-020 (reuse refresh token → revoke toàn bộ chuỗi session) không được giảm thiểu**: kẻ tấn công có một refresh token cũ (đã revoke) có thể gọi `/auth/refresh` **không giới hạn** để liên tục đăng xuất nạn nhân khỏi mọi thiết bị — một DoS phiên miễn phí, đúng thứ mà "rate limit refresh" được thêm vào để chặn.
- `/oauth/exchange` cũng không giới hạn (key lại do client chọn).
- `docs/api/README.md` tuyên bố các endpoint nhạy cảm được bảo vệ bởi rate limiting → **sai với 3 endpoint này**.
- Code hiện tại **trông như đã được bảo vệ** (có lời gọi `checkThrottled`) nên rất dễ bị bỏ qua khi review.

**Cách sửa**
1. **Đối xứng hoá**: mọi nơi gọi `checkThrottled(...)` phải có `recordFailure(...)` tương ứng — và **chỉ ghi khi thao tác thực sự thất bại hoặc thực sự tiêu tốn tài nguyên**. Cụ thể:
   - `register`: ghi khi tạo tài khoản thành công (đây là rate limit phát, không phải đếm lỗi) → `recordDispatch("register:" + ip)`.
   - `refresh`: ghi khi refresh **thất bại** (401) → `recordFailure("refresh:" + ip)`.
   - `oauth/exchange`: ghi khi exchange **thất bại**.
2. **Đổi tên API để phân biệt ý định**: `checkThrottled`/`recordFailure` đang bị dùng cho cả "đếm lỗi xác thực" và "rate limit phát". Tách thành hai khái niệm (`AuthenticationThrottlingService` cho credential, `RequestRateLimiter` cho phát/nhận) để không lặp lại lỗi này.
3. **Test bắt buộc**: mỗi endpoint có throttle phải có một test khẳng định **429 thật sự xảy ra** sau N lần. Đây là loại test đã thiếu và là lý do case này lọt.

**Acceptance test**
- 30 `register` từ một IP → có **429** (hoặc cơ chế chống spam tương đương đã được ADR phê duyệt).
- 30 `refresh` với token không hợp lệ → có **429**.
- 30 `oauth/exchange` không hợp lệ → có **429**.
- Test cho mỗi endpoint khẳng định ngưỡng đạt được (không chỉ assert status 401/201).

---

### BE-044 — BE-003 CHƯA FIX: notification gateway chỉ ghi log và vứt bỏ token, endpoints vẫn vĩnh viễn không dùng được

- **Mức độ:** P0 — Blocker (chức năng không dùng được + thông báo sai sự thật)
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/infrastructure/integration/email/LoggingAccountNotificationGateway.java`; `api/AccountSecurityController.java:53-58`; `application/IdentityAuthenticationService.java:66-70`

**Hiện tượng**
BE-003 được "fix" bằng một adapter mới, nhưng adapter **không gửi gì cả** và **không dùng `rawToken`**:

```java
@Component
public class LoggingAccountNotificationGateway implements AccountNotificationGateway {
    private static final Logger log = LoggerFactory.getLogger(LoggingAccountNotificationGateway.class);

    @Override
    public void sendPasswordResetNotification(String email, String rawToken) {
        log.info("Dispatched password reset instructions for recipient: {}", email);   // rawToken không dùng
    }

    @Override
    public void sendEmailVerificationNotification(String email, String rawToken) {
        log.info("Dispatched email verification instructions for recipient: {}", email); // rawToken không dùng
    }
}
```

Class là `@Component` **không có điều kiện** → đây chính là implementation đang chạy ở production.

**Bằng chứng (app thật)**

```text
POST /register                        -> 201
log: "Dispatched email verification instructions for recipient: be003@test.io"

POST /password/reset-request          -> 200
{"message":"If an active account exists with this email, password reset instructions have been dispatched."}

DB:  password_reset_tokens = 1        (token được tạo)
     email_verification_tokens = 3    (token được tạo)
     users.email_verified = 1  -> 0   (không ai verify được)
Raw token xuất hiện trong API response? KHÔNG (đã kiểm /v3/api-docs, /actuator/info)
Raw token xuất hiện trong log?          KHÔNG (gateway cố tình không log)
POST /password/reset-confirm (token bất kỳ) -> 400
POST /verify-email (token bất kỳ)           -> 400
```

**Ảnh hưởng**
- **Người dùng quên mật khẩu vẫn không thể khôi phục tài khoản**; **email verification vẫn không thể thành công** — không có kênh nào để lấy token (không email, không API, không log).
- **Tệ hơn vòng 1**: trước đây token bị vứt âm thầm trong controller; nay hệ thống **chủ động khẳng định đã gửi** ở **cả response API lẫn log server**. Một operator đọc log "Dispatched email verification instructions" sẽ tin tính năng đang chạy. Đây là loại lỗi làm bug ẩn lâu nhất.
- Rủi ro vận hành: khi có email adapter thật, `@Component` không điều kiện này **có thể ghi đè** hoặc xung đột bean; và `@Autowired(required = false)` ở `IdentityAuthenticationService`/`PasswordManagementService` nghĩa là nếu adapter biến mất thì **không gửi gì và không log warning** — im lặng hoàn toàn.

**Cách sửa**
1. **Chọn dứt khoát một hướng và ghi vào ADR:**
   - **(a) Email nằm trong MVP:** thay `LoggingAccountNotificationGateway` bằng adapter thật (SES/SMTP), đặt dưới `@ConditionalOnProperty` của profile/môi trường, ghi `notification_events`, và **fail-fast khi khởi động** nếu tính năng được bật mà không có adapter. Thêm endpoint `/api/v1/auth/verify-email/resend` (hiện thiếu — người dùng mất email không có cách nào xin lại).
   - **(b) Email ngoài MVP:** xoá `EmailVerificationService` + `/verify-email` + `email_verification_tokens` (bằng migration mới) **hoặc** giữ nhưng đổi response/log thành trung thực và ghi rõ giới hạn. **Không** để log nói "Dispatched" khi không gửi gì.
2. **Bỏ `@Autowired(required = false)`** cho `AccountNotificationGateway` — thiếu adapter là lỗi cấu hình, phải fail-fast (hoặc log WARN rõ ràng), không được im lặng.
3. Sửa `AccountSecurityController` để **không** khẳng định đã gửi khi chưa gửi.
4. `implementation-backlog.md:10` hiện ghi G2 **Complete** cho "verification/reset/change password, Google linking" — cần sửa lại cho khớp thực tế.

**Acceptance test**
- Có đường đi lấy được token reset (email thật, hoặc cơ chế được ADR phê duyệt) và `confirmPasswordReset` **thành công thật** (204, login được bằng mật khẩu mới).
- `verify-email` với token hợp lệ → **204** và `users.email_verified = 1` trong DB.
- Không tồn tại implementation nào log "Dispatched" mà không gửi.
- Test end-to-end: register → verify → reset-request → reset-confirm → login mật khẩu mới → token cũ không dùng lại được.
- Khởi động app với `enabled=true` mà thiếu adapter → **fail-fast**.

---

### BE-045 — `reset-request` tính mọi request là "failure": người dùng thật bị khoá luồng reset sau 6 lần

- **Mức độ:** P2 — Medium
- **Trạng thái xác minh:** ✅ Đã tái hiện
- **File:** `src/main/java/com/recruitment/app/modules/identity/api/AccountSecurityController.java:55-56`

**Hiện tượng**
`reset-request` gọi `recordFailure` **vô điều kiện** trên **mọi** request — kể cả khi email không tồn tại, và kể cả khi thao tác hoàn toàn hợp lệ. Không có `recordSuccess`/reset:

```java
throttling.checkThrottled("reset:" + request.email());
passwordManagement.requestPasswordReset(request.email());
throttling.recordFailure("reset:" + request.email());   // luôn tăng, kể cả thành công
```

**Bằng chứng**

```text
7 lần gửi /password/reset-request cho cùng một email:
200 200 200 200 200 429 429
```

**Ảnh hưởng**
Người dùng thật bấm "quên mật khẩu" nhiều lần (không nhận được email — vì BE-044, hoặc do chậm email) sẽ bị **429 và không thể yêu cầu reset trong 15 phút tiếp theo** — đúng lúc họ cần nhất. Đây là trải nghiệm hỏng nghiêm trọng ở luồng khôi phục tài khoản.

**Cách sửa**
- `reset-request` cần **rate limit phát** (ví dụ 3 lần/giờ cho mỗi email, 20 lần/giờ cho mỗi IP), **không** dùng bộ đếm thất bại xác thực. Áp dụng chung với BE-042 (tách namespace) và BE-043 (đối xứng hoá).
- Không tính các lần gửi thành công vào "failure count".
- Trả `429` kèm `Retry-After` (đã có hạ tầng) và thông điệp rõ ràng.

**Acceptance test**
- 3 lần `reset-request` cùng email trong 1 giờ → lần 4 **429** với `Retry-After`.
- Sau khi cửa sổ trôi qua → cho phép lại.
- `reset-request` thành công **không** ảnh hưởng tới việc đăng nhập (liên kết BE-042).

---

### BE-046 — BE-023 gây bất nhất mới: filter/DTO nhận `transactionId` 43–128 nhưng entity vẫn bắt đúng 43 → OAuth login fail ở bước cuối

- **Mức độ:** P2 — Medium (luồng OAuth hỏng với input hợp lệ theo hợp đồng)
- **Trạng thái xác minh:** ✅ Đã xác minh (live + đọc code)
- **File:** `api/request/OAuthCodeExchangeRequest.java:14`; `infrastructure/security/oauth/PkceGoogleAuthorizationRequestFilter.java:125`; `application/OAuthAuthorizationCodeService.java:114`, `:121`; **`infrastructure/persistence/entity/OAuthAuthorizationCode.java:66`**

**Hiện tượng**
`transactionId` được nới lên `{43,128}` ở DTO, filter và service — nhưng **entity vẫn giữ ràng buộc cũ đúng 43 ký tự**:

```java
// OAuthAuthorizationCode.java:66 — vẫn strict
if (transactionId == null || !transactionId.matches("[A-Za-z0-9_-]{43}")) {
    throw new IllegalArgumentException("OAuth transaction id must contain 32 random bytes");
}
```

**Bằng chứng**

```bash
# Filter nay CHẤP NHẬN transaction_id 64 ký tự (DTO + filter đã nới)
GET /oauth2/authorization/google?code_challenge=<43>&code_challenge_method=S256&transaction_id=<64>
-> 302   (đi tiếp sang Google)

# Nhưng entity sẽ NÉM khi persist handoff code:
#   OAuthAuthorizationCode.java:66 -> IllegalArgumentException
#   JpaOAuthAuthorizationCodeStore.java:22 -> new OAuthAuthorizationCode(...) là caller DUY NHẤT
```

Hằng số dùng chung đã được tạo nhưng **chưa được áp dụng ở entity**:

| Nơi | Ràng buộc hiện tại |
| :--- | :--- |
| `OAuthCodeExchangeRequest.transactionId` | `{43,128}` |
| `PkceGoogleAuthorizationRequestFilter.isValidTransactionId` | `FLEXIBLE_TOKEN_PATTERN` (43–128) |
| `OAuthAuthorizationCodeService.validateTransactionId[ForConsumption]` | `FLEXIBLE_TOKEN_PATTERN` (43–128) |
| **`OAuthAuthorizationCode` constructor** | **`matches("[A-Za-z0-9_-]{43}")` — strict 43** ❌ |

**Ảnh hưởng**
Client sinh `transaction_id` 64 ký tự (hợp lệ theo tài liệu "ít nhất 32 random bytes" **và** theo DTO/filter mới) sẽ:
1. Bắt đầu OAuth thành công (302 → Google), người dùng đăng nhập Google thành công.
2. Backend cố lưu handoff code → entity ném `IllegalArgumentException` trong `GoogleOAuth2SuccessHandler` — handler chỉ catch `IdentityAuthenticationException | OAuthIdentityException | DataIntegrityViolationException`, **không catch `IllegalArgumentException`** → exception thoát ra khỏi success handler ⇒ **lỗi phía server và đăng nhập OAuth thất bại ở bước cuối**, sau khi người dùng đã xác thực.
3. PKCE challenge đã bị `consumeCodeChallenge` tiêu thụ → người dùng phải bắt đầu lại toàn bộ luồng.

**Cách sửa**
1. Thống nhất **một** ràng buộc cho `transactionId` ở **tất cả** các lớp. Dùng `TokenDigest.FLEXIBLE_TOKEN_PATTERN` trong `OAuthAuthorizationCode` (và trong `OAuthCodeExchangeRequest` thay vì hardcode chuỗi).
2. Rà soát các regex còn hardcode (xem BE-048) để tránh tái diễn: `PkceGoogleAuthorizationRequestFilter:48,71,104`, `OAuthAuthorizationCode:63,66`, `TokenSessionService:26`, `OAuthCodeExchangeRequest:8,14`.
3. Thêm `catch (IllegalArgumentException)` (hoặc bắt `RuntimeException` có log) trong `GoogleOAuth2SuccessHandler` để lỗi nội bộ không rò ra ngoài dưới dạng 500 không kiểm soát.
4. Test: `transactionId` 43, 64, 128 ký tự → cả 3 đi hết được luồng (dùng stub Google); `transactionId` 42 và 129 → 400/401.

**Acceptance test**
- Test khẳng định **cùng một** ràng buộc được dùng ở DTO, filter, service **và** entity (ví dụ test parameterized trên `TokenDigest.FLEXIBLE_TOKEN_PATTERN`).
- `transactionId` 64 ký tự đi hết luồng OAuth thành công (với provider stub).
- Không còn `matches("[A-Za-z0-9_-]{43}")` hardcode ngoài `TokenDigest`.

---

### BE-047 — `docs/api/README.md` ghi sai 3 đường dẫn và 1 tên field của endpoint vừa bổ sung

- **Mức độ:** P2 — Medium (hợp đồng tài liệu sai)
- **Trạng thái xác minh:** ✅ Đã xác minh
- **File:** `docs/api/README.md:42-45`

**Hiện tượng**
Bảng "API identity hiện có" vừa được bổ sung 4 dòng, nhưng **3 trong 4 dòng sai** so với code:

| Tài liệu ghi | Code thực tế | Vấn đề |
| :--- | :--- | :--- |
| `POST /api/v1/auth/password/change` — request `oldPassword`, `newPassword` | `ChangePasswordRequest(currentPassword, newPassword)` | ❌ **sai tên field** (`oldPassword` vs `currentPassword`) |
| `POST /api/v1/auth/password/reset` | `POST /api/v1/auth/password/reset-confirm` | ❌ **sai path** |
| `POST /api/v1/auth/email/verify` | `POST /api/v1/auth/verify-email` | ❌ **sai path** |
| `POST /api/v1/auth/password/reset-request` | đúng | ✅ |

Ngoài ra tài liệu thêm câu: *"Các endpoint nhạy cảm được bảo vệ bởi cơ chế Rate Limiting trượt; khi vượt ngưỡng sẽ trả `429 TOO_MANY_REQUESTS` kèm header `Retry-After`."* — đúng về hạ tầng (`Retry-After: 899` đã xác minh) nhưng **không đúng với `register`/`refresh`/`oauth/exchange`** (BE-043, no-op) và không nêu các hạn chế của khoá theo `X-Forwarded-For` (BE-041).

**Ảnh hưởng**
Đây đúng là loại lỗi mà BE-012/BE-036 được tạo ra để chặn: client/QA đọc tài liệu sẽ gọi sai path và sai field. Vì `fail-on-unknown-properties` nay đã bật (BE-017), client dùng `oldPassword` sẽ nhận **400** thay vì được bỏ qua — nên sai lệch này gây lỗi cứng ngay lập tức.

**Cách sửa**
1. Sửa 3 dòng cho khớp code: `currentPassword`; `/password/reset-confirm`; `/verify-email`.
2. Thêm test/CI check đối chiếu path trong `docs/api/README.md` với `RequestMappingHandlerMapping` (dùng lại ý tưởng đã đề xuất cho BE-012) để drift không tái diễn.
3. Bổ sung ghi chú về phạm vi rate limit thực tế và hạn chế của `X-Forwarded-For`.

**Acceptance test**
- Mọi path trong bảng `docs/api/README.md` tồn tại trong `RequestMappingHandlerMapping`.
- Tên field trong bảng khớp `@JsonProperty`/record component của DTO tương ứng.
- (Tùy chọn) test tự động phát hiện drift này trong CI.

---

### BE-048 — Nợ còn lại sau vòng 2 (gộp nhiều mục nhỏ)

- **Mức độ:** P3 — Low (gộp; nên tách PR nhỏ)
- **Trạng thái xác minh:** 🔍 Phân tích tĩnh + ✅ xác minh từng mục

| # | Mục | Bằng chứng | Ảnh hưởng |
| :--- | :--- | :--- | :--- |
| 1 | **BE-008 không có test hồi quy** | `grep -rn "incrementCredentialVersion\|credentialVersion()" src/test/java` → **rỗng**; `LiveAccountAuthorizationIntegrationTests` không được sửa | Fix đúng nhưng có thể regress âm thầm; ADR yêu cầu "replay/race/escalation/disabled account tests" |
| 2 | **Không có test CORS header** | `src/test/.../common/security/` chỉ có `ApiCorsPropertiesTests` (test validate property) | Tôi xác minh thủ công CORS đúng (origin hợp lệ → 200 + `Allow-Origin`; origin lạ → 403) nhưng không có gì chặn hồi quy |
| 3 | **`REFRESH_TOKEN_PATTERN` thành dead code** | `TokenSessionService.java:26` khai báo, nhưng dòng 152 dùng `TokenDigest.OPAQUE_TOKEN_PATTERN` | Dead code; gây nhầm lẫn về "nguồn sự thật" của định dạng token |
| 4 | **Regex còn hardcode ở 6 nơi** (BE-035 chưa trọn) | `PkceGoogleAuthorizationRequestFilter:48,71,104`; `OAuthAuthorizationCode:63,66`; `OAuthCodeExchangeRequest:8,14` | Chính là nguyên nhân của **BE-046**; nên dùng `TokenDigest` constant |
| 5 | **`FLEXIBLE_TOKEN_REGEX` chưa dùng ở entity** | chỉ dùng ở service + filter (xem BE-046) | Bất nhất ràng buộc |
| 6 | **BE-012: `requestBody` vẫn thiếu** | `python: "requestBody" in op` → `False` cho **cả 10** path, kể cả POST | Client generator không sinh được request body; hợp đồng OpenAPI chưa đầy đủ |
| 7 | **BE-019/020 chưa có tài liệu** | `docs/runbooks/authentication-and-ai.md` **không được sửa**; access token vẫn sống hết TTL sau logout | Người đọc tài liệu hiểu sai mức độ an toàn của logout |
| 8 | **`ON DELETE` vẫn không có** (BE-037) | `grep -c "ON DELETE" V009` → **0**; 27 FK đều RESTRICT | Cần quyết định trước G8 (purge retention) |
| 9 | **Profile `local` chết** (BE-014) | `compose.local.yml:38` vẫn `SPRING_PROFILES_ACTIVE: local`, `application-local.yml` vẫn bị `.dockerignore` loại | Cấu hình gây hiểu nhầm |
| 10 | **`linkGoogleAccount` vẫn dead code** (BE-031) | `IdentityAuthenticationService:141` không có caller; route đã bị xoá | Dead code + `implementation-backlog.md:56` vẫn tuyên bố tính năng |
| 11 | **`attempt` column vẫn chưa dùng** (BE-011) | retry nay nằm trong 1 `execute()`; không có writer/reader cho `attempt` ở production | Schema hứa hành vi (3 row attempts) chưa tồn tại; cần ghi rõ hoặc dùng |
| 12 | **`ApiErrorWriter` set header/status 2 lần** | `ApiErrorWriter.java` **không đổi**; 4 nơi gọi set status+content-type rồi `ApiErrorWriter` set lại | Trùng lặp vô hại nhưng khó bảo trì |
| 13 | **`AuthenticationThrottlingService` còn 2 constructor** (no-arg + `@Autowired Clock`) | dòng 39-46 | No-arg tạo instance với `Clock` khác — footgun còn lại |
| 14 | **`BE-026` `.env` giữ credential thật** | không đổi (đúng thiết kế local) | Chỉ cần rotate khi kết thúc dev |

**Cách sửa:** xử lý theo thứ tự ưu tiên trong bảng; mỗi mục là một PR nhỏ. Ưu tiên mục 1, 2, 4, 6 vì chúng trực tiếp ngăn case đã từng xảy ra tái diễn.

**Acceptance test**
- Có test cho role-change → revoke (mục 1) và cho CORS header (mục 2).
- `grep -rn 'matches("\[A-Za-z0-9' src/main/java` chỉ còn trong `TokenDigest` (mục 4).
- OpenAPI có `requestBody` cho mọi POST có body (mục 6).

---

## 6. Ma trận truy vết: tài liệu tuyên bố gì ↔ code thực tế

| # | Tuyên bố trong tài liệu | Thực tế | Case |
| :--- | :--- | :--- | :--- |
| 1 | `implementation-backlog.md:57` — bootstrap qua `app.identity.bootstrap-admin` | Code dùng `recruitment.identity.bootstrap-admin`; không có test bind; DB có 0 admin | **BE-004** |
| 2 | `implementation-backlog.md:50-51` — "sliding-window rate limiter (5 failed attempts per 15 min)" | Đúng, nhưng map không có eviction (rò rỉ bộ nhớ) và key là email nạn nhân | **BE-005, BE-006** |
| 3 | `implementation-backlog.md:47-48` — "immediately revoking active JWT access upon deactivation **or password change**" | Deactivation ✅; password change ✅; nhưng claim fail-open khi thiếu, và **role change không thu hồi** | **BE-007, BE-008** |
| 4 | `implementation-backlog.md:52-53` — verification/reset password với single-use replay protection | Token đúng thiết kế nhưng **không có kênh gửi**; email verification **không thể** thành công | **BE-003** |
| 5 | `implementation-backlog.md:40` — "Public OpenAPI 3.1 endpoint" | Tồn tại nhưng thiếu 4 endpoint, không có schema/response lỗi | **BE-012** |
| 6 | `implementation-backlog.md:9` — "ArchUnit quality gates passing" | Đúng với `target/`; **FAIL** với build dir cách ly (đúng lệnh runbook khuyến nghị) | **BE-002** |
| 7 | `adr/0003:22` — "methods to 60 non-comment lines" | Không có gate nào kiểm tra | **BE-018** |
| 8 | `adr/0003:27-28` — "Screening allows three provider attempts" | Không có implementation; cột `attempt` không ai đọc/ghi | **BE-011** |
| 9 | `SMARTRECRUIT_PROJECT_SETUP.md:10` — "JSON Schema structured output, tối đa 3 attempt" | Shape schema nghi vấn sai; không có 3 attempt | **BE-010, BE-011** |
| 10 | `runbooks/authentication-and-ai.md:96` — adapter "kiểm tra response schema" | Đúng (validate phía sau) — đây là safety net duy nhất nếu schema provider bị bỏ qua | BE-010 |
| 11 | `runbooks/local-development.md:62-72` — lệnh build cách ly | Lệnh này làm BUILD FAILURE | **BE-002** |
| 12 | `runbooks/authentication-and-ai.md:48` — transaction_id "ít nhất 32 random bytes" | Code yêu cầu **đúng** 43 ký tự | **BE-023** |
| 13 | `database/README.md:55` — "Numeric ranges, date ordering, salary range and screening score have database checks" | Đúng (11 CHECK constraints) ✅ | — |
| 14 | `architecture/backend.md:102` — "Không đặt Jackson annotation trên JPA entity" | Đúng ✅ | — |
| 15 | `architecture/backend.md:103` — endpoint mới phải mở tường minh, mặc định deny-all | Đúng ✅ (đã kiểm chứng 401/403) | — |
| 16 | `api/frontend-mapping.md:33` — "Concurrent refresh must be serialized to avoid triggering token-reuse protection" | Đúng, và chính sách reuse-all là có chủ đích — nhưng không có rate limit để chống lạm dụng | **BE-020** |
| 17 | `database/README.md:51-53` — "Integrity rules **currently enforced**: A job creator must be a member of that job's company" | V007 làm `created_by_member_id` NULLABLE → compound FK **không còn được kiểm tra**; không có thay thế ở application layer | **BE-028** |
| 18 | `adr/0002:12` — "Compound foreign keys enforce invariants … including job creator/company" | FK compound vẫn tồn tại nhưng bị vô hiệu bởi NULL | **BE-028** |
| 19 | `adr/0003:20-21` — "ArchUnit must enforce layers and cycles beyond the existing entity reference test" | Có 2 vi phạm hướng phụ thuộc thật (`api→infrastructure`, `infrastructure→api`) mà ArchUnit không bắt | **BE-030** |
| 20 | `implementation-backlog.md:39` — "production/controller/**method** line budget rules passing" | Không có gate method; và `OpenApiController.createSpecification()` = 65 dòng đang **vi phạm** | **BE-018** |
| 21 | `implementation-backlog.md:56` — "Google account linking uniqueness enforced with HTTP 409 conflict handling" | `linkGoogleAccount` không có controller mapping; security config mở route không tồn tại | **BE-031** |
| 22 | `database/README.md:27` — mốc thời gian UTC; entity dùng `Instant` | Đúng về UTC nhưng 54 cột là `datetime` precision 0 → làm tròn ±0.5s; không được ghi lại | **BE-032** |
| 23 | `conventions.md:23` — "Mỗi lỗi API có mã lỗi ổn định" | `IllegalStateException` không được handle → body mặc định của Boot, không có `code` | **BE-033** |
| 24 | `conventions.md:25` — "Log giữ request identifier và nguyên nhân kỹ thuật" | Logger duy nhất trong `src/main` là `AdminBootstrapRunner`; `requestId` không bao giờ được log | **BE-033** |
| 25 | `database/schema.md:5-10`, `database/README.md:13-18`, `overview.md:145-146` — danh sách migration | Chỉ liệt kê V001–V006 / V001–V002; **thiếu V007 và V008** | **BE-036** |
| 26 | `overview.md:143` — `application-test.yml` trong `src/main/resources/` | Thực tế ở `src/test/resources/` | **BE-036** |
| 27 | `database/README.md:29` — "không index theo thói quen" | 3 index trùng prefix index/unique key khác | **BE-037** |
| 28 | `database/README.md:28` — dùng `utf8mb4` | Migration không pin charset; CI (`utf8mb4_0900_ai_ci`) và compose local (`utf8mb4_unicode_ci`) **lệch collation** | **BE-037** → ⚠️ đã đồng bộ ở vòng 2 |

### Bổ sung vòng 2 — tuyên bố mới chưa đúng

| # | Tuyên bố trong tài liệu | Thực tế | Case |
| :--- | :--- | :--- | :--- |
| 29 | `docs/api/README.md:42` — `password/change` request `oldPassword` | DTO là `ChangePasswordRequest(currentPassword, …)`; với `fail-on-unknown-properties=true` client dùng `oldPassword` nhận **400** | **BE-047** |
| 30 | `docs/api/README.md:44` — `POST /api/v1/auth/password/reset` | Path thật là `/api/v1/auth/password/reset-confirm` | **BE-047** |
| 31 | `docs/api/README.md:45` — `POST /api/v1/auth/email/verify` | Path thật là `/api/v1/auth/verify-email` | **BE-047** |
| 32 | `docs/api/README.md` — "Các endpoint nhạy cảm được bảo vệ bởi cơ chế Rate Limiting trượt" | `register`, `refresh`, `oauth/exchange` **không** bị giới hạn (30/30 không có 429 — BE-043); khoá IP **spoofable** (BE-041) | **BE-041, BE-043** |
| 33 | `implementation-backlog.md:10` — G2 Complete cho "verification/reset/change password, Google linking" | Luồng reset/verify vẫn **không dùng được** (token bị vứt — BE-044); `linkGoogleAccount` không có controller | **BE-044, BE-048** |
| 34 | `LoggingAccountNotificationGateway` log "Dispatched … instructions" | **Không gửi gì**, `rawToken` không được dùng | **BE-044** |
| 35 | `database/schema.md:13` — V009 mô tả là "chuẩn hóa timestamp…, thêm CHECK" | Đúng, nhưng **không đề cập V009 fail trên DB có dữ liệu** khi job creator không thuộc company | **BE-039** |
| 36 | `production-readiness.md:12` — chỉ đặt `forward-headers-strategy=framework` sau proxy tin cậy | Code đọc `X-Forwarded-For` **vô điều kiện** cho khoá throttle, không phụ thuộc cấu hình này | **BE-041** |
| 37 | `conventions.md:23` — "Mỗi lỗi API có mã lỗi ổn định và HTTP status phù hợp" | 405/415 bị catch-all biến thành **500 `INTERNAL_ERROR`** | **BE-040** |

---

## 7. Checklist theo dõi tiến độ

> Cập nhật vòng 2 (sau khi kiểm thử lại). Ký hiệu: `[x]` = đã fix và **đã kiểm chứng**; `[~]` = fix một phần, còn hở; `[ ]` = chưa fix.

```
VÒNG 1 — 38 case gốc
[x] BE-001  P0  Bearer header cũ chặn endpoint public          FIXED (A/B 200/200, có test)
[x] BE-002  P0  ArchUnit gate fail theo build dir              FIXED (A/B cả 2 build dir SUCCESS, có test chặn)
[ ] BE-003  P0  Password reset / verify email không dùng được   CHƯA FIX -> xem BE-044
[x] BE-004  P0  Admin bootstrap sai config prefix               FIXED (prefix + yml + .env + bind test)
[x] BE-005  P0  Throttle map tăng vô hạn (DoS bộ nhớ)           FIXED (MAX_ENTRIES + eviction)
[~] BE-006  P0  Throttle theo email -> khóa tài khoản người khác FIX MỘT PHẦN -> BE-041/042/043
[x] BE-007  P1  credential_version fail-open                    FIXED (8/8 kịch bản, 2 test mới)
[~] BE-008  P1  Đổi role không thu hồi token                    FIX CODE đúng, THIẾU TEST hồi quy
[x] BE-009  P1  Regex PII xóa mất mốc thời gian                 FIXED (11/11 assertion PASS)
[x] BE-010  P1  Sai field structured output của Gemini          FIXED (responseMimeType + responseSchema)
[x] BE-011  P1  Không có 3 provider attempt                     FIXED (retry loop 3, 2 test; cột `attempt` vẫn chưa dùng)
[~] BE-012  P1  OpenAPI hardcode, thiếu 4 endpoint              FIX MỘT PHẦN (đủ 10 path, còn thiếu requestBody)
[x] BE-013  P1  Sai mã HTTP cho current-password & DIVE->409    FIXED (422 + DIVE thu hẹp)
[~] BE-014  P2  Profile local là no-op trong container          FIX MỘT PHẦN (collation+logging; profile chết còn)
[x] BE-015  P2  Dead schema Envers + CHECK sai ngữ nghĩa        FIXED (V009 drop bảng + đổi CHECK)
[x] BE-016  P2  Dead code trong domain entity                   FIXED (bỏ overload 6 tham số)
[x] BE-017  P2  JSON property lạ bị bỏ qua im lặng              FIXED (fail-on-unknown-properties)
[x] BE-018  P2  Thiếu gate method <= 60 dòng + 1 vi phạm thật   FIXED (gate + mutation test PASS)
[ ] BE-019  P2  Access token không bị thu hồi khi logout         CHƯA XỬ LÝ (code + docs)
[ ] BE-020  P2  Reuse refresh token revoke cả phiên hợp lệ       CHƯA XỬ LÝ -> rate limit là no-op (BE-043)
[ ] BE-021  P2  Enumeration qua register (409)                   CHƯA XỬ LÝ -> throttle register no-op (BE-043)
[ ] BE-022  P2  Thông điệp reset-request không trung thực        CHƯA FIX -> BE-044
[~] BE-023  P3  transactionId 43 ký tự vs tài liệu               FIX MỘT PHẦN -> gây bất nhất (BE-046)
[x] BE-024  P3  Constructor tạo instance throttle thứ hai        FIXED
[x] BE-025  P3  validatePassword mất field-level error           FIXED (400 VALIDATION_ERROR + fieldErrors)
[x] BE-026  P3  Rotate credential trong .env                     không đổi (đúng thiết kế) — nên rotate
[~] BE-027  P3  Tài liệu application-local.yml.example          FIX MỘT PHẦN
[x] BE-028  P1  V007 vô hiệu hóa FK compound (job creator)       FIX ĐÚNG nhưng NGUY HIỂM -> xem BE-039
[x] BE-029  P1  Job constructor lẫn member ID vào user ID       FIXED (bỏ field + ctor 7 tham số)
[x] BE-030  P1  ArchUnit bỏ lọt 2 vi phạm hướng phụ thuộc       FIXED (2 rule mới, 0 import chéo)
[x] BE-031  P2  Route link-google mở nhưng không tồn tại         FIXED (route xoá; linkGoogleAccount vẫn dead)
[x] BE-032  P2  datetime precision 0 -> làm tròn ±0.5s          FIXED (V009 datetime(6))
[~] BE-033  P2  Không log requestId; IllegalStateException rò ra FIX + REGRESSION -> xem BE-040
[~] BE-034  P2  Test rỗng / không chạm nhánh cần kiểm chứng      FIX MỘT PHẦN (còn thiếu test CORS header)
[~] BE-035  P2  Trùng lặp logic hash/token (hex vs base64url)    FIX MỘT PHẦN (TokenDigest có; còn 6 regex hardcode)
[~] BE-036  P3  Tài liệu migration/schema lỗi thời               FIX MỘT PHẦN (docs/api sai 3 path -> BE-047)
[~] BE-037  P3  Nợ schema: index/CHECK/ON DELETE/collation       FIX MỘT PHẦN (index+CHECK xong; ON DELETE còn)
[x] BE-038  P3  pom.xml thừa dependency + scripts/ lẫn tạp       FIXED

VÒNG 2 — 10 case mới (phải fix trước khi sang G3)
[ ] BE-039  P0  V009 FAIL trên DB không rỗng -> app không start  MỚI — đã tái hiện ERROR 1452
[ ] BE-040  P0  Catch-all biến 405/415 thành 500 + spam ERROR    MỚI — đã tái hiện
[ ] BE-041  P1  X-Forwarded-For spoofable -> bypass + khóa IP    MỚI — đã tái hiện
[ ] BE-042  P1  reset/verify chia sẻ key `ip:` với login         MỚI — đã tái hiện
[ ] BE-043  P1  Throttle register/refresh/oauth là no-op         MỚI — đã tái hiện
[ ] BE-044  P0  BE-003 chưa fix: gateway chỉ log, vứt token      MỚI — đã tái hiện
[ ] BE-045  P2  reset-request tính mọi request là failure        MỚI — đã tái hiện
[ ] BE-046  P2  transactionId bất nhất DTO/filter vs entity      MỚI — đã xác minh
[ ] BE-047  P2  docs/api/README sai 3 path + 1 tên field         MỚI — đã xác minh
[ ] BE-048  P3  Nợ còn lại sau vòng 2 (14 mục nhỏ)               MỚI — gộp
```

---

## 8. Phụ lục — lệnh tái hiện nhanh các case chính

```bash
B=http://127.0.0.1:8080

# BE-001 — header Bearer cũ chặn endpoint public  (kỳ vọng 200, thực tế 401)
curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"Passw0rdSecure12"}'
curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/api/v1/auth/login \
  -H 'Authorization: Bearer stale.token' \
  -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"Passw0rdSecure12"}'

# BE-002 — ArchUnit gate theo build dir
export JAVA_HOME=/Users/ProM2/Library/Java/JavaVirtualMachines/amazon-corretto-25.jdk/Contents/Home
./mvnw -B -ntp -Dtest=ModuleArchitectureTests test                                   # SUCCESS
./mvnw -B -ntp -Dtest=ModuleArchitectureTests -Dsmartrecruit.build.directory=/tmp/x test  # FAILURE (61)

# BE-005 — rò rỉ bộ nhớ throttle
jcmd <pid> GC.class_histogram | grep AttemptRecord
seq 1 20000 | xargs -P 40 -I{} curl -s -o /dev/null -X POST $B/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"flood{}@nowhere.test","password":"WrongPassword123"}'
jcmd <pid> GC.class_histogram | grep AttemptRecord     # => 20002

# BE-006 — khóa tài khoản người khác
for i in 1 2 3 4 5; do curl -s -o /dev/null -w '%{http_code} ' -X POST $B/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"victim@example.com","password":"WrongPassword123"}'; done
curl -s -X POST $B/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"victim@example.com","password":"<MAT_KHAU_DUNG>"}'   # => 429

# BE-003 — token reset được tạo nhưng không gửi
curl -s -X POST $B/api/v1/auth/password/reset-request \
  -H 'Content-Type: application/json' -d '{"email":"victim@example.com"}'
docker exec sr-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -D "$MYSQL_DATABASE" -N -B \
  -e "SELECT COUNT(*) FROM password_reset_tokens; SELECT COUNT(*) FROM email_verification_tokens;"
```

### Phụ lục vòng 2 — lệnh tái hiện các case MỚI

```bash
B=http://127.0.0.1:8080

# ---------- BE-039: V009 fail trên DB KHÔNG rỗng (app không start được) ----------
# 1) Áp V001..V008 thủ công lên MySQL 8.4 rỗng
for f in $(ls src/main/resources/db/migration/V00[1-8]*.sql | sort); do
  docker exec -i sr-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" v009test < "$f"; done
# 2) Seed dữ liệu HỢP LỆ theo schema V008 (creator không thuộc company của job)
docker exec -i sr-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" v009test -e "
INSERT INTO users (id,version,created_at,updated_at,email,password_hash,full_name,is_active)
  VALUES (1001,0,NOW(),NOW(),'c@t.org','h','C',1);
INSERT INTO companies (id,version,created_at,updated_at,name,slug,is_verified)
  VALUES (2001,0,NOW(),NOW(),'C1','c1',1),(2002,0,NOW(),NOW(),'C2','c2',1);
INSERT INTO company_members (id,version,created_at,updated_at,company_id,user_id,\`role\`,is_active)
  VALUES (3001,0,NOW(),NOW(),2002,1001,'OWNER',1);
INSERT INTO jobs (id,version,created_at,updated_at,company_id,created_by_user_id,
                  created_by_member_id,title,slug,description,employment_type,workplace_type,
                  salary_currency,status,headcount)
  VALUES (4001,0,NOW(),NOW(),2001,1001,NULL,'J','j','d','FULL_TIME','REMOTE','USD','DRAFT',1);"
# 3) Chạy đúng 3 câu lệnh bước 4 của V009 -> ERROR 1452
docker exec -i sr-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" v009test -e "
ALTER TABLE jobs DROP FOREIGN KEY FK_JOBS_CREATED_BY_MEMBER_COMPANY;
ALTER TABLE jobs DROP COLUMN created_by_member_id;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_created_by_user_company
  FOREIGN KEY (company_id, created_by_user_id) REFERENCES company_members (company_id, user_id);"

# ---------- BE-040: 405/415 biến thành 500 ----------
curl -s -o /dev/null -w 'GET  /auth/login  -> %{http_code}\n' $B/api/v1/auth/login            # 500 (phải 405)
curl -s -o /dev/null -w 'PUT  /auth/login  -> %{http_code}\n' -X PUT $B/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{}'                                                # 500 (phải 405)
curl -s -o /dev/null -w 'POST text/plain  -> %{http_code}\n' -X POST $B/api/v1/auth/login \
  -H 'Content-Type: text/plain' -d 'x'                                                       # 500 (phải 415)
grep -c "Unhandled unexpected exception" /tmp/app.log   # log spam ERROR + stack trace

# ---------- BE-041: spoof X-Forwarded-For để bypass throttle ----------
# (a) XFF cố định -> throttle hoạt động (429 ở lần 6)
for i in $(seq 1 7); do printf '%s ' "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/v1/auth/login \
  -H 'X-Forwarded-For: 203.0.113.9' -H 'Content-Type: application/json' \
  -d '{"email":"victim@test.io","password":"WrongPassword123"}')"; done; echo
# (b) XFF xoay vòng -> BYPASS hoàn toàn (không có 429)
for i in $(seq 1 14); do printf '%s ' "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/v1/auth/login \
  -H "X-Forwarded-For: 198.51.100.$i" -H 'Content-Type: application/json' \
  -d '{"email":"victim@test.io","password":"WrongPassword123"}')"; done; echo
# (c) khóa IP tuỳ chọn của nạn nhân
for i in $(seq 1 50); do curl -s -o /dev/null -X POST $B/api/v1/auth/password/reset-request \
  -H 'X-Forwarded-For: 192.0.2.77' -H 'Content-Type: application/json' -d "{\"email\":\"spam$i@test.io\"}"; done
curl -s -o /dev/null -w 'login XFF=192.0.2.77 -> %{http_code}\n' -X POST $B/api/v1/auth/login \
  -H 'X-Forwarded-For: 192.0.2.77' -H 'Content-Type: application/json' \
  -d '{"email":"real@test.io","password":"<MAT_KHAU_DUNG>"}'                                  # 429

# ---------- BE-042: reset-request khóa chéo login cùng IP ----------
for i in $(seq 1 50); do curl -s -o /dev/null -X POST $B/api/v1/auth/password/reset-request \
  -H 'Content-Type: application/json' -d "{\"email\":\"dos$i@test.io\"}"; done
curl -s -o /dev/null -w 'login cùng IP -> %{http_code}\n' -X POST $B/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"real@test.io","password":"<MAT_KHAU_DUNG>"}'  # 429

# ---------- BE-043: throttle register/refresh là no-op ----------
python3 - <<'EOF'
import json,urllib.request,urllib.error
B="http://127.0.0.1:8080"
def post(p,b):
    r=urllib.request.Request(B+p,data=json.dumps(b).encode(),headers={"Content-Type":"application/json"},method="POST")
    try:
        with urllib.request.urlopen(r) as x: return x.status
    except urllib.error.HTTPError as e: return e.code
c=[post("/api/v1/auth/register",{"fullName":f"T{i}","email":f"rt{i}@test.io","password":"Passw0rdSecure12"}) for i in range(30)]
print("register 30x ->", set(c), "| có 429?", 429 in c)     # toàn 201 -> no-op
c=[post("/api/v1/auth/refresh",{"refreshToken":"a"*43}) for _ in range(30)]
print("refresh  30x ->", set(c), "| có 429?", 429 in c)     # toàn 401 -> no-op
EOF

# ---------- BE-044: gateway chỉ log, token vẫn không lấy được ----------
curl -s -X POST $B/api/v1/auth/register -H 'Content-Type: application/json' \
  -d '{"fullName":"V","email":"be044@test.io","password":"Passw0rdSecure12"}' >/dev/null
curl -s -X POST $B/api/v1/auth/password/reset-request -H 'Content-Type: application/json' \
  -d '{"email":"be044@test.io"}'; echo
grep -i "Dispatched" /tmp/app.log | tail -3        # log nói "Dispatched ..." nhưng KHÔNG gửi gì
docker exec sr-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -D "$MYSQL_DATABASE" -N -B \
  -e "SELECT COUNT(*) FROM email_verification_tokens; SELECT COUNT(*) FROM users WHERE email_verified=1;"

# ---------- BE-045: người dùng thật bị khóa luồng reset ----------
for i in $(seq 1 7); do printf '%s ' "$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  $B/api/v1/auth/password/reset-request -H 'Content-Type: application/json' \
  -d '{"email":"same@test.io"}')"; done; echo      # 200 x5 rồi 429 429

# ---------- BE-046: transactionId bất nhất (filter nhận 64, entity bắt 43) ----------
C43=$(python3 -c "print('a'*43)"); T64=$(python3 -c "print('b'*64)")
curl -s -o /dev/null -w 'filter + transaction_id 64 -> %{http_code}\n' \
  "$B/oauth2/authorization/google?code_challenge=$C43&code_challenge_method=S256&transaction_id=$T64"  # 302
grep -n 'transactionId.matches' src/main/java/com/recruitment/app/modules/identity/infrastructure/persistence/entity/OAuthAuthorizationCode.java
```

---

*Hết file.*

**Chú thích vòng 2:** file này gồm 48 case — 38 case phát hiện ở vòng 1 (§5, §5b) và 10 case phát hiện khi kiểm thử lại sau fix (§5c). Trạng thái từng case được cập nhật ở §0.5 và §7. Mọi case đều kèm bằng chứng tái hiện được; case nào ở trạng thái ⚠️ cần được xác minh trước khi sửa.
