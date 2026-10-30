import re

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Title
code = code.replace(
    'add_p("Lập kế hoạch dự án phần mềm với trợ lý AI – Google Gemini AI"',
    'add_p("Lập kế hoạch dự án phần mềm với trợ lý Google Gemini AI"'
)

# Table 0
code = code.replace(
    'Báo cáo phản biện AI & Nhật ký sử dụng AI',
    'Báo cáo phản biện Gemini AI & Nhật ký sử dụng Gemini AI'
)

# Section 1
code = code.replace(
    'để dùng AI làm trợ lý quản lý dự án cho hệ thống SmartRecruit',
    'để dùng Gemini AI làm trợ lý quản lý dự án cho hệ thống SmartRecruit'
)
code = code.replace(
    '("Đánh giá phản biện", True), (" đầu ra của AI: phát hiện sai lệch số học, ảo giác về ngân sách/phạm vi và chỉnh sửa có căn cứ kỹ thuật vững chắc.")',
    '("Đánh giá phản biện", True), (" đầu ra của Gemini AI: phát hiện sai lệch số học, ảo giác về ngân sách/phạm vi và chỉnh sửa có căn cứ kỹ thuật vững chắc.")'
)

# Section 3
code = code.replace(
    '["Phần F", "Bài 5 – Kiểm tra phản biện đầu ra AI, chất vấn Sponsor, đánh giá chất lượng", "15 phút"],',
    '["Phần F", "Bài 5 – Kiểm tra phản biện đầu ra Gemini AI, chất vấn Sponsor, đánh giá chất lượng", "15 phút"],'
)

# Section 5: Header and Callouts
code = code.replace(
    'add_h1("5. Phần A – Thiết lập môi trường Gemini AI (25 phút)")',
    'add_h1("5. Phần A – Thiết lập môi trường Google Gemini AI (25 phút)")'
)
code = code.replace(
    '"Bạn là trợ lý quản lý dự án phần mềm chuyên nghiệp, có kinh nghiệm sâu sắc theo chuẩn PMBOK (PMI) và Agile/Scrum. Bạn hỗ trợ nhóm sinh viên [Nhóm 03] lập kế hoạch và điều hành dự án Nền tảng tuyển dụng thông minh SmartRecruit.",',
    '"Bạn là trợ lý quản lý dự án phần mềm chuyên nghiệp trên nền tảng Gemini AI, có kinh nghiệm sâu sắc theo chuẩn PMBOK (PMI) và Agile/Scrum. Bạn hỗ trợ nhóm sinh viên [Nhóm 03] lập kế hoạch và điều hành dự án Nền tảng tuyển dụng thông minh SmartRecruit.",'
)
code = code.replace(
    '"Instructions áp dụng cho MỌI cuộc trò chuyện trong Project. Viết càng cụ thể và chặt chẽ, kết quả AI trả về càng chính xác, không bị lan man hay sai lệch ngữ cảnh kỹ thuật của SmartRecruit.",',
    '"System Instructions áp dụng cho MỌI cuộc trò chuyện trong Gemini AI. Viết càng cụ thể và chặt chẽ, kết quả Gemini AI trả về càng chính xác, không bị lan man hay sai lệch ngữ cảnh kỹ thuật của SmartRecruit.",'
)
code = code.replace(
    '"Dòng “Không làm hộ toàn bộ…” giúp AI đóng vai người hướng dẫn và phản biện thay vì làm thay hoàn toàn – đây là tiêu chuẩn đánh giá quan trọng của bài thực hành."',
    '"Dòng “Không làm hộ toàn bộ…” giúp Gemini AI đóng vai người hướng dẫn và phản biện thay vì làm thay hoàn toàn – đây là tiêu chuẩn đánh giá quan trọng của bài thực hành."'
)
code = code.replace(
    'add_bullet("Thư ký nhóm chịu trách nhiệm ghi nhật ký prompt (theo mẫu Phụ lục C) xuyên suốt buổi thực hành.")',
    'add_bullet("Thư ký nhóm chịu trách nhiệm ghi nhật ký prompt (theo mẫu Phụ lục C) xuyên suốt quá trình làm việc với Gemini AI.")'
)

# Section 6: Bài 1
code = code.replace(
    'add_bullet("Đối chiếu phần “ngoài phạm vi” với Phụ lục A – AI có bỏ sót hoặc tự ý thêm các tính năng không có trong tài liệu baseline kỹ thuật không?")',
    'add_bullet("Đối chiếu phần “ngoài phạm vi” với Phụ lục A – Gemini AI có bỏ sót hoặc tự ý thêm các tính năng không có trong tài liệu baseline kỹ thuật không?")'
)
code = code.replace(
    'add_p("Trong quá trình làm việc với trợ lý AI, bản nháp ban đầu do AI sinh ra có một số mục tiêu chung chung như “xây dựng hệ thống tuyển dụng thông minh hiệu quả” và “đảm bảo hệ thống chạy tốt, ít lỗi”. Nhóm đã tiến hành phân tích phản biện và viết lại 2 mục tiêu then chốt để bảo đảm chuẩn SMART (Specific, Measurable, Achievable, Relevant, Time-bound):")',
    'add_p("Trong quá trình làm việc với trợ lý Gemini AI, bản nháp ban đầu do Gemini AI sinh ra có một số mục tiêu chung chung như “xây dựng hệ thống tuyển dụng thông minh hiệu quả” và “đảm bảo hệ thống chạy tốt, ít lỗi”. Nhóm đã tiến hành phân tích phản biện và viết lại 2 mục tiêu then chốt để bảo đảm chuẩn SMART (Specific, Measurable, Achievable, Relevant, Time-bound):")'
)
code = code.replace(
    'add_p("Nhóm đã đối chiếu kỹ lưỡng phần Ngoài phạm vi với tài liệu Project Setup v1.1. AI ban đầu có xu hướng đề xuất thêm các tính năng như “ứng dụng di động đa nền tảng” hoặc “tự động gửi thư từ chối ứng viên nếu điểm dưới 50”. Nhóm đã kiên quyết loại bỏ và xác nhận đây là phạm vi ngoài (Out-of-scope) vì vi phạm nguyên tắc Human-in-the-loop (AI không được tự ý từ chối con người) và vi phạm ràng buộc nguồn lực của đội ngũ sinh viên trong 08 Sprint.")',
    'add_p("Nhóm đã đối chiếu kỹ lưỡng phần Ngoài phạm vi với tài liệu Project Setup v1.1. Gemini AI ban đầu có xu hướng đề xuất thêm các tính năng như “ứng dụng di động đa nền tảng” hoặc “tự động gửi thư từ chối ứng viên nếu điểm dưới 50”. Nhóm đã kiên quyết loại bỏ và xác nhận đây là phạm vi ngoài (Out-of-scope) vì vi phạm nguyên tắc Human-in-the-loop (AI không được tự ý từ chối con người) và vi phạm ràng buộc nguồn lực của đội ngũ sinh viên trong 08 Sprint.")'
)

# Section 7: Bài 2
code = code.replace(
    'add_bullet("Biểu diễn WBS dưới dạng sơ đồ cây phân cấp trực quan – không chỉ dừng lại ở bảng danh sách của AI.")',
    'add_bullet("Biểu diễn WBS dưới dạng sơ đồ cây phân cấp trực quan – không chỉ dừng lại ở bảng danh sách của Gemini AI.")'
)

# Section 8: Bài 3
code = code.replace(
    'add_p("Yêu cầu: Ước lượng thời gian bằng PERT ba điểm (O – M – P), xác định quan hệ phụ thuộc, tính đường găng và kiểm tra lịch có đáp ứng thời hạn 08 Sprint (kết thúc trước 03/11) không.")',
    'add_p("Yêu cầu: Ước lượng thời gian bằng PERT ba điểm (O – M – P) với trợ lý Gemini AI, xác định quan hệ phụ thuộc, tính đường găng và kiểm tra lịch có đáp ứng thời hạn 08 Sprint (kết thúc trước 03/11) không.")'
)
code = code.replace(
    '"Lưu ý cho sinh viên: AI có thể tính sai số học, nhầm lẫn công thức làm tròn hoặc hiểu sai quan hệ phụ thuộc giữa các hoạt động kỹ thuật. Toàn bộ bảng tính toán dưới đây BẮT BUỘC phải được nhóm lập công thức và kiểm tra chéo bằng Microsoft Excel/Google Sheets – đây là tiêu chuẩn chấm điểm bắt buộc."',
    '"Lưu ý cho sinh viên: Gemini AI có thể tính sai số học, nhầm lẫn công thức làm tròn hoặc hiểu sai quan hệ phụ thuộc giữa các hoạt động kỹ thuật. Toàn bộ bảng tính toán dưới đây BẮT BUỘC phải được nhóm lập công thức và kiểm tra chéo bằng Microsoft Excel/Google Sheets – đây là tiêu chuẩn chấm điểm bắt buộc."'
)
code = code.replace(
    'add_bullet("Tính toán độc lập bằng Excel các chỉ số TE, ES, EF, LS, LF, Slack và độ lệch chuẩn sigma; đối chiếu từng dòng với kết quả đề xuất của AI để phát hiện sai lệch.")',
    'add_bullet("Tính toán độc lập bằng Excel các chỉ số TE, ES, EF, LS, LF, Slack và độ lệch chuẩn sigma; đối chiếu từng dòng với kết quả đề xuất của Gemini AI để phát hiện sai lệch.")'
)

# Section 9: Bài 4
code = code.replace(
    'add_bullet("Bổ sung ít nhất 2 rủi ro kỹ thuật chuyên sâu mà AI thường bỏ sót (liên quan đến upload file độc hại và cơ chế vô hiệu hóa session khi đổi quyền Admin).")',
    'add_bullet("Bổ sung ít nhất 2 rủi ro kỹ thuật chuyên sâu mà Gemini AI thường bỏ sót (liên quan đến upload file độc hại và cơ chế vô hiệu hóa session khi đổi quyền Admin).")'
)
code = code.replace(
    'add_p("Ghi chú: (*) R09 và R10 là 2 rủi ro thực chiến do nhóm tự phân tích và bổ sung dựa trên đặc thù kỹ thuật của SmartRecruit, không phụ thuộc vào gợi ý ban đầu của AI.", italic=True, font_size=10, color="595959")',
    'add_p("Ghi chú: (*) R09 và R10 là 2 rủi ro thực chiến do nhóm tự phân tích và bổ sung dựa trên đặc thù kỹ thuật của SmartRecruit, không phụ thuộc vào gợi ý ban đầu của Gemini AI.", italic=True, font_size=10, color="595959")'
)

# Section 10: Bài 5
code = code.replace(
    'add_h1("10. Phần F – Bài 5: Kiểm tra phản biện đầu ra AI & Quản lý chất lượng dự án (15 phút)")',
    'add_h1("10. Phần F – Bài 5: Kiểm tra phản biện đầu ra Gemini AI & Quản lý chất lượng dự án (15 phút)")'
)
code = code.replace(
    'add_bullet("Sinh viên tự viết toàn bộ câu trả lời giải trình cho 5 câu hỏi chất vấn (tuyệt đối không nhờ AI làm hộ) và ghi vào báo cáo.")',
    'add_bullet("Sinh viên tự viết toàn bộ câu trả lời giải trình cho 5 câu hỏi chất vấn (tuyệt đối không nhờ Gemini AI làm hộ) và ghi vào báo cáo.")'
)
code = code.replace(
    'add_bullet("Thực hiện phần phản tư (Reflection) sâu sắc về vai trò của AI trong quản lý dự án phần mềm.")',
    'add_bullet("Thực hiện phần phản tư (Reflection) sâu sắc về vai trò của Gemini AI trong quản lý dự án phần mềm.")'
)
code = code.replace(
    'add_h3("Phần phản tư về vai trò của AI trong Quản lý dự án phần mềm (Reflection)")',
    'add_h3("Phần phản tư về vai trò của Gemini AI trong Quản lý dự án phần mềm (Reflection)")'
)
code = code.replace(
    'add_bullet([("Những khâu AI giúp nhóm tăng tốc vượt trội: ", True), ("AI phát huy sức mạnh tối đa ở việc tạo khung tài liệu chuẩn (scaffolding templates), gợi ý cấu trúc WBS phân rã ban đầu, chuyển đổi nhanh chóng yêu cầu nghiệp vụ thành User Story có tiêu chí chấp nhận (Given-When-Then), và gợi ý danh mục rủi ro phổ biến trong ngành phần mềm. Nhờ AI, nhóm tiết kiệm được khoảng 50% thời gian soạn thảo sơ bộ.")])',
    'add_bullet([("Những khâu Gemini AI giúp nhóm tăng tốc vượt trội: ", True), ("Gemini AI phát huy sức mạnh tối đa ở việc tạo khung tài liệu chuẩn (scaffolding templates), gợi ý cấu trúc WBS phân rã ban đầu, chuyển đổi nhanh chóng yêu cầu nghiệp vụ thành User Story có tiêu chí chấp nhận (Given-When-Then), và gợi ý danh mục rủi ro phổ biến trong ngành phần mềm. Nhờ Gemini AI, nhóm tiết kiệm được khoảng 50% thời gian soạn thảo sơ bộ.")])'
)
code = code.replace(
    'add_bullet([("Những điểm AI thường sai sót, ngây ngô hoặc thiếu sót: ", True), ("(1) ", False), ("Ảo giác số học và công thức: ", True), ("AI tính toán số học rất dễ sai lệch khi cộng dồn giờ công WBS hoặc tính toán tiến trình xuôi/ngược PERT (cần kiểm tra chéo bằng Excel); (2) ", False), ("Mở rộng phạm vi vô căn cứ: ", True), ("AI thường tự động thêm các tính năng ngoài lề (như mobile app, tích hợp HRIS) mà không quan tâm đến ràng buộc ngân sách 33.052.000 VNĐ; (3) ", False), ("Bỏ quên các ràng buộc an ninh nhạy cảm: ", True), ("AI ban đầu không tự thiết lập cơ chế khóa tự nâng quyền Admin hay xóa token session khi đổi quyền.")])',
    'add_bullet([("Những điểm Gemini AI thường sai sót, ngây ngô hoặc thiếu sót: ", True), ("(1) ", False), ("Ảo giác số học và công thức: ", True), ("Gemini AI tính toán số học rất dễ sai lệch khi cộng dồn giờ công WBS hoặc tính toán tiến trình xuôi/ngược PERT (cần kiểm tra chéo bằng Excel); (2) ", False), ("Mở rộng phạm vi vô căn cứ: ", True), ("Gemini AI thường tự động thêm các tính năng ngoài lề (như mobile app, tích hợp HRIS) mà không quan tâm đến ràng buộc ngân sách 33.052.000 VNĐ; (3) ", False), ("Bỏ quên các ràng buộc an ninh nhạy cảm: ", True), ("Gemini AI ban đầu không tự thiết lập cơ chế khóa tự nâng quyền Admin hay xóa token session khi đổi quyền.")])'
)
code = code.replace(
    'add_bullet([("Những quyết định then chốt KHÔNG ĐƯỢC giao phó cho AI: ", True), ("(1) ", False), ("Quyết định cam kết ngân sách và thời hạn: ", True), ("Chỉ có con người mới hiểu rõ năng lực thật và nguồn vốn thực tế; (2) ", False), ("Đánh giá và đưa ra quyết định tuyển dụng con người: ", True), ("AI chỉ là công cụ tính toán hỗ trợ, con người phải chịu trách nhiệm pháp lý và đạo đức; (3) ", False), ("Phê duyệt kiến trúc và chính sách an toàn thông tin: ", True), ("Việc cấp quyền truy cập, bảo vệ dữ liệu PII và quyết định go/no-go khi phát hành sản phẩm bắt buộc phải do các kỹ sư trưởng và PM phê duyệt.")])',
    'add_bullet([("Những quyết định then chốt KHÔNG ĐƯỢC giao phó cho Gemini AI: ", True), ("(1) ", False), ("Quyết định cam kết ngân sách và thời hạn: ", True), ("Chỉ có con người mới hiểu rõ năng lực thật và nguồn vốn thực tế; (2) ", False), ("Đánh giá và đưa ra quyết định tuyển dụng con người: ", True), ("Gemini AI chỉ là công cụ tính toán hỗ trợ, con người phải chịu trách nhiệm pháp lý và đạo đức; (3) ", False), ("Phê duyệt kiến trúc và chính sách an toàn thông tin: ", True), ("Việc cấp quyền truy cập, bảo vệ dữ liệu PII và quyết định go/no-go khi phát hành sản phẩm bắt buộc phải do các kỹ sư trưởng và PM phê duyệt.")])'
)

# Section 11: Sản phẩm nộp
code = code.replace(
    'add_bullet("Nhật ký sử dụng AI (Prompt Log theo mẫu Phụ lục C) ghi nhận đầy đủ tiến trình tương tác.")',
    'add_bullet("Nhật ký sử dụng Gemini AI (Prompt Log theo mẫu Phụ lục C) ghi nhận đầy đủ tiến trình tương tác.")'
)

# Section 12: Tiêu chí
code = code.replace(
    '["Tư duy phản biện AI", "Chỉ rõ được các điểm yếu và ảo giác của AI; trả lời sắc sảo 5 câu hỏi chất vấn khó của Sponsor; bài học phản tư sâu sắc, thực tế.", "1,5"],',
    '["Tư duy phản biện Gemini AI", "Chỉ rõ được các điểm yếu và ảo giác của Gemini AI; trả lời sắc sảo 5 câu hỏi chất vấn khó của Sponsor; bài học phản tư sâu sắc, thực tế.", "1,5"],'
)
code = code.replace(
    '["Nhật ký AI & Trình bày", "Ghi chép đầy đủ nhật ký prompt qua từng bài; văn bản định dạng chuẩn mực, đồng nhất font chữ, bảng biểu chuyên nghiệp, nộp đúng hạn.", "0,5"],',
    '["Nhật ký Gemini AI & Trình bày", "Ghi chép đầy đủ nhật ký prompt tương tác với Gemini AI qua từng bài; văn bản định dạng chuẩn mực, đồng nhất font chữ, bảng biểu chuyên nghiệp, nộp đúng hạn.", "0,5"],'
)
code = code.replace(
    '[["TỔNG ĐIỂM", True], ["ĐÁNH GIÁ TOÀN DIỆN NĂNG LỰC QUẢN TRỊ DỰ ÁN VỚI TRỢ LÝ AI", True], [["10,0", True]]]',
    '[["TỔNG ĐIỂM", True], ["ĐÁNH GIÁ TOÀN DIỆN NĂNG LỰC QUẢN TRỊ DỰ ÁN VỚI TRỢ LÝ GEMINI AI", True], [["10,0", True]]]'
)

# Section 13: Quy định
code = code.replace(
    'add_h1("13. Quy định sử dụng AI có trách nhiệm")',
    'add_h1("13. Quy định sử dụng Gemini AI có trách nhiệm")'
)
code = code.replace(
    'add_bullet("AI đóng vai trò là trợ lý ảo hỗ trợ phương pháp luận; toàn thể thành viên trong nhóm chịu trách nhiệm cuối cùng và tuyệt đối cho mọi con số, mã nguồn và nội dung báo cáo nộp.")',
    'add_bullet("Gemini AI đóng vai trò là trợ lý ảo hỗ trợ phương pháp luận; toàn thể thành viên trong nhóm chịu trách nhiệm cuối cùng và tuyệt đối cho mọi con số, mã nguồn và nội dung báo cáo nộp.")'
)
code = code.replace(
    'add_bullet("Nghiêm cấm hành vi sao chép nguyên văn đầu ra của AI mà không qua kiểm tra, đối chiếu kỹ thuật. Bài nộp vi phạm sẽ bị trừ tối thiểu 50% điểm số của tiêu chí tương ứng.")',
    'add_bullet("Nghiêm cấm hành vi sao chép nguyên văn đầu ra của Gemini AI mà không qua kiểm tra, đối chiếu kỹ thuật. Bài nộp vi phạm sẽ bị trừ tối thiểu 50% điểm số của tiêu chí tương ứng.")'
)
code = code.replace(
    'add_bullet("Tuyệt đối không đưa thông tin định danh cá nhân thật (PII), thông tin mật của tổ chức, khóa bí mật API hoặc dữ liệu CV chưa được cấp quyền vào bất kỳ công cụ AI công cộng nào.")',
    'add_bullet("Tuyệt đối không đưa thông tin định danh cá nhân thật (PII), thông tin mật của tổ chức, khóa bí mật API hoặc dữ liệu CV chưa được cấp quyền vào bất kỳ giao diện Gemini AI công cộng nào.")'
)
code = code.replace(
    'add_bullet("Phải ghi chép minh bạch và trung thực các câu lệnh prompt trong nhật ký sử dụng AI, phân định rõ phần nào do AI gợi ý và phần nào do nhóm tự phân tích, điều chỉnh.")',
    'add_bullet("Phải ghi chép minh bạch và trung thực các câu lệnh prompt trong nhật ký sử dụng Gemini AI, phân định rõ phần nào do Gemini AI gợi ý và phần nào do nhóm tự phân tích, điều chỉnh.")'
)

# Phụ lục C & D
code = code.replace(
    'add_h1("Phụ lục C – Nhật ký sử dụng AI (Prompt Log)")',
    'add_h1("Phụ lục C – Nhật ký sử dụng Gemini AI (Prompt Log)")'
)
code = code.replace(
    'headers_log = ["STT", "Bài thực hành", "Prompt đã dùng (tóm tắt)", "AI trả lời tốt ở điểm nào", "Nhóm đã sửa / bổ sung gì"]',
    'headers_log = ["STT", "Bài thực hành", "Prompt đã dùng (tóm tắt)", "Gemini AI trả lời tốt ở điểm nào", "Nhóm đã sửa / bổ sung gì"]'
)
code = code.replace(
    '["4", "Bài 3 (Lịch PERT)", "Ước lượng PERT 15 hoạt động chính, tính ES/EF/LS/LF, tìm đường găng và độ lệch chuẩn.", "Gợi ý trình tự phụ thuộc giữa các công việc khá logic.", "AI tính sai phép cộng Slack; nhóm đã lập bảng tính Excel kiểm tra lại toàn bộ số học."],',
    '["4", "Bài 3 (Lịch PERT)", "Ước lượng PERT 15 hoạt động chính, tính ES/EF/LS/LF, tìm đường găng và độ lệch chuẩn.", "Gợi ý trình tự phụ thuộc giữa các công việc khá logic.", "Gemini AI tính sai phép cộng Slack; nhóm đã lập bảng tính Excel kiểm tra lại toàn bộ số học."],'
)
code = code.replace(
    '["6", "Bài 5 (Phản biện)", "Đóng vai Sponsor khó tính chất vấn 5 câu hỏi hóc búa về tiến độ, chi phí, đạo đức AI và bảo mật.", "Đặt câu hỏi chất vấn rất sắc sảo, đánh đúng vào các điểm nhạy cảm của đồ án.", "Nhóm tự nghiên cứu và viết 100% câu trả lời giải trình, không nhờ AI trả lời hộ."]',
    '["6", "Bài 5 (Phản biện)", "Đóng vai Sponsor khó tính chất vấn 5 câu hỏi hóc búa về tiến độ, chi phí, đạo đức AI và bảo mật.", "Đặt câu hỏi chất vấn rất sắc sảo, đánh đúng vào các điểm nhạy cảm của đồ án.", "Nhóm tự nghiên cứu và viết 100% câu trả lời giải trình, không nhờ Gemini AI trả lời hộ."]'
)
code = code.replace(
    'add_h1("Phụ lục D – Gợi ý prompt nâng cao cho SmartRecruit")',
    'add_h1("Phụ lục D – Gợi ý prompt nâng cao cho SmartRecruit với Gemini AI")'
)

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Make all Gemini applied successfully.")
