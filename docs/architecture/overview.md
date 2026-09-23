# Kiến trúc Smart Recruitment

> Trạng thái: bản định hướng ban đầu. Tài liệu này mô tả kiến trúc đích và phân biệt rõ những phần đã có với những phần sẽ được bổ sung.

## 1. Mục tiêu

Smart Recruitment được tổ chức như một **modular monolith**: một ứng dụng Spring Boot được triển khai độc lập, nhưng mã nguồn được chia theo từng miền nghiệp vụ. Cách này phù hợp với giai đoạn đầu của sản phẩm vì đơn giản để phát triển và triển khai, đồng thời tránh việc các module nghiệp vụ bị trộn lẫn khi hệ thống mở rộng.

Các mục tiêu chính:

- Tách mã theo nghiệp vụ tuyển dụng thay vì gom toàn bộ controller, service và repository vào các thư mục lớn dùng chung.
- Giữ API, database migration, cấu hình và tài liệu ở vị trí xác định.
- Không đưa mật khẩu, token, file build hay file người dùng tải lên vào Git.
- Có thể mở rộng thêm frontend, cache, hàng đợi hoặc dịch vụ riêng trong tương lai mà không phải tổ chức lại toàn bộ repository.

## 2. Trạng thái hiện tại

Repository hiện là một ứng dụng Spring Boot/Maven tại thư mục gốc:

- Entry point: `src/main/java/com/recruitment/app/Application.java`.
- Maven artifact: `com.recruitment:application`.
- Công nghệ đã có: Spring Web MVC, Spring Data JPA, MySQL Connector/J và Lombok.
- Cấu hình ứng dụng nằm tại `src/main/resources/application.yml`.
- Chưa có module nghiệp vụ, controller, entity, repository hoặc migration database trong source hiện tại.

Vì vậy, những phần được mô tả dưới đây là cấu trúc đích; chỉ tạo package hoặc module khi bắt đầu có mã nguồn thực tế cho phần đó.

## 3. Bức tranh tổng thể

```mermaid
flowchart LR
    U[Người dùng] --> F[Frontend web hoặc mobile]
    F -->|HTTPS / JSON API| B[Spring Boot backend]
    B --> M[Module nghiệp vụ]
    M --> D[(MySQL)]
    M --> S[Object storage<br/>CV, avatar, tài liệu]
    M --> N[Email / Notification provider]
```

Backend là nguồn xử lý nghiệp vụ và kiểm soát truy cập. MySQL chỉ lưu dữ liệu có cấu trúc cùng metadata file; CV, avatar và tài liệu không được lưu trong repository hoặc thư mục `uploads/` của source code.

## 4. Cấu trúc repository đích

```text
smart-recruitment/
├── .github/                         # CI, PR template, issue template, CODEOWNERS
├── docs/                            # Tài liệu được version bằng Git
│   ├── architecture/                # Kiến trúc và các sơ đồ
│   ├── api/                         # API contract và OpenAPI
│   ├── database/                    # ERD, data dictionary, quy ước SQL
│   ├── adr/                         # Architecture Decision Records
│   └── runbooks/                    # Cách chạy, deploy và xử lý sự cố
├── infra/                           # Docker và hạ tầng triển khai
│   └── docker/
├── scripts/                         # Script hỗ trợ local/CI, không có secret
├── src/                             # Spring Boot backend hiện tại
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .editorconfig
├── .gitignore
├── .env.example                     # Chỉ tên biến môi trường, không có giá trị thật
├── README.md
├── CONTRIBUTING.md
└── SECURITY.md
```

Không tạo thư mục `backend/` ở giai đoạn này: repository hiện tại đã là backend Spring Boot. Một thư mục `frontend/` chỉ được thêm khi đội đã chọn công nghệ và bắt đầu xây giao diện.

## 5. Cấu trúc package backend

Package gốc giữ là `com.recruitment.app`. Khi có chức năng nghiệp vụ, tổ chức theo mẫu sau:

```text
src/main/java/com/recruitment/app/
├── Application.java
├── common/
│   ├── config/                      # CORS, OpenAPI, Jackson, cấu hình chung
│   ├── security/                    # Authentication, authorization, JWT
│   ├── exception/                   # Exception chuẩn và GlobalExceptionHandler
│   ├── web/                         # API response, pagination, request metadata
│   ├── validation/                  # Validator/annotation dùng chung
│   └── audit/                       # createdAt, updatedAt, createdBy
└── modules/
    ├── auth/
    ├── users/
    ├── candidates/
    ├── companies/
    ├── jobs/
    ├── applications/
    ├── interviews/
    ├── notifications/
    └── files/
```

Mỗi module có cùng ranh giới:

```text
modules/jobs/
├── api/                             # Controller, request và response DTO
├── application/                     # Use case, service, command/query, mapper
├── domain/                          # Model, rule nghiệp vụ, repository interface
└── infrastructure/                  # JPA, adapter dịch vụ ngoài, scheduler
```

Quy tắc phụ thuộc:

- `api` gọi `application`; không gọi trực tiếp JPA repository.
- `application` điều phối use case và phụ thuộc vào abstraction ở `domain`.
- `infrastructure` hiện thực persistence hoặc tích hợp bên ngoài.
- `common` chỉ chứa phần dùng thật sự chung; không dùng nó như một thư mục `utils` để chứa mọi thứ.
- Một module không truy cập entity/repository nội bộ của module khác. Giao tiếp qua use case công khai, event hoặc interface đã thống nhất.

## 6. Dòng chảy một request

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant UseCase as Application service
    participant Domain
    participant Repository
    participant MySQL

    Client->>Controller: HTTP request + JSON
    Controller->>Controller: Validate request DTO
    Controller->>UseCase: Gọi use case
    UseCase->>Domain: Áp dụng quy tắc nghiệp vụ
    UseCase->>Repository: Lưu/đọc dữ liệu
    Repository->>MySQL: SQL qua JPA
    MySQL-->>Repository: Kết quả
    Repository-->>UseCase: Domain model
    UseCase-->>Controller: Response DTO
    Controller-->>Client: HTTP response + JSON
```

Controller không được trả JPA entity trực tiếp ra API. Request/response DTO giúp API ổn định khi model database thay đổi.

## 7. Database và cấu hình

```text
src/main/resources/
├── application.yml                  # Giá trị mặc định không nhạy cảm
├── application-local.yml.example    # Mẫu cấu hình local
├── application-dev.yml              # Cấu hình dev không có secret
├── application-test.yml             # Cấu hình test
├── application-prod.yml             # Cấu hình production không có secret
└── db/migration/                    # Flyway migration
    ├── V001__create_users.sql
    ├── V002__create_companies.sql
    └── V003__create_jobs.sql
```

Nguyên tắc:

- Mỗi thay đổi schema là một migration SQL mới, có version tăng dần.
- Không sửa migration đã chạy ở môi trường chung.
- Production và shared environment không dùng `ddl-auto: create` hoặc `ddl-auto: update`.
- Password database, JWT secret và API key đến từ biến môi trường hoặc secret manager; không commit vào YAML.
- File build trong `target/` không phải nguồn cấu hình và không được commit.

## 8. Kiểm thử

```text
src/test/
├── java/com/recruitment/app/
│   ├── unit/                        # Test rule/use case không cần database thật
│   ├── integration/                 # Test Spring + persistence/API
│   └── support/                     # Fixture và test helper
└── resources/
    └── application-test.yml
```

Unit test chạy nhanh và không phụ thuộc hạ tầng. Integration test dùng cấu hình test riêng, ưu tiên MySQL Testcontainers khi bộ test bắt đầu cần xác minh JPA migration.

## 9. Quy ước làm việc

- Một Pull Request chỉ tập trung vào một mục tiêu rõ ràng.
- Tên nhánh: `feature/<ticket>-<ten>`, `fix/<ticket>-<ten>`, `docs/<ticket>-<ten>` hoặc `chore/<ticket>-<ten>`.
- Commit dùng dạng `feat(jobs): ...`, `fix(auth): ...`, `docs(architecture): ...`.
- `main` chỉ nhận thay đổi thông qua Pull Request đã được review và CI kiểm tra.
- Không commit `.idea/`, `target/`, `.env`, `application-local.yml`, log hoặc file người dùng tải lên.

## 10. Phạm vi của tài liệu này

Tài liệu này là bản đồ cấu trúc. Chi tiết API sẽ được đặt trong `docs/api/`, chi tiết database trong `docs/database/`, còn mỗi quyết định quan trọng sẽ được ghi thành một file riêng trong `docs/adr/`.
