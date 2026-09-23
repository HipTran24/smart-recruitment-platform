# Quy trình Đóng góp

## Branch

Tạo nhánh ngắn từ `main` theo một trong các mẫu:

```text
feature/<ticket>-<mo-ta>
fix/<ticket>-<mo-ta>
docs/<ticket>-<mo-ta>
chore/<ticket>-<mo-ta>
```

Ví dụ: `feature/SCRUM-12-create-job`.

Không push trực tiếp vào `main`.

## Commit

Dùng Conventional Commits:

```text
feat(jobs): add job creation use case
fix(auth): reject expired refresh token
docs(architecture): document module boundaries
chore(build): align Java toolchain
```

Commit mô tả thay đổi có chủ đích; không trộn refactor lớn, format toàn dự án và tính năng không liên quan trong cùng commit.

## Pull Request checklist

- [ ] Phạm vi thay đổi rõ ràng và gắn với ticket/issue.
- [ ] Build và test liên quan đã được chạy bởi người tạo PR.
- [ ] Không có secret, file build, `.idea/`, log hoặc dữ liệu người dùng.
- [ ] API/database/architecture docs được cập nhật nếu thay đổi tác động contract.
- [ ] Migration mới được thêm khi schema thay đổi.
- [ ] Có ít nhất một người review trước khi merge vào `main`.

## Review

Review ưu tiên tính đúng đắn, security, ranh giới module, test và khả năng bảo trì. Nhận xét cần gắn với file/dòng cụ thể và nêu rõ lý do hoặc rủi ro.
