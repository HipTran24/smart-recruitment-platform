# Quy ước API

> Trạng thái: **Target**. Backend hiện chưa công bố controller hoặc endpoint nghiệp vụ; tài liệu này là chuẩn để áp dụng ngay khi API đầu tiên được tạo.

## Hiện có

- `GET /actuator/health`, `GET /actuator/health/liveness` và `GET /actuator/health/readiness` phục vụ health check, không trả chi tiết nội bộ.
- `GET /actuator/info` được phép truy cập.
- Mọi đường dẫn khác bị Spring Security từ chối mặc định. Không thêm `permitAll` trước khi có contract, authentication và authorization rõ ràng.

## URL và version

API nghiệp vụ dùng tiền tố:

```text
/api/v1/
```

Ví dụ định hướng:

```text
POST /api/v1/auth/login
GET  /api/v1/jobs
POST /api/v1/jobs
POST /api/v1/jobs/{jobId}/applications
```

Không thay đổi ý nghĩa của endpoint đã public theo cách phá vỡ client. Khi cần thay đổi không tương thích, tạo version API mới.

## Request và response

- Dùng JSON UTF-8 qua HTTPS.
- Request body có schema rõ ràng, validation tại lớp API.
- Thành công trả HTTP status đúng ngữ nghĩa: `200`, `201`, `204`.
- Không có dữ liệu hoặc tài nguyên không tồn tại trả `404`.
- Input không hợp lệ trả `400`; không đủ quyền trả `403`; chưa đăng nhập trả `401`.

Mẫu lỗi định hướng:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu gửi lên không hợp lệ.",
  "fieldErrors": [
    {
      "field": "title",
      "message": "Không được để trống."
    }
  ],
  "requestId": "..."
}
```

## Pagination, filter và sort

Danh sách lớn dùng query parameter rõ ràng:

```text
GET /api/v1/jobs?page=0&size=20&sort=createdAt,desc
```

- `page` bắt đầu từ `0`.
- `size` có giới hạn tối đa do backend quy định.
- Filter dùng tên trường nghiệp vụ, ví dụ `status=PUBLISHED`.
- Sort chỉ cho phép danh sách trường được backend whitelist.

## Contract và tài liệu

- Mỗi endpoint mới cần có mô tả request, response, quyền truy cập và lỗi có thể trả.
- Khi có OpenAPI/Swagger, file export đặt trong `docs/api/` hoặc được sinh từ source trong CI.
- Không ghi credential, token mẫu thật hoặc dữ liệu cá nhân thật trong ví dụ API.
