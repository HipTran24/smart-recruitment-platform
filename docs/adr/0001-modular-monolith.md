# ADR 0001: Dùng Modular Monolith cho backend

> Trạng thái: Accepted
> Ngày: 2026-09-22

## Bối cảnh

Smart Recruitment đang ở giai đoạn khởi tạo với một Spring Boot application, chưa có module nghiệp vụ hoặc nhu cầu vận hành nhiều service độc lập. Hệ thống cần được chia ranh giới nghiệp vụ rõ ràng nhưng vẫn dễ chạy local, test và triển khai cho đội nhỏ.

## Quyết định

Backend tiếp tục là một Spring Boot application duy nhất, tổ chức package theo module nghiệp vụ:

```text
com.recruitment.app.modules.<module>
```

Mỗi module chia thành `api`, `application`, `domain` và `infrastructure` khi có mã nguồn tương ứng. Giao tiếp giữa module đi qua use case công khai hoặc event/interface đã thống nhất; không truy cập trực tiếp persistence nội bộ của module khác.

## Hệ quả

### Tích cực

- Một quy trình build, test và deploy đơn giản.
- Dễ refactor trong giai đoạn yêu cầu còn thay đổi.
- Ranh giới module chuẩn bị sẵn cho việc tách service nếu sau này thật sự cần.
- Ít chi phí vận hành hơn microservices.

### Đánh đổi

- Cần kỷ luật dependency để không biến thành monolith hỗn độn.
- Không thể scale hoặc deploy riêng từng module.
- Khi một module trở nên quá lớn, đội cần cân nhắc ADR mới về việc tách bounded context hoặc service.

## Các lựa chọn đã cân nhắc

- **Technical-layer monolith:** đơn giản lúc đầu nhưng dễ làm code các nghiệp vụ khác nhau bị trộn lẫn.
- **Microservices ngay từ đầu:** linh hoạt khi scale độc lập nhưng tăng đáng kể chi phí local development, CI/CD, observability và vận hành.
