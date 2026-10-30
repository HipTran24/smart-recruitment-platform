import sys

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "pareto_qa = ["
end_marker = "for q_title, q_ans in pareto_qa:"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f"Could not find markers: start={start_idx}, end={end_idx}")
    sys.exit(1)

new_qa_code = '''pareto_qa = [
    ("Câu 1: Hai nhóm lỗi nhiều nhất là gì và chiếm bao nhiêu phần trăm tổng số báo cáo?",
     "Trả lời: Dựa trên bảng số liệu đã sắp xếp giảm dần, hai nhóm lỗi xuất hiện nhiều nhất trong hệ thống SmartRecruit cuối Sprint 4 là:\\n"
     "1. L01 – Lỗi trích xuất và phân tích JSON từ Gemini AI trả về sai schema hoặc rỗng: 28 báo cáo (chiếm 28.0%).\\n"
     "2. L02 – Lỗi vòng lặp xác thực phiên và mất đồng bộ token trên React 19 / TanStack Query: 22 báo cáo (chiếm 22.0%).\\n"
     "-> Tổng cộng hai nhóm lỗi này chiếm tới 50/100 báo cáo, tương đương đúng 50.0% tổng số lượng lỗi của toàn bộ hệ thống."),

    ("Câu 2: Cần chọn tối thiểu bao nhiêu nhóm lỗi đầu tiên để lũy kế đạt ít nhất 80%? Liệt kê mã lỗi và tỷ lệ lũy kế tại điểm đó.",
     "Trả lời: Cần chọn tối thiểu 4 nhóm lỗi đầu tiên để tỷ lệ tích lũy đạt ngưỡng tối thiểu 80%. Danh sách các mã lỗi và tỷ lệ lũy kế tương ứng bao gồm:\\n"
     "- Nhóm 1 (L01): 28 báo cáo -> Tỷ lệ: 28.0% | Tích lũy: 28.0%\\n"
     "- Nhóm 2 (L02): 22 báo cáo -> Tỷ lệ: 22.0% | Tích lũy: 50.0%\\n"
     "- Nhóm 3 (L03 - Lỗi upload CV PDF/DOCX dung lượng lớn bị timeout S3): 16 báo cáo -> Tỷ lệ: 16.0% | Tích lũy: 66.0%\\n"
     "- Nhóm 4 (L04 - Lỗi tính toán sai điểm đối chiếu kỹ năng do thiếu synonym): 14 báo cáo -> Tỷ lệ: 14.0% | Tích lũy: 80.0%\\n"
     "-> Tỷ lệ lũy kế tại điểm chọn 4 nhóm lỗi đầu tiên đạt chính xác 80.0% tổng số lỗi phát sinh."),

    ("Câu 3: Dữ liệu này có đúng 20% nhóm lỗi tạo ra 80% số báo cáo không? Tính tỷ lệ số nhóm được chọn trên tổng số nhóm và giải thích.",
     "Trả lời: Dữ liệu thực tế của SmartRecruit KHÔNG tuân theo tỷ lệ toán học cứng nhắc 20–80:\\n"
     "- Tỷ lệ số nhóm lỗi được chọn: 4 nhóm được chọn trên tổng số 8 nhóm lỗi = 4 / 8 = 50.0% (không phải 20%).\\n"
     "- Giải thích bản chất quản trị: Trong kỹ nghệ phần mềm và quản lý chất lượng (PMBOK Quality Management), nguyên lý Pareto không phải là một định luật toán học bất biến mà là một nguyên tắc chỉ dẫn thực nghiệm (Heuristic Rule) về 'Số ít cốt yếu và Số nhiều thứ yếu' (Vital Few vs. Trivial Many). Việc chỉ cần xử lý 4 nhóm lỗi (chiếm một nửa danh mục) đã giúp triệt tiêu tới 80% khối lượng sự cố cho thấy nguồn lực sửa lỗi trong Sprint 5 vẫn mang lại hiệu suất hoàn vốn (ROI) cực kỳ cao."),

    ("Câu 4: L05 có ít báo cáo (chỉ 3 báo cáo). Có nên trì hoãn xử lý vì nằm cuối biểu đồ không? Giải thích dựa trên tác động.",
     "Trả lời: TUYỆT ĐỐI KHÔNG ĐƯỢC TRÌ HOÃN XỬ LÝ L05!\\n"
     "- Giải thích căn cứ quản trị chất lượng: Biểu đồ Pareto chỉ phản ánh khía cạnh Tần suất xuất hiện (Frequency), trong khi việc ra quyết định xử lý sự cố trong kỹ nghệ phần mềm bắt buộc phải dựa trên Ma trận rủi ro: Mức độ ưu tiên = Tần suất (Probability) × Mức độ nghiêm trọng (Severity / Impact).\\n"
     "- Đánh giá tác động của L05: L05 là lỗi rò rỉ phân quyền truy cập hồ sơ ứng viên (IDOR - Insecure Direct Object Reference), cho phép người dùng xem trộm CV của ứng viên khác. Đây là lỗi bảo mật cấp độ Critical (Blocker), vi phạm nghiêm trọng nguyên tắc Least Privilege, phá vỡ cam kết bảo vệ dữ liệu định danh cá nhân (PII) và có thể dẫn tới hậu quả pháp lý nghiêm trọng ngay cả khi chỉ xảy ra một lần duy nhất. Do đó, L05 bắt buộc phải được xếp độ ưu tiên cao nhất (P0 - Blocker) để khắc phục ngay tại đầu Sprint 5 song song với các lỗi có tần suất cao."),

    ("Câu 5: 'Lỗi trích xuất và phân tích JSON từ Gemini AI trả về sai schema hoặc rỗng (L01)' đã phải nguyên nhân gốc chưa? Nêu ít nhất hai loại bằng chứng cần thu thập để điều tra.",
     "Trả lời: L01 ('Gemini trả về sai schema hoặc rỗng') CHƯA PHẢI LÀ NGUYÊN NHÂN GỐC (Root Cause). Đây chỉ là hiện tượng/triệu chứng bề mặt (Symptom). Nguyên nhân gốc thực sự có thể nằm ở các khâu:\\n"
     "1. Parser PDFBox trích xuất văn bản từ CV dạng PDF bị lỗi font encoding khiến chuỗi text gửi vào AI bị rác hoặc mất chữ.\\n"
     "2. Prompt v1 chưa thiết lập chế độ Strict JSON Mode hoặc văn bản CV quá dài vượt ngưỡng token dẫn tới response bị cắt ngang.\\n"
     "3. Phía Gemini 2.5 Flash đôi khi bọc output trong markdown code blocks khiến bộ deserialize Jackson của Spring Boot bị vấp ngoại lệ JsonParseException.\\n"
     "Hai loại bằng chứng cụ thể cần thu thập để điều tra nguyên nhân gốc:\\n"
     "- Bằng chứng 1 (Raw Network & AI Payload Dump): Trích xuất toàn bộ chuỗi JSON raw request và raw response trao đổi giữa Spring Boot và Gemini API thông qua correlation ID / traceId được ghi nhận trên CloudWatch Logs.\\n"
     "- Bằng chứng 2 (Extracted Plaintext Artifact): Lưu lại file text trung gian sau khi qua thư viện Apache PDFBox để đối chiếu xem văn bản đầu vào gửi cho AI có giữ nguyên vẹn nội dung các phần Skills và Experience hay không."),

    ("Câu 6: Hoàn thành kế hoạch 3 công việc cải thiện chất lượng cho Sprint 5 ở mục 6 tiếp theo.",
     "Trả lời: Nhóm đã xây dựng hoàn chỉnh Kế hoạch hành động 3 công việc ưu tiên cho Sprint 5 kết hợp cả yếu tố tần suất Pareto và mức độ nghiêm trọng bảo mật, chi tiết được trình bày tại Mục 6 dưới đây.")
]

'''

new_content = content[:start_idx] + new_qa_code + content[end_idx:]

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully patched generate_full_qlda_work.py")
