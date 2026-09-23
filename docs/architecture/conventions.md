# Quy ước Mã nguồn

> Trạng thái: **Target**. Các quy ước này áp dụng cho mã mới; không cần tạo package trống chỉ để khớp sơ đồ.

## Tên và package

- Package dùng chữ thường: `com.recruitment.app.modules.jobs`.
- Class dùng PascalCase: `CreateJobRequest`, `JobController`.
- Method và field dùng camelCase: `createJob`, `publishedAt`.
- Tên module dùng số nhiều khi đại diện cho tập nghiệp vụ: `jobs`, `candidates`, `applications`.
- Không dùng hậu tố mơ hồ như `Helper`, `Util`, `Manager` nếu trách nhiệm chưa được nêu rõ.

## DTO và entity

- Request/response DTO đặt trong module `api/request` và `api/response`.
- Entity/domain model không được lộ ra khỏi API.
- DTO không chứa mật khẩu, token, secret hoặc trường nội bộ không cần cho client.
- Mapping giữa DTO và domain model nằm ở `application/mapper` hoặc một mapper có chủ sở hữu rõ ràng.

## Xử lý lỗi

- Không trả stack trace cho client.
- Mỗi lỗi API có mã lỗi ổn định, thông điệp an toàn và HTTP status phù hợp.
- Lỗi validation phải chỉ rõ trường không hợp lệ mà không để lộ dữ liệu nhạy cảm.
- Log giữ request identifier và nguyên nhân kỹ thuật; không log password, token hay CV của ứng viên.

## Dependency và cấu hình

- Thêm dependency chỉ khi có lý do rõ ràng trong Pull Request.
- Phiên bản dependency được quản lý tập trung qua Maven/Spring Boot khi có thể.
- Configuration đọc từ `application*.yml` và biến môi trường; không hard-code endpoint hoặc credential.
- Mọi thay đổi database đi kèm migration, không dựa vào `ddl-auto` để cập nhật shared environment.
