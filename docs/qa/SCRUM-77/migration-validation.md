\# SCRUM-77 Kết quả kiểm chứng database và migration



\## Môi trường



\- Người thực hiện: An Nguyen

\- Branch: db/SCRUM-77-schema-validation

\- Runtime: Java 25 trong Docker

\- Database: MySQL 8.4.11 do Testcontainers tạo riêng

\- Database local/production: Không dùng làm đích kiểm thử

\- SHA kiểm thử migration: Chưa bổ sung

\- Thời điểm chạy migration: Chưa bổ sung



\## Kết quả constraint, domain và validation



\- Tests run: 17

\- Failures: 0

\- Errors: 0

\- Skipped: 0

\- Build: SUCCESS

\- Tổng thời gian Maven: 2 phút 58 giây

\- Kết thúc: 31/10/2026 10:50:39 UTC+7



Phạm vi:

\- Application uniqueness và foreign key.

\- Giá trị trạng thái trong database.

\- History actor, trạng thái và timestamp trong test DB.

\- Domain transition và history.

\- Evaluation score boundaries và foreign key.

\- Lưu nhiều evaluation trên cùng application.

\- DTO/entity từ chối điểm ngoài 0–100.



\## Kết quả migration



| Kiểm tra | Kết quả |

|---|---|

| Empty database đến migration mới nhất | Chờ đối chiếu log |

| Upgrade V006 → V007 có backfill dữ liệu | Chờ đối chiếu log |

| Upgrade tiếp V008/V009 và kiểm tra dữ liệu | Chờ đối chiếu log |

| Exit code | Chưa bổ sung |



\- \[Log migration](logs/migration-validation.txt)

\- Chi tiết test: src/test/java/com/recruitment/app/SchemaMigrationUpgradeTests.java



\## Thay đổi thực hiện



\- Thêm test history và constraint DB.

\- Bổ sung validation điểm evaluation.

\- Điểm ngoài 0–100 bị từ chối thay vì tự đổi thành 0 hoặc 100.

\- Không tạo migration mới.

\- Không sửa migration lịch sử.

\- Giữ nguyên cách xử lý score null hiện có.



\## Giới hạn



\- Lưu nhiều evaluation chưa chứng minh đầy đủ nghiệp vụ nhiều vòng và tổng hợp điểm.

\- Chưa có test HTTP xác nhận endpoint trả 400 cho điểm sai.

\- Test history SQL không thay thế kiểm thử tích hợp tự động ghi history.

\- Chưa kiểm chứng quy trình rollback/restore của deployment.

\- CI run URL: Chưa bổ sung.

\- PR URL: Chưa bổ sung.



\## Kết luận



Kết quả 17 test đã được ghi nhận.

Kết luận migration chỉ được cập nhật sau khi đối chiếu log thực chạy.

Chưa kết luận hoàn thành toàn bộ acceptance criteria SCRUM-77.

