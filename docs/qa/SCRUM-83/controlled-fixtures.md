\# SCRUM-83 Controlled KPI fixtures



\## Phạm vi



Dữ liệu tổng hợp cho kiểm thử.

Không chứa CV, email, tên hoặc dữ liệu cá nhân.

Đây là đặc tả fixture; chưa phải dữ liệu đã seed hoặc kết quả đã chạy.



\## Bộ lọc chính



\- from: 2026-10-01

\- to: 2026-10-01

\- timezone: Asia/Ho\_Chi\_Minh

\- startInclusive: 2026-09-30T17:00:00Z

\- endExclusive: 2026-10-01T17:00:00Z



J1 và J2 phải được tạo bằng fixture trên DB test.

Không dùng ID của database local hoặc production.



\## Applications



| Alias | Job | created\_at UTC | Source | Current status | History |

|---|---|---|---|---|---|

| A1 | J1 | 2026-09-30T16:59:59Z | PORTAL | SUBMITTED | SUBMITTED |

| A2 | J1 | 2026-09-30T17:00:00Z | PORTAL | IN\_REVIEW | SUBMITTED, IN\_REVIEW, IN\_REVIEW |

| A3 | J1 | 2026-10-01T12:00:00Z | REFERRAL | INTERVIEW | SUBMITTED, IN\_REVIEW, SHORTLISTED, INTERVIEW |

| A4 | J2 | 2026-10-01T16:59:59Z | UNKNOWN | REJECTED | Không có history |

| A5 | J1 | 2026-10-01T17:00:00Z | PORTAL | OFFERED | SUBMITTED, OFFERED |



Mỗi application dùng Candidate test riêng để không vi phạm uniqueness.



\## Expected cho bộ lọc chính



\- applications: 3

\- SUBMITTED: 3

\- IN\_REVIEW: 2

\- SHORTLISTED: 1

\- INTERVIEW: 1

\- OFFERED: 0

\- REJECTED: 1

\- WITHDRAWN: 0

\- bySource: PORTAL=1, REFERRAL=1, UNKNOWN=1



A1 nằm trước đầu khoảng, không được tính.

A5 nằm đúng endExclusive, không được tính.

History IN\_REVIEW lặp của A2 chỉ được tính một lần.

A4 vẫn được tính REJECTED từ current status dù thiếu history.



\## Expected khi thêm jobId=J1



\- applications: 2

\- SUBMITTED: 2

\- IN\_REVIEW: 2

\- SHORTLISTED: 1

\- INTERVIEW: 1

\- OFFERED: 0

\- REJECTED: 0

\- WITHDRAWN: 0

\- bySource: PORTAL=1, REFERRAL=1



\## Expected khi thêm source=portal



\- Source được chuẩn hóa thành PORTAL.

\- applications: 1

\- SUBMITTED: 1

\- IN\_REVIEW: 1

\- Các stage còn lại: 0

\- bySource: PORTAL=1



\## Kiểm tra quyền API



| Caller | Expected |

|---|---|

| Không có authentication | 401 |

| Candidate | 403 |

| Platform Admin | 403 |

| Recruiter | 200 với dữ liệu hợp lệ |



\## Kiểm tra filter và bảo mật



\- from/to thiếu hoặc không hợp lệ: 400 INVALID\_KPI\_FILTER.

\- jobId không tồn tại: 400 INVALID\_KPI\_FILTER.

\- source sai định dạng: 400 INVALID\_KPI\_FILTER.

\- Filter hợp lệ nhưng không khớp dữ liệu: counts bằng 0.

\- Cache-Control: no-store.

\- Response không chứa dữ liệu cá nhân.

\- Database lỗi: trả lỗi an toàn, không trả số 0 giả.



\## Phần cần bổ sung



\- Fixture/test riêng cho timezone có DST.

\- Đối chiếu dashboard với API.

\- Contract và test export.

\- Kết quả thực chạy và CI link.

