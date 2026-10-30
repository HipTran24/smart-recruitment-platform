# Quy ước API

> Trạng thái: **Current** cho API identity. API nghiệp vụ tuyển dụng chưa được công bố; route mới bị deny mặc định cho đến khi có contract và policy rõ ràng.

## Hiện có

- `GET /actuator/health`, `GET /actuator/health/liveness`, `GET /actuator/health/readiness`, và `GET /actuator/info` là public.
- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout` là public identity endpoints.
- `GET /api/v1/auth/me` yêu cầu `Authorization: Bearer <access-token>` hợp lệ và một role application được nhận diện (`ROLE_CANDIDATE`, `ROLE_RECRUITER`, hoặc `ROLE_PLATFORM_ADMIN`).
- Google OAuth routes chỉ được bật khi `GOOGLE_OAUTH_ENABLED=true`; xem [runbook](../runbooks/authentication-and-ai.md).
- Route chưa được khai báo explicit trả `401` khi chưa xác thực hoặc `403` khi đã xác thực, thay vì tự động public.

## URL và version

API nghiệp vụ dùng tiền tố:

```text
/api/v1/
```

Ví dụ định hướng:

```text
POST /api/v1/auth/login
GET  /api/v1/jobs
POST /api/v1/jobs
POST /api/v1/jobs/{jobId}/applications
```

Không thay đổi ý nghĩa của endpoint đã public theo cách phá vỡ client. Khi cần thay đổi không tương thích, tạo version API mới.

## API identity hiện có

| Endpoint | Request | Kết quả |
| --- | --- | --- |
| `POST /api/v1/auth/register` | `fullName`, `email`, `password` (tối thiểu 12 ký tự) | `201` và access/refresh token |
| `POST /api/v1/auth/login` | `email`, `password` | `200` và access/refresh token |
| `POST /api/v1/auth/refresh` | `refreshToken` | `200` và token pair mới; token cũ bị revoke |
| `POST /api/v1/auth/logout` | `refreshToken` | `204`; idempotent |
| `POST /api/v1/auth/oauth/exchange` | `code`, `codeVerifier`, `transactionId` của cùng OAuth transaction | `200` và token pair |
| `GET /api/v1/auth/me` | Bearer access token | `200` và identity/roles hiện hành |
| `POST /api/v1/auth/password/change` | `currentPassword`, `newPassword` (Bearer token) | `204` |
| `POST /api/v1/auth/password/reset-request` | `email` | `200` ("If an active account exists...") |
| `POST /api/v1/auth/password/reset-confirm` | `token`, `newPassword` | `204` |
| `POST /api/v1/auth/verify-email` | `token` | `204` |

Response có token luôn đặt `Cache-Control: no-store` và `Pragma: no-cache`. Refresh token là credential opaque, không phải JWT; client không được đưa access/refresh token vào URL, local storage không được bảo vệ, log hay analytics. Các endpoint nhạy cảm được bảo vệ bởi cơ chế Rate Limiting trượt đa chiều theo từng namespace riêng biệt (login lockout, registration limit, password reset dispatch, email verification, token refresh). Khoá IP mặc định phân giải an toàn từ kết nối socket TCP (`RemoteAddr`); header `X-Forwarded-For` chỉ được tin cậy khi bật `app.security.client-ip.trust-forwarded-header: true` sau reverse proxy đã cấu hình strip client header. Khi vượt ngưỡng hệ thống trả `429 TOO_MANY_REQUESTS` kèm header `Retry-After`. Thông báo tài khoản trong baseline MVP sử dụng `app.notification.provider: logging` (lưu token in-memory tối đa 200 bản ghi, TTL 15 phút phục vụ kiểm thử và phát triển). Môi trường production thực tế yêu cầu cấu hình nhà cung cấp gửi thư hợp lệ (ví dụ AWS SES qua `APP_NOTIFICATION_PROVIDER=ses`), nếu thiếu bean tương ứng ứng dụng sẽ kích hoạt cơ chế Fail-Fast từ chối khởi động.

**Đánh đổi bảo mật được chấp nhận (Accepted Risk):** `POST /api/v1/auth/register` trả `409 CONFLICT` khi email đã tồn tại trong hệ thống. Đây là đánh đổi có chủ đích để tối ưu trải nghiệm người dùng (UX) khi đăng ký tài khoản. Rủi ro dò quét tài khoản (Account Enumeration) được giảm thiểu chủ động bằng Rate Limiter theo địa chỉ IP (tối đa 20 yêu cầu / IP / 15 phút). Trái lại, luồng khôi phục mật khẩu (`POST /api/v1/auth/password/reset-request`) được bảo vệ bằng thông điệp trung lập tuyệt đối ("If an active account exists...") để ngăn chặn triệt để nguy cơ trích xuất danh sách người dùng.


## Request và response

- Dùng JSON UTF-8 qua HTTPS.
- Request body có schema rõ ràng, validation tại lớp API.
- Thành công trả HTTP status đúng ngữ nghĩa: `200`, `201`, `204`.
- Không có dữ liệu hoặc tài nguyên không tồn tại trả `404`.
- Input không hợp lệ trả `400`; không đủ quyền trả `403`; chưa đăng nhập trả `401`.

Mẫu lỗi hiện hành:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "The request is invalid.",
  "fieldErrors": {},
  "requestId": "server-generated-uuid"
}
```

### Phân định phạm vi lỗi ứng dụng vs hạ tầng Container (Tomcat Connector)

- **Lỗi tầng Servlet / Ứng dụng:** Mọi lỗi được xử lý qua Servlet container (bao gồm validation DTO, lỗi nghiệp vụ, phân quyền, 404 Not Found, 405 Method Not Allowed, 406 Not Acceptable, 415 Unsupported Media Type, 422 Unprocessable Entity, 429 Too Many Requests và trang lỗi nội bộ `/error`) đều tuân thủ chặt chẽ JSON contract `ApiErrorResponse` (`code`, `message`, `fieldErrors`, `requestId`). Riêng lỗi đàm phán nội dung `406 Not Acceptable` khi client từ chối nhận JSON sẽ trả HTTP 406 với body rỗng để tuân thủ RFC.
- **Lỗi tầng Container / Connector (Pre-Servlet):** Các yêu cầu vi phạm giao thức nghiêm trọng ở tầng socket trước khi chuyển giao vào Spring DispatcherServlet (như URI vượt quá giới hạn cấu hình `server.max-http-request-header-size: 8KB`, URI chứa byte điều khiển/null `%00`, hoặc HTTP method token chứa ký tự đặc biệt theo RFC 7230) sẽ bị Tomcat connector từ chối ở tầng mạng với mã 400/414/431 (trả về trang HTML tối giản của container hoặc body rỗng). Toàn bộ cấu hình máy chủ (`server.error.include-stacktrace: never`, `server.error.include-message: never`, `server.error.include-exception: false`) đảm bảo không rò rỉ phiên bản phần mềm máy chủ hay stack trace.


## Pagination, filter và sort

Danh sách lớn dùng query parameter rõ ràng:

```text
GET /api/v1/jobs?page=0&size=20&sort=createdAt,desc
```

- `page` bắt đầu từ `0`.
- `size` có giới hạn tối đa do backend quy định.
- Filter dùng tên trường nghiệp vụ, ví dụ `status=PUBLISHED`.
- Sort chỉ cho phép danh sách trường được backend whitelist.

## Authorization

JWT access token mang `roles` và Spring Security map chúng thành authorities `ROLE_*`. Endpoint tuyển dụng tương lai phải khai báo policy nghiệp vụ ở endpoint/use case (ví dụ owner hoặc role; Recruiter dùng chung dữ liệu của đội), không chỉ tin `userId` từ request. `GET /me` luôn đọc lại account active từ database.

## Contract và tài liệu

- Mỗi endpoint mới cần có mô tả request, response, quyền truy cập và lỗi có thể trả.
- Khi có OpenAPI/Swagger, file export đặt trong `docs/api/` hoặc được sinh từ source trong CI.
- Không ghi credential, token mẫu thật hoặc dữ liệu cá nhân thật trong ví dụ API.
