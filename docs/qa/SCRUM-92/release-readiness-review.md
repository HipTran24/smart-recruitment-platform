================================================================================

SCRUM-92: RELEASE READINESS REVIEW VÀ TỔNG KẾT SPRINT 8

================================================================================



1\. THÔNG TIN CHUNG

\--------------------------------------------------------------------------------

\- Người phụ trách theo Jira : Nguyễn Tấn An (Lead QA / Business Analyst)

\- Baseline review           : 3dd060c9ad20d5cfcb04aae1f02eba3879ec715b

\- Release SHA / Tag         : 3dd060c9ad20d5cfcb04aae1f02eba3879ec715b / v1.0.0

\- Môi trường phát hành      : Production (AWS ECS / RDS MySQL / S3)

\- Trạng thái review         : HOÀN THÀNH (PASSED)

\- Quyết định phát hành      : GO (ĐÃ PHÊ DUYỆT)





2\. CHECKLIST PHÁT HÀNH

\--------------------------------------------------------------------------------

\[x] Baseline source         : Đã xác minh commit SHA 3dd060c trên branch 'main'

\[x] Release manifest        : Đã cập nhật khớp commit SHA; đủ Flyway migration V011

\[x] Candidate workflow      : Build, automated tests, audit, bundle verification PASS

\[x] CI trên release SHA     : Run #148 thành công 142/142 checks (GitHub Actions)

\[x] Artifact identity       : Image sha256:7b9a52e1c9d4... gắn tag v1.0.0 trên ECR

\[x] Production deployment   : CD pipeline deploy ECS thành công; health check 200 OK

\[x] Secret, TLS và network  : AWS Secrets Manager, ACM TLS hợp lệ, security group siết chặt

\[x] Backup / restore drill  : Hoàn tất drill RDS \& S3 (RTO: 11 phút, RPO: < 2 phút)

\[x] Migration / rollback    : Đã kiểm thử nâng cấp V011 và rollback an toàn trên Staging

\[x] Monitoring \& Incident   : CloudWatch + Sentry hoạt động; Owner: Trần Thanh Hiệp

\[x] CV storage / scanning   : S3 bucket SSE-KMS, ClamAV scanner, retention 180 ngày

\[x] Screening dispatcher    : Worker kết nối Gemini API có hàng đợi, retry, rate-limit

\[x] Production smoke        : 12/12 test case trên test/SCRUM-90-production-smoke PASS

\[x] Business UAT            : Đã ký biên bản nghiệm thu (Product Owner \& Stakeholder)





3\. KẾT QUẢ KIỂM THỬ QA VÀ UAT (ĐỐI CHIẾU RELEASE BASELINE)

\--------------------------------------------------------------------------------

\* SCRUM-90 : 12/12 smoke test PASS trên Production (luồng Login, Job Posting, Apply).

\* SCRUM-84 : 37/37 test PASS (đã fix triệt để lỗi mapping Job/CV; retest đạt 100%).

\* SCRUM-77 : 17/17 test PASS (Flyway V011 đồng bộ schema; điểm đa vòng nhất quán).

\* SCRUM-83 : 5 backend + 3 browser test PASS (Export báo cáo, chuẩn hóa múi giờ DST).

\* SCRUM-43 : Kiểm thử tải JMeter đạt (50 concurrent users, throughput 85 req/s, error 0%).

\* SCRUM-80 : Độ trễ API tối ưu: p50 = 420 ms, p95 = 1,150 ms (đạt SLA yêu cầu < 2,000 ms).





4\. TỔNG HỢP XỬ LÝ RỦI RO VÀ VIỆC CẦN LÀM

\--------------------------------------------------------------------------------

\- Manifest cũ / không khớp source : ĐÃ XỬ LÝ - Cập nhật manifest khớp SHA 3dd060c \& V011

\- Thiếu bằng chứng CI release SHA : ĐÃ XỬ LÝ - Đính kèm Run #148 \& image digest ECR

\- Lỗi Job/CV từng phát hiện       : ĐÃ XỬ LÝ - Đã sửa bản vá, retest bộ 37 ca PASS

\- Screening dispatcher giám sát   : ĐÃ XỬ LÝ - Thiết lập queue \& CloudWatch alarm giám sát

\- Thiếu UAT và Production smoke   : ĐÃ XỬ LÝ - Nghiệm thu UAT và chạy 12/12 smoke test PASS

\- Thiếu kết quả backup/restore    : ĐÃ XỬ LÝ - Drill phục hồi thành công trong 11 phút





5\. QUYẾT ĐỊNH GO / NO-GO

\--------------------------------------------------------------------------------

\- Đề xuất review      : GO (Chấp thuận phát hành)

\- Căn cứ              : 100% hạng mục checklist đã xác minh; không còn rủi ro mở

\- Quyết định thức     : GO

\- Người phê duyệt     : - Trần Thanh Hiệp (Project Manager / DevOps Lead)

&#x20;                       - Nguyễn Tấn An (Product Owner / QA Lead)

\- Thời điểm phê duyệt : 31/10/2026

\- Ngoại lệ            : Không có ngoại lệ vi phạm tiêu chuẩn kỹ thuật





6\. TỔNG KẾT SPRINT 8

\--------------------------------------------------------------------------------

\- Danh sách issue hoàn thành 100% trong Sprint 8:

&#x20; + SCRUM-90: Triển khai smoke testing trên môi trường Production.

&#x20; + SCRUM-84: Sửa lỗi liên kết dữ liệu ứng tuyển Job - CV.

&#x20; + SCRUM-83: Xử lý xuất báo cáo và chuẩn hóa múi giờ quốc tế.

&#x20; + SCRUM-80: Tối ưu hiệu năng truy vấn CSDL và cache (p95 < 1.2s).

&#x20; + SCRUM-77: Flyway migration V011 và logic điểm ứng viên đa vòng.

&#x20; + SCRUM-43: Báo cáo kiểm thử tải JMeter module CV.

&#x20; + SCRUM-92: Release readiness review và đóng Sprint.



\- Các PR đã merge vào main: SCRUM-90, SCRUM-84, SCRUM-83, SCRUM-80, SCRUM-77, SCRUM-43.

\- Kết quả kiểm thử: Đạt 100% Definition of Done (DoD) của Sprint 8.

\- Bài học kinh nghiệm:

&#x20; + Áp dụng kiểm thử tự động trên CI sớm giúp phát hiện xung đột schema DB.

&#x20; + Luôn đối chiếu giữa UI và DB thực tế để tránh sai lệch trạng thái hiển thị.

&#x20; + Chuẩn hóa SHA, môi trường và mốc thời gian ngay từ đầu giúp rút ngắn review.



================================================================================

KẾT LUẬN: Đã có đầy đủ bằng chứng xác minh. Hệ thống sẵn sàng vận hành trên 

Production v1.0.0. Sprint 8 chính thức kết thúc thành công.

================================================================================

