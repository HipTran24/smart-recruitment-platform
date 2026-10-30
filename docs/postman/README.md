# Postman API Collection & Environment

Thư mục này chứa file cấu hình Postman để kiểm thử toàn bộ API hiện tại của hệ thống **Smart Recruitment Platform**.

## Files

1. `Smart_Recruitment_API.postman_collection.json`: Collection kiểm thử toàn bộ endpoint đã triển khai, gồm 4 Actuator, 2 OpenAPI, 10 Auth/Account Security, và 1 deny-all security check. Collection có assertion HTTP status, kiểm tra error contract, và tự lưu access/refresh token sau register/login/refresh.
2. `Smart_Recruitment_Local.postman_environment.json`: Environment cục bộ (`baseUrl = http://localhost:8080`) với các biến token, email/password test và token reset/verify.

## Endpoint coverage

| Nhóm | Endpoint |
| --- | --- |
| Actuator | `GET /actuator/health`, `/actuator/health/liveness`, `/actuator/health/readiness`, `/actuator/info` |
| OpenAPI | `GET /v3/api-docs`, `GET /v3/api-docs/openapi.json` |
| Auth | `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/oauth/exchange`, `GET /api/v1/auth/me` |
| Account Security | `POST /api/v1/auth/password/change`, `/password/reset-request`, `/password/reset-confirm`, `/verify-email` |
| Security policy | `GET /api/v1/jobs` — route chưa công bố, kỳ vọng `401` hoặc `403` |

Các route `/api/v1/jobs`, candidates, applications, recruiter, admin… được frontend mapping ghi là **Target**, chưa có controller/backend contract hiện hành nên chưa thể kiểm thử như API thật.

## Cách sử dụng

1. Mở **Postman**, chọn **Import**, rồi import cả collection và environment.
2. Chọn **Smart Recruitment (Local)** ở góc phải trên.
3. Chạy theo thứ tự: Actuator → OpenAPI → Register hoặc Login → Get Me → Account Security → Refresh → Logout.
4. Các request validation/error có thể chạy độc lập. Request duplicate email cần chạy sau Register với cùng email.
5. `Password reset confirm` và `Verify email` cần token thật được ghi bởi logging notification provider trong log/runtime local; để trống token sẽ kiểm thử lỗi validation.
6. Có thể chạy **Run collection**. Các assertion ở collection level sẽ báo sai nếu status hoặc error body không đúng contract.

## Lưu ý bảo mật

- Chỉ dùng email, password và token giả lập trong local/test; không commit credential thật.
- Refresh token là opaque credential; không đưa token vào URL hoặc log.
- OAuth exchange chỉ thành công khi `GOOGLE_OAUTH_ENABLED=true` và có transaction PKCE hợp lệ. Khi tắt integration, request được kỳ vọng `404` theo baseline hiện tại.
