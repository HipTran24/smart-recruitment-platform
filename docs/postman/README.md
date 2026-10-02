# Postman API Collection & Environment

Thư mục này chứa file cấu hình Postman để kiểm thử toàn bộ API hiện tại của hệ thống **Smart Recruitment Platform**.

## Files
1. `Smart_Recruitment_API.postman_collection.json`: Collection chứa toàn bộ các request, phân nhóm theo Actuator, Auth, và Security Test. Có sẵn Test Scripts để tự động lưu `accessToken` và `refreshToken` vào biến môi trường.
2. `Smart_Recruitment_Local.postman_environment.json`: File môi trường cục bộ (`baseUrl = http://localhost:8080`, `accessToken`, `refreshToken`).

## Cách sử dụng
1. Mở **Postman**, bấm nút **Import** ở góc trên bên trái.
2. Kéo thả cả 2 file trên vào Postman.
3. Chọn môi trường **Smart Recruitment (Local)** ở góc trên bên phải.
4. Chạy các request theo đúng thứ tự logic (Register -> Login -> Get Me -> Refresh Token -> Logout).
