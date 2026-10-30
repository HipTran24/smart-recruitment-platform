\# SCRUM-90 Biên bản tổng hợp UAT và smoke test



\## Trạng thái biên bản



Chờ hoàn tất kiểm thử và xác nhận nghiệp vụ.

Chưa xác nhận Production sẵn sàng.



\## Thông tin kiểm thử



\- Issue: SCRUM-90

\- Người kiểm thử: An Nguyen

\- Môi trường: Docker local trên Windows

\- Frontend: http://localhost:8443

\- Backend: http://localhost:8080

\- Nhánh lưu hồ sơ: test/SCRUM-90-production-smoke

\- SHA của bản thực chạy: Chưa được ghi nhận đầy đủ.

\- Thời điểm từng lần kiểm thử: Chưa được ghi nhận đầy đủ.

\- Xác minh email: Test mailbox local.

\- Người xác nhận nghiệp vụ: Chờ phân công/xác nhận.

\- Người quyết định go/no-go: Chờ phân công/xác nhận.

\- Phụ thuộc SCRUM-47 và SCRUM-48: Chưa xác minh.



\## Phạm vi và kết quả



| Phạm vi | Kết quả ghi nhận | Bằng chứng |

|---|---|---|

| Kết nối database local | Đã kết nối MySQL qua DBeaver | Ảnh đã cung cấp trong quá trình kiểm thử; cần bổ sung vào repository |

| Migration | Đã quan sát V001–V010 có success = 1 | Ảnh đã cung cấp; chưa xác minh migration của bản mới |

| Backend startup | Đã quan sát container healthy và log khởi động thành công | Log đã cung cấp; cần đối chiếu log lưu trong repository |

| Frontend | Trang đăng nhập tải được | Ảnh kiểm thử |

| Login và phân quyền | Đã thực hiện kiểm thử; trạng thái từng case ghi trong báo cáo | \[Báo cáo](test-report.md) |

| Tạo và đăng Job | FAIL trong lần quan sát: báo thành công nhưng không có Job trong database; chưa retest | \[Danh sách lỗi](bugs.md) |

| Upload CV | Chưa có bằng chứng hoàn tất | Chưa có |

| Ứng tuyển xuyên suốt | Bị chặn trong luồng dùng Job chưa tạo được | BUG-01 |

| Analysis/matching | Chưa có bằng chứng hoàn tất; cần xác minh điều kiện provider | Chưa có |

| Smoke sau deploy Production | Chưa thực hiện | Chưa có |

| UAT được business xác nhận | Chưa xác nhận | Chưa có |



\## Minh chứng xác thực đã lưu



\- \[Candidate login](evidence/auth-01-candidate.png)

\- \[Sai mật khẩu](evidence/auth-02-invalid-password.png)

\- \[Recruiter login](evidence/auth-03-recruiter.png)

\- \[Admin login](evidence/auth-04-admin.png)

\- \[Candidate truy cập Admin](evidence/auth-05-admin-denied.png)

\- \[Logout và mở lại trang riêng tư](evidence/auth-06-logout.png)



Ảnh cần được đối chiếu với kết quả trong test-report.md.

Kiểm tra điều hướng giao diện chưa thay thế kiểm thử phân quyền API.



\## Lỗi còn mở



| Mã | Nội dung | Ảnh hưởng | Trạng thái | Người chịu trách nhiệm |

|---|---|---|---|---|

| BUG-01 | Publish báo thành công nhưng không lưu Job | Chặn luồng nghiệp vụ phụ thuộc Job | Chưa có kết quả retest | Chưa được phân công |



\- Jira bug URL: Chưa có.

\- Hạn xử lý: Chờ người phụ trách xác nhận.

\- Ngoại lệ được chấp nhận: Chưa có.

\- Chi tiết: \[bugs.md](bugs.md).



\## Blocker



\- Chưa có kết quả retest tạo Job thành công.

\- Chưa hoàn tất kiểm thử CV, ứng tuyển và matching.

\- Chưa xác nhận trạng thái phụ thuộc SCRUM-47 và SCRUM-48.

\- Chưa có kết quả smoke Production.

\- Chưa có xác nhận nghiệp vụ.

\- Chi tiết bổ sung: \[blockers.md](blockers.md).



\## Xác nhận nghiệp vụ



\- Phạm vi business đã kiểm tra: Chưa xác nhận.

\- Kết luận của business: Chờ xác nhận.

\- Ngoại lệ được chấp nhận: Chưa có.

\- Người xác nhận: Chưa có.

\- Thời điểm xác nhận: Chưa có.

\- Link comment hoặc tài liệu xác nhận: Chưa có.



\## Đánh giá của QA



\- Đề xuất hiện tại: NO-GO cho việc kết luận Production sẵn sàng.

\- Căn cứ: Chưa đủ bằng chứng cho các luồng trọng yếu, còn lỗi/blocker và chưa có xác nhận nghiệp vụ.

\- Đây là đề xuất QA, không phải quyết định release chính thức.



\## Quyết định chính thức



\- Quyết định: Chờ người có trách nhiệm xác nhận.

\- Người quyết định: Chưa xác nhận.

\- Thời điểm quyết định: Chưa có.

\- Điều kiện hoặc ngoại lệ kèm theo: Chưa có.

\- Link bằng chứng xác nhận: Chưa có.



\## Hành động tiếp theo



1\. Xác định phiên bản được triển khai và ghi thời điểm kiểm thử.

2\. Retest BUG-01 sau khi có bản sửa.

3\. Hoàn tất các luồng Job, CV, ứng tuyển và matching.

4\. Cập nhật báo cáo, ảnh/log và kết quả retest.

5\. Xác minh SCRUM-47 và SCRUM-48.

6\. Thực hiện smoke trên môi trường nghiệm thu được phép.

7\. Nhận xác nhận nghiệp vụ và quyết định go/no-go.

8\. Cập nhật biên bản bằng kết quả và người chịu trách nhiệm thực tế.



\## Kết luận



Hồ sơ hiện ghi nhận kiểm thử local từng phần.

Chưa đủ căn cứ kết luận SCRUM-90 đã được nghiệm thu hoàn tất.

