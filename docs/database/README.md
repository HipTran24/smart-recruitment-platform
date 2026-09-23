# Database Guide

> Trạng thái: **Current baseline + Target**. Backend đã dùng MySQL/JPA nhưng chưa có entity, table hoặc migration được version trong source.

## Nguồn dữ liệu chuẩn

Schema được quản lý bằng Flyway migration tại:

```text
src/main/resources/db/migration/
```

Ví dụ tên file:

```text
V001__create_users.sql
V002__create_companies.sql
V003__create_jobs.sql
```

Một migration đã chạy ở môi trường chung là bất biến. Nếu cần đổi schema, thêm migration mới; không sửa file cũ.

## Quy ước MySQL

- Database, table và column dùng `snake_case`: `job_applications`, `created_at`.
- Primary key dùng `<entity>_id` hoặc `id`, nhưng chọn một quy ước và dùng nhất quán.
- Foreign key mô tả rõ quan hệ: `candidate_id`, `company_id`.
- Thời điểm lưu UTC trong database; client chuyển đổi theo timezone hiển thị.
- Dùng `utf8mb4` để hỗ trợ tiếng Việt và Unicode.
- Tạo index dựa trên query thực tế, foreign key và các trường tìm kiếm phổ biến; không index theo thói quen.

## Dữ liệu audit và lifecycle

Các table nghiệp vụ thường có:

```text
created_at
updated_at
created_by       # khi nghiệp vụ cần truy vết người tạo
updated_by       # khi nghiệp vụ cần truy vết người cập nhật
```

Xóa mềm chỉ được dùng khi có yêu cầu nghiệp vụ rõ ràng. Nếu dùng, quy ước trường là `deleted_at` và mọi query mặc định phải loại bản ghi đã xóa.

## Bảo mật

- Database username/password luôn lấy từ biến môi trường hoặc secret manager.
- Tài khoản ứng dụng dùng quyền tối thiểu cần thiết, không dùng `root` ở shared/prod environment.
- Không commit database dump, dữ liệu CV, email, số điện thoại hoặc dữ liệu ứng viên thật.
- `ddl-auto: create` và `ddl-auto: update` không dùng trên shared/prod environment; migration là nguồn thay đổi schema.
