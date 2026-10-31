\## BUG-01 — Publish báo thành công nhưng không lưu Job



\- Jira bug URL: chưa có

\- Test ID: FLOW-01

\- Môi trường: Docker local trên Windows, http://localhost:8443

\- SHA lúc phát hiện: chưa ghi nhận

\- Các bước tái hiện:

&#x20; 1. Đăng nhập tài khoản qa.recruiter@example.com có quyền Recruiter.

&#x20; 2. Mở trang tạo Job.

&#x20; 3. Điền dữ liệu hợp lệ, tiêu đề QA SCRUM90 — Backend Intern.

&#x20; 4. Nhấn Publish.

&#x20; 5. Kiểm tra danh sách Job.

&#x20; 6. Truy vấn bảng jobs trong DBeaver.

\- Expected: Job được lưu trong database và xuất hiện ở danh sách với trạng thái phù hợp.

\- Actual: Giao diện báo thành công nhưng truy vấn bảng jobs không trả về bản ghi.

\- Bằng chứng:

&#x20; - Ảnh thông báo Publish: chưa bổ sung vào repo.

&#x20; - Ảnh truy vấn jobs rỗng: chưa bổ sung vào repo.

\- Ảnh hưởng: Chặn kiểm thử các bước tiếp theo sử dụng Job này.

\- Kết quả retest: chưa chạy.

