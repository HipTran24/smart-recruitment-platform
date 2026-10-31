# Việt hóa kết quả sàng lọc và dữ liệu CV kiểm thử — 31/10/2026

Đã tạo thêm 26 tài khoản ứng viên, tải 26 file CV từ các thư mục 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20 và tạo 26 đơn ứng tuyển vào công việc IT (mã 3) của recruiter.test@smartrecruit.local. Các hồ sơ này là dữ liệu kiểm thử cục bộ; tên tài khoản dùng số nhóm CV để dễ đối chiếu.

## Sử dụng

1. Đăng nhập nhà tuyển dụng tại http://localhost:8444/login bằng tài khoản recruiter.test@smartrecruit.local đã được cấp.
2. Mở http://localhost:8444/recruiter/candidates/screening. Có 27 hồ sơ thuộc công việc IT: 26 hồ sơ mới và 1 hồ sơ đã có.
3. Chọn từng hồ sơ hoặc bấm **Chọn tất cả**, rồi bấm **Phân tích … hồ sơ**. Nút chọn tất cả không tự gửi CV sang AI.
4. Mở **Chi tiết** để xem giải thích bằng tiếng Việt, tiêu chí phù hợp và cần kiểm chứng.

Mỗi ứng viên mới có một CV và một đơn ứng tuyển riêng. Toàn bộ 26 tài khoản đã được đăng nhập qua API và xác minh quyền ứng viên. Danh sách email, mật khẩu và ánh xạ CV nằm tại `.local/cv-test-fixtures.md`; file này được Git bỏ qua và có quyền đọc/ghi chỉ cho chủ sở hữu. Mật khẩu ba tài khoản kiểm thử đã cấp trước đó không thay đổi.

## Việt hóa

- Gemini được yêu cầu viết phần tóm tắt, tiêu chí phù hợp/còn thiếu và giới hạn bằng tiếng Việt; tên công nghệ được giữ nguyên.
- Giao diện hiển thị “Đã hoàn tất”, “Đang phân tích”, “Trung lập”… thay cho mã trạng thái/khuyến nghị tiếng Anh. Mã trao đổi với API vẫn giữ nguyên.
- Phiên bản chính sách `gemini-cv-screening-v2-vi` được đưa vào khóa cache. Yêu cầu mới không dùng lại kết quả tiếng Anh từ chính sách cũ.
- Hồ sơ 1038 trong ảnh và hồ sơ 1064 mới đã được chạy lại bằng Gemini thật, đều hoàn tất và trả phần giải thích bằng tiếng Việt. Đây là lượt đánh giá mới, vì vậy điểm mới có thể khác lượt trước; kết quả cũ vẫn được giữ trong lịch sử các lần phân tích. Hồ sơ 1038 trước đây 65 điểm, lượt mới 60; hồ sơ 1064 được 40 điểm theo tiêu chí của công việc IT.
- 25 hồ sơ mới còn lại chưa được tự động chạy AI, để người dùng tự chọn và kiểm thử. Hạn mức Gemini và nhịp gọi 13 giây vẫn được giữ.

## Xác minh

- 145 test backend đạt, gồm hồi quy cache theo ngôn ngữ; coverage gate và ArchUnit đạt.
- 44 test frontend và TypeScript đạt.
- 39 test Playwright đạt, gồm kiểm tra nhãn tiếng Việt vẫn gửi đúng mã API và chọn/bỏ chọn toàn bộ hồ sơ.
- Trình duyệt với API thật: nhìn thấy đủ 26 ứng viên mới; chọn được cả 27 hồ sơ hiện có; kết quả và khuyến nghị ở trang chi tiết bằng tiếng Việt; không tràn ngang ở 390 px; không phát hiện lỗi JavaScript hoặc vi phạm trong bộ axe WCAG được chạy.

## Số hồ sơ theo nhóm CV

| Thư mục | Số tài khoản / CV / đơn mới |
|---|---:|
| 8 | 3 |
| 9 | 3 |
| 10 | 1 |
| 12 | 2 |
| 13 | 3 |
| 14 | 2 |
| 15 | 3 |
| 17 | 2 |
| 18 | 3 |
| 19 | 1 |
| 20 | 3 |
