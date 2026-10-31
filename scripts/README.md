# Developer Scripts

Để mở môi trường QA đã có tài khoản ba quyền và 26 CV trên máy hiện tại:

```bash
cd /Users/ProM2/Documents/smart-recruitment
./scripts/start-qa.sh
```

Mở http://localhost:8444/login. Lệnh dùng cấu hình riêng tại `.local/qa-runtime.json`,
kiểm tra MySQL/backend/giao diện và giữ nguyên tài khoản, file CV, dữ liệu đã có.
Danh sách đăng nhập nằm tại `.local/role-test-accounts.md` và `.local/cv-test-fixtures.md`.
Các file `.local` chỉ có trên máy đã thiết lập QA; chúng được Git bỏ qua.

Để giữ nguyên tài khoản, mật khẩu, phân quyền, CV và kết quả khi chuyển lên VPS,
xuất gói dữ liệu bằng `python3 scripts/deployment/manage-data.py export` rồi làm theo
[hướng dẫn chuyển dữ liệu](../docs/deployment/existing-accounts.md). Gói dữ liệu được chuyển riêng bằng SSH, không đưa vào Git.

All commands are run from the repository root. Before using a command, copy `.env.example` to `.env` and set unique local passwords.

| Command | Purpose |
| --- | --- |
| `./scripts/start-qa.sh` | Starts the existing local QA environment with its test accounts and CVs; opens the app at port 8444. |
| `./scripts/check-env.sh` | Validates that `.env` exists and contains required local values without printing them. |
| `./scripts/docker-up.sh` | Builds the backend image and starts MySQL plus the application. |
| `./scripts/docker-down.sh` | Stops local containers but preserves the MySQL volume. |
| `./scripts/docker-down.sh --remove-data` | Stops containers and permanently deletes the local Docker database volume. |
| `./scripts/docker-logs.sh [app\|mysql]` | Follows the latest logs for the selected service. |
| `./scripts/run-local.sh` | Runs Spring Boot on the host against MySQL exposed by Docker. |
| `./scripts/verify.sh` | Runs Maven verification against an isolated MySQL Testcontainer. |

`docker-down.sh` preserves data by default. The `--remove-data` option is intentionally explicit because it deletes the local MySQL volume.

The scripts prefer Maven Wrapper when its required wrapper metadata exists; otherwise they use the installed `mvn` command.
