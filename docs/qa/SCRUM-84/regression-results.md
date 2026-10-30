\# SCRUM-84 Kết quả E2E regression



\## Thông tin



\- Người thực hiện: An Nguyen

\- Branch: test/SCRUM-84-regression

\- HEAD được ghi nhận sau lần chạy:

&#x20; 4ffa6636b71b21089e62ffd5d1abbbaffa62dd9e

\- Thay đổi chưa commit lúc chạy: Chưa được ghi nhận.

\- Thời điểm bắt đầu lần chạy: Chưa được ghi nhận.

\- Môi trường: Windows, Playwright local.

\- Lệnh: npm.cmd run test:e2e

\- Phạm vi: Browser tests với API giả lập.



\## Kết quả



| Chỉ số | Lần chạy có log qua Tee-Object | Lần chạy trực tiếp sau đó |

|---|---|---|

| Build | PASS, 745 ms | PASS, 729 ms |

| Tổng số test | 37 | 37 |

| Passed | 34 | 34 |

| Failed | 3 | 3 |

| Skipped | Không có test bị skip trong danh sách | Không có test bị skip trong danh sách |

| Thời gian Playwright báo | 1,1 phút | 1,0 phút |

| Exit code | 1 | 1 |



Build có cảnh báo bundle lớn hơn 500 kB nhưng vẫn thành công.

Pipeline thất bại do 3 test không đạt.



\## Kết quả theo nhóm



| Nhóm | Passed | Failed | Phạm vi |

|---|---:|---:|---|

| Authentication và role navigation | 5 | 0 | Login đúng/sai, role navigation và chặn Candidate khỏi Admin |

| CV | 0 | 1 | Kiểm tra có control chọn file |

| Job | 0 | 2 | Request tạo Job và validation tiêu đề |

| Matching outcomes | 5 | 0 | Hiển thị kết quả, null/zero, API lỗi/retry và điểm ngoài phạm vi |

| Recruiter/accessibility hiện có | 24 | 0 | Giao diện, trạng thái lỗi và accessibility |

| Tổng | 34 | 3 | API giả lập |



\## Lỗi phát hiện



\### CV-01 — Không có control chọn file CV



\- Test: candidate CV page provides a file selection control.

\- Expected: Có một input type="file".

\- Actual: Không có input; Expected 1, Received 0.

\- Vị trí assertion: frontend/e2e/cv.browser.ts:48.

\- Kết quả: FAIL.

\- Ảnh hưởng: Chặn kiểm thử upload CV hợp lệ và file không hợp lệ.

\- Jira bug URL: Chưa có.



\### JOB-01 — Publish không gửi request tạo Job



\- Test: publishing a job must send a create request.

\- Expected: Phát sinh POST /api/v1/recruiter/jobs.

\- Actual: Không quan sát được request trong thời hạn 5000 ms.

\- Vị trí chờ request: frontend/e2e/jobs.browser.ts:37.

\- Kết quả: FAIL.

\- Jira bug URL: Chưa có.



\### JOB-02 — Tiêu đề trống không có validation được kiểm tra



\- Test: empty job title must not report a successful publish.

\- Expected: Có validation trình duyệt hoặc phần tử role="alert".

\- Actual: Predicate vẫn false sau 5000 ms.

\- Vị trí assertion: frontend/e2e/jobs.browser.ts:96.

\- Kết quả: FAIL.

\- Lưu ý: Test dừng ở assertion validation; các assertion phía sau chưa được thực hiện.

\- Jira bug URL: Chưa có.



\## Bằng chứng



\- \[Log lần chạy qua Tee-Object](logs/regression.txt)

\- HTML report của lần chạy mới nhất:

&#x20; frontend/playwright-report/index.html

\- Screenshot, error-context và trace:

&#x20; frontend/test-results/

\- Cả 3 test lỗi đều có screenshot và trace theo output Playwright.

\- PR URL: Chưa bổ sung.

\- CI run URL: Chưa bổ sung.

\- CI artifact URL: Chưa bổ sung.



HTML report và test-results là kết quả local.

Cần lưu hoặc tải lên artifact trước khi lần chạy mới ghi đè.



\## Độ ổn định



\- Hai lần chạy đầy đủ liên tiếp đều có 34 PASS và cùng 3 test FAIL.

\- Chưa có bằng chứng các lỗi này là flaky.

\- Cấu hình retries đã kiểm tra trước đó: 0.

\- Chưa đủ số lần chạy để kết luận độ ổn định dài hạn.

\- Ngưỡng thời gian pipeline được nhóm chấp thuận: Chưa ghi nhận.



\## Giới hạn



\- API được giả lập; chưa chứng minh backend/MySQL hoạt động xuyên suốt.

\- Matching PASS chỉ xác minh hiển thị và xử lý response, không chứng minh Gemini phân tích CV thật.

\- Test CV mới phát hiện thiếu control chọn file, chưa bao phủ upload hợp lệ/không hợp lệ.

\- Job happy path chưa đạt.

\- Chưa hoàn thành toàn bộ acceptance criteria của SCRUM-84.



\## Hành động tiếp theo



1\. Tạo hoặc liên kết bug cho 3 lỗi.

2\. Phối hợp owner xử lý chức năng Job và CV.

3\. Retest sau khi có bản sửa.

4\. Hoàn thiện happy/negative path còn thiếu.

5\. Bổ sung CI run, artifact và PR URL thực tế.



\## Kết luận



Regression hiện có 34 test đạt và 3 test thất bại.

Giữ nguyên các test lỗi để theo dõi và retest.

Chưa đủ căn cứ nghiệm thu SCRUM-84.

