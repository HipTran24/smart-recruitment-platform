# SmartRecruit - Baseline Integration Inventory (INT-00)

**Ngày lập:** 05/10/2026  
**Trạng thái:** Baseline Verified & Locked  
**Tham chiếu:** `docs/architecture/frontend-backend-integration-plan.md`, `ADR 0003`, `GEMINI.md`

---

## 1. Môi trường phát triển và Toolchain đã khóa (Environment Lock)

| Thành phần | Cấu hình / Phiên bản đã xác minh | Lệnh kiểm tra | Trạng thái |
|---|---|---|---|
| **JDK** | Amazon Corretto `25.0.4.1` (Khớp `pom.xml` Java 25 LTS) | `JAVA_HOME=... java -version` | **PASS** |
| **Node.js** | Node.js `v26.10.0` | `node -v` | **PASS** |
| **Package Manager** | npm `11.19.1` (`package-lock.json` frozen) | `npm -v` | **PASS** |
| **Docker Engine** | Docker Desktop `29.2.1` | `docker info` | **PASS** (Active) |
| **Database Container** | MySQL `8.4.11` via Testcontainers | `mvn test -Dtest=OpenApiControllerTests` | **PASS** (Flyway V001..V009 applied) |
| **Frontend Server** | Vite 8.3.1 trên cổng `8443` | `npm --prefix frontend run test` | **PASS** (7/7 tests passed) |
| **Frontend Build** | Rollup bundle production | `npm --prefix frontend run build` | **PASS** (Built cleanly) |
| **Backend Architecture** | ArchUnit modular monolith checks | `mvn test -Dtest=ModuleArchitectureTests` | **PASS** (9/9 rules passed) |

---

## 2. Bảng phân loại Inventory Màn hình, Quyền và Trạng thái Tích hợp

### 2.1 Luồng Xác thực & Định danh (Identity & Security)
- **Tình trạng trước tích hợp:** Đã có backend API (`/api/v1/auth/*`), nhưng frontend thiếu hoàn toàn các trang Auth UI và Route Guard; chưa có phiên in-memory.
- **Kế hoạch INT-03:** Bổ sung trang `Login.tsx`, `Register.tsx`, `VerifyEmail.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`. Triển khai `AuthProvider` in-memory và single-flight refresh lock.

### 2.2 Không gian Ứng viên (Candidate Workspace - Emerald Theme)
| Trang | Đường dẫn | Quyền yêu cầu | Target API Contract | Trạng thái |
|---|---|---|---|---|
| `ExploreJobs.tsx` | `/explore-jobs`, `/explore-jobs/:jobId` | Public / Candidate | `GET /api/v1/jobs`, `GET /api/v1/jobs/{id}` | Target (INT-06) |
| `ViewDetails.tsx` | `/views_details`, `/jobs/:jobId` | Public / Candidate | `GET /api/v1/jobs/{id}`, `POST /api/v1/jobs/{id}/applications` | Target (INT-06, INT-07) |
| `ProfileResume.tsx` | `/profile-resume` | `ROLE_CANDIDATE` | `GET/PUT /api/v1/candidates/me`, CV upload sessions | Target (INT-04, INT-05) |
| `MyApplication.tsx` | `/my-applications`, `/my-applications/:id` | `ROLE_CANDIDATE` | `GET /api/v1/candidates/me/applications`, withdraw action | Target (INT-07) |
| `InterviewsOffer.tsx` | `/interviews-offers` | `ROLE_CANDIDATE` | `GET /api/v1/candidates/me/interviews`, `GET /api/v1/candidates/me/offers` | Target (INT-09) |
| `ReviewOffer.tsx` | `/offers/:offerId/review` | `ROLE_CANDIDATE` | `GET /api/v1/candidates/me/offers/{id}`, accept/decline | Target (INT-09) |
| `CandidateSettings.tsx` | `/settings_candidate` | `ROLE_CANDIDATE` | `POST /api/v1/auth/password/change` | Target (INT-03) |

### 2.3 Không gian Nhà tuyển dụng (Recruiter Workspace - Blue Theme)
| Trang | Đường dẫn | Quyền yêu cầu | Target API Contract | Trạng thái |
|---|---|---|---|---|
| `RecruiterConsole.tsx` | `/recruiter/console` | `ROLE_RECRUITER` | `GET /api/v1/recruiter/reports/overview` | Target (INT-10) |
| `JobRequisitionsDashboard.tsx` | `/recruiter/jobs` | `ROLE_RECRUITER` | `GET /api/v1/recruiter/jobs`, publish/close actions | Target (INT-06) |
| `JobCreationStudio.tsx` | `/recruiter/jobs/create` | `ROLE_RECRUITER` | `POST /api/v1/recruiter/jobs`, publish draft | Target (INT-06) |
| `CandidateManagement.tsx` | `/recruiter/candidates` | `ROLE_RECRUITER` | `GET /api/v1/recruiter/applications` (shared team only) | Target (INT-07) |
| `ApplicationDetailDossier.tsx`| `/recruiter/candidates/detail`, `/recruiter/candidates/:id` | `ROLE_RECRUITER` | `GET /api/v1/recruiter/applications/{id}`, stage transition | Target (INT-07) |
| `EvaluationFeedbackRecruiter.tsx` | `/recruiter/evaluations` | `ROLE_RECRUITER` | `GET/POST /api/v1/recruiter/applications/{id}/evaluations` | Target (INT-07) |
| `BulkCandidateScreeningHub.tsx` | `/recruiter/candidates/bulk` | `ROLE_RECRUITER` | `POST /api/v1/recruiter/screening-batches` | Target (INT-08) |
| `AIFeedbackDraftStudio.tsx` | `/recruiter/ai-feedback` | `ROLE_RECRUITER` | `GET/POST /api/v1/recruiter/feedback-drafts`, approve/send | Target (INT-10) |
| `InterviewCalendar.tsx` | `/recruiter/calendar` | `ROLE_RECRUITER` | `GET/POST /api/v1/recruiter/interviews` | Target (INT-09) |
| `HiringAnalyticsRecruiter.tsx` | `/recruiter/analytics` | `ROLE_RECRUITER` | `GET /api/v1/recruiter/reports/funnel` | Target (INT-10) |
| `NotificationAuditLogCenter.tsx` | `/recruiter/notifications` | `ROLE_RECRUITER` | `GET /api/v1/notifications`, read action | Target (INT-10) |

### 2.4 Không gian Quản trị viên Nền tảng (Platform Admin - Neutral-Black Dark Theme)
| Trang | Đường dẫn | Quyền yêu cầu | Quyết định bảo mật (ADR 0003) |
|---|---|---|---|
| `AdminConsole.tsx` | `/admin`, `/admin-console` | `ROLE_PLATFORM_ADMIN` | `GET /api/v1/admin/operations/overview` (chỉ số hạ tầng/hệ thống, không chứa CV raw). |
| `UserDirectory.tsx` | `/user-directory` | `ROLE_PLATFORM_ADMIN` | `GET /api/v1/admin/users`, quản trị tài khoản người dùng. |
| `UserRoleManagement.tsx` | `/users-roles` | `ROLE_PLATFORM_ADMIN` | Gán vai trò/status, bảo vệ Last Active Admin. |
| `SkillTaxonomy.tsx` | `/skill-taxonomy` | `ROLE_PLATFORM_ADMIN` | `GET/POST /api/v1/admin/skills`, quản trị từ điển kỹ năng. |
| `AuditEventExplorer.tsx` | `/audit` | `ROLE_PLATFORM_ADMIN` | `GET /api/v1/admin/audit-events` (metadata đã lọc, cấm log token/CV). |
| `SettingsConfiguration.tsx` | `/settings` | `ROLE_PLATFORM_ADMIN` | `GET/PUT /api/v1/admin/operations/settings`. |
| Tuyển dụng trên Admin UI | `/jobs`, `/applications`, `/candidates` | `ROLE_PLATFORM_ADMIN` | **Admin Least Privilege:** Admin bị từ chối truy cập CV dossier; chuyển hướng sang quản trị taxonomy/users. |

---

## 3. Các quyết định kiến trúc đã thống nhất (Mục 5)

1. **Shared Recruiting Team (ADR 0003):** Company là metadata, quyền tuyển dụng dựa trên shared squad / team.
2. **Xác minh Email cho Local / E2E:** Tạo harness `TestMailbox` trong cấu hình không phải production để browser/Postman lấy token xác minh mà không log token nhạy cảm ra production.
3. **Session In-Memory:** Tuyệt đối không lưu Access/Refresh token vào `localStorage` hoặc `sessionStorage`. Reload trang chủ động đưa về trạng thái đăng nhập hoặc bảo vệ phiên theo chính sách.
4. **Single-Flight Refresh:** 10 request đồng thời hết hạn access token trong cùng phiên chỉ kích hoạt đúng 1 request refresh duy nhất qua shared Promise.
