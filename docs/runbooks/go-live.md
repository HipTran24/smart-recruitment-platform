# Quy Trình Đưa Hệ Thống Vào Vận Hành (Go-Live Runbook)
## SmartRecruit Platform Deployment Operations

### 1. Chuẩn Bị Tiền Điều Kiện (Pre-flight Checklist)

- [x] Docker Engine phiên bản $\ge 24.0$ và Docker Compose v2 đã sẵn sàng.
- [x] Cổng 8443 (Frontend), cổng 8080 (Backend API), cổng 3307 (MySQL Host) không bị ứng dụng khác chiếm dụng.
- [x] Cấu hình môi trường `.env` hoặc các biến `GEMINI_API_KEY` đã được thiết lập.

---

### 2. Các Bước Triển Khai Thực Thi (Execution Steps)

#### Bước 1: Khởi động toàn bộ cụm Container
Từ thư mục gốc dự án, thực thi script tự động hóa build và khởi chạy:
```bash
./scripts/docker-up.sh
```
*Script sẽ tự động build image backend với Java 25, compile frontend production bundle và khởi tạo 3 container trong mạng nội bộ `smart-recruitment-network`.*

#### Bước 2: Kiểm tra trạng thái sức khỏe container (Container Health Check)
Kiểm tra xem cả 3 container đã đạt trạng thái `healthy`:
```bash
docker ps --filter "name=smart-recruitment" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

#### Bước 3: Xác minh Endpoint API trực tiếp (Backend Verification)
Kiểm tra endpoint sức khỏe và tài liệu OpenAPI:
```bash
# Kiểm tra Actuator Health
curl -s http://localhost:8080/actuator/health

# Kiểm tra OpenAPI Docs
curl -s http://localhost:8080/v3/api-docs | head -n 20
```

#### Bước 4: Xác minh Giao diện Nginx & Proxy Routing (Frontend Verification)
Kiểm tra phản hồi HTTP từ Nginx:
```bash
curl -I http://localhost:8443
curl -s http://localhost:8443/api/v1/jobs | head -n 10
```

---

### 3. Danh Mục Đường Dẫn Truy Cập Chính Thức (Live URLs)

- **Cổng thông tin tuyển dụng & Trải nghiệm Ứng viên (Candidate Portal):**  
  👉 **http://localhost:8443/explore-jobs**  
  *(Cho phép xem danh sách việc làm, tìm kiếm, đọc mô tả chi tiết và nộp hồ sơ ứng tuyển).*
- **Phân hệ Nhà tuyển dụng (Recruiter Workspace):**  
  👉 **http://localhost:8443/recruiter/console**  
  *(Quản lý pipeline ứng viên, xem dossier chi tiết, chấm điểm AI, lên lịch phỏng vấn, tạo offer).*
- **Phân hệ Quản trị nền tảng (Platform Admin Governance):**  
  👉 **http://localhost:8443/admin-console**  
  *(Quản trị tài khoản người dùng, phân quyền RBAC có bảo vệ last-admin, quản lý từ điển kỹ năng, audit trail).*
- **Tài liệu đặc tả API OpenAPI / Swagger:**  
  👉 **http://localhost:8080/v3/api-docs**
