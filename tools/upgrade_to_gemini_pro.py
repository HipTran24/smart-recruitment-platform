with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Header
code = code.replace(
    'sec.header.paragraphs[0].text = "Lab QLDA CNTT – Gemini AI: SmartRecruit Project"',
    'sec.header.paragraphs[0].text = "Lab QLDA CNTT – Gemini AI (Gói Pro): SmartRecruit Project"'
)

# Title
code = code.replace(
    'add_p("Lập kế hoạch dự án phần mềm với trợ lý Google Gemini AI"',
    'add_p("Lập kế hoạch dự án phần mềm với trợ lý Google Gemini AI (Gói Pro)"'
)

# Table 0: Lab info
code = code.replace(
    '["Hình thức", "Làm việc nhóm 3–5 sinh viên, mỗi nhóm dùng chung 1 tài khoản/môi trường Gemini AI (Đơn vị: [Nhóm 03])"],',
    '["Hình thức", "Làm việc nhóm 3–5 sinh viên, mỗi nhóm dùng chung 1 tài khoản/môi trường Gemini AI gói Pro (Đơn vị: [Nhóm 03])"],'
)
code = code.replace(
    '["Công cụ", "Google Gemini AI (gemini.google.com hoặc Google AI Studio), Microsoft Word/Excel hoặc Google Docs/Sheets, Jira Software"],',
    '["Công cụ", "Google Gemini AI – Gói Pro (gemini.google.com / Google AI Studio với model Gemini Pro), Microsoft Word/Excel hoặc Google Docs/Sheets, Jira Software"],'
)
code = code.replace(
    'Báo cáo phản biện Gemini AI & Nhật ký sử dụng Gemini AI',
    'Báo cáo phản biện Gemini AI (Gói Pro) & Nhật ký sử dụng Gemini AI'
)

# Section 1: Mục tiêu
code = code.replace(
    'để dùng Gemini AI làm trợ lý quản lý dự án cho hệ thống SmartRecruit',
    'để dùng Gemini AI gói Pro làm trợ lý quản lý dự án cho hệ thống SmartRecruit'
)
code = code.replace(
    '(" đầu ra của Gemini AI: phát hiện sai lệch số học, ảo giác về ngân sách/phạm vi và chỉnh sửa có căn cứ kỹ thuật vững chắc.")',
    '(" đầu ra của Gemini AI gói Pro: phát hiện sai lệch số học, ảo giác về ngân sách/phạm vi và chỉnh sửa có căn cứ kỹ thuật vững chắc.")'
)

# Section 2: Chuẩn bị
code = code.replace(
    'add_bullet("Tạo sẵn tài khoản Google Gemini tại gemini.google.com / Google AI Studio (gói miễn phí hoặc gói Gemini Advanced đều đáp ứng tốt bài thực hành).")',
    'add_bullet("Tạo sẵn/kích hoạt tài khoản Google Gemini gói Pro (Gemini Advanced hoặc Google AI Studio sử dụng model Gemini Pro) để tận dụng cửa sổ ngữ cảnh lớn (Context Window lên tới 1–2 triệu tokens) và khả năng suy luận logic chuyên sâu.")'
)
code = code.replace(
    'add_bullet("Kiểm tra kết nối Internet phòng máy và quyền truy cập gemini.google.com, bảo đảm băng thông cho các nhóm tương tác AI đồng thời.")',
    'add_bullet("Kiểm tra kết nối Internet phòng máy và quyền truy cập gemini.google.com / aistudio.google.com, bảo đảm băng thông cho các nhóm tương tác Gemini AI gói Pro đồng thời.")'
)

# Section 3: Tiến trình
code = code.replace(
    '["Phần A", "Thiết lập môi trường Gemini AI (tạo Gem/Project, System Instructions, nạp Knowledge)", "25 phút"],',
    '["Phần A", "Thiết lập môi trường Gemini AI gói Pro (tạo Gem/Project, System Instructions, nạp Knowledge)", "25 phút"],'
)
code = code.replace(
    '["Phần F", "Bài 5 – Kiểm tra phản biện đầu ra Gemini AI, chất vấn Sponsor, đánh giá chất lượng", "15 phút"],',
    '["Phần F", "Bài 5 – Kiểm tra phản biện đầu ra Gemini AI gói Pro, chất vấn Sponsor, đánh giá chất lượng", "15 phút"],'
)

# Section 4: Tình huống SmartRecruit
code = code.replace(
    'add_bullet([("Chi tiết yêu cầu kỹ thuật và phạm vi: ", True), ("Xem Phụ lục A – đây là tài liệu cốt lõi các nhóm sẽ đưa vào Knowledge / Tệp đính kèm ngữ cảnh của Gemini AI.")])',
    'add_bullet([("Trợ lý AI hỗ trợ quản trị: ", True), ("Sử dụng Google Gemini AI gói Pro (Gemini Pro) làm trợ lý phương pháp luận; chi tiết yêu cầu kỹ thuật xem Phụ lục A – đây là tài liệu cốt lõi nạp vào Knowledge của Gemini AI gói Pro.")])'
)

# Section 5: Phần A
code = code.replace(
    'add_h1("5. Phần A – Thiết lập môi trường Google Gemini AI (25 phút)")',
    'add_h1("5. Phần A – Thiết lập môi trường Google Gemini AI – Gói Pro (25 phút)")'
)
code = code.replace(
    'add_bullet("Đăng nhập gemini.google.com → vào mục Gems / Dự án làm việc (hoặc truy cập Google AI Studio: aistudio.google.com) → bấm Create Gem / New Prompt (Tạo không gian làm việc mới).")',
    'add_bullet("Đăng nhập gemini.google.com bằng tài khoản gói Pro (Gemini Advanced) hoặc truy cập Google AI Studio (aistudio.google.com, chọn model Gemini Pro) → bấm Create Gem / New Prompt để tạo không gian làm việc chuyên biệt.")'
)
code = code.replace(
    'add_bullet("Mô tả: “Trợ lý quản lý và lập kế hoạch dự án Nền tảng tuyển dụng thông minh SmartRecruit trên nền tảng Gemini AI – môn Quản lý dự án CNTT”.")',
    'add_bullet("Mô tả: “Trợ lý quản lý và lập kế hoạch dự án Nền tảng tuyển dụng thông minh SmartRecruit trên nền tảng Gemini AI gói Pro – môn Quản lý dự án CNTT”.")'
)
code = code.replace(
    'add_callout("Mẫu System Instructions cho Gemini AI (Dự án SmartRecruit)", instructions_lines)',
    'add_callout("Mẫu System Instructions cho Gemini AI Gói Pro (Dự án SmartRecruit)", instructions_lines)'
)
code = code.replace(
    '"Bạn là trợ lý quản lý dự án phần mềm chuyên nghiệp trên nền tảng Gemini AI,',
    '"Bạn là trợ lý quản lý dự án phần mềm chuyên nghiệp trên nền tảng Gemini AI (Gói Pro),'
)
code = code.replace(
    '"System Instructions áp dụng cho MỌI cuộc trò chuyện trong Gemini AI. Viết càng cụ thể và chặt chẽ, kết quả Gemini AI trả về càng chính xác, không bị lan man hay sai lệch ngữ cảnh kỹ thuật của SmartRecruit.",',
    '"System Instructions áp dụng cho MỌI cuộc trò chuyện trong Gemini AI gói Pro. Việc khai thác gói Pro với cửa sổ ngữ cảnh cực lớn (Context Window lên tới hàng triệu tokens) cho phép nạp trọn vẹn toàn bộ tài liệu kỹ thuật mà không lo bị cắt xén hay quên ngữ cảnh.",'
)
code = code.replace(
    '"Dòng “Không làm hộ toàn bộ…” giúp Gemini AI đóng vai người hướng dẫn và phản biện thay vì làm thay hoàn toàn – đây là tiêu chuẩn đánh giá quan trọng của bài thực hành."',
    '"Dòng “Không làm hộ toàn bộ…” kết hợp năng lực suy luận đa bước của Gemini Pro giúp AI đóng vai người phản biện sắc sảo thay vì chỉ trả lời rập khuôn – đây là tiêu chuẩn đánh giá quan trọng của bài thực hành."'
)
code = code.replace(
    'add_bullet("Kiểm tra kết nối: mở một cuộc hội thoại mới với Gemini AI và hỏi: “Tóm tắt 5 ràng buộc kỹ thuật và nguyên tắc vận hành của hệ thống SmartRecruit”. Nếu Gemini AI trả lời chính xác các nội dung (Ngân sách 33.052.000 VNĐ, 08 Sprint, Modular Monolith, Human-in-the-loop, Admin Least Privilege), môi trường làm việc đã sẵn sàng.")',
    'add_bullet("Kiểm tra kết nối: mở một cuộc hội thoại mới với Gemini AI gói Pro và hỏi: “Tóm tắt 5 ràng buộc kỹ thuật và nguyên tắc vận hành của hệ thống SmartRecruit”. Nếu Gemini AI gói Pro trả lời chính xác các nội dung (Ngân sách 33.052.000 VNĐ, 08 Sprint, Modular Monolith, Human-in-the-loop, Admin Least Privilege), môi trường làm việc đã sẵn sàng.")'
)
code = code.replace(
    'add_bullet("Thư ký nhóm chịu trách nhiệm ghi nhật ký prompt (theo mẫu Phụ lục C) xuyên suốt quá trình làm việc với Gemini AI.")',
    'add_bullet("Thư ký nhóm chịu trách nhiệm ghi nhật ký prompt (theo mẫu Phụ lục C) xuyên suốt quá trình làm việc với Gemini AI gói Pro.")'
)

# Section 6: Bài 1
code = code.replace(
    'add_bullet("Đối chiếu phần “ngoài phạm vi” với Phụ lục A – Gemini AI có bỏ sót hoặc tự ý thêm các tính năng không có trong tài liệu baseline kỹ thuật không?")',
    'add_bullet("Đối chiếu phần “ngoài phạm vi” với Phụ lục A – Gemini AI gói Pro có bỏ sót hoặc tự ý thêm các tính năng không có trong tài liệu baseline kỹ thuật không?")'
)
code = code.replace(
    'add_p("Trong quá trình làm việc với trợ lý Gemini AI, bản nháp ban đầu do Gemini AI sinh ra có một số mục tiêu chung chung như “xây dựng hệ thống tuyển dụng thông minh hiệu quả” và “đảm bảo hệ thống chạy tốt, ít lỗi”. Nhóm đã tiến hành phân tích phản biện và viết lại 2 mục tiêu then chốt để bảo đảm chuẩn SMART (Specific, Measurable, Achievable, Relevant, Time-bound):")',
    'add_p("Trong quá trình làm việc với trợ lý Gemini AI gói Pro, bản nháp ban đầu do Gemini AI gói Pro sinh ra có một số mục tiêu chung chung như “xây dựng hệ thống tuyển dụng thông minh hiệu quả” và “đảm bảo hệ thống chạy tốt, ít lỗi”. Nhóm đã tiến hành phân tích phản biện và viết lại 2 mục tiêu then chốt để bảo đảm chuẩn SMART (Specific, Measurable, Achievable, Relevant, Time-bound):")'
)
code = code.replace(
    'add_p("Nhóm đã đối chiếu kỹ lưỡng phần Ngoài phạm vi với tài liệu Project Setup v1.1. Gemini AI ban đầu có xu hướng đề xuất thêm các tính năng như “ứng dụng di động đa nền tảng” hoặc “tự động gửi thư từ chối ứng viên nếu điểm dưới 50”. Nhóm đã kiên quyết loại bỏ và xác nhận đây là phạm vi ngoài (Out-of-scope) vì vi phạm nguyên tắc Human-in-the-loop (AI không được tự ý từ chối con người) và vi phạm ràng buộc nguồn lực của đội ngũ sinh viên trong 08 Sprint.")',
    'add_p("Nhóm đã đối chiếu kỹ lưỡng phần Ngoài phạm vi với tài liệu Project Setup v1.1. Dù sử dụng Gemini AI gói Pro với độ hiểu biết sâu, mô hình ban đầu vẫn có xu hướng đề xuất thêm các tính năng mở rộng như “ứng dụng di động đa nền tảng” hoặc “tự động gửi thư từ chối ứng viên nếu điểm dưới 50”. Nhóm đã kiên quyết loại bỏ và xác nhận đây là phạm vi ngoài (Out-of-scope) vì vi phạm nguyên tắc Human-in-the-loop (AI không được tự ý từ chối con người) và vi phạm ràng buộc nguồn lực của đội ngũ sinh viên trong 08 Sprint.")'
)

# Section 7: Bài 2
code = code.replace(
    'add_bullet("Biểu diễn WBS dưới dạng sơ đồ cây phân cấp trực quan – không chỉ dừng lại ở bảng danh sách của Gemini AI.")',
    'add_bullet("Biểu diễn WBS dưới dạng sơ đồ cây phân cấp trực quan – không chỉ dừng lại ở bảng danh sách của Gemini AI gói Pro.")'
)
code = code.replace(
    'add_bullet("Lưu WBS cuối cùng thành file tài liệu kỹ thuật và tải ngược lên phần ngữ cảnh tài liệu (Knowledge) của Gemini AI để phục vụ bài lập lịch tiếp theo.")',
    'add_bullet("Lưu WBS cuối cùng thành file tài liệu kỹ thuật và tải ngược lên phần ngữ cảnh tài liệu (Knowledge) của Gemini AI gói Pro để phục vụ bài lập lịch tiếp theo.")'
)

# Section 8: Bài 3
code = code.replace(
    'add_p("Yêu cầu: Ước lượng thời gian bằng PERT ba điểm (O – M – P) với trợ lý Gemini AI, xác định quan hệ phụ thuộc, tính đường găng và kiểm tra lịch có đáp ứng thời hạn 08 Sprint (kết thúc trước 03/11) không.")',
    'add_p("Yêu cầu: Ước lượng thời gian bằng PERT ba điểm (O – M – P) với trợ lý Gemini AI gói Pro, xác định quan hệ phụ thuộc, tính đường găng và kiểm tra lịch có đáp ứng thời hạn 08 Sprint (kết thúc trước 03/11) không.")'
)
code = code.replace(
    '"Lưu ý cho sinh viên: Gemini AI có thể tính sai số học, nhầm lẫn công thức làm tròn hoặc hiểu sai quan hệ phụ thuộc giữa các hoạt động kỹ thuật. Toàn bộ bảng tính toán dưới đây BẮT BUỘC phải được nhóm lập công thức và kiểm tra chéo bằng Microsoft Excel/Google Sheets – đây là tiêu chuẩn chấm điểm bắt buộc."',
    '"Lưu ý cho sinh viên: Mặc dù Gemini AI gói Pro có khả năng suy luận logic vượt trội, mô hình ngôn ngữ vẫn có thể tính sai số học, nhầm lẫn công thức làm tròn hoặc xác định chưa tối ưu độ trễ Slack. Toàn bộ bảng tính toán dưới đây BẮT BUỘC phải được nhóm lập công thức và kiểm tra chéo bằng Microsoft Excel/Google Sheets – đây là tiêu chuẩn chấm điểm bắt buộc."'
)
code = code.replace(
    'add_bullet("Tính toán độc lập bằng Excel các chỉ số TE, ES, EF, LS, LF, Slack và độ lệch chuẩn sigma; đối chiếu từng dòng với kết quả đề xuất của Gemini AI để phát hiện sai lệch.")',
    'add_bullet("Tính toán độc lập bằng Excel các chỉ số TE, ES, EF, LS, LF, Slack và độ lệch chuẩn sigma; đối chiếu từng dòng với kết quả đề xuất của Gemini AI gói Pro để phát hiện sai lệch.")'
)

# Section 9: Bài 4
code = code.replace(
    'add_bullet("Bổ sung ít nhất 2 rủi ro kỹ thuật chuyên sâu mà Gemini AI thường bỏ sót (liên quan đến upload file độc hại và cơ chế vô hiệu hóa session khi đổi quyền Admin).")',
    'add_bullet("Bổ sung ít nhất 2 rủi ro kỹ thuật chuyên sâu mà Gemini AI gói Pro thường bỏ sót (liên quan đến upload file độc hại và cơ chế vô hiệu hóa session khi đổi quyền Admin).")'
)
code = code.replace(
    'add_p("Ghi chú: (*) R09 và R10 là 2 rủi ro thực chiến do nhóm tự phân tích và bổ sung dựa trên đặc thù kỹ thuật của SmartRecruit, không phụ thuộc vào gợi ý ban đầu của Gemini AI.", italic=True, font_size=10, color="595959")',
    'add_p("Ghi chú: (*) R09 và R10 là 2 rủi ro thực chiến do nhóm tự phân tích và bổ sung dựa trên đặc thù kỹ thuật của SmartRecruit, không phụ thuộc vào gợi ý ban đầu của Gemini AI gói Pro.", italic=True, font_size=10, color="595959")'
)

# Section 10: Bài 5
code = code.replace(
    'add_h1("10. Phần F – Bài 5: Kiểm tra phản biện đầu ra Gemini AI & Quản lý chất lượng dự án (15 phút)")',
    'add_h1("10. Phần F – Bài 5: Kiểm tra phản biện đầu ra Gemini AI gói Pro & Quản lý chất lượng dự án (15 phút)")'
)
code = code.replace(
    'add_p("Mở chat mới “Bai5_PhanBien” và yêu cầu Gemini AI đóng vai nhà tài trợ dự án (Sponsor) khó tính để chất vấn kế hoạch:")',
    'add_p("Mở chat mới “Bai5_PhanBien” và yêu cầu Gemini AI gói Pro đóng vai nhà tài trợ dự án (Sponsor) khó tính để chất vấn kế hoạch:")'
)
code = code.replace(
    'add_bullet("Sinh viên tự viết toàn bộ câu trả lời giải trình cho 5 câu hỏi chất vấn (tuyệt đối không nhờ Gemini AI làm hộ) và ghi vào báo cáo.")',
    'add_bullet("Sinh viên tự viết toàn bộ câu trả lời giải trình cho 5 câu hỏi chất vấn (tuyệt đối không nhờ Gemini AI gói Pro làm hộ) và ghi vào báo cáo.")'
)
code = code.replace(
    'add_bullet("Thực hiện phần phản tư (Reflection) sâu sắc về vai trò của Gemini AI trong quản lý dự án phần mềm.")',
    'add_bullet("Thực hiện phần phản tư (Reflection) sâu sắc về vai trò của Gemini AI gói Pro trong quản lý dự án phần mềm.")'
)
code = code.replace(
    'add_h3("Phần phản tư về vai trò của Gemini AI trong Quản lý dự án phần mềm (Reflection)")',
    'add_h3("Phần phản tư về vai trò của Gemini AI gói Pro trong Quản lý dự án phần mềm (Reflection)")'
)
code = code.replace(
    'add_p("Qua toàn bộ quá trình thực hành thiết lập và tương tác với trợ lý AI (Gemini AI) cho dự án SmartRecruit, nhóm [Nhóm 03] rút ra các bài học phản tư sâu sắc:")',
    'add_p("Qua toàn bộ quá trình thực hành thiết lập và tương tác với trợ lý AI (Gemini AI gói Pro) cho dự án SmartRecruit, nhóm [Nhóm 03] rút ra các bài học phản tư sâu sắc:")'
)
code = code.replace(
    'add_bullet([("Những khâu Gemini AI giúp nhóm tăng tốc vượt trội: ", True), ("Gemini AI phát huy sức mạnh tối đa ở việc tạo khung tài liệu chuẩn (scaffolding templates), gợi ý cấu trúc WBS phân rã ban đầu, chuyển đổi nhanh chóng yêu cầu nghiệp vụ thành User Story có tiêu chí chấp nhận (Given-When-Then), và gợi ý danh mục rủi ro phổ biến trong ngành phần mềm. Nhờ Gemini AI, nhóm tiết kiệm được khoảng 50% thời gian soạn thảo sơ bộ.")])',
    'add_bullet([("Những khâu Gemini AI gói Pro giúp nhóm tăng tốc vượt trội: ", True), ("Gemini AI gói Pro phát huy sức mạnh tối đa nhờ năng lực xử lý cửa sổ ngữ cảnh cực lớn (Context Window hàng triệu tokens), giúp phân tích đồng thời toàn bộ tài liệu kiến trúc, gợi ý cấu trúc WBS phân rã chuẩn xác, chuyển đổi nhanh chóng yêu cầu nghiệp vụ thành User Story có tiêu chí chấp nhận (Given-When-Then), và đóng vai phản biện đa chiều rất sâu sắc. Nhờ Gemini Pro, nhóm tiết kiệm được khoảng 50% thời gian soạn thảo sơ bộ.")])'
)
code = code.replace(
    'add_bullet([("Những điểm Gemini AI thường sai sót, ngây ngô hoặc thiếu sót: ", True), ("(1) ", False), ("Ảo giác số học và công thức: ", True), ("Gemini AI tính toán số học rất dễ sai lệch khi cộng dồn giờ công WBS hoặc tính toán tiến trình xuôi/ngược PERT (cần kiểm tra chéo bằng Excel); (2) ", False), ("Mở rộng phạm vi vô căn cứ: ", True), ("Gemini AI thường tự động thêm các tính năng ngoài lề (như mobile app, tích hợp HRIS) mà không quan tâm đến ràng buộc ngân sách 33.052.000 VNĐ; (3) ", False), ("Bỏ quên các ràng buộc an ninh nhạy cảm: ", True), ("Gemini AI ban đầu không tự thiết lập cơ chế khóa tự nâng quyền Admin hay xóa token session khi đổi quyền.")])',
    'add_bullet([("Những điểm Gemini AI gói Pro vẫn có thể sai sót hoặc cần lưu ý: ", True), ("(1) ", False), ("Ảo giác số học và công thức: ", True), ("Gemini Pro dù thông minh nhưng tính toán số học vẫn có thể sai lệch khi cộng dồn giờ công WBS hoặc tính toán tiến trình xuôi/ngược PERT (cần kiểm tra chéo bằng Excel); (2) ", False), ("Mở rộng phạm vi vô căn cứ: ", True), ("Gemini Pro có xu hướng đề xuất các giải pháp hoàn hảo cấp doanh nghiệp (như mobile app, tích hợp HRIS) vượt ngoài ràng buộc ngân sách 33.052.000 VNĐ; (3) ", False), ("Bỏ quên các ràng buộc an ninh ngầm: ", True), ("Gemini Pro ban đầu không tự thiết lập cơ chế khóa tự nâng quyền Admin hay cơ chế xóa session khi đổi quyền nếu ta không nhắc rõ.")])'
)
code = code.replace(
    'add_bullet([("Những quyết định then chốt KHÔNG ĐƯỢC giao phó cho Gemini AI: ", True), ("(1) ", False), ("Quyết định cam kết ngân sách và thời hạn: ", True), ("Chỉ có con người mới hiểu rõ năng lực thật và nguồn vốn thực tế; (2) ", False), ("Đánh giá và đưa ra quyết định tuyển dụng con người: ", True), ("Gemini AI chỉ là công cụ tính toán hỗ trợ, con người phải chịu trách nhiệm pháp lý và đạo đức; (3) ", False), ("Phê duyệt kiến trúc và chính sách an toàn thông tin: ", True), ("Việc cấp quyền truy cập, bảo vệ dữ liệu PII và quyết định go/no-go khi phát hành sản phẩm bắt buộc phải do các kỹ sư trưởng và PM phê duyệt.")])',
    'add_bullet([("Những quyết định then chốt KHÔNG ĐƯỢC giao phó cho Gemini AI gói Pro: ", True), ("(1) ", False), ("Quyết định cam kết ngân sách và thời hạn: ", True), ("Chỉ có con người mới hiểu rõ năng lực thật và nguồn vốn thực tế; (2) ", False), ("Đánh giá và đưa ra quyết định tuyển dụng con người: ", True), ("Gemini AI chỉ là công cụ tính toán hỗ trợ, con người phải chịu trách nhiệm pháp lý và đạo đức; (3) ", False), ("Phê duyệt kiến trúc và chính sách an toàn thông tin: ", True), ("Việc cấp quyền truy cập, bảo vệ dữ liệu PII và quyết định go/no-go khi phát hành sản phẩm bắt buộc phải do các kỹ sư trưởng và PM phê duyệt.")])'
)

# Section 11: Sản phẩm nộp
code = code.replace(
    'add_bullet("Ảnh chụp màn hình Gemini AI: cấu hình System Instructions / Gem và danh mục tài liệu nạp vào Knowledge.")',
    'add_bullet("Ảnh chụp màn hình Gemini AI gói Pro: cấu hình System Instructions / Gem và danh mục tài liệu nạp vào Knowledge.")'
)
code = code.replace(
    'add_bullet("Nhật ký sử dụng Gemini AI (Prompt Log theo mẫu Phụ lục C) ghi nhận đầy đủ tiến trình tương tác.")',
    'add_bullet("Nhật ký sử dụng Gemini AI gói Pro (Prompt Log theo mẫu Phụ lục C) ghi nhận đầy đủ tiến trình tương tác.")'
)

# Section 12: Tiêu chí đánh giá
code = code.replace(
    '["Thiết lập Gemini AI", "System Instructions định nghĩa rõ ràng vai trò, bối cảnh, quy tắc và cơ chế gợi mở; Knowledge nạp đầy đủ tài liệu baseline kỹ thuật SmartRecruit chuẩn xác.", "1,0"],',
    '["Thiết lập Gemini AI gói Pro", "System Instructions định nghĩa rõ ràng vai trò, bối cảnh, quy tắc và cơ chế gợi mở; khai thác tốt context window lớn của gói Pro; Knowledge nạp đầy đủ tài liệu baseline.", "1,0"],'
)
code = code.replace(
    '["Tư duy phản biện Gemini AI", "Chỉ rõ được các điểm yếu và ảo giác của Gemini AI; trả lời sắc sảo 5 câu hỏi chất vấn khó của Sponsor; bài học phản tư sâu sắc, thực tế.", "1,5"],',
    '["Tư duy phản biện Gemini AI gói Pro", "Chỉ rõ được các điểm yếu và ảo giác của Gemini AI gói Pro; trả lời sắc sảo 5 câu hỏi chất vấn khó của Sponsor; bài học phản tư sâu sắc, thực tế.", "1,5"],'
)
code = code.replace(
    '["Nhật ký Gemini AI & Trình bày", "Ghi chép đầy đủ nhật ký prompt tương tác với Gemini AI qua từng bài; văn bản định dạng chuẩn mực, đồng nhất font chữ, bảng biểu chuyên nghiệp, nộp đúng hạn.", "0,5"],',
    '["Nhật ký Gemini AI gói Pro & Trình bày", "Ghi chép đầy đủ nhật ký prompt tương tác với Gemini AI gói Pro qua từng bài; văn bản định dạng chuẩn mực, đồng nhất font chữ, bảng biểu chuyên nghiệp, nộp đúng hạn.", "0,5"],'
)
code = code.replace(
    '[["TỔNG ĐIỂM", True], ["ĐÁNH GIÁ TOÀN DIỆN NĂNG LỰC QUẢN TRỊ DỰ ÁN VỚI TRỢ LÝ GEMINI AI", True], [["10,0", True]]]',
    '[["TỔNG ĐIỂM", True], ["ĐÁNH GIÁ TOÀN DIỆN NĂNG LỰC QUẢN TRỊ DỰ ÁN VỚI TRỢ LÝ GEMINI AI (GÓI PRO)", True], [["10,0", True]]]'
)

# Section 13: Quy định
code = code.replace(
    'add_h1("13. Quy định sử dụng Gemini AI có trách nhiệm")',
    'add_h1("13. Quy định sử dụng Gemini AI (Gói Pro) có trách nhiệm")'
)
code = code.replace(
    'add_bullet("Gemini AI đóng vai trò là trợ lý ảo hỗ trợ phương pháp luận; toàn thể thành viên trong nhóm chịu trách nhiệm cuối cùng và tuyệt đối cho mọi con số, mã nguồn và nội dung báo cáo nộp.")',
    'add_bullet("Gemini AI gói Pro đóng vai trò là trợ lý ảo hỗ trợ phương pháp luận; toàn thể thành viên trong nhóm chịu trách nhiệm cuối cùng và tuyệt đối cho mọi con số, mã nguồn và nội dung báo cáo nộp.")'
)
code = code.replace(
    'add_bullet("Nghiêm cấm hành vi sao chép nguyên văn đầu ra của Gemini AI mà không qua kiểm tra, đối chiếu kỹ thuật. Bài nộp vi phạm sẽ bị trừ tối thiểu 50% điểm số của tiêu chí tương ứng.")',
    'add_bullet("Nghiêm cấm hành vi sao chép nguyên văn đầu ra của Gemini AI gói Pro mà không qua kiểm tra, đối chiếu kỹ thuật. Bài nộp vi phạm sẽ bị trừ tối thiểu 50% điểm số của tiêu chí tương ứng.")'
)
code = code.replace(
    'add_bullet("Tuyệt đối không đưa thông tin định danh cá nhân thật (PII), thông tin mật của tổ chức, khóa bí mật API hoặc dữ liệu CV chưa được cấp quyền vào bất kỳ giao diện Gemini AI công cộng nào.")',
    'add_bullet("Tuyệt đối không đưa thông tin định danh cá nhân thật (PII), thông tin mật của tổ chức, khóa bí mật API hoặc dữ liệu CV chưa được cấp quyền vào bất kỳ giao diện Gemini AI gói Pro nào.")'
)
code = code.replace(
    'add_bullet("Phải ghi chép minh bạch và trung thực các câu lệnh prompt trong nhật ký sử dụng Gemini AI, phân định rõ phần nào do Gemini AI gợi ý và phần nào do nhóm tự phân tích, điều chỉnh.")',
    'add_bullet("Phải ghi chép minh bạch và trung thực các câu lệnh prompt trong nhật ký sử dụng Gemini AI gói Pro, phân định rõ phần nào do Gemini AI gợi ý và phần nào do nhóm tự phân tích, điều chỉnh.")'
)

# Phụ lục A
code = code.replace(
    'add_p("Tài liệu kỹ thuật baseline v1.1 được chuẩn hóa để sinh viên đưa vào Knowledge của Gemini AI:")',
    'add_p("Tài liệu kỹ thuật baseline v1.1 được chuẩn hóa để sinh viên đưa vào Knowledge của Gemini AI gói Pro:")'
)

# Phụ lục C & D
code = code.replace(
    'add_h1("Phụ lục C – Nhật ký sử dụng Gemini AI (Prompt Log)")',
    'add_h1("Phụ lục C – Nhật ký sử dụng Gemini AI (Gói Pro) (Prompt Log)")'
)
code = code.replace(
    'headers_log = ["STT", "Bài thực hành", "Prompt đã dùng (tóm tắt)", "Gemini AI trả lời tốt ở điểm nào", "Nhóm đã sửa / bổ sung gì"]',
    'headers_log = ["STT", "Bài thực hành", "Prompt đã dùng (tóm tắt)", "Gemini AI gói Pro trả lời tốt ở điểm nào", "Nhóm đã sửa / bổ sung gì"]'
)
code = code.replace(
    '["4", "Bài 3 (Lịch PERT)", "Ước lượng PERT 15 hoạt động chính, tính ES/EF/LS/LF, tìm đường găng và độ lệch chuẩn.", "Gợi ý trình tự phụ thuộc giữa các công việc khá logic.", "Gemini AI tính sai phép cộng Slack; nhóm đã lập bảng tính Excel kiểm tra lại toàn bộ số học."],',
    '["4", "Bài 3 (Lịch PERT)", "Ước lượng PERT 15 hoạt động chính, tính ES/EF/LS/LF, tìm đường găng và độ lệch chuẩn.", "Gợi ý trình tự phụ thuộc giữa các công việc khá logic.", "Gemini AI gói Pro tính sai phép cộng Slack; nhóm đã lập bảng tính Excel kiểm tra lại toàn bộ số học."],'
)
code = code.replace(
    '["6", "Bài 5 (Phản biện)", "Đóng vai Sponsor khó tính chất vấn 5 câu hỏi hóc búa về tiến độ, chi phí, đạo đức AI và bảo mật.", "Đặt câu hỏi chất vấn rất sắc sảo, đánh đúng vào các điểm nhạy cảm của đồ án.", "Nhóm tự nghiên cứu và viết 100% câu trả lời giải trình, không nhờ Gemini AI trả lời hộ."]',
    '["6", "Bài 5 (Phản biện)", "Đóng vai Sponsor khó tính chất vấn 5 câu hỏi hóc búa về tiến độ, chi phí, đạo đức AI và bảo mật.", "Đặt câu hỏi chất vấn rất sắc sảo, đánh đúng vào các điểm nhạy cảm của đồ án.", "Nhóm tự nghiên cứu và viết 100% câu trả lời giải trình, không nhờ Gemini AI gói Pro trả lời hộ."]'
)
code = code.replace(
    'add_h1("Phụ lục D – Gợi ý prompt nâng cao cho SmartRecruit với Gemini AI")',
    'add_h1("Phụ lục D – Gợi ý prompt nâng cao cho SmartRecruit với Gemini AI gói Pro")'
)

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Applied Gemini Pro upgrade successfully.")
