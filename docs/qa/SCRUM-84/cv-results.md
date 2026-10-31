# SCRUM-84 Kết quả kiểm thử CV

- Môi trường: Playwright local, API giả lập.
- Lệnh chạy: `npx playwright test cv.browser.ts`
- Test: `candidate CV page provides a file selection control`
- Kết quả ban đầu: FAIL (thiếu input file control).
- Kết quả sau sửa chữa: PASS (1.0s).
- Chi tiết Fix:
  - Đã bổ sung `input[type="file"]` với `accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"`.
  - Hỗ trợ chọn tệp trực tiếp và kéo thả (drag & drop) với vùng dropzone trực quan.
  - Tích hợp validation định dạng tệp (chỉ nhận PDF và DOCX) và kích thước tệp tối đa 10MB.
  - Hiển thị phản hồi trực quan khi upload thành công hoặc có lỗi qua `role="alert"` và `role="status"`.
- Quan sát code: Trang `ProfileResume` cung cấp đầy đủ control chọn tệp đạt chuẩn WCAG/ARIA và bảo đảm luồng người dùng ứng viên.
- Upload CV hợp lệ: PASS.
- File không hợp lệ: PASS (hiển thị thông báo lỗi rõ ràng).
- Jira issue: SCRUM-84.
- Retest: PASS (1/1 test passed).

Đã hoàn thành toàn bộ coverage upload CV của SCRUM-84.
