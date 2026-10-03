# SMARTRECRUIT – PROJECT SETUP & AI DEVELOPMENT CONTEXT
# Bộ ngữ cảnh kỹ thuật thống nhất cho đội phát triển và AI coding agents

| Thuộc tính | Giá trị baseline |
| :--- | :--- |
| **Phiên bản tài liệu** | 1.1 — Engineering baseline có Admin RBAC |
| **Lịch dự án** | 08 Sprint: 08/09/2026 – 02/11/2026; 03/11/2026 là mốc UAT/nghiệm thu/đóng dự án. |
| **Tổng ngân sách baseline** | 33.052.000 VNĐ (gồm 30.240.000 VNĐ nhân công 108 ngày công, 1.300.000 VNĐ chi phí trực tiếp và 1.512.000 VNĐ dự phòng rủi ro). |
| **Kiến trúc hệ thống** | Modular Monolith: Spring Boot 4.1.1 + Java 25 LTS + React 19 SPA + MySQL 8.4 LTS. |
| **AI Model & Adapter** | Google Gemini 2.5 Flash (server-side adapter, JSON Schema structured output, tối đa 3 attempt, connect timeout 3s, read timeout 30s). |
| **Hạ tầng triển khai demo** | AWS EC2 (Ubuntu + Nginx reverse proxy) + RDS MySQL 8.4 (private subnet) + S3 private bucket + ECR + SSM. |
| **Nguyên tắc cốt lõi** | Human-in-the-loop (AI chỉ gợi ý minh bạch, Recruiter quyết định, không auto-reject); Admin Least-privilege (không xem CV raw). |

## 1. PHẠM VI MVP (IN-SCOPE & OUT-OF-SCOPE)
- **In-Scope:** React SPA dark/light theme; Spring Boot REST API modular monolith; CSDL MySQL 8.4 LTS; xác thực JWT + Google OIDC (PKCE); phân quyền RBAC 3 vai trò (Candidate, Recruiter, Admin); Admin Console quản trị role/status, taxonomy và audit; quản lý Job, nộp CV PDF/DOCX qua S3 private; trích xuất có cấu trúc qua Gemini 2.5 Flash; thuật toán đối chiếu điểm minh bạch; dự thảo email phản hồi có kiểm duyệt; Docker Compose; CI/CD GitHub Actions; triển khai demo AWS.
- **Out-of-Scope:** Ứng dụng di động native; OCR nhận dạng CV quét ảnh viết tay; tích hợp tự động ATS/HRIS/Payroll bên ngoài; tự động loại bỏ (auto-reject) ứng viên; cam kết SLA 24/7 thương mại; xử lý dữ liệu CV thật khi chưa có văn bản đồng ý (consent).

## 2. DANH MỤC NGHIỆP VỤ CSDL (không giới hạn 16 bảng)
1. Identity: `users`, `refresh_tokens`, `auth_identities`
2. Recruiting: `jobs`, `skills`, `job_skills`, `applications`
3. CV & AI: `cv_files`, `cv_extractions`, `extraction_runs`
4. Assessment: `match_results`, `evaluations`, `interview_rounds`, `feedback_drafts`
5. Operations: `notification_events`, `audit_events`

## 3. CƠ CẤU 24 MÀN HÌNH GIAO DIỆN
- 01 Trang xác thực chung (Login / Register / Session UX)
- 06 Màn hình Candidate (Job Discovery, Job Details, Profile & Consent, CV Upload & Status, My Applications, Status Tracker)
- 11 Màn hình Recruiter (Overview, Job Postings, Job Studio, Ranking Matrix, Application Dossier, Evaluation, Interview Scheduling, Feedback Review, Notifications, Analytics Dashboard, Account Settings)
- 06 Màn hình Admin Console (Admin Overview, User Directory, User Role/Status Mutation, Skill Taxonomy Management, Audit Event Explorer, Admin Settings)
