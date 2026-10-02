# Smart Recruitment

Backend cho nền tảng tuyển dụng, xây dựng theo modular monolith Spring Boot.

## What is implemented

- Flyway-managed MySQL schema cho identity, candidate, company, job, application và lịch sử sàng lọc CV.
- Đăng ký/đăng nhập password, JWT RS256 access token, refresh token opaque có rotation và phát hiện reuse.
- Google OpenID Connect với PKCE và handoff code dùng một lần; JWT không xuất hiện trên URL redirect.
- Gemini adapter tùy chọn cho sàng lọc CV có structured output, timeout, redaction trực tiếp và worker bền vững để retry an toàn.
- Local Docker runtime, kiểm thử đơn vị và Testcontainers-based schema integration test.

## Quick start

1. Copy `.env.example` thành `.env` và thay toàn bộ placeholder.
2. Chạy `./scripts/generate-local-jwt-keys.sh`, rồi chép hai đường dẫn được in ra vào `.env`.
3. Chạy `./scripts/docker-up.sh`.
4. Kiểm tra `http://localhost:8080/actuator/health/readiness`.

Xem cấu hình JWT, Google OAuth, CORS và Gemini trong [runbook xác thực & AI](docs/runbooks/authentication-and-ai.md). Chạy `./scripts/verify.sh` để kiểm tra đầy đủ; script dùng MySQL Testcontainer tách biệt và không thay đổi database local.

See [documentation](docs/README.md), [contribution guidance](CONTRIBUTING.md), and [security reporting](SECURITY.md).
