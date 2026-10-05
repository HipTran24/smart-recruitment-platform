# Smart Recruitment Documentation

Đây là cổng vào cho toàn bộ tài liệu kỹ thuật của repository. Mỗi tài liệu được viết bằng Markdown, version cùng source code và phải phản ánh trạng thái thực tế của dự án.

## Điều hướng

| Khu vực | Nội dung |
| --- | --- |
| [architecture/](architecture/overview.md) | Kiến trúc tổng thể, cấu trúc backend và quy ước mã nguồn |
| [Kế hoạch tích hợp frontend–backend](architecture/frontend-backend-integration-plan.md) | Kế hoạch Target cho agent code: contract, auth, nghiệp vụ, kiểm thử, tối ưu và bàn giao |
| [Kịch bản tổng thể cho AI agent](../SMARTRECRUIT_MASTER_AGENT_SCRIPT.md) | Hoàn thiện frontend, backend, database và đưa website từ local tới staging/production với bằng chứng nghiệm thu |
| [api/](api/README.md) | Chuẩn API và hợp đồng API khi các endpoint được xây dựng |
| [database/](database/README.md) | Quy ước MySQL, migration và [mô hình dữ liệu hiện có](database/schema.md) |
| [adr/](adr/README.md) | Các quyết định kiến trúc có ảnh hưởng lâu dài |
| [runbooks/](runbooks/local-development.md) | Cách chạy local, [xác thực & AI](runbooks/authentication-and-ai.md), troubleshooting và [production readiness](runbooks/production-readiness.md) |
| [contribution.md](contribution.md) | Quy trình làm việc, branch, commit và Pull Request |

## Trạng thái tài liệu

- Tài liệu ghi **Current** mô tả phần đã tồn tại trong repository.
- Tài liệu ghi **Target** mô tả quy ước hoặc kiến trúc đã được chọn cho phần sẽ xây dựng.
- Không ghi API, database table hoặc workflow như thể đã tồn tại nếu chúng mới chỉ là kế hoạch.

## Quy tắc cập nhật

- Thay đổi API phải cập nhật `docs/api/` trong cùng Pull Request.
- Thay đổi database phải có migration và cập nhật `docs/database/`.
- Thay đổi có tính kiến trúc phải thêm hoặc cập nhật một ADR.
- Không đưa mật khẩu, token, URL có credential hoặc dữ liệu ứng viên thật vào tài liệu.
