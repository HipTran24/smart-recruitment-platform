\# SCRUM-92 Release readiness review và tổng kết Sprint 8



\## Thông tin



\- Người phụ trách theo Jira: Tấn An.

\- Baseline review: 3dd060c9ad20d5cfcb04aae1f02eba3879ec715b.

\- Release SHA/tag được phê duyệt: Chưa xác nhận.

\- Môi trường phát hành: Chưa xác nhận.

\- Trạng thái review: Đang thực hiện.

\- Quyết định phát hành chính thức: Chờ xác nhận.



\## Checklist phát hành



| Hạng mục | Bằng chứng hiện có | Trạng thái |

|---|---|---|

| Baseline source | Đã ghi nhận SHA cụ thể | Đã xác minh |

| Release manifest | Bản ngày 06/10, reference HEAD, thiếu V011 và có tên migration không khớp | Cần cập nhật |

| Release candidate workflow | Có build/test/audit, bundle verification và image safety smoke | Đã đọc cấu hình; chưa xác minh run |

| CI trên phiên bản phát hành | Chưa có run URL và kết quả | Chưa xác minh |

| Artifact/image identity | Chưa có bundle manifest hoặc image digest của bản được chọn | Chưa xác minh |

| Production deployment | Workflow không thực hiện deploy | Chưa có bằng chứng |

| Secret store, TLS và network | Được yêu cầu trong readiness runbook | Chưa xác minh triển khai |

| Backup/restore | Được yêu cầu trong readiness runbook | Chưa có kết quả drill |

| Migration/rollback | Cần đối chiếu đúng phiên bản và môi trường | Chưa xác minh |

| Monitoring và incident owner | Được yêu cầu trong readiness runbook | Chưa xác nhận |

| CV storage/scanning/retention | Được yêu cầu trong readiness runbook | Chưa xác minh |

| Screening dispatcher | Runbook yêu cầu durable trigger/cadence/monitoring | Chưa có bằng chứng vận hành |

| Production smoke | Chưa có báo cáo trên bản phát hành | Chưa thực hiện/xác minh |

| Business UAT | Chưa có xác nhận | Chờ xác nhận |



\## QA và UAT



Các kết quả dưới đây thuộc các lần chạy trước.

Chưa mặc định áp dụng cho baseline phát hành hiện tại.



| Issue | Kết quả đã ghi nhận | Phần còn thiếu |

|---|---|---|

| SCRUM-90 | Minh chứng xác thực local | UAT business và Production smoke |

| SCRUM-84 | 37 test: 34 PASS, 3 FAIL | Lỗi Job/CV; cần đối chiếu trạng thái tích hợp và retest |

| SCRUM-77 | 17 test PASS | Đối chiếu migration report, nhiều vòng/tổng hợp điểm |

| SCRUM-83 | 5 backend test và 3 browser test PASS | Export, DST và đối chiếu xuyên suốt |

| SCRUM-43 | JMeter đã hoạt động, có báo cáo blocker | Chưa có kết quả tải xử lý CV |

| SCRUM-80 | Baseline p50 9,446 ms; p95 16,951 ms | Chưa có ngưỡng chấp nhận và so sánh trước–sau |



\## Rủi ro và việc cần xử lý



| Nội dung | Ảnh hưởng | Owner | Bước tiếp theo |

|---|---|---|---|

| Manifest cũ hoặc không khớp source | Khó tái tạo và xác định artifact | Chờ phân công | Cập nhật theo release candidate thực tế |

| Thiếu bằng chứng CI cho release SHA | Chưa xác nhận chất lượng bản phát hành | Chờ phân công | Đính kèm run và artifact đúng SHA |

| Lỗi Job/CV từng được phát hiện | Chặn luồng tuyển dụng trọng yếu | Chờ phân công | Xác minh bản sửa và retest |

| Screening chưa có bằng chứng dispatcher | Có thể không xử lý được CV sau ứng tuyển | Chờ phân công | Xác minh trigger, queue và monitoring |

| Thiếu UAT và Production smoke | Chưa đủ căn cứ nghiệm thu | Chờ xác nhận | Tổ chức kiểm thử và business sign-off |

| Thiếu kết quả backup/restore | Chưa chứng minh khả năng phục hồi | Chờ phân công | Thực hiện drill được phép |



\## Go/no-go



\- Đề xuất review: Chưa đủ căn cứ GO.

\- Căn cứ: Các hạng mục bắt buộc còn thiếu bằng chứng hoặc chờ xử lý.

\- Quyết định chính thức: Chờ người có thẩm quyền.

\- Người quyết định: Chưa xác nhận.

\- Thời điểm: Chưa có.

\- Ngoại lệ được chấp nhận: Chưa có.

\- Link xác nhận: Chưa có.



Image safety smoke chỉ kiểm tra hành vi an toàn khi thiếu cấu hình;

không thay thế smoke nghiệp vụ trên Production.



\## Tổng kết Sprint 8



\- Danh sách issue chính thức thuộc Sprint 8: Chưa đối chiếu.

\- Các PR đã thấy trong lịch sử main: SCRUM-90, SCRUM-83,

&#x20; SCRUM-80, SCRUM-77, SCRUM-43.

\- Việc merge PR không đồng nghĩa đã nghiệm thu toàn bộ issue.

\- Kết quả kiểm thử: Theo bảng QA/UAT, cần liên kết báo cáo.

\- Việc chưa hoàn tất: Các mục thiếu bằng chứng và rủi ro nêu trên.

\- Bài học từ quá trình kiểm thử:

&#x20; Cần đối chiếu thông báo UI với dữ liệu lưu thật;

&#x20; phân biệt test API giả lập với tích hợp thật;

&#x20; ghi SHA/môi trường/thời điểm cùng kết quả test.

\- Owner và thời hạn công việc chuyển tiếp: Chờ thống nhất.



\## Kết luận



Hồ sơ đang ở bước review bằng chứng.

Chưa xác nhận Production sẵn sàng hoặc Sprint 8 hoàn tất nghiệm thu.

