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
| `POST /api/v1/auth/password/change` | `oldPassword`, `newPassword` (Bearer token) | `204` |
| `POST /api/v1/auth/password/reset-request` | `email` | `200` ("If an active account exists...") |
| `POST /api/v1/auth/password/reset` | `token`, `newPassword` | `204` |
| `POST /api/v1/auth/email/verify` | `token` | `204` |

Response có token luôn đặt `Cache-Control: no-store` và `Pragma: no-cache`. Refresh token là credential opaque, không phải JWT; client không được đưa access/refresh token vào URL, local storage không được bảo vệ, log hay analytics. Các endpoint nhạy cảm được bảo vệ bởi cơ chế Rate Limiting trượt; khi vượt ngưỡng sẽ trả `429 TOO_MANY_REQUESTS` kèm header `Retry-After`.

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
