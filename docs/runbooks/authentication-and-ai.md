# Runbook: Xác thực, Google OAuth và Gemini CV Screening

> Trạng thái: **Current**. Đây là cấu hình vận hành cho authentication và adapter AI có trong repository. Không đặt PEM, OAuth client secret, Gemini API key, refresh token hoặc CV thật vào Git, log, ticket hay tài liệu.

## JWT và refresh token

Access token là JWT RS256 ngắn hạn; refresh token là chuỗi opaque 256-bit chỉ được lưu SHA-256 trong database. Khi refresh, token cũ bị revoke và token mới được phát. Reuse token đã revoke làm revoke toàn bộ refresh session active của account.

Các biến bắt buộc:

```text
APP_SECURITY_JWT_ISSUER=https://api.example.com
APP_SECURITY_JWT_AUDIENCE=smart-recruitment-api
APP_SECURITY_JWT_KEY_ID=key-2026-01
APP_SECURITY_JWT_PRIVATE_KEY_LOCATION=file:/run/secrets/app-jwt-private.pem
APP_SECURITY_JWT_PUBLIC_KEY_LOCATION=file:/run/secrets/app-jwt-public.pem
APP_SECURITY_JWT_ACCESS_TOKEN_TTL=PT15M
APP_SECURITY_JWT_REFRESH_TOKEN_TTL=P30D
APP_SECURITY_JWT_CLOCK_SKEW=PT30S
```

Private key phải là RSA PKCS#8 PEM, public key là X.509 PEM, cùng một key pair và tối thiểu 2048 bit. Local dùng `./scripts/generate-local-jwt-keys.sh`; Compose mount hai key thành Docker secrets. Production phải dùng secret manager và có runbook thay key/rollover `key-id`.

Client gửi access token qua `Authorization: Bearer <token>`. Không gửi token qua query parameter hay cookie. Token response được `no-store`; client cần giữ credential trong nơi có vòng đời ngắn và không ghi vào telemetry/log. Role trong JWT được map thành `ROLE_*`; endpoint mới phải khai báo policy owner/company/role rõ ràng.

## Google OAuth với PKCE

Google OAuth mặc định tắt. Khi bật, cấu hình:

```text
GOOGLE_OAUTH_ENABLED=true
GOOGLE_OAUTH_CLIENT_ID=<secret-manager-reference-or-value>
GOOGLE_OAUTH_CLIENT_SECRET=<secret-manager-reference-or-value>
GOOGLE_OAUTH_SUCCESS_REDIRECT_URI=https://app.example.com/auth/complete
GOOGLE_OAUTH_AUTHORIZATION_CODE_TTL=PT1M
```

Trong Google Cloud Console, authorized redirect URI phải khớp chính xác callback backend public:

```text
https://api.example.com/login/oauth2/code/google
```

`GOOGLE_OAUTH_SUCCESS_REDIRECT_URI` là redirect **sau** khi backend đã xác minh Google; nó phải HTTPS (localhost HTTP chỉ cho local) và không được chứa `code` hoặc `transaction_id` sẵn trong query string.

Luồng frontend:

1. Tạo `codeVerifier` ngẫu nhiên theo PKCE (43–128 ký tự) và `transaction_id` base64url từ ít nhất 32 random bytes.
2. Tính `code_challenge = BASE64URL(SHA-256(codeVerifier))`, rồi điều hướng browser đến:

   ```text
   GET /oauth2/authorization/google?code_challenge=<challenge>&code_challenge_method=S256&transaction_id=<transaction_id>
   ```

3. Backend lưu challenge theo transaction, còn Spring OAuth state được bind server-side theo transaction. Nhiều tab được hỗ trợ mà không ghi đè challenge/state của nhau.
4. Google callback được kiểm tra state và OIDC claims. Backend phát một handoff code opaque, một lần, rồi redirect tới frontend với `code` và `transaction_id` — **không có JWT trên URL**.
5. Frontend gọi:

   ```http
   POST /api/v1/auth/oauth/exchange
   Content-Type: application/json

   {"code":"…","codeVerifier":"…","transactionId":"…"}
   ```

   Code, verifier challenge và transaction phải khớp. Sai verifier/transaction cũng làm code không thể dùng lại.

Nếu không đặt `GOOGLE_OAUTH_SUCCESS_REDIRECT_URI`, callback trả JSON code cho integration local; production nên dùng redirect frontend HTTPS. Không auto-link Google vào local account chỉ dựa trên email: tài khoản tồn tại cần một luồng link account được xác thực riêng.

## CORS, cookie OAuth và reverse proxy

Đặt `APP_WEB_CORS_ALLOWED_ORIGINS` thành danh sách origin chính xác, phân tách bởi dấu phẩy, ví dụ:

```text
APP_WEB_CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

Wildcard bị từ chối. OAuth chỉ dùng session tạm cho state/PKCE; cookie là `HttpOnly`, `SameSite=Lax`, và phải `Secure=true` ở production. Local HTTPS-free có thể dùng `SERVER_SESSION_COOKIE_SECURE=false`.

Mặc định `SERVER_FORWARD_HEADERS_STRATEGY=none`. Chỉ đặt `framework` khi backend nằm sau proxy/load balancer đáng tin cậy có nhiệm vụ loại bỏ header `Forwarded`/`X-Forwarded-*` do client tự gửi và thay bằng header của chính proxy; nếu không callback Google có thể bị open-redirect hoặc sai base URL. Tương tự, `app.security.client-ip.trust-forwarded-header` mặc định `false`, chỉ bật khi đứng sau reverse proxy đã strip client header để bảo vệ cơ chế rate limiting.

## Quản lý phiên và thu hồi Token (Logout & Credential Versioning)

- **Refresh Token Revocation**: Khi client gọi `POST /api/v1/auth/logout`, refresh token tương ứng bị thu hồi lập tức trong cơ sở dữ liệu (`revoked_at`), ngăn chặn vĩnh viễn việc tái cấp access token từ phiên này.
- **Access Token Lifespan**: Access Token là JWT phi trạng thái (stateless) với thời gian sống ngắn (TTL mặc định 15 phút). Access Token tiếp tục có hiệu lực cho tới khi hết hạn TTL, trừ khi tài khoản bị vô hiệu hóa (`active = false`), đổi mật khẩu (`changePassword`), hoặc thay đổi vai trò (`addRole`/`removeRole`). Trong các trường hợp đó, `credential_version` được tăng lên, kích hoạt kiểm tra thời gian thực (`LiveAccountAuthorizationService`) từ chối ngay lập tức mọi access token cũ.

## Gemini CV screening

Gemini cũng mặc định tắt. Bật adapter bằng:

```text
GEMINI_ENABLED=true
GEMINI_API_KEY=<secret-manager-reference-or-value>
GEMINI_MODEL=<approved-model-name>
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_API_VERSION=v1beta
GEMINI_CONNECT_TIMEOUT=PT3S
GEMINI_READ_TIMEOUT=PT30S
```

Adapter gửi structured JSON request, kiểm tra response schema, có timeout và phân loại 429/5xx/network là retryable. Nó remove email, phone, URL và các dòng CV có nhãn direct/sensitive identifier trước call, đồng thời sanitize direct identifier nhận được trong output trước khi workflow lưu audit data. Đây là defense-in-depth, không thay thế consent, retention/deletion policy, quyền truy cập tối thiểu, hoặc anonymization ở tầng ingestion. Không gửi CV có dữ liệu không cần thiết cho job criteria.

`CvScreeningWorkflow` chỉ nhận screening đã queue: claim state trong transaction ngắn bằng lease, gọi provider ngoài transaction/DB lock, rồi re-lock để complete/fail. Worker crash có thể được reclaim khi lease hết hạn; result từ worker cũ bị discard. Deployment cần scheduler/outbox/queue và alert riêng để gọi workflow cho record pending hoặc retryable — repository không tự chạy scheduler hay expose public endpoint cho việc đó.

Cột `attempt` trong bảng `application_screenings` (được bảo vệ bởi unique constraint `(job_application_id, attempt)`) định danh lần chạy sàng lọc của một hồ sơ ứng viên. Nếu một lượt sàng lọc thất bại (FAILED), worker orchestrator có thể cấp phát một bản ghi mới với `attempt` tăng dần (tối đa 3 attempt theo ADR 0003). Đồng thời, trong mỗi lượt thực thi, adapter Gemini tích hợp cơ chế retry tự động tối đa 3 lần cho các lỗi mạng tạm thời hoặc 429/5xx trước khi đánh dấu lượt đó thất bại.

Raw CV không được lưu trong workflow record, nhưng `input_hash` được suy ra từ input để chống worker nhận nhầm payload. Hãy quản lý hash này như metadata liên quan dữ liệu cá nhân: không expose ra API/log, áp retention/access control cùng hồ sơ ứng viên, và cân nhắc keyed fingerprint trong deployment có threat model database-disclosure/membership-inference.

Điểm số/recommendation chỉ là tín hiệu hỗ trợ recruiter. Phải có người review và không được dùng làm quyết định tuyển dụng tự động.
