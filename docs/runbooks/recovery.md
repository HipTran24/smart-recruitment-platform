# Quy Trình Khôi Phục & Xử Lý Sự Cố (Disaster Recovery & Incident Runbook)
## SmartRecruit Platform Disaster Recovery Plan

### 1. Phân Loại Sự Cố & Kịch Bản Ứng Phó (Incident Scenarios)

#### Kịch Bản A: Cơ Sở Dữ Liệu Bị Lỗi Khóa Ngoài Hoặc Lỗi Migration Drift
- **Hiện tượng:** Backend không khởi động được, log báo `FlywayValidateException` hoặc lỗi schema migration.
- **Hành động khắc phục:**
  1. Kiểm tra log chi tiết:
     ```bash
     docker logs smart-recruitment-app-1 | grep -i "flyway"
     ```
  2. Nếu cần sửa chữa schema checksum, khởi chạy lệnh repair:
     ```bash
     docker exec -it smart-recruitment-app-1 java -cp ... org.flywaydb.commandline.Main repair
     ```
  3. Trong môi trường dev/local nếu cần làm mới sạch sẽ database:
     ```bash
     docker compose -f compose.local.yml down -v
     docker compose -f compose.local.yml up -d
     ```

#### Kịch Bản B: Người Dùng Bị Khóa Quyền Nhưng JWT Cũ Còn Hạn
- **Hiện tượng:** Admin vừa thu hồi quyền hoặc khóa một tài khoản, nhưng lo ngại Access Token của họ còn hiệu lực trong 15 phút.
- **Cơ chế tự động (Built-in Guard):**
  - Hệ thống sử dụng `LiveAccountValidator` kết hợp trường `credential_version` trong bảng `users`.
  - Bất cứ khi nào tài khoản bị khóa (`deactivate()`) hoặc thay đổi vai trò (`updateUserRoles()`), `credentialVersion` tự động tăng lên $N+1$.
  - Mọi request tiếp theo mang JWT cũ (có `credentialVersion = N`) sẽ bị `JwtAuthenticationFilter` chặn ngay lập tức với mã HTTP 401 Unauthorized tại cổng servlet, không cần chờ hết hạn 15 phút.

#### Kịch Bản C: Quản Trị Viên Vô Tình Tự Tước Quyền Admin (Last Admin Guard)
- **Hiện tượng:** Admin thực hiện hạ cấp hoặc khóa tài khoản admin duy nhất trong hệ thống.
- **Cơ chế bảo vệ (Safety Barrier):**
  - Phương thức `AdminUserService.updateUserRoles()` và `updateUserStatus()` tự động đếm số lượng admin đang hoạt động thông qua `countActivePlatformAdmins()`.
  - Nếu số lượng $\le 1$, hệ thống lập tức từ chối và ném lỗi `IllegalStateException("Cannot remove/deactivate the last active platform administrator")`.
  - Nếu muốn bổ sung admin khẩn cấp từ dòng lệnh DB:
    ```sql
    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id FROM users u, roles r
    WHERE u.email = 'emergency-admin@smartrecruit.local' AND r.code = 'ROLE_PLATFORM_ADMIN'
    ON DUPLICATE KEY UPDATE user_id = u.id;
    ```

#### Kịch Bản D: Quá Tải API Sàng Lọc Gemini AI
- **Hiện tượng:** Gemini API trả về mã lỗi 429 Quota Exceeded hoặc timeout.
- **Cơ chế dự phòng (Graceful Degradation):**
  - `GeminiCvScreeningClient` tự động chuyển đổi sang bộ tính điểm xác định (Deterministic Rule-based Matcher).
  - Thuật toán tự động đối chiếu từ khóa kỹ năng giữa yêu cầu việc làm và CV thô của ứng viên để đưa ra điểm số có giải thích, đảm bảo pipeline tuyển dụng của Recruiter không bị gián đoạn.

---

### 2. Quy Trình Khôi Phục Dữ Liệu (Backup & Restore)

```bash
# Sao lưu dữ liệu MySQL
docker exec smart-recruitment-mysql-1 mysqldump -u recruitment_user -precruitment_password recruitment_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Khôi phục dữ liệu từ bản sao lưu
docker exec -i smart-recruitment-mysql-1 mysql -u recruitment_user -precruitment_password recruitment_db < backup_file.sql
```
