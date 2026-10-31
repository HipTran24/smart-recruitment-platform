\# SCRUM-43 Điều kiện chạy load test CV



\## Trạng thái



BLOCKED — chưa xác minh được đường kích hoạt xử lý CV.



\## Bằng chứng code



\- ApplicationService.apply tạo application và trả kết quả.

\- Chưa thấy apply tạo/queue screening hoặc gọi workflow.

\- CvScreeningWorkflow.execute cần screening ID và request khớp fingerprint.

\- Workflow không phải HTTP endpoint hoặc scheduler.

\- Truy vấn caller hiện chưa tìm thấy nơi gọi trong code ứng dụng.



Bằng chứng tìm kiếm: screening-call-sites.txt.



\## Cần backend owner cung cấp



1\. Cơ chế tạo/queue screening.

2\. Dispatcher hoặc đường kích hoạt được phép dùng trong môi trường test.

3\. Cách kiểm tra trạng thái thành công/thất bại của screening.

4\. Fixture độc lập: Candidate, Job, CV và consent phù hợp.

5\. Provider test được kiểm soát hoặc quyền sử dụng provider thật.



\## Phần QA sẽ thực hiện sau khi đủ điều kiện



\- Tạo JMeter test plan và assertion.

\- Chạy xác minh 1 user, 1 vòng.

\- Chạy tải trong giới hạn được thống nhất.

\- Báo cáo throughput, latency, error rate và kết quả xử lý.



\## Kết quả hiện tại



\- JMeter: đã khởi động được.

\- Load test xử lý CV: chưa chạy.

\- Throughput/p95/error rate: chưa đo.

\- Chưa kết luận SCRUM-43 hoàn thành.

