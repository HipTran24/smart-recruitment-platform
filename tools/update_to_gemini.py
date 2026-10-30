with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace header if needed
code = code.replace(
    'sec.header.paragraphs[0].text = "Lab QLDA CNTT – SmartRecruit Project"',
    'sec.header.paragraphs[0].text = "Lab QLDA CNTT – Gemini AI: SmartRecruit Project"'
)

# 1. Title
code = code.replace(
    'add_p("Lập kế hoạch dự án phần mềm với trợ lý AI – Claude Projects", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=15, color="1F4E79", space_after=12)',
    'add_p("Lập kế hoạch dự án phần mềm với trợ lý AI – Google Gemini AI", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=15, color="1F4E79", space_after=12)'
)

# 2. Table 0
code = code.replace(
    '["Hình thức", "Làm việc nhóm 3–5 sinh viên, mỗi nhóm dùng chung 1 Claude Project (Đơn vị: [Nhóm 03])"],',
    '["Hình thức", "Làm việc nhóm 3–5 sinh viên, mỗi nhóm dùng chung 1 tài khoản/môi trường Gemini AI (Đơn vị: [Nhóm 03])"],'
)
code = code.replace(
    '["Công cụ", "Claude (claude.ai hoặc ứng dụng Claude), Microsoft Word/Excel hoặc Google Docs/Sheets, Jira Software"],',
    '["Công cụ", "Google Gemini AI (gemini.google.com hoặc Google AI Studio), Microsoft Word/Excel hoặc Google Docs/Sheets, Jira Software"],'
)

# 3. Mục tiêu 1
code = code.replace(
    'add_bullet([("Thiết lập một ", False), ("Claude Project", True), (" đúng cách (Instructions + Knowledge) để dùng AI làm trợ lý quản lý dự án cho hệ thống SmartRecruit.")])',
    'add_bullet([("Thiết lập môi trường làm việc với ", False), ("Gemini AI", True), (" đúng cách (System Instructions + Knowledge) để dùng AI làm trợ lý quản lý dự án cho hệ thống SmartRecruit.")])'
)

# 4. Chuẩn bị
code = code.replace(
    'add_bullet("Tạo sẵn tài khoản Claude tại claude.ai / ChatGPT (gói miễn phí hoặc gói trả phí đều đáp ứng tốt bài thực hành).")',
    'add_bullet("Tạo sẵn tài khoản Google Gemini tại gemini.google.com / Google AI Studio (gói miễn phí hoặc gói Gemini Advanced đều đáp ứng tốt bài thực hành).")'
)
code = code.replace(
    'add_bullet("Kiểm tra kết nối Internet phòng máy và quyền truy cập claude.ai, bảo đảm băng thông cho các nhóm tương tác AI đồng thời.")',
    'add_bullet("Kiểm tra kết nối Internet phòng máy và quyền truy cập gemini.google.com, bảo đảm băng thông cho các nhóm tương tác AI đồng thời.")'
)

# 5. Table 1 (Tiến trình)
code = code.replace(
    '["Phần A", "Thiết lập Claude Project (tạo Project, Instructions, nạp Knowledge kỹ thuật)", "25 phút"],',
    '["Phần A", "Thiết lập môi trường Gemini AI (tạo Gem/Project, System Instructions, nạp Knowledge)", "25 phút"],'
)

# 6. Tình huống
code = code.replace(
    'add_bullet([("Chi tiết yêu cầu kỹ thuật và phạm vi: ", True), ("Xem Phụ lục A – đây là tài liệu cốt lõi các nhóm sẽ đưa vào Knowledge của Claude Project.")])',
    'add_bullet([("Chi tiết yêu cầu kỹ thuật và phạm vi: ", True), ("Xem Phụ lục A – đây là tài liệu cốt lõi các nhóm sẽ đưa vào Knowledge / Tệp đính kèm ngữ cảnh của Gemini AI.")])'
)

# 7. Section 5: Phần A
code = code.replace(
    'add_h1("5. Phần A – Thiết lập Claude Project (25 phút)")',
    'add_h1("5. Phần A – Thiết lập môi trường Gemini AI (25 phút)")'
)
code = code.replace(
    'add_bullet("Đăng nhập claude.ai → chọn mục Projects ở thanh bên trái → bấm + New Project (Tạo dự án mới).")',
    'add_bullet("Đăng nhập gemini.google.com → vào mục Gems / Dự án làm việc (hoặc truy cập Google AI Studio: aistudio.google.com) → bấm Create Gem / New Prompt (Tạo không gian làm việc mới).")'
)
code = code.replace(
    'add_callout("Mẫu Instructions cho Project SmartRecruit", instructions_lines)',
    'add_callout("Mẫu System Instructions cho Gemini AI (Dự án SmartRecruit)", instructions_lines)'
)
code = code.replace(
    'add_bullet("Kiểm tra kết nối: mở một chat mới trong Project và hỏi: “Tóm tắt 5 ràng buộc kỹ thuật và nguyên tắc vận hành của hệ thống SmartRecruit”. Nếu Claude trả lời chính xác các nội dung (Ngân sách 10 triệu, 08 Sprint, Modular Monolith, Human-in-the-loop, Admin Least Privilege), Project đã sẵn sàng.")',
    'add_bullet("Kiểm tra kết nối: mở một cuộc hội thoại mới với Gemini AI và hỏi: “Tóm tắt 5 ràng buộc kỹ thuật và nguyên tắc vận hành của hệ thống SmartRecruit”. Nếu Gemini AI trả lời chính xác các nội dung (Ngân sách 10 triệu, 08 Sprint, Modular Monolith, Human-in-the-loop, Admin Least Privilege), môi trường làm việc đã sẵn sàng.")'
)

# 8. Section 7 (WBS)
code = code.replace(
    'add_bullet("Lưu WBS cuối cùng thành file tài liệu kỹ thuật và tải ngược lên Knowledge của Claude Project để phục vụ bài lập lịch tiếp theo.")',
    'add_bullet("Lưu WBS cuối cùng thành file tài liệu kỹ thuật và tải ngược lên phần ngữ cảnh tài liệu (Knowledge) của Gemini AI để phục vụ bài lập lịch tiếp theo.")'
)

# 9. Section 10 (Bài 5)
code = code.replace(
    'add_p("Mở chat mới “Bai5_PhanBien” và yêu cầu Claude đóng vai nhà tài trợ dự án (Sponsor) khó tính để chất vấn kế hoạch:")',
    'add_p("Mở chat mới “Bai5_PhanBien” và yêu cầu Gemini AI đóng vai nhà tài trợ dự án (Sponsor) khó tính để chất vấn kế hoạch:")'
)
code = code.replace(
    'add_p("Qua toàn bộ quá trình thực hành thiết lập và tương tác với trợ lý AI (Claude Projects) cho dự án SmartRecruit, nhóm [Nhóm 03] rút ra các bài học phản tư sâu sắc:")',
    'add_p("Qua toàn bộ quá trình thực hành thiết lập và tương tác với trợ lý AI (Gemini AI) cho dự án SmartRecruit, nhóm [Nhóm 03] rút ra các bài học phản tư sâu sắc:")'
)

# 10. Section 11 (Sản phẩm nộp)
code = code.replace(
    'add_bullet("Ảnh chụp màn hình Claude Project: cấu hình Instructions và danh mục tài liệu nạp vào Knowledge.")',
    'add_bullet("Ảnh chụp màn hình Gemini AI: cấu hình System Instructions / Gem và danh mục tài liệu nạp vào Knowledge.")'
)

# 11. Section 12 (Tiêu chí đánh giá)
code = code.replace(
    '["Thiết lập Claude Project", "Instructions định nghĩa rõ ràng vai trò, bối cảnh, quy tắc và cơ chế gợi mở; Knowledge nạp đầy đủ tài liệu baseline kỹ thuật SmartRecruit chuẩn xác.", "1,0"],',
    '["Thiết lập Gemini AI", "System Instructions định nghĩa rõ ràng vai trò, bối cảnh, quy tắc và cơ chế gợi mở; Knowledge nạp đầy đủ tài liệu baseline kỹ thuật SmartRecruit chuẩn xác.", "1,0"],'
)

# 12. Phụ lục A
code = code.replace(
    'add_p("Tài liệu kỹ thuật baseline v1.1 được chuẩn hóa để sinh viên đưa vào Knowledge của Claude Project:")',
    'add_p("Tài liệu kỹ thuật baseline v1.1 được chuẩn hóa để sinh viên đưa vào Knowledge của Gemini AI:")'
)

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Replacement script written successfully.")
