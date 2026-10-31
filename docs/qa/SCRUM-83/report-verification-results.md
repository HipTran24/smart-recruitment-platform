\# SCRUM-83 Kết quả kiểm chứng báo cáo và phân quyền



\## Thông tin



\- Người kiểm thử: An Nguyen

\- Branch: test/SCRUM-83-report

\- Môi trường: Windows, Playwright local; Java 25 trong Docker.

\- Database backend test: MySQL Testcontainers cô lập.

\- SHA từng lần chạy: Chưa ghi nhận đầy đủ.

\- CI run URL: Chưa bổ sung.

\- PR URL: Chưa bổ sung.



\## Kết quả API và database



\- Lệnh Maven:

&#x20; -Dtest=ReportVerificationIntegrationTests,KpiIntegrationTests test

\- Tests run: 5.

\- Failures: 0.

\- Errors: 0.

\- Skipped: 0.

\- Build: SUCCESS.

\- Tổng thời gian Maven: 4 phút 47 giây.

\- Kết thúc: 31/10/2026 11:15:18 UTC+7.

\- Authentication được Spring Security test mô phỏng.



| Kiểm tra | Expected | Actual | Status |

|---|---|---|---|

| Bộ lọc Job và ngày local | Chỉ tính application trong cohort | Assertion đạt | PASS |

| Source không phân biệt hoa/thường | portal được xử lý thành PORTAL | Assertion đạt | PASS |

| History lặp | Mỗi application chỉ tính một lần cho mỗi stage | Assertion đạt | PASS |

| Thiếu history | Current status vẫn được tính | Assertion đạt | PASS |

| Candidate/Admin gọi KPI | HTTP 403 | Assertion đạt | PASS |

| Caller chưa đăng nhập | HTTP 401 | Assertion đạt | PASS |

| Filter không hợp lệ | HTTP 400, INVALID\_KPI\_FILTER | Assertion đạt | PASS |

| Cache-Control | no-store | Assertion đạt | PASS |



Các kết quả trên thuộc tổng 5 phương thức test,

không phải số lượng test riêng cho từng dòng.



\## Kết quả dashboard và UI role access



\- Build frontend: PASS, 798 ms.

\- Lệnh: npx.cmd playwright test report.browser.ts

\- Tests run: 3.

\- Passed: 3.

\- Failed: 0.

\- Thời gian Playwright báo: 16,0 giây.

\- API: Giả lập bằng fixture.

\- Timezone Playwright: Asia/Bangkok.



| Test | Expected | Actual | Status |

|---|---|---|---|

| Dashboard cohort | Loại application tại endExclusive; không đếm trùng history; giữ kết quả sau reload | Assertion đạt | PASS |

| Candidate mở recruiter analytics | Hiển thị chặn quyền, không gọi API danh sách Recruiter | Assertion đạt | PASS |

| Admin mở recruiter analytics | Hiển thị chặn quyền, không gọi API danh sách Recruiter | Assertion đạt | PASS |



\## Bằng chứng



\- Backend test:

&#x20; src/test/java/com/recruitment/app/recovery/ReportVerificationIntegrationTests.java

\- Backend test hiện có:

&#x20; src/test/java/com/recruitment/app/recovery/KpiIntegrationTests.java

\- Browser test:

&#x20; frontend/e2e/report.browser.ts

\- Đặc tả fixture:

&#x20; \[controlled-fixtures.md](controlled-fixtures.md)

\- Kết quả API:

&#x20; \[api-verification-results.md](api-verification-results.md)

\- JVM shutdown:

&#x20; \[logs/jvm-shutdown.dumpstream](logs/jvm-shutdown.dumpstream)

\- HTML report local:

&#x20; frontend/playwright-report/index.html

\- Kết quả toàn bộ E2E sau thay đổi: Chưa bổ sung.

\- CI artifact URL: Chưa bổ sung.



\## Cảnh báo và phần còn thiếu



\### JVM shutdown



Surefire buộc kết thúc fork JVM sau thời hạn shutdown 30 giây.

Các test không failure/error và Maven báo BUILD SUCCESS.

Dump chưa cung cấp nguyên nhân chi tiết.



\### Export



File HiringAnalyticsRecruiter đã kiểm tra chưa có chức năng export.

Chưa thực hiện đối chiếu nội dung file export.

Tiêu chí export của SCRUM-83 chưa được xác nhận đạt.



\### Đối chiếu xuyên suốt



Dashboard hiện đọc danh sách application và tính số liệu ở frontend.

API /recruiter/kpis được kiểm tra riêng.

Chưa có test xuyên suốt DB → API thực → dashboard → export.



\### Timezone và quyền



\- Đã kiểm tra ranh giới ngày UTC+7.

\- Chưa bổ sung timezone có DST.

\- UI test dùng API giả lập.

\- API test dùng authentication mô phỏng, chưa kiểm chứng JWT thật.



\### Bug và blocker



\- Jira bug URL cho thiếu chức năng export: Chưa có.

\- Người phụ trách xử lý: Chưa xác nhận.

\- Nguyên nhân JVM shutdown chậm: Chưa xác minh.



\## Hành động tiếp theo



1\. Chạy toàn bộ E2E và bổ sung kết quả.

2\. Xác định contract và owner của chức năng export.

3\. Kiểm tra export sau khi có bản triển khai.

4\. Bổ sung case DST và đối chiếu dữ liệu xuyên suốt.

5\. Kiểm tra CI, lưu artifact và liên kết Jira.



\## Kết luận



5 backend test và 3 browser test đã chạy đạt trong phạm vi nêu trên.

Chưa đủ bằng chứng xác nhận toàn bộ acceptance criteria SCRUM-83,

đặc biệt chức năng export.

