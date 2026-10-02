# Runbook: Troubleshooting Backend và MySQL

## 1. Lỗi timezone MySQL/JDBC

**Nguyên nhân:** session MySQL hoặc JDBC connection dùng timezone không nhất quán.

**Khắc phục:** dùng UTC xuyên suốt cho dữ liệu lưu trữ:

```text
connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true
```

MySQL container local cũng phải có `--default-time-zone=+00:00`. Client tự chuyển sang timezone hiển thị.

## 2. `Could not create connection to database server`

**Nguyên nhân có thể có:** MySQL chưa chạy; host/port sai; URL không hợp lệ; hoặc lỗi TLS/timezone xảy ra trước khi xác thực.

**Kiểm tra theo thứ tự:**

1. Kiểm tra MySQL service đang chạy.
2. Kiểm tra `localhost`, port `3306` và tên database trong JDBC URL.
3. Kiểm tra timezone hợp lệ.
4. Đăng nhập MySQL bằng chính username/password của ứng dụng để phân biệt lỗi MySQL với lỗi Spring Boot.

## 3. `Access denied for user`

**Nguyên nhân:** username, password, host trong MySQL account hoặc quyền `GRANT` không khớp.

**Khắc phục:** dùng một app user riêng có quyền trên đúng database. Không sử dụng `root` cho môi trường dùng chung hoặc production.

## 4. `Unable to determine Dialect without JDBC metadata`

**Nguyên nhân:** Hibernate không đọc được metadata vì kết nối database đã thất bại.

**Khắc phục:** sửa lỗi datasource trước; không thêm `hibernate.dialect` chỉ để che lỗi kết nối.

## 5. Cảnh báo `com.mysql.jdbc.Driver` deprecated

**Nguyên nhân:** class driver cũ được khai báo thủ công.

**Khắc phục:** dùng `com.mysql.cj.jdbc.Driver` hoặc bỏ `driver-class-name` để Spring Boot suy ra driver từ JDBC URL.

## 6. App dùng JDK khác với `pom.xml`

**Dấu hiệu:** Run console hiển thị version Java khác với property `java.version` trong Maven.

**Khắc phục:** kiểm tra Project SDK, Maven Runner JRE và Run Configuration JRE trong IntelliJ. Cả ba nên dùng JDK được project khai báo.

## 7. Lỗi chỉ xuất hiện khi chạy test

`@SpringBootTest` dùng `application-test.yml` và MySQL Testcontainers riêng; không để test phụ thuộc database local hoặc credential production. Nếu Docker daemon không chạy, khởi động Docker Desktop trước khi chạy `mvn verify`.

## 8. Startup báo lỗi JWT key hoặc JWT configuration

JWT không có fallback key. Kiểm tra mọi biến `APP_SECURITY_JWT_*`, đặc biệt `PRIVATE_KEY_LOCATION` và `PUBLIC_KEY_LOCATION`; private PEM phải là PKCS#8, public PEM là X.509, hai key phải cùng pair và RSA tối thiểu 2048 bit. Local dùng `./scripts/generate-local-jwt-keys.sh` để tránh tự tạo key thủ công.

## 9. Google OAuth callback thất bại

Kiểm tra `GOOGLE_OAUTH_ENABLED=true`, client id/secret, và redirect URI Google Cloud khớp tuyệt đối với URL public dạng `https://<api-host>/login/oauth2/code/google`. Luồng bắt đầu phải gửi PKCE S256 từ frontend; OAuth state/session chỉ là tạm thời. Không thử exchange cùng handoff code nhiều lần vì code dùng một lần.

## 10. Gemini không chạy hoặc trả lỗi provider

Gemini bị tắt mặc định. Khi bật, cần có `GEMINI_API_KEY`, `GEMINI_MODEL` và endpoint HTTPS hợp lệ. Lỗi 429/5xx/network được đánh dấu retryable bởi adapter; lỗi request/schema không retry. Không log CV gốc, API key hoặc provider response chứa dữ liệu ứng viên khi chẩn đoán.
