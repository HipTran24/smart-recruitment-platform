# Security và liên kết Jira cho PR #1 / #2 — 30/10/2026

Yêu cầu tiếp tục recovery cho phép sửa finding bảo mật thực tế, xác minh CI/review và đối chiếu Jira. Hồ sơ này ghi kết quả local và liên kết native đã kiểm tra; trạng thái CI/review mới nhất được cập nhật trong description và Checks của từng PR.

## Finding tái hiện và bản vá

`npm audit --json` trên hai nhánh có cùng manifest/lockfile ban đầu tái hiện 3 package mức high. Tất cả thuộc dependency phát triển, nhưng vẫn được vá vì chúng chạy trong toolchain và CI.

| Package | npm lock trước | Sau | Nguồn bản vá |
| --- | --- | --- | --- |
| vite | 8.3.1 | 8.3.3 | [GitHub advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm) |
| source-map-js | 1.2.1 | 1.2.2 | [GitHub advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) |
| undici | 8.11.2 | 8.12.3 | [GitHub advisory, patched từ 8.12.2](https://github.com/advisories/GHSA-2m5v-pch6-74hx) |

Manifest nâng minimum Vite lên `^8.3.3`; lockfile giữ phiên bản đã kiểm tra. Hai dependency gián tiếp được cập nhật trong phạm vi tương thích của parent. Không nâng major framework.

`pnpm-lock.yaml` trước đó không khớp manifest hiện tại: còn Vite 8.0.5 và thiếu nhóm dependency kiểm thử đã có trong package.json. Đã import lại từ npm lockfile bằng pnpm 10.34.3 đúng phiên bản trong `.mise.toml`; việc này giải thích phần diff lockfile lớn. Đã đối chiếu đủ 177 cặp package name/version: npm và pnpm mô tả cùng đồ thị đã vá, gồm Vitest/jsdom/testing-library.

## Kiểm chứng local sau bản vá

| Kiểm tra | Kết quả |
| --- | --- |
| `npm ci` | PASS: cài mới từ lockfile |
| `npm audit --json` | PASS: 0 finding ở mọi mức |
| `npm audit --omit=dev --json` | PASS: 0 finding production |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 3 file, 22 test |
| `npm run build` | PASS; cảnh báo chunk lớn đã có trước |
| `npx --yes pnpm@10.34.3 install --lockfile-only --frozen-lockfile --ignore-scripts` | PASS |
| `git diff --check` | PASS |

Bản ghi máy đọc được nằm trong [evidence.json](evidence.json), có số liệu trước/sau, danh sách advisory và checksum của audit response local. Kết quả này xác nhận các advisory đã biết trong đồ thị npm được kiểm tra; không chứng nhận toàn bộ ứng dụng không còn lỗi bảo mật.

## CI mới

Thêm `.github/workflows/frontend-ci.yml` chạy Node 22, `npm ci`, audit cả development/production với ngưỡng fail high, typecheck, test và build. Workflow dùng quyền `contents: read`, không dùng `pull_request_target` hoặc secrets. Backend Maven CI được giữ riêng.

Workflow mới cung cấp check thực tế cho cả hai PR. Nó không tự cấu hình branch protection/required checks và không thay thế review độc lập. Kết quả head mới phải được đọc từ Checks; không lấy run trên head cũ để chứng nhận head mới.

## Jira được kiểm chứng qua Development Panel

Đã mở issue trong browser, chờ widget Development tải dữ liệu rồi mở **Development details → Pull requests**. Đối chiếu repository `HipTran24/smart-recruitment-platform`, ID, URL, source branch và target `main`:

- [SCRUM-50](https://tranthanhhiep.atlassian.net/browse/SCRUM-50) hiển thị đúng [PR #1](https://github.com/HipTran24/smart-recruitment-platform/pull/1), trạng thái DRAFT.
- [SCRUM-21](https://tranthanhhiep.atlassian.net/browse/SCRUM-21) hiển thị đúng [PR #2](https://github.com/HipTran24/smart-recruitment-platform/pull/2), trạng thái OPEN. PR #1 cũng xuất hiện như liên hệ phụ, phù hợp với các issue được đề cập trong hồ sơ audit của PR #1.

Trạng thái liên kết PR là **PASS**. Các lần đọc trước thấy panel trống chưa đủ chứng minh thiếu kết nối: widget tải bất đồng bộ. Kết quả native hiện tại thay thế trạng thái UNVERIFIED trước đó. Đây là xác minh các PR cụ thể, không xác nhận mọi commit cũ thiếu Jira key đã được backfill.

## Review và giới hạn bàn giao

API GitHub lúc kiểm tra trả về 0 submitted review trên cả PR #1 và PR #2. Review độc lập là **BLOCKED** cho đến khi có reviewer thực sự đọc và chấp thuận head hiện tại. Tự review kỹ thuật của coding agent không được ghi thành review độc lập trên GitHub. PR #1 vẫn là draft.

Các commit gốc và main được bảo toàn. Các thay đổi bảo mật/CI được thêm bằng commit mới trên từng nhánh PR; không merge PR và không rewrite/force-push lịch sử.

Nếu cần rollback bản vá, dùng một commit revert bình thường sau khi đánh giá lại rủi ro advisory. Không làm yếu ngưỡng audit hoặc skip test để tạo PASS. Các run/check và review mới nhất được trỏ trong description của hai PR.
