\# SCRUM-90 Báo cáo kiểm thử local



\- Người kiểm thử: An Nguyen

\- Thời điểm và timezone: \[điền thời điểm thực chạy]

\- Môi trường: Docker local trên Windows

\- Base SHA: \[điền kết quả git rev-parse HEAD]

\- Thay đổi cấu hình: .dockerignore và compose.local.yml

\- Phạm vi: đăng nhập, điều hướng theo vai trò và logout



\## Kết quả



| ID | Expected | Actual | Status | Evidence |

|---|---|---|---|---|

| AUTH-01 | Candidate vào đúng workspace | \[điền] | \[điền] | \[Ảnh](evidence/auth-01-candidate.png) |

| AUTH-02 | Sai mật khẩu bị từ chối | \[điền] | \[điền] | \[Ảnh](evidence/auth-02-invalid-password.png) |

| AUTH-03 | Recruiter vào đúng workspace | \[điền] | \[điền] | \[Ảnh](evidence/auth-03-recruiter.png) |

| AUTH-04 | Admin vào đúng workspace | \[điền] | \[điền] | \[Ảnh](evidence/auth-04-admin.png) |

| AUTH-05 | Candidate không vào được trang Admin | \[điền] | \[điền] | \[Ảnh](evidence/auth-05-admin-denied.png) |

| AUTH-06 | Sau logout, trang riêng tư yêu cầu login | Chuyển về login, không hiển thị dữ liệu riêng tư | PASS | \[Ảnh](evidence/auth-06-logout.png) |



\## Lỗi và giới hạn



\- Từng phát hiện Publish Job báo thành công nhưng bảng jobs rỗng.

\- Trạng thái sau cập nhật main: chưa retest.

\- Chưa hoàn tất luồng Job, CV, ứng tuyển và matching.

\- Kiểm tra chặn trang ở giao diện chưa thay thế kiểm thử quyền API.

\- Chưa có xác nhận UAT nghiệp vụ hoặc nghiệm thu Production

\## \[Test ID]



\## FLOW-01 — Recruiter tạo và đăng Job



\- Thời điểm kiểm thử và timezone: \[điền]

\- Môi trường: Docker local

\- Base SHA: \[SHA lúc kiểm thử]

\- Thay đổi chưa commit lúc chạy: \[nếu có]

\- Setup: Recruiter đã đăng nhập, mở trang tạo Job.

\- Input giả lập: QA SCRUM90 — Backend Intern

\- Steps: Điền dữ liệu hợp lệ → Publish → kiểm tra danh sách và DB.

\- Expected: Job được lưu và có trạng thái phù hợp.

\- Actual: \[ghi kết quả quan sát trong lần chạy này]

\- Status: PASS / FAIL / BLOCKED / NOT RUN

\- Evidence: \[link ảnh/log thực sự tồn tại]

\- Bug URL: chưa có

\- Retest: chưa chạy
## Phạm vi chưa hoàn tất



\- \[Liệt kê case chưa chạy hoặc bị chặn]

\- UAT nghiệp vụ: \[chờ xác nhận hoặc xác nhận thực tế]

\- Production smoke: \[chưa thực hiện hoặc kết quả thực tế]



\## Kết luận



\[Chỉ kết luận trong phạm vi đã kiểm thử]

