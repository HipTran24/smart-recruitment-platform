# Kiểm thử và hiệu năng SmartRecruit — 31/10/2026

Đã sửa các luồng tuyển dụng chính và kiểm tra trên môi trường QA cục bộ riêng. Kết quả sau sửa: **144 test backend, 44 test frontend, 37 test Playwright, 8/8 luồng thực tế qua Nginx và 14/14 CV sàng lọc thành công**. 54 lượt trang/viewport không có lỗi giao diện được phát hiện, tràn ngang hoặc vi phạm trong bộ quy tắc axe WCAG 2 A/AA và 2.1 AA đã chạy.

## Những lỗi đã sửa

- Token JWT bị từ chối khi `iat` cũ hơn cửa sổ lệch giờ khoảng 30 giây, dù hạn `exp` là 15 phút. Đã sửa để kiểm tra thời điểm phát hành trong tương lai và dùng `exp` làm hạn hiệu lực; có test token đã phát hành 5 phút trước.
- Trang CV từng báo thành công bằng timer và chưa tải nội dung file. Đã có multipart upload, đọc PDF/DOCX, lưu file và văn bản vào hệ thống, giới hạn dung lượng, từ chối file lỗi/mã hóa/không có văn bản và kiểm tra quyền tải xuống.
- Constructor CV từng bỏ qua `parsedText`; CV đầu tiên không được chọn mặc định do kiểm tra danh sách sau khi đã thêm bản ghi. Đã sửa và kiểm thử cả đổi CV mặc định.
- Payload Gemini chứa `additionalProperties` không được endpoint `responseSchema` chấp nhận, gây HTTP 400 cho mọi CV. Đã sửa schema, tránh lấy phần thought làm JSON và tắt thinking cho Gemini 2.5 Flash trong tác vụ này.
- Sàng lọc AI chưa có API gọi từ giao diện. Đã nối hàng đợi nền, trạng thái tiến trình, kết quả lưu bền, dùng lại kết quả khi đầu vào không đổi và giới hạn 2 worker/32 tác vụ chờ.
- Khóa thử có quota 5 yêu cầu/phút. Các cuộc gọi dồn từng bị 429; đã thêm `GEMINI_MIN_REQUEST_INTERVAL`, đặt cục bộ PT13S và chạy lại các hồ sơ bị giới hạn.
- Nhiều trang dùng dữ liệu mẫu hoặc thao tác chỉ thay đổi state. Các trang ứng viên, recruiter và quản trị hiện gọi API thật cho những thao tác đang hiển thị: lưu hồ sơ, quyền AI, ứng tuyển/rút hồ sơ, đăng/đóng việc, đánh giá, lịch phỏng vấn, đề nghị và phản hồi, tài khoản/phân quyền, kỹ năng và audit.
- Truy vấn danh sách hồ sơ từng đọc lại thông tin việc/ứng viên/lịch sử/AI theo từng hàng. Đã đổi sang đọc theo lô; danh sách và báo cáo recruiter được giới hạn theo công ty. Thêm kiểm tra quyền chi tiết hồ sơ và quyền sở hữu CV.
- Phân trang từng trả metadata không khớp giới hạn size thực tế. Bộ lọc việc làm bị bỏ qua; giá trị ONSITE trên giao diện không khớp enum. Đã sửa.
- Lọc vai trò tài khoản gặp lỗi SQL khi fetch collection và phân trang. Đã tách lấy ID theo trang rồi fetch đầy đủ vai trò; có test giữ đủ các vai trò khi lọc.
- Giao diện tải toàn bộ trang ngay khi khởi động. Đã chia bundle theo route, bỏ tải font ngoài bắt buộc, thống nhất form/loading/error/retry, sửa nhãn select, focus/Escape cho drawer và màu chữ thiếu tương phản.
- Nginx mặc định giới hạn 1 MB khiến CV lớn thất bại. Đã đặt 11 MB cho multipart, giữ Host gồm port qua proxy. Docker có thư mục CV được cấp quyền ghi và volume riêng để giữ file khi tạo lại container.

## Môi trường và phương pháp đo

Apple M2, 8 GB RAM; Java 25, Spring Boot 4.1.2; MySQL 8.4.11 qua Docker. Frontend được build production, phục vụ qua Nginx. Dữ liệu QA có **1.014 đơn ứng tuyển**: 14 đơn dùng CV được cung cấp và 1.000 đơn tổng hợp để đo danh sách. Cơ sở dữ liệu QA tách khỏi cấu hình dữ liệu dự án sẵn có.

Mỗi endpoint được warm-up 5 lần rồi đo 100 yêu cầu, concurrency 10. Tổng 400 yêu cầu đo tải, 0 lỗi. Đây là đo ngắn trên localhost, không phải cam kết thông lượng tối đa, tải dài hạn hoặc độ trễ Internet.

| Endpoint/luồng | p50 (ms) | p95 (ms) | Yêu cầu/giây trong lượt đo | Lỗi |
|---|---:|---:|---:|---:|
| publicJobs | 18.98 | 23.80 | 494.77 | 0 |
| recruiterApplications100 | 40.94 | 61.45 | 234.68 | 0 |
| recruiterOverview | 23.88 | 32.43 | 391.84 | 0 |
| candidateApplications | 14.79 | 21.87 | 646.31 | 0 |

p95 nghĩa là 95% yêu cầu hoàn thành trong thời gian đó hoặc nhanh hơn.

JavaScript entry: **742,14 → 302,18 KB**, giảm **59.3%**; gzip **177,42 → 90,85 KB**. Đây là kích thước entry build, chưa phải điểm Lighthouse hay phép đo Core Web Vitals trên thiết bị người dùng.

## Bộ CV và Gemini

**14/14 PDF tải lên và có văn bản được lưu; 14/14 có kết quả AI hoàn tất.** Trung vị toàn bộ bước upload/đọc/lưu là **52.66 ms**, chậm nhất **222.50 ms** trong lượt đo ban đầu. PDFBox 3.0.8 được kiểm tra lại trên toàn bộ 14 file bằng script corpus, đều thành công. DOCX được kiểm tra bằng fixture có tiếng Việt, xuống đoạn và kiểm thử từ chối XML không an toàn.

| File trong bộ được cung cấp | Ký tự lưu trong DB | Upload/đọc/lưu (ms) | AI sau thử lại |
|---|---:|---:|---|
| 10/1774233483_af8UnRqT.pdf | 1493 | 222.50 | COMPLETED |
| 12/1774832901_sB7FbjHN.pdf | 2792 | 63.70 | COMPLETED |
| 12/1774832924_FzBUjKT5.pdf | 2541 | 35.93 | COMPLETED |
| 13/1773506320_2pRVMPrR.pdf | 3255 | 65.63 | COMPLETED |
| 13/1774517351_l7aKOxvU.pdf | 2829 | 70.01 | COMPLETED |
| 13/1775118616_NacU9y5e.pdf | 2292 | 59.52 | COMPLETED |
| 14/1774834904_flNqNr1f.pdf | 2070 | 53.70 | COMPLETED |
| 14/1774834951_oMaOqTcd.pdf | 2179 | 41.43 | COMPLETED |
| 8/1774852731_I9Z1Z2BM.pdf | 3309 | 61.10 | COMPLETED |
| 8/1774852751_W4RumPYP.pdf | 3301 | 51.61 | COMPLETED |
| 8/1774853139_4my_A24J.pdf | 3393 | 47.45 | COMPLETED |
| 9/1774143577_s5i6Q2zW.pdf | 3259 | 45.27 | COMPLETED |
| 9/1774403388_C0cTUEN9.pdf | 4081 | 48.51 | COMPLETED |
| 9/1774594778_O3E2sOn0.pdf | 3165 | 38.02 | COMPLETED |

Gemini 2.5 Flash đã hoàn tất 6 hồ sơ đầu ở lượt gọi không giãn nhịp; 8 hồ sơ còn lại hoàn tất sau khi bật giới hạn 13 giây/yêu cầu, hồ sơ cuối trong nhóm này hoàn tất khoảng **94 giây** kể từ lúc xếp hàng. Thời gian này gồm chờ quota và xử lý provider. Không coi đây là benchmark một lượt mới 14 CV đồng thời. Yêu cầu xếp hàng trả HTTP 202; giao diện tiếp tục sử dụng được. Trung vị dùng lại kết quả đã lưu: **17.60 ms**.

Các CV được đối chiếu với một công việc QA cố định và tiêu chí chung về phát triển phần mềm để xác minh tích hợp. Chưa có nhãn chuẩn từ nhà tuyển dụng để tính precision/recall hay khẳng định độ chính xác xếp hạng. Điểm AI là dữ liệu hỗ trợ xem xét.

Nginx đã nhận một PDF **2,094,082 byte**, trả 201 sau **327.67 ms** và tải xuống trùng hoàn toàn từng byte.

## Xác minh

- `mvn verify`: 144 test, 0 fail/error/skip; ArchUnit và các coverage gate đều đạt. JaCoCo: line **63.87%**, branch **47.17%**.
- `npm run typecheck`, `npm test`: đạt, 44 test.
- `npm run test:e2e`: 37 test đạt, có kiểm tra bàn phím, responsive và axe.
- 8 luồng API thật qua production bundle/Nginx: lưu hồ sơ rồi reload; tải PDF rồi reload; ứng tuyển; lưu đánh giá; phỏng vấn xuất hiện ở tài khoản ứng viên; gửi/nhận/chấp nhận offer và reload; menu mobile/Escape; dashboard và danh sách tài khoản admin. 0 page error.
- 27 route × 2 viewport (390, 1440): 54 lượt, 0 alert lỗi dữ liệu, 0 tràn ngang, 0 vi phạm axe được kiểm tra, 0 page error. Đây không thay thế kiểm tra accessibility thủ công toàn diện.
- Kiểm tra từ chối: ứng viên vào API recruiter 403, recruiter vào admin 403, CV của ứng viên khác 404, anonymous vào API riêng 401. Kiểm thử tích hợp riêng xác minh cô lập recruiter theo doanh nghiệp.
- `docker compose config --quiet`, `nginx -t`, kiểm tra cú pháp shell và `git diff --check`: đạt. Luồng production frontend/Nginx chạy với backend Java cục bộ; chưa kiểm thử nguyên bộ backend container trên hạ tầng triển khai.

## Giới hạn còn lại

Chưa xác minh production/cloud, Google OAuth với client thật, gửi email qua provider thật, kiểm thử tải dài hạn hoặc phục hồi khi mất máy chủ. File PDF chỉ có ảnh cần OCR trước; hệ thống chưa tích hợp OCR. Trạng thái quét virus là PENDING vì chưa có dịch vụ antivirus; không coi file đã được xác nhận CLEAN. Trang cấu hình hiển thị thông số vận hành thực tế, không cung cấp các công tắc giả chưa được backend áp dụng. Trang phản hồi lưu bản nháp thật; chưa có luồng tạo nội dung AI riêng và gửi email ngoài hệ thống được xác minh.

Cần cấp volume lưu CV khi triển khai; compose cục bộ đã có `resume-data`. Với nhiều instance, thay adapter lưu file cục bộ bằng kho chung và điều phối hạn mức provider ở phạm vi toàn cụm.

## Chạy lại

```bash
./scripts/verify.sh
cd frontend
npm run typecheck
npm test
npm run test:e2e
```

Từ thư mục gốc, kiểm tra đọc file CV mà không in nội dung cá nhân:

```bash
./scripts/qa/verify-cv-corpus.sh /duong-dan/thu-muc-cv
```

Các số liệu máy đọc được nằm cạnh báo cáo: `metrics.json`, `cv-results.json`, `browser-checks.json`. API key chỉ lưu trong `.env` bị Git bỏ qua. Tài khoản QA ngẫu nhiên lưu riêng tại `.local/qa-access.md`, không đưa vào source hoặc báo cáo.

Tài liệu đối chiếu tích hợp: [Gemini generateContent](https://ai.google.dev/api/generate-content), [Apache PDFBox](https://pdfbox.apache.org/download.html).
