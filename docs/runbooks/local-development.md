# Runbook: Chạy môi trường Local

> Trạng thái: **Current baseline**. Tài liệu này mô tả cách chạy backend hiện tại mà không đưa credential vào repository.

## Điều kiện cần

- JDK đúng phiên bản được khai báo trong `pom.xml` (hiện là Java 26).
- Maven cài sẵn hoặc Maven tích hợp trong IntelliJ.
- MySQL đang chạy và có database/user cho môi trường local.
- IntelliJ đã mở đúng thư mục repository root.

Repository hiện chưa có thư mục `.mvn/wrapper` hoàn chỉnh. Script local tự tìm JDK đúng major version trên macOS trước khi gọi Maven; IntelliJ vẫn phải cấu hình Maven Runner dùng JDK 26.

## Cấu hình local

`application.yml` không nên chứa credential thật. Dùng biến môi trường cho datasource:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
```

Mẫu URL local:

```text
jdbc:mysql://localhost:3306/smartrecruit_db?useSSL=false&allowPublicKeyRetrieval=true&connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true
```

Trong IntelliJ, thêm các biến này tại **Run → Edit Configurations → Environment variables** cho cấu hình chạy ứng dụng. Không lưu password thật vào tài liệu, Git hoặc ảnh chụp màn hình.

## Trình tự kiểm tra

1. Xác nhận MySQL đang chạy và user ứng dụng có quyền truy cập database.
2. Xác nhận URL dùng đúng host, port, tên database và ép session timezone về `UTC`.
3. Kiểm tra IntelliJ dùng đúng JDK theo `pom.xml`.
4. Chạy `Application` từ IntelliJ hoặc `mvn spring-boot:run` từ repository root.
5. Xem Run console: ứng dụng chỉ được xem là chạy thành công khi không có `Application run failed` và Hikari datasource khởi tạo thành công.

## Dữ liệu local

- Local database không được coi là dữ liệu chia sẻ.
- Không nhập dữ liệu ứng viên thật vào môi trường local.
- Schema được tạo bằng Flyway migration, không phụ thuộc thao tác thủ công chưa được ghi lại.
- Chạy `mvn verify` trực tiếp dùng MySQL Testcontainers; không cần và không được trỏ test vào database local.
