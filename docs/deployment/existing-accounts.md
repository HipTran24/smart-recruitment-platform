# Giữ tài khoản và CV khi chuyển lên VPS

Tài khoản được lưu trong MySQL. Push code lên Git không chuyển database hoặc file CV sang VPS. Dùng gói chuyển dữ liệu dưới đây một lần cho VPS mới; các lần cập nhật sau dùng lại volume hiện có.

Gói đã chuẩn bị có **29 tài khoản: 1 quản trị viên, 1 nhà tuyển dụng và 27 ứng viên**, cùng 30 file CV, 27 hồ sơ ứng tuyển, công ty/công việc và các kết quả sàng lọc đã lưu. Email, mật khẩu hiện tại và phân quyền được giữ nguyên; dữ liệu mật khẩu trong gói là hash Argon2 đang có trong database.

## Trên máy hiện tại: xuất dữ liệu

```bash
python3 scripts/deployment/manage-data.py export
```

Lệnh mặc định đọc `.local/qa-runtime.json` và `.local/qa-uploads`, tạo tệp `.local/deploy-data/smartrecruit-data-<thời-gian-UTC>.tar.gz`, quyền đọc/ghi chỉ cho chủ tệp. Đường dẫn chính xác được in khi xuất xong. Tệp chứa SQL và những CV được database tham chiếu, kèm checksum SHA-256.

Gói dữ liệu, `.env`, API key và khóa JWT được Git/Docker build bỏ qua. **Chuyển gói dữ liệu bằng SSH/SCP riêng với mã nguồn**. API key và cấu hình database của máy nguồn không nằm trong gói. Phiên đăng nhập, mã đặt lại mật khẩu và mã xác minh cũ cũng không được chuyển; người dùng đăng nhập lại bằng mật khẩu hiện có.

Kiểm tra một gói mà không nhập dữ liệu:

```bash
python3 scripts/deployment/manage-data.py inspect --bundle /duong-dan/smartrecruit-data-<thoi-gian>.tar.gz
```

## Trên VPS mới: nhập một lần trước khi chạy app

Checkout mã nguồn tại `/opt/smart-recruitment`, cài Docker Compose v2 và Python 3.10 trở lên, sau đó:

```bash
cd /opt/smart-recruitment
mkdir -p .local/deploy-data
chmod 700 .local .local/deploy-data
cp .env.example .env
./scripts/generate-local-jwt-keys.sh
```

Điền `.env` bằng cấu hình của VPS: mật khẩu MySQL riêng, đường dẫn tuyệt đối của hai khóa JWT vừa tạo và thông tin URL của môi trường mới. Nếu tiếp tục sàng lọc bằng DeepSeek, điền `DEEPSEEK_API_KEY`, đặt `DEEPSEEK_ENABLED=true`, `DEEPSEEK_MODEL=deepseek-flash`, `GEMINI_ENABLED=false`. Giữ `APP_IDENTITY_BOOTSTRAP_ADMIN_ENABLED=false` vì tài khoản quản trị hiện có sẽ được nhập từ gói.

Trên máy nguồn, chuyển gói vào thư mục vừa tạo; thay `user`, `VPS_IP` và tên gói bằng giá trị thực:

```bash
scp .local/deploy-data/smartrecruit-data-<thoi-gian>.tar.gz user@VPS_IP:/opt/smart-recruitment/.local/deploy-data/
```

Quay lại VPS, **chỉ khởi động MySQL trước**, chờ healthy, rồi nhập dữ liệu:

```bash
cd /opt/smart-recruitment
docker compose --env-file .env -f infra/docker/compose.local.yml up -d --wait mysql

python3 scripts/deployment/manage-data.py restore \
  --bundle .local/deploy-data/smartrecruit-data-<thoi-gian>.tar.gz \
  --env-file .env

./scripts/docker-up.sh
```

Công cụ tự tìm MySQL và volume CV qua Compose, kiểm tra checksum, nhập SQL, khôi phục file CV và đối chiếu số dòng từng bảng. Nó từ chối database hoặc volume CV đã có dữ liệu; không có tùy chọn ghi đè. App chỉ nên được bật sau khi lệnh nhập báo `restored: true`.

Sau khi cấu hình domain/reverse proxy của VPS, đăng nhập bằng email và mật khẩu đang dùng. Tài khoản recruiter vẫn thấy hồ sơ, CV và kết quả sàng lọc trước khi chuyển. Compose trong ví dụ là cấu hình hiện có của dự án; thiết lập HTTPS/domain và cấu hình production được quản lý riêng theo runbook triển khai.

## Những lần deploy tiếp theo

```bash
cd /opt/smart-recruitment
git pull
./scripts/docker-up.sh
```

Giữ cùng thư mục dự án, tệp `.env` và Compose project `smart-recruitment`. MySQL và CV nằm trong các volume `smart-recruitment_mysql-data` và `smart-recruitment_resume-data`, nên việc thay container/build lại image vẫn giữ tài khoản và dữ liệu.

Không chạy `docker compose down -v`, `docker volume prune` hoặc `./scripts/docker-down.sh --remove-data` khi cần giữ dữ liệu: những lệnh đó có thể xóa các volume. Công cụ xuất cũng có thể dùng lại để sao lưu VPS bằng `--database-config` và `--uploads-directory` phù hợp với môi trường.

## Phạm vi khôi phục và kiểm thử

- Giữ nguyên ID tài khoản, password hash, trạng thái tài khoản, phân quyền, liên kết công ty và hồ sơ ứng viên.
- Giữ nguyên dữ liệu ứng tuyển, lịch sử trạng thái, nhận xét và kết quả sàng lọc.
- Khôi phục đúng byte của các CV; UID/GID của backend cố định là `10001:10001` ở cả image thường và image phát hành.
- Chỉ loại bỏ token/phiên đăng nhập cũ; không tạo lại hoặc đặt lại mật khẩu tài khoản đang có.
- Kiểm thử checksum, path traversal, symlink và chặn nhập đè: `python3 -m unittest discover -s scripts/deployment -p 'test_*.py' -v`.
