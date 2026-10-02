# Runbook: Chạy môi trường Local

> Trạng thái: **Current baseline**. Tài liệu này mô tả cách chạy backend hiện tại mà không đưa credential vào repository.

## Điều kiện cần

- JDK đúng phiên bản được khai báo trong `pom.xml` (hiện là Java 26).
- Maven cài sẵn hoặc Maven tích hợp trong IntelliJ.
- MySQL đang chạy và có database/user cho môi trường local.
- IntelliJ đã mở đúng thư mục repository root.

Repository hiện chưa có thư mục `.mvn/wrapper` hoàn chỉnh. Script local tự tìm JDK đúng major version trên macOS trước khi gọi Maven; IntelliJ vẫn phải cấu hình Maven Runner dùng JDK 26.

## Cấu hình local

`application.yml` không chứa credential thật. Cách nhanh nhất là copy `.env.example` thành `.env`, tạo key pair local bằng `./scripts/generate-local-jwt-keys.sh`, rồi chép hai đường dẫn in ra vào `JWT_PRIVATE_KEY_FILE` và `JWT_PUBLIC_KEY_FILE`. Thư mục `.local/secrets/` đã được Git ignore.

Dùng biến môi trường cho datasource và JWT:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
APP_SECURITY_JWT_ISSUER
APP_SECURITY_JWT_AUDIENCE
APP_SECURITY_JWT_KEY_ID
APP_SECURITY_JWT_PRIVATE_KEY_LOCATION
APP_SECURITY_JWT_PUBLIC_KEY_LOCATION
```

Mẫu URL local:

```text
jdbc:mysql://localhost:3306/smartrecruit_db?useSSL=false&allowPublicKeyRetrieval=true&connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true
```

Trong IntelliJ, thêm các biến này tại **Run → Edit Configurations → Environment variables** cho cấu hình chạy ứng dụng. Không lưu password thật vào tài liệu, Git hoặc ảnh chụp màn hình.

`scripts/run-local.sh` đọc `.env`, tự export các biến JWT (thêm tiền tố `file:` cho key path) và chạy Spring Boot. Compose mount PEM thành Docker secret read-only; không copy PEM vào image hay environment variable.

Để SPA local gọi API, đặt chính xác origin, ví dụ `APP_WEB_CORS_ALLOWED_ORIGINS=http://localhost:3000`. Bỏ trống biến này sẽ chặn CORS. Không dùng `*`.

## Trình tự kiểm tra

1. Xác nhận MySQL đang chạy và user ứng dụng có quyền truy cập database.
2. Tạo local JWT key pair, kiểm tra `.env` trỏ đúng hai PEM matching.
3. Xác nhận URL dùng đúng host, port, tên database và ép session timezone về `UTC`.
4. Kiểm tra IntelliJ dùng đúng JDK theo `pom.xml`.
5. Chạy `./scripts/run-local.sh`, `./scripts/docker-up.sh`, hoặc `Application` với đầy đủ biến môi trường.
6. Xem Run console: ứng dụng chỉ được xem là chạy thành công khi không có `Application run failed`, Flyway hoàn tất và Hikari datasource khởi tạo thành công.

## Dữ liệu local

- Local database không được coi là dữ liệu chia sẻ.
- Không nhập dữ liệu ứng viên thật vào môi trường local.
- Schema được tạo bằng Flyway migration, không phụ thuộc thao tác thủ công chưa được ghi lại.
- Chạy `./scripts/verify.sh` dùng MySQL Testcontainers; không cần và không được trỏ test vào database local. Docker daemon phải đang chạy.
- Google OAuth và Gemini đều mặc định tắt. Chỉ bật sau khi cấu hình secret local theo [runbook xác thực & AI](authentication-and-ai.md).
