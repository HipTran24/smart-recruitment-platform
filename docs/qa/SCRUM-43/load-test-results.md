\# SCRUM-43 Báo cáo trạng thái kiểm thử tải CV



\## Thông tin



\- Người thực hiện: An Nguyen

\- Branch: test/SCRUM-43-performance

\- Môi trường dự kiến: Docker local trên Windows

\- Công cụ: Apache JMeter 5.6.3 đã khởi động được

\- Trạng thái thực thi: BLOCKED — chưa chạy load test



\## Công việc đã thực hiện



\- Kiểm tra API ứng tuyển.

\- Đọc ApplicationService.apply.

\- Đọc CvScreeningWorkflow và CvScreeningStateService.

\- Tìm kiếm nơi gọi workflow trong code ứng dụng và test.



\## Blocker



Chưa xác minh được cơ chế tạo/queue screening và dispatcher

hoặc endpoint được phép dùng để kích hoạt xử lý CV.



POST ứng tuyển chưa được chứng minh kích hoạt screening.

Không sử dụng thời gian phản hồi API ứng tuyển thay cho

thời gian xử lý CV.



\## Kết quả đo



| Chỉ số | Kết quả |

|---|---|

| Số user đã chạy | Chưa chạy |

| Số vòng | Chưa chạy |

| Số request | Chưa đo |

| Throughput | Chưa đo |

| p95 | Chưa đo |

| Error rate | Chưa đo |

| Số CV xử lý thành công/thất bại | Chưa đo |

| Kết luận đạt ngưỡng | Chưa đánh giá |



\## Bằng chứng



\- \[Kết quả tìm caller](screening-call-sites.txt)

\- \[Chi tiết blocker](blockers.md)

\- JMeter plan thực thi: Chưa có.

\- File JTL/HTML report: Chưa có.



\## Điều kiện tiếp tục



1\. Backend owner cung cấp đường kích hoạt screening trên môi trường test.

2\. Chuẩn bị fixture độc lập và consent phù hợp.

3\. Xác định provider, giới hạn tải và ngưỡng chấp nhận.

4\. Chạy xác minh 1 user × 1 vòng trước khi tăng tải.



\## Kết luận



Chưa có kết quả load test xử lý CV.

SCRUM-43 chưa đủ điều kiện nghiệm thu.

