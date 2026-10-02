with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Section 4: Tình huống
code = code.replace(
    'add_bullet([("Ngân sách: ", True), ("10.000.000 VNĐ là baseline tạm thời theo tài liệu kỹ thuật; cần sponsor/giảng viên xác nhận trước khi chi tiêu thực tế.")])',
    'add_bullet([("Ngân sách: ", True), ("33.052.000 VNĐ là baseline ngân sách tổng thể được xác lập theo định mức dự toán WBS (gồm 30.240.000 VNĐ nhân công cho 108 ngày công, 1.300.000 VNĐ chi phí trực tiếp hạ tầng/công nghệ và 1.512.000 VNĐ dự phòng rủi ro).")])'
)

# 2. Section 5: Instructions
code = code.replace(
    '"- Ràng buộc cốt lõi: Ngân sách 10.000.000 VNĐ baseline, thời hạn 08 Sprint (08/09/2026 – 02/11/2026)',
    '"- Ràng buộc cốt lõi: Ngân sách 33.052.000 VNĐ baseline (30.240.000 VNĐ nhân công + 1.300.000 VNĐ trực tiếp + 1.512.000 VNĐ dự phòng), thời hạn 08 Sprint (08/09/2026 – 02/11/2026)'
)

# 3. Section 5: Bước A3 (kiểm tra kết nối)
code = code.replace(
    'Nếu Gemini AI trả lời chính xác các nội dung (Ngân sách 10 triệu, 08 Sprint, Modular Monolith, Human-in-the-loop, Admin Least Privilege), môi trường làm việc đã sẵn sàng.',
    'Nếu Gemini AI trả lời chính xác các nội dung (Ngân sách 33.052.000 VNĐ, 08 Sprint, Modular Monolith, Human-in-the-loop, Admin Least Privilege), môi trường làm việc đã sẵn sàng.'
)

# 4. Section 6: Prompt Bài 1
code = code.replace(
    '(9) Ngân sách tổng 10.000.000 VNĐ,',
    '(9) Ngân sách tổng 33.052.000 VNĐ,'
)

# 5. Section 6: Project Charter SMART mục tiêu 4
code = code.replace(
    '4. Kiểm soát tổng chi phí phát triển và triển khai thử nghiệm trên AWS trong phạm vi ngân sách baseline được duyệt là 10.000.000 VNĐ, không để phát sinh chi phí vượt định mức.',
    '4. Kiểm soát tổng chi phí phát triển, nhân sự và triển khai thử nghiệm trên AWS trong phạm vi ngân sách baseline được duyệt là 33.052.000 VNĐ, không để phát sinh chi phí vượt định mức.'
)

# 6. Section 6: Project Charter Ngân sách tổng (Budget)
old_budget_entry = '''    ["Ngân sách tổng (Budget)", "Tổng ngân sách baseline tạm thời: 10.000.000 VNĐ (cần Sponsor xác nhận trước khi giải ngân), phân bổ cụ thể:\\n- Hạ tầng điện toán đám mây AWS demo (EC2 t3.medium, RDS db.t3.micro, S3, ECR trong 2 tháng): 4.500.000 VNĐ.\\n- Chi phí Quota Google Gen AI API (Gemini 2.5 Flash phục vụ phát triển, kiểm thử và demo): 1.500.000 VNĐ.\\n- Tên miền (Domain name) và chứng chỉ bảo mật SSL/TLS: 500.000 VNĐ.\\n- Chi phí công cụ kiểm thử, tài liệu kỹ thuật và văn phòng phẩm nhóm: 1.500.000 VNĐ.\\n- Quỹ dự phòng rủi ro tài chính (Contingency Reserve 20%): 2.000.000 VNĐ."],'''

new_budget_entry = '''    ["Ngân sách tổng (Budget)", "Tổng ngân sách baseline chính thức: 33.052.000 VNĐ (chuẩn hóa theo cơ sở định mức WBS 108 ngày công và tài chính dự án), phân bổ cụ thể:\\n- Chi phí nhân công trực tiếp (108 ngày công của đội ngũ phát triển 6 vai trò WBS): 30.240.000 VNĐ.\\n- Chi phí trực tiếp hạ tầng & dịch vụ công nghệ (Cloud VPS/AWS, Quota Google Gemini API, Tên miền & SSL, công cụ kiểm thử): 1.300.000 VNĐ.\\n- Quỹ dự phòng rủi ro tài chính (Contingency Reserve ~5%): 1.512.000 VNĐ.\\nTổng cộng: 30.240.000 + 1.300.000 + 1.512.000 = 33.052.000 VNĐ."],'''

code = code.replace(old_budget_entry, new_budget_entry)

# 7. Section 6: Giả định & Ràng buộc
code = code.replace(
    '- Ràng buộc ngân sách: Tuyệt đối không chi tiêu vượt quá hạn mức 10.000.000 VNĐ.',
    '- Ràng buộc ngân sách: Tuyệt đối không chi tiêu vượt quá hạn mức 33.052.000 VNĐ.'
)

# 8. Section 6: Phân tích SMART mục tiêu 2
code = code.replace(
    'không vượt quá hạn mức baseline 10.000.000 VNĐ tính đến ngày đóng dự án 03/11/2026',
    'không vượt quá hạn mức baseline 33.052.000 VNĐ tính đến ngày đóng dự án 03/11/2026'
)

# 9. Section 6: Câu hỏi 1 với Sponsor
code = code.replace(
    'add_bullet([("Câu hỏi 1 (Về cơ chế giải ngân ngân sách): ", True), ("“Hạn mức 10.000.000 VNĐ là ngân sách được tài trợ chính thức hay nhóm sinh viên phải tự chi trả rồi thanh toán lại; quy trình phê duyệt chi phí phát sinh AWS và Quota AI được thực hiện theo bước nào?” – ", False), ("Lý do: ", True), ("Chi phí đám mây AWS và API Gemini tính bằng thẻ tín dụng theo thời gian thực; nếu không làm rõ nguồn tiền và cơ chế kích hoạt ngân sách, nhóm có nguy cơ bị dừng dịch vụ giữa chừng hoặc tự chịu gánh nặng tài chính.")])',
    'add_bullet([("Câu hỏi 1 (Về cơ chế giải ngân ngân sách): ", True), ("“Hạn mức dự toán 33.052.000 VNĐ (gồm 30.240.000 VNĐ nhân công và 2.812.000 VNĐ chi phí trực tiếp + dự phòng) được giải ngân, nghiệm thu theo từng giai đoạn Sprint như thế nào giữa Nhà trường/Sponsor và nhóm?” – ", False), ("Lý do: ", True), ("Cần xác định rõ cơ chế ghi nhận chi phí nhân công và quy trình thanh toán chi phí trực tiếp đám mây/API để nhóm chủ động duy trì dịch vụ liên tục.")])'
)

# 10. Section 9: Risk Register R01 & Contingency Plan
code = code.replace(
    'Ngân sách 10 triệu bị cạn kiệt, tài khoản đám mây bị tạm khóa.',
    'Ngân sách chi phí trực tiếp bị cạn kiệt, tài khoản đám mây bị tạm khóa.'
)
code = code.replace(
    'Cài đặt AWS Budget Alarm ở mức 70% ngân sách; thiết lập hard-limit quota trên Google Cloud Console; dùng Mock Adapter khi chạy test cục bộ và CI.',
    'Cài đặt AWS Budget Alarm ở mức 70% định mức chi phí trực tiếp; thiết lập hard-limit quota trên Google Cloud Console; dùng Mock Adapter khi chạy test cục bộ và CI.'
)
code = code.replace(
    'Khi hóa đơn tích lũy dịch vụ AWS vượt ngưỡng 3.000.000 VNĐ trước tuần thứ 4,',
    'Khi hóa đơn tích lũy dịch vụ AWS và Gemini API vượt ngưỡng 900.000 VNĐ (khoảng 70% chi phí trực tiếp) trước tuần thứ 4,'
)

# 11. Section 10: Bài 5 Prompt & QA 2
code = code.replace(
    'tập trung vào thời gian 08 Sprint, rủi ro ngân sách 10 triệu, áp lực nhân lực 6 người,',
    'tập trung vào thời gian 08 Sprint, rủi ro ngân sách 33.052.000 VNĐ, áp lực nhân lực 6 người,'
)
code = code.replace(
    'Câu hỏi 2 (Về ngân sách 10 triệu và rủi ro vượt chi phí): “Ngân sách 10.000.000 VNĐ chỉ là con số ước tính ban đầu. Nếu trong quá trình chạy kiểm thử tải hoặc do lỗi lặp vô hạn khiến hóa đơn AWS và tiền gọi API Gemini tăng vọt lên 20–30 triệu, ai sẽ là người chịu trách nhiệm chi trả?”',
    'Câu hỏi 2 (Về ngân sách 33.052.000 VNĐ và rủi ro vượt chi phí): “Dự toán tổng ngân sách là 33.052.000 VNĐ, trong đó phần chi phí trực tiếp cho hạ tầng đám mây và API Gemini là 1.300.000 VNĐ. Nếu trong quá trình chạy kiểm thử tải hoặc do lỗi lặp vô hạn khiến hóa đơn đám mây tăng vọt vượt hạn mức này, ai sẽ là người chịu trách nhiệm chi trả?”'
)
code = code.replace(
    '3. Quỹ dự phòng: Trong cơ cấu ngân sách 10 triệu, nhóm đã để riêng 2.000.000 VNĐ (chiếm 20%) làm quỹ dự phòng rủi ro (Contingency Reserve). Nếu chi phí chạm ngưỡng 80%, PM sẽ chủ động họp với Sponsor để xin ý kiến tối ưu hóa thay vì âm thầm để phát sinh nợ.',
    '3. Quỹ dự phòng: Trong cơ cấu ngân sách 33.052.000 VNĐ, nhóm đã để riêng 1.512.000 VNĐ làm quỹ dự phòng rủi ro (Contingency Reserve). Nếu chi phí trực tiếp chạm ngưỡng 70%, PM sẽ chủ động họp với Sponsor để xin ý kiến tối ưu hóa thay vì âm thầm để phát sinh vượt định mức.'
)
code = code.replace(
    'mà không quan tâm đến ràng buộc ngân sách 10 triệu;',
    'mà không quan tâm đến ràng buộc ngân sách 33.052.000 VNĐ;'
)

# 12. Phụ lục A - A4
code = code.replace(
    'add_bullet("Ngân sách baseline tạm thời: 10.000.000 VNĐ; cần Sponsor/Giảng viên xác nhận trước khi chi tiêu thực tế.")',
    'add_bullet("Ngân sách baseline chính thức: 33.052.000 VNĐ (gồm 30.240.000 VNĐ chi phí nhân công 108 ngày công, 1.300.000 VNĐ chi phí trực tiếp và 1.512.000 VNĐ quỹ dự phòng rủi ro).")'
)

# 13. Phụ lục C: Prompt Log (Table 23)
code = code.replace(
    'ngân sách 10tr, 08 Sprint.',
    'ngân sách 33.052.000 VNĐ, 08 Sprint.'
)

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Budget update script applied successfully.")
