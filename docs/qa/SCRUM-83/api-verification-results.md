\# SCRUM-83 Kết quả kiểm tra API và DB



\- Lệnh Maven: -Dtest=ReportVerificationIntegrationTests,KpiIntegrationTests test

\- Runtime: Java 25 trong Docker.

\- Database: MySQL Testcontainers.

\- Authentication: Spring Security test mô phỏng.

\- Tests run: 5.

\- Failures: 0.

\- Errors: 0.

\- Skipped: 0.

\- Build: SUCCESS.

\- Tổng thời gian Maven: 4 phút 47 giây.

\- Kết thúc: 31/10/2026 11:15:18 UTC+7.

\- Exit code: Chưa được lưu riêng.



\## Cảnh báo



Surefire buộc kết thúc fork JVM sau thời hạn shutdown 30 giây.

Dump không có thêm stack trace; nguyên nhân chưa xác minh.



\[Bằng chứng](logs/jvm-shutdown.dumpstream)



\## Giới hạn



\- Chưa kiểm thử dashboard/export.

\- Chưa bổ sung case DST.

\- Chưa kiểm chứng JWT thật.

\- Chưa kết luận toàn bộ SCRUM-83 hoàn thành.

