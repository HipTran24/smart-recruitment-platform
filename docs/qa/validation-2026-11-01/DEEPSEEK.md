# Kiểm thử chuyển sang DeepSeek — 01/11/2026

Đã chuyển môi trường QA đang chạy sang DeepSeek, model `deepseek-flash`. Key được lấy từ biến môi trường; các tệp cấu hình trong Git chỉ chứa tên biến và giá trị mẫu.

## Kết quả thực tế

| Kiểm tra | Kết quả |
| --- | --- |
| Gọi `POST https://api.deepseek.com/chat/completions` | HTTP 200; JSON tiếng Việt hợp lệ |
| Request thử ngắn | 0,96 giây; 59 token đầu vào, 15 token đầu ra |
| Bộ CV người dùng đã gửi | 26/26 hồ sơ hoàn tất (100%); 0 lỗi; đủ điểm và nhận xét tiếng Việt |
| Thời gian đợt phân tích 26 CV | 66,51 giây, đo từ thời điểm tạo yêu cầu đầu đến kết quả cuối trong DB |
| Hồ sơ test bổ sung | 1 hồ sơ đã rút, giữ nguyên trạng thái và loại khỏi đợt phân tích |
| Tải trạng thái 26 hồ sơ | p50 7,83 ms; p95 10,83 ms, 25 request tuần tự tại máy cục bộ |
| Gửi lại yêu cầu cùng dữ liệu | Dùng lại kết quả cùng ID; không phân tích trùng |
| Khởi động lại máy chủ | Giữ nguyên toàn bộ 26 kết quả, điểm và ID |
| Giao diện thật | Tiêu đề “Sàng lọc CV”; tiến trình 26/26; tải lại vẫn đúng; không tràn ngang ở 390 px |
| Quét WCAG bằng axe | 0 vi phạm trong phạm vi quét trang sàng lọc |

66,51 giây là thời gian xử lý đợt CV thật, gồm thời gian chờ hàng đợi và gọi AI. 0,96 giây chỉ là request kết nối ngắn. Số đo API trạng thái là kiểm tra tuần tự tại máy cục bộ, không phải thử tải đồng thời.

## Thay đổi và kiểm tra

- Tiêu đề, nút thao tác và nhãn nhà tuyển dụng dùng “Sàng lọc CV”; phản hồi chuyên môn bằng tiếng Việt.
- DeepSeek dùng JSON mode, tắt thinking để giảm độ trễ, giới hạn đầu ra 2048 token; kiểm tra điểm, các trường bắt buộc, JSON trắng/cắt dở và metadata nhà cung cấp trước khi lưu hoàn tất.
- Dùng chung quy tắc bỏ thông tin liên lạc và bỏ qua chỉ dẫn trong CV; giới hạn kích thước nội dung giữ nguyên.
- Hàng đợi nằm trong DB, chạy tối đa hai tác vụ, khôi phục yêu cầu chờ và lease hết hạn; lưu thời điểm thử lại khi gặp quota. Hạn mức Gemini cũ không chặn DeepSeek.
- Trạng thái được đọc theo lô tối đa 100 hồ sơ/request, tự cập nhật sau lỗi mạng và sau tải lại trang. Chọn tất cả bao gồm mọi trang.
- Tài khoản AI hết số dư được hiển thị thành lỗi riêng, không thử lại vô hạn.
- Maven verify: 160 kiểm thử, 0 lỗi; gồm migration MySQL, giao dịch, phân quyền, hợp đồng HTTP và kiểm tra kiến trúc/coverage.
- Frontend: typecheck, build và 44 kiểm thử unit đạt. Bộ kiểm thử trình duyệt có 43 trường hợp, gồm chọn 101 hồ sơ và loại hồ sơ đã rút.
- Đăng nhập và kiểm tra thêm bằng trình duyệt với môi trường thật tại cổng 8444; kết quả tổng hợp trong `deepseek-checks.json`.

## Chạy lại môi trường hiện tại

```bash
cd /Users/ProM2/Documents/smart-recruitment
./scripts/start-qa.sh
```

Mở http://localhost:8444/recruiter/candidates/screening và đăng nhập bằng tài khoản recruiter đã có. Giao diện hiển thị “Đã hoàn tất 26/26 hồ sơ (100%)”.

Cấu hình hiện tại: `DEEPSEEK_ENABLED=true`, `DEEPSEEK_MODEL=deepseek-flash`, `GEMINI_ENABLED=false`. Key chỉ được đặt trong `.env` cục bộ. Cấu hình DeepSeek đã được nối vào cả `run-local.sh` và Docker Compose.
