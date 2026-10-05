# Bảng Kê Phát Hành Hệ Thống (Release Manifest)
## SmartRecruit Platform Release 1.0.0

### 1. Thông Tin Bản Phát Hành (Release Metadata)

- **Phiên bản:** `1.0.0-RELEASE`
- **Ngày phát hành:** 06/10/2026
- **Môi trường triển khai:** Docker Container Multi-tier Architecture
- **Git Commit Reference:** `HEAD`
- **Mã định danh kiến trúc:** Modular Monolith Clean Architecture

---

### 2. Danh Mục Container & Dịch Vụ Hạ Tầng

| Tên Container | Base Image / Công Nghệ | Cổng Nội Bộ | Cổng Công Khai (Host) | Vai Trò & Trách Nhiệm |
| :--- | :--- | :--- | :--- | :--- |
| `smart-recruitment-frontend` | `nginx:alpine` + React 19 SPA | 80/tcp | `8443` (HTTP/Reverse Proxy) | Cung cấp giao diện người dùng, định tuyến SPA và reverse proxy chuyển tiếp `/api/` về backend. |
| `smart-recruitment-app` | `eclipse-temurin:25-jdk-noble` | 8080/tcp | `8080` (Direct API) | Chứa toàn bộ core service, Spring Boot 4.1.1, Flyway migration engine và AI client. |
| `smart-recruitment-mysql` | `mysql:8.4` (LTS) | 3306/tcp | `3307` | Cơ sở dữ liệu quan hệ lưu trữ thông tin người dùng, tin tuyển dụng, CV và bảng kiểm toán. |

---

### 3. Danh Mục Biến Môi Trường (Environment Variables Configuration)

```properties
# Backend Core Configuration
SPRING_PROFILES_ACTIVE=docker
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/recruitment_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=recruitment_user
SPRING_DATASOURCE_PASSWORD=recruitment_password

# Authentication & JWT Security
APP_SECURITY_JWT_ACCESS_TOKEN_TTL=PT15M
APP_SECURITY_JWT_REFRESH_TOKEN_TTL=P7D
APP_TEST_MAILBOX_ENABLED=false

# Google Gemini AI Integration
GEMINI_API_KEY=${GEMINI_API_KEY:-demo-local-key}
GEMINI_MODEL_VERSION=gemini-2.5-flash

# Frontend Reverse Proxy Configuration
VITE_API_BASE_URL=/api/v1
```

---

### 4. Lịch Sử Chuyển Đổi Schema Cơ Sở Dữ Liệu (Flyway Migrations)

1. `V001__init_schema.sql`: Khởi tạo bảng users, roles, user_roles và audit cơ sở.
2. `V002__create_recruitment_domain_schema.sql`: Khởi tạo bảng companies, company_members, jobs, job_applications, candidate_profiles, skills.
3. `V003__token_replay_and_family_revocation.sql`: Cơ chế thu hồi refresh token theo họ khóa (family revocation) chống tấn công phát lại.
4. `V004__identity_domain_reorganization.sql`: Tái tổ chức cấu trúc bảng danh tính.
5. `V005__domain_lifecycle_fixes.sql`: Tinh chỉnh các trường thời gian lifecycle.
6. `V006__align_schema_with_domain.sql`: Đồng bộ schema với Domain model JPA.
7. `V007__fix_application_screenings_ai_version.sql`: Cập nhật phiên bản mô hình AI Gemini.
8. `V008__reconcile_schema_drift.sql`: Đồng bộ hóa drift giữa DB schema và entity mappings.
9. `V009__harden_schema_invariants.sql`: Thắt chặt ràng buộc toàn vẹn khóa ngoại (compound FK recruiter-company).
10. `V010__add_interviews_offers_evaluations_notifications_and_audit.sql`: Bổ sung hoàn thiện bảng phỏng vấn, lời mời việc làm, đánh giá chuyên môn, bản nháp phản hồi AI, thông báo người dùng và nhật ký kiểm toán.
