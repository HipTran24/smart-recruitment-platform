# Database Guide

> Trạng thái: **Current baseline**. Schema được quản lý bởi Flyway và phản ánh persistence entity hiện có.

## Nguồn dữ liệu chuẩn

Schema được quản lý bằng Flyway migration tại:

```text
src/main/resources/db/migration/
```

Migration hiện có:

```text
V001__initial_schema.sql
V002__create_recruitment_domain_schema.sql
V003__add_identity_authentication_schema.sql
V004__bind_oauth_handoff_codes_to_pkce.sql
V005__add_application_screening_audit_data.sql
V006__bind_oauth_handoff_codes_to_transactions.sql
V007__convert_job_creator_membership_to_user_references.sql
V008__add_identity_credential_version_and_verification.sql
V009__harden_schema_integrity_and_precision.sql
```

Một migration đã chạy ở môi trường chung là bất biến. Nếu cần đổi schema, thêm migration mới; không sửa file cũ.

## Quy ước MySQL

- Database, table và column dùng `snake_case`: `job_applications`, `created_at`.
- Primary key dùng `<entity>_id` hoặc `id`, nhưng chọn một quy ước và dùng nhất quán.
- Foreign key mô tả rõ quan hệ: `candidate_id`, `company_id`.
- Thời điểm lưu UTC trong database; MySQL session dùng `+00:00`, Hibernate JDBC timezone dùng `UTC`, client chuyển đổi theo timezone hiển thị.
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

## Integrity rules currently enforced

- A job creator must be a member of that job's company.
- A selected resume must belong to the candidate profile that submitted the application.
- A candidate has at most one primary resume, enforced with a generated nullable key and unique constraint.
- Numeric ranges, date ordering, salary range and screening score have database checks in addition to entity validation.
- Flyway migration is exercised against an empty MySQL Testcontainer in CI before Hibernate validates the mapping.
- All foreign keys intentionally enforce `ON DELETE RESTRICT` (default MySQL behavior) to prevent accidental cascading data loss of compliance records and candidate submissions; automated data retention purging will be executed via a dedicated application service in Sprint 8.
- In V009 migration, when synthesizing parent company memberships for zero-member companies with jobs, the least-privilege role 'RECRUITER' is granted (rather than 'OWNER') to satisfy the compound FK invariant without granting administrative privileges.
- The column 'attempt' in application_screenings tracks sequential screening runs for a candidate job application (enforced by uk_application_screenings_application_attempt). Transient network retries during a screening execution are handled within a single lease in CvScreeningWorkflow, whereas re-evaluations (e.g. after CV resubmission) increment the attempt counter.
