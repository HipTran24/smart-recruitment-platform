# Danh Mục Tính Năng Hệ Thống (Feature Inventory)
## SmartRecruit Platform – Version 1.0.0-RELEASE

### 1. Phân Hệ Ứng Viên (Candidate Workspace – Emerald Theme)

| Tính Năng | Tuyến URL Frontend | Endpoint API Backend | Quyền Hạn (RBAC) | Mô Tả & Ràng Buộc Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| **Duyệt việc công khai** | `/explore-jobs`, `/jobs/:jobId` | `GET /api/v1/jobs`, `GET /api/v1/jobs/:id` | Công khai (Public) | Tìm kiếm việc làm đã xuất bản (Published), lọc theo loại hình làm việc, địa điểm, từ khóa. |
| **Đăng ký & Xác thực** | `/register`, `/login`, `/verify-email` | `/api/v1/auth/register`, `/login`, `/verify-email` | Công khai (Public) | Đăng ký tài khoản mật khẩu mạnh hoặc Google OIDC; kiểm tra email kích hoạt; cấp JWT. |
| **Quản lý Hồ sơ & Consent** | `/profile-resume` | `GET/PUT /api/v1/candidates/me`, `/consent` | `ROLE_CANDIDATE` | Cập nhật thông tin liên hệ, học vấn, kinh nghiệm, kỹ năng và xác nhận đồng thuận AI (Consent). |
| **Tải lên & Quản lý CV** | `/profile-resume` | `GET/POST /api/v1/candidates/me/resumes` | `ROLE_CANDIDATE` | Tải lên file CV (PDF/DOCX max 10MB), gắn cờ CV chính (Primary Resume), trích xuất văn bản thô. |
| **Nộp đơn ứng tuyển** | `/jobs/:jobId` (Apply Modal) | `POST /api/v1/jobs/:id/applications` | `ROLE_CANDIDATE` | Đính kèm CV đã tải lên, nhập thư giới thiệu (Cover letter); chặn nộp trùng vào cùng vị trí. |
| **Theo dõi tiến trình hồ sơ**| `/my-applications` | `GET /api/v1/candidates/applications` | `ROLE_CANDIDATE` | Xem trạng thái từng đơn: Applied, Screened, In Review, Interviewing, Offer Stage, Closed. |
| **Xem & Phản hồi Offer** | `/offers/:offerId/review` | `PUT /api/v1/candidates/offers/:id/response` | `ROLE_CANDIDATE` | Xem chi tiết mức lương, phụ cấp, hạn phản hồi; thực hiện Chấp nhận (Accept) hoặc Từ chối (Decline). |

---

### 2. Phân Hệ Nhà Tuyển Dụng (Recruiter Workspace – Blue Theme)

| Tính Năng | Tuyến URL Frontend | Endpoint API Backend | Quyền Hạn (RBAC) | Mô Tả & Ràng Buộc Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| **Tổng quan Tuyển dụng** | `/recruiter/console` | `GET /api/v1/recruiter/jobs`, `applications` | `ROLE_RECRUITER` | Thống kê số lượng tin tuyển dụng, tổng số ứng viên, tỷ lệ match trung bình, việc sắp đóng. |
| **Tạo & Xuất bản Việc làm**| `/recruiter/job-creation` | `POST /api/v1/recruiter/jobs`, `.../publish` | `ROLE_RECRUITER` | Tạo tin tuyển dụng mới với trọng số đánh giá; lưu nháp hoặc xuất bản trực tiếp lên bảng tin. |
| **Quản lý Ứng viên Pipeline**| `/recruiter/candidates` | `GET /api/v1/recruiter/applications` | `ROLE_RECRUITER` | Xem danh sách ứng viên nộp theo từng việc làm, lọc theo giai đoạn tuyển dụng (stage). |
| **Hồ sơ Ứng viên (Dossier)** | `/recruiter/candidates/:id` | `GET /api/v1/recruiter/applications/:id/dossier` | `ROLE_RECRUITER` | Xem toàn bộ chi tiết hồ sơ, điểm AI screening, kỹ năng khớp, văn bản CV, thư giới thiệu. |
| **Kích hoạt AI Sàng lọc** | `/recruiter/candidates/:id` | `POST .../applications/:id/screening` | `ROLE_RECRUITER` | Gọi Gemini 2.5 Flash phân tích mức độ phù hợp và giải thích điểm số minh bạch (Human-in-the-loop). |
| **Chuyển giai đoạn (Stage)** | `/recruiter/candidates/:id` | `PUT .../applications/:id/stage` | `ROLE_RECRUITER` | Chuyển trạng thái: REVIEWING $\to$ INTERVIEW $\to$ OFFER $\to$ HIRED / REJECTED theo quy tắc. |
| **Đánh giá Chuyên môn** | `/recruiter/evaluations` | `POST .../applications/:id/evaluations` | `ROLE_RECRUITER` | Ghi điểm phỏng vấn, đánh giá kỹ thuật, mức độ phù hợp văn hóa (Cultural fit), điểm mạnh/yếu. |
| **Lên lịch Phỏng vấn** | `/recruiter/calendar` | `POST .../applications/:id/interviews` | `ROLE_RECRUITER` | Đặt lịch phỏng vấn (Panel, 1-on-1), liên kết phòng họp trực tuyến, thời lượng, ghi chú. |
| **Phát hành Lời mời (Offer)**| `/recruiter/candidates/:id` | `POST .../applications/:id/offers` | `ROLE_RECRUITER` | Nhập mức lương đề xuất, đơn vị tiền tệ, hạn chót phản hồi; chuyển trạng thái hồ sơ sang OFFER. |
| **Dự thảo Phản hồi Ứng viên**| `/recruiter/ai-feedback` | `GET/PUT .../applications/:id/feedback` | `ROLE_RECRUITER` | AI đề xuất bản nháp email phản hồi lịch sự, mang tính xây dựng; Recruiter chỉnh sửa trước khi gửi. |

---

### 3. Phân Hệ Quản Trị Hệ Thống (Platform Admin – Neutral Dark Theme)

| Tính Năng | Tuyến URL Frontend | Endpoint API Backend | Quyền Hạn (RBAC) | Mô Tả & Ràng Buộc Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| **Trung tâm Điều hành Admin**| `/admin-console` | `GET /actuator/health`, `/api/v1/admin/users` | `ROLE_PLATFORM_ADMIN` | Giám sát trạng thái cụm microservices, tổng số tài khoản, lưu lượng xác thực và tuân thủ. |
| **Danh mục Tài khoản** | `/user-directory` | `GET /api/v1/admin/users`, `GET /users/:id` | `ROLE_PLATFORM_ADMIN` | Tra cứu người dùng, phân loại tài khoản theo vai trò (Candidate, Recruiter, Admin), trạng thái. |
| **Phân quyền & Khóa tài khoản**| `/users-roles` | `PUT /api/v1/admin/users/:id/roles`, `/status` | `ROLE_PLATFORM_ADMIN` | Gán vai trò, kích hoạt/khóa tài khoản. **Bảo vệ Last Active Admin** và cấm kết hợp Admin + Recruiter. |
| **Từ điển Kỹ năng (Taxonomy)**| `/skill-taxonomy` | `GET/POST/DELETE /api/v1/admin/skills` | `ROLE_PLATFORM_ADMIN` | Quản trị cây kỹ năng chuẩn hóa (Frontend, Backend, DevOps, Data, Soft Skills) cho AI matching. |
| **Nhật ký Kiểm toán (Audit)**| `/audit` | `GET /api/v1/admin/audit-events` | `ROLE_PLATFORM_ADMIN` | Tra cứu vết kiểm toán WORM: hành động, người thực hiện, tài nguyên, địa chỉ IP và traceId. |
| **Cấu hình Vận hành (Settings)**| `/settings` | `GET/PUT /api/v1/admin/operations/settings` | `ROLE_PLATFORM_ADMIN` | Quản lý allowlist cài đặt: Chế độ bảo trì, bật/tắt đăng ký mới, phiên bản AI model, giới hạn file. |
| **Quy tắc Least Privilege** | N/A (Bị chặn ở cấp API) | Tuyệt đối cấm gọi Dossier, CV thô | `ROLE_PLATFORM_ADMIN` | Admin không có quyền xem nội dung CV, không can thiệp vào quyết định tuyển dụng của Recruiter. |
