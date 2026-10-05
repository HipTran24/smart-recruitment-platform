# Báo Cáo Kết Quả Kiểm Thử (Test Execution Report)
## SmartRecruit Platform Quality Gates

### 1. Tổng Quan Kết Quả Kiểm Thử

| Phân Vùng Kiểm Thử | Công Cụ / Framework | Tổng Số Test Case | Thành Công (Pass) | Thất Bại (Fail) | Tỷ Lệ Đạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kiến Trúc Module Monolith** | ArchUnit 1.4.1 (Java 25 LTS) | 9 | 9 | 0 | **100%** |
| **Frontend Unit & Integration** | Vitest 5.0.3 + React Testing Library | 22 | 22 | 0 | **100%** |
| **Frontend Static Type Check** | TypeScript `tsc --noEmit` | N/A | 0 Errors | 0 | **100%** |
| **Frontend Production Build** | Vite 8.3.1 (Rollup/Gzip) | N/A | 0 Errors | 0 | **100%** |
| **Database Migrations** | Flyway Community (V001 - V010) | 10 Scripts | 10 Validated | 0 | **100%** |

---

### 2. Chi Tiết Bài Kiểm Tra Kiến Trúc (ArchUnit Tests)

1. `productionClassesContainNoTestClasses`: Đảm bảo bytecode sản phẩm không lẫn lộn mã kiểm thử. $\to$ **PASS**
2. `persistenceEntitiesDoNotReferenceEntitiesFromAnotherModule`: Tuyệt đối không cho phép thực thể JPA tham chiếu chéo giữa các module (applications, candidates, companies, identity, jobs). $\to$ **PASS**
3. `domainHasNoDependenciesOnInfrastructureApplicationOrFrameworks`: Domain models hoàn toàn độc lập với Spring Boot, Hibernate và tầng ngoài. $\to$ **PASS**
4. `applicationDoesNotDependOnInfrastructure`: Tầng ứng dụng chỉ phụ thuộc vào domain và các outbound port interfaces. $\to$ **PASS**
5. `apiDoesNotDependDirectlyOnPersistenceEntities`: Tầng REST API chỉ trao đổi DTO, không làm lộ các entity persistence. $\to$ **PASS**
6. `apiDoesNotDependOnInfrastructure`: API phụ thuộc trực tiếp vào Application Service, không gọi tắt xuống Repository/Infrastructure. $\to$ **PASS**
7. `infrastructureDoesNotDependOnApi`: Tầng hạ tầng kỹ thuật không phụ thuộc ngược lên tầng trình diễn API. $\to$ **PASS**
8. `modulesAreFreeOfCyclicDependencies`: Kiểm tra phụ thuộc dạng đồ thị có hướng (DAG), hoàn toàn không có chu trình (cycle-free). $\to$ **PASS**
9. `sourceAndTestFilesRespectSizeBudgets`:
   - Lớp nghiệp vụ không vượt quá 400 dòng.
   - REST Controller không vượt quá 200 dòng.
   - Hàm/phương thức không vượt quá 60 dòng. $\to$ **PASS**

---

### 3. Chi Tiết Kiểm Thử Frontend (Vitest Suite)

- **API Interceptor & Single-Flight Refresh (`src/lib/api.test.ts` - 10 tests):**
  - Chèn Bearer token tự động khi gọi các endpoint yêu cầu xác thực.
  - Khóa single-flight refresh lock: 10 request đồng thời hết hạn chỉ kích hoạt duy nhất 1 request `POST /api/v1/auth/refresh`.
  - Hủy bỏ phiên và từ chối token nếu session generation không khớp (ngăn chặn tái sử dụng token sau logout).
  - Timeout an toàn 8000ms qua AbortController khi backend không phản hồi.
- **Xác Thực & Quản Lý Phiên (`src/auth/auth.test.tsx` - 4 tests):**
  - Khởi tạo trạng thái phiên từ token bộ nhớ.
  - Phân tích quyền hạn roleCodes đa chiều.
  - Xử lý luồng đăng xuất dọn dẹp sạch token trong RAM.
- **Điều Hướng & Bảo Vệ Tuyến Đường (`src/App.test.tsx` - 8 tests):**
  - Tuyến công khai `/explore-jobs` và `/jobs/:id` cho phép truy cập vô danh.
  - Tuyến `/admin-console` chặn Candidate và người dùng chưa đăng nhập.
  - Tuyến `/recruiter/**` chặn Candidate và Platform Admin (tuân thủ ADR 0003).
  - Tuyến `/my-applications` chuyển hướng đúng về workspace cá nhân của ứng viên.
