with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r', encoding='utf-8') as f:
    code = f.read()

pareto_code = '''
# ==================== PHẦN G: BÀI THỰC HÀNH PHÂN TÍCH PARETO TRONG QUẢN LÝ CHẤT LƯỢNG ====================
print("Writing Section: Bài thực hành Phân tích Pareto Quản lý chất lượng...")
add_h1("Phần G – Bài thực hành Phân tích Pareto trong Quản lý chất lượng dự án phần mềm")
add_p("HỌC PHẦN: QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN  |  Thời gian: 30 phút  |  Đơn vị: [Nhóm 03] (5 sinh viên)", bold=True, color="595959", space_after=3)
add_p("Lớp: Chuyên ngành Kỹ thuật Phần mềm – Khóa 2023  |  Nhóm: [Nhóm 03]  |  Ngày thực hiện: 05/10/2026 (Cuối Sprint 4)", italic=True, font_size=10, space_after=6)

# 1. Tình huống và nhiệm vụ
add_h2("1. Tình huống và nhiệm vụ thực hành")
add_p("Nhóm sinh viên [Nhóm 03] đang tiến hành phát triển Nền tảng tuyển dụng thông minh SmartRecruit theo mô hình Agile/Scrum gồm 08 Sprint liên tục (08/09/2026 – 02/11/2026). Vào cuối Sprint 4 (Giai đoạn hoàn thiện phân hệ Tiếp nhận hồ sơ CV và Tích hợp Gemini AI trích xuất), bộ phận Kiểm thử (QA Tester) đã tiến hành kiểm thử hồi quy toàn diện và ghi nhận được 100 báo cáo sự cố (Defect Reports) thực tế phát sinh từ các tầng công nghệ Java 21, Spring Boot 3.5, React 19, CSDL MySQL 8.4 và dịch vụ Google Gemini API.")
add_p("Mục tiêu bài thực hành: Nhóm sử dụng công cụ phân tích biểu đồ Pareto trên Microsoft Excel để tính toán tỷ lệ phần trăm và tỷ lệ lũy kế, vẽ biểu đồ Pareto kết hợp (Combo Chart), nhận diện nhóm lỗi trọng yếu (“Vital Few”) chiếm 80% sự cố hệ thống, đồng thời kết hợp đánh giá mức độ nghiêm trọng (Severity) để xây dựng Kế hoạch cải thiện chất lượng gồm 3 công việc ưu tiên giải quyết dứt điểm trong Sprint 5.")

# 2. Dữ liệu thực hành
add_h2("2. Dữ liệu thực hành lỗi hệ thống SmartRecruit (Cuối Sprint 4)")
add_p("Dữ liệu dưới đây được tổng hợp từ nhật ký defect tracking thực tế của dự án SmartRecruit cuối Sprint 4, đã loại bỏ các báo cáo trùng lặp (duplicate) và phân loại chính xác vào 8 nhóm lỗi công nghệ điển hình. Đơn vị đo là số lượng báo cáo lỗi (Defect Count):")

col_w_pareto_data = [1200, 6960, 1200]
headers_pareto_data = ["Mã lỗi", "Nhóm lỗi công nghệ thực tế (SmartRecruit MVP)", "Số báo cáo"]
data_pareto_data = [
    ["L01", "Lỗi trích xuất & phân tích JSON từ Gemini AI trả về sai schema hoặc rỗng (AI / Backend)", "28"],
    ["L02", "Lỗi vòng lặp xác thực phiên & mất đồng bộ token trên React 19 / TanStack Query (Frontend / Auth)", "22"],
    ["L03", "Lỗi tải lên CV định dạng PDF/DOCX dung lượng lớn bị timeout / ngắt kết nối S3 (Frontend / Storage)", "16"],
    ["L04", "Lỗi tính toán sai điểm đối chiếu kỹ năng (Match Scoring) do không chuẩn hóa synonym (Backend / DB)", "14"],
    ["L06", "Lỗi Virtual Threads Java 21 bị ghim (Thread Pinning) khi gọi thư viện I/O đồng bộ (Java 21 / Backend)", "8"],
    ["L07", "Lỗi Flyway migration không tương thích cú pháp và collation trên MySQL 8.4 LTS (Database / Migration)", "5"],
    ["L08", "Lỗi vỡ layout mobile và không nhận biến CSS theme Tailwind 4 trên React 19 (Frontend / CSS)", "4"],
    ["L05", "Lỗi rò rỉ phân quyền IDOR: Người dùng xem được hồ sơ CV của ứng viên khác (Security / RBAC)", "3"],
    [["TỔNG", True], ["TỔNG SỐ LƯỢNG BÁO CÁO LỖI GHI NHẬN CUỐI SPRINT 4", True], [["100", True]]]
]
add_table_data(col_w_pareto_data, headers_pareto_data, data_pareto_data, alignments=['C', 'L', 'C'])

callout_pareto_note = [
    "Thông tin bổ sung đặc biệt quan trọng: Lỗi L05 đã được đội ngũ Security xác nhận là lỗi phân quyền IDOR (Insecure Direct Object Reference) cực kỳ nghiêm trọng (Critical Vulnerability), vi phạm nguyên tắc Least Privilege và luật bảo vệ dữ liệu cá nhân. Nhóm bắt buộc phải cân nhắc mức độ tác động nghiêm trọng này khi đề xuất thứ tự xử lý, tuyệt đối không được trì hoãn chỉ vì số lượng báo cáo xuất hiện ít."
]
add_callout("Thông tin bổ sung về lỗi an toàn bảo mật L05", callout_pareto_note)

# 3. Phân công và quản lý thời gian
add_h2("3. Phân công vai trò và quản lý thời gian thực hành (30 phút)")
col_w_assign = [2000, 3600, 3760]
headers_assign = ["Thành viên", "Họ tên / Vai trò", "Nhiệm vụ phân công trong bài thực hành"]
data_assign = [
    ["SV1", "Trần Thanh Hiệp (MSSV: 2380600636) – PM / Tech Lead", "Điều phối nhóm, tổng hợp quyết định ưu tiên và phân tích phản biện"],
    ["SV2", "Thành viên 2 – BA / PO", "Thu thập dữ liệu lỗi, nhập liệu bảng tính Excel và kiểm tra tính toàn vẹn"],
    ["SV3", "Thành viên 3 – Frontend Engineer", "Thiết lập biểu đồ kết hợp Combo Chart (Pareto) trên Microsoft Excel"],
    ["SV4", "Thành viên 4 – QA Tester", "Kiểm tra công thức tỷ lệ lũy kế, xác minh ngưỡng 80% và phân tích 80/20"],
    ["SV5", "Thành viên 5 – Backend Architect", "Soạn thảo kế hoạch hành động 3 công việc cải thiện chất lượng Sprint 5"]
]
add_table_data(col_w_assign, headers_assign, data_assign, alignments=['C', 'L', 'L'])

col_w_time = [2400, 6960]
headers_time = ["Khung thời gian", "Hoạt động thực hiện cụ thể"]
data_time = [
    ["0 – 3 phút", "Đọc đề bài, phân tích bối cảnh lỗi SmartRecruit và phân công trách nhiệm thành viên"],
    ["3 – 10 phút", "Nhập bảng dữ liệu lỗi vào Excel, sắp xếp giảm dần và thiết lập công thức tính tỷ lệ, lũy kế"],
    ["10 – 18 phút", "Tạo biểu đồ kết hợp Pareto Combo Chart (cột số lượng, đường lũy kế và đường ngưỡng 80%)"],
    ["18 – 25 phút", "Thảo luận nhóm, trả lời 6 câu hỏi phân tích chất lượng và đề xuất 3 công việc Sprint 5"],
    ["25 – 30 phút", "Kiểm tra chéo kết quả, rà soát điều kiện nghiệm thu và hoàn thiện báo cáo nộp bài"]
]
add_table_data(col_w_time, headers_time, data_time, alignments=['C', 'L'])

# 4. Hướng dẫn thực hiện trên Excel
add_h2("4. Hướng dẫn thực hiện phân tích Pareto trên Excel")
add_p("Bước 1: Tạo sheet có tên Phan_tich trên Excel với 5 cột: Cột A (Mã & Nhóm lỗi); Cột B (Số báo cáo); Cột C (Tỷ lệ %); Cột D (Tỷ lệ lũy kế %); Cột E (Ngưỡng 80%). Nhập dữ liệu 8 nhóm lỗi từ hàng 2 đến hàng 9. Tiến hành sắp xếp toàn bộ bảng dữ liệu theo Cột B giảm dần (từ 28 đến 3); không sắp xếp riêng lẻ từng cột để tránh sai lệch dữ liệu.")
add_p("Bước 2: Nhập các công thức toán học chuẩn xác tại hàng 2 rồi sao chép (drag fill) công thức xuống đến hàng 9. Định dạng các cột C, D, E ở định dạng hiển thị Phần trăm (Percentage, 1 chữ số thập phân):")

col_w_formula = [1800, 4200, 3360]
headers_formula = ["Ô tính", "Công thức Excel chuẩn", "Giải thích ý nghĩa nghiệp vụ"]
data_formula = [
    ["C2", "=B2/SUM($B$2:$B$9)", "Tính tỷ lệ phần trăm số báo cáo của nhóm lỗi trên tổng số lỗi"],
    ["D2", "=SUM($B$2:B2)/SUM($B$2:$B$9)", "Tính tỷ lệ phần trăm tích lũy (lũy kế) từ nhóm lỗi đầu đến nhóm hiện tại"],
    ["E2", "=80%", "Thiết lập đường tham chiếu ngưỡng chuẩn Pareto 80% (ngưỡng phân định Vital Few)"]
]
add_table_data(col_w_formula, headers_formula, data_formula, alignments=['C', 'L', 'L'])

add_p("Bước 3: Chọn các vùng dữ liệu A, B, D, E để tạo biểu đồ kết hợp (Combo Chart): Thiết lập cột Số báo cáo (B) là biểu đồ Cột (Clustered Column) trên trục tung chính (trái, từ 0 đến 30); thiết lập Tỷ lệ lũy kế (D) và Ngưỡng 80% (E) là biểu đồ Đường (Line with Markers) trên trục tung phụ (phải, định dạng hiển thị từ 0% đến 100%).")
add_p("Bước 4: Đặt tên biểu đồ: “Biểu đồ Pareto phân tích lỗi hệ thống SmartRecruit cuối Sprint 4”. Kiểm tra đối soát: Tổng số báo cáo lỗi = 100, tổng tỷ lệ phần trăm = 100.0% và giá trị lũy kế ở dòng cuối cùng = 100.0%.")

# 5. Phiếu trả lời của nhóm
add_h2("5. Phiếu trả lời câu hỏi phân tích của nhóm [Nhóm 03]")
add_p("Dưới đây là phần phân tích chuyên sâu, lập luận chặt chẽ của nhóm dựa trên số liệu thực tế của dự án SmartRecruit:")

pareto_qa = [
    ("Câu 1: Hai nhóm lỗi nhiều nhất là gì và chiếm bao nhiêu phần trăm tổng số báo cáo?",
     "Trả lời: Dựa trên bảng số liệu đã sắp xếp giảm dần, hai nhóm lỗi xuất hiện nhiều nhất trong hệ thống SmartRecruit cuối Sprint 4 là:\n"
     "1. L01 – Lỗi trích xuất và phân tích JSON từ Gemini AI trả về sai schema hoặc rỗng: 28 báo cáo (chiếm 28.0%).\n"
     "2. L02 – Lỗi vòng lặp xác thực phiên và mất đồng bộ token trên React 19 / TanStack Query: 22 báo cáo (chiếm 22.0%).\n"
     "-> Tổng cộng hai nhóm lỗi này chiếm tới 50/100 báo cáo, tương đương đúng 50.0% tổng số lượng lỗi của toàn bộ hệ thống."),

    ("Câu 2: Cần chọn tối thiểu bao nhiêu nhóm lỗi đầu tiên để lũy kế đạt ít nhất 80%? Liệt kê mã lỗi và tỷ lệ lũy kế tại điểm đó.",
     "Trả lời: Cần chọn tối thiểu 4 nhóm lỗi đầu tiên để tỷ lệ tích lũy đạt ngưỡng tối thiểu 80%. Danh sách các mã lỗi và tỷ lệ lũy kế tương ứng bao gồm:\n"
     "- Nhóm 1 (L01): 28 báo cáo -> Tỷ lệ: 28.0% | Tích lũy: 28.0%\n"
     "- Nhóm 2 (L02): 22 báo cáo -> Tỷ lệ: 22.0% | Tích lũy: 50.0%\n"
     "- Nhóm 3 (L03 - Lỗi upload CV PDF/DOCX dung lượng lớn bị timeout S3): 16 báo cáo -> Tỷ lệ: 16.0% | Tích lũy: 66.0%\n"
     "- Nhóm 4 (L04 - Lỗi tính toán sai điểm đối chiếu kỹ năng do thiếu synonym): 14 báo cáo -> Tỷ lệ: 14.0% | Tích lũy: 80.0%\n"
     "-> Tỷ lệ lũy kế tại điểm chọn 4 nhóm lỗi đầu tiên đạt chính xác 80.0% tổng số lỗi phát sinh."),

    ("Câu 3: Dữ liệu này có đúng 20% nhóm lỗi tạo ra 80% số báo cáo không? Tính tỷ lệ số nhóm được chọn trên tổng số nhóm và giải thích.",
     "Trả lời: Dữ liệu thực tế của SmartRecruit KHÔNG tuân theo tỷ lệ toán học cứng nhắc 20–80:\n"
     "- Tỷ lệ số nhóm lỗi được chọn: 4 nhóm được chọn trên tổng số 8 nhóm lỗi = 4 / 8 = 50.0% (không phải 20%).\n"
     "- Giải thích bản chất quản trị: Trong kỹ nghệ phần mềm và quản lý chất lượng (PMBOK Quality Management), nguyên lý Pareto không phải là một định luật toán học bất biến mà là một nguyên tắc chỉ dẫn thực nghiệm (Heuristic Rule) về 'Số ít cốt yếu và Số nhiều thứ yếu' (Vital Few vs. Trivial Many). Việc chỉ cần xử lý 4 nhóm lỗi (chiếm một nửa danh mục) đã giúp triệt tiêu tới 80% khối lượng sự cố cho thấy nguồn lực sửa lỗi trong Sprint 5 vẫn mang lại hiệu suất hoàn vốn (ROI) cực kỳ cao."),

    ("Câu 4: L05 có ít báo cáo (chỉ 3 báo cáo). Có nên trì hoãn xử lý vì nằm cuối biểu đồ không? Giải thích dựa trên tác động.",
     "Trả lời: TUYỆT ĐỐI KHÔNG ĐƯỢC TRÌ HOÃN XỬ LÝ L05!\n"
     "- Giải thích căn cứ quản trị chất lượng: Biểu đồ Pareto chỉ phản ánh khía cạnh Tần suất xuất hiện (Frequency), trong khi việc ra quyết định xử lý sự cố trong kỹ nghệ phần mềm bắt buộc phải dựa trên Ma trận rủi ro: Mức độ ưu tiên = Tần suất (Probability) × Mức độ nghiêm trọng (Severity / Impact).\n"
     "- Đánh giá tác động của L05: L05 là lỗi rò rỉ phân quyền truy cập hồ sơ ứng viên (IDOR - Insecure Direct Object Reference), cho phép người dùng xem trộm CV của ứng viên khác. Đây là lỗi bảo mật cấp độ Critical (Blocker), vi phạm nghiêm trọng nguyên tắc Least Privilege, phá vỡ cam kết bảo vệ dữ liệu định danh cá nhân (PII) và có thể dẫn tới hậu quả pháp lý nghiêm trọng ngay cả khi chỉ xảy ra một lần duy nhất. Do đó, L05 bắt buộc phải được xếp độ ưu tiên cao nhất (P0 - Blocker) để khắc phục ngay tại đầu Sprint 5 song song với các lỗi có tần suất cao."),

    ("Câu 5: 'Lỗi trích xuất và phân tích JSON từ Gemini AI trả về sai schema hoặc rỗng (L01)' đã phải nguyên nhân gốc chưa? Nêu ít nhất hai loại bằng chứng cần thu thập để điều tra.",
     "Trả lời: L01 ('Gemini trả về sai schema hoặc rỗng') CHƯA PHẢI LÀ NGUYÊN NHÂN GỐC (Root Cause). Đây chỉ là hiện tượng/triệu chứng bề mặt (Symptom). Nguyên nhân gốc thực sự có thể nằm ở các khâu:\n"
     "1. Parser PDFBox trích xuất văn bản từ CV dạng PDF bị lỗi font encoding khiến chuỗi text gửi vào AI bị rác hoặc mất chữ.\n"
     "2. Prompt v1 chưa thiết lập chế độ Strict JSON Mode hoặc văn bản CV quá dài vượt ngưỡng token dẫn tới response bị cắt ngang.\n"
     "3. Phía Gemini 2.5 Flash đôi khi bọc output trong markdown code blocks (```json ... ```) khiến bộ deserialize Jackson của Spring Boot bị vấp ngoại lệ JsonParseException.\n"
     "Hai loại bằng chứng cụ thể cần thu thập để điều tra nguyên nhân gốc:\n"
     "- Bằng chứng 1 (Raw Network & AI Payload Dump): Trích xuất toàn bộ chuỗi JSON raw request và raw response trao đổi giữa Spring Boot và Gemini API thông qua correlation ID / traceId được ghi nhận trên CloudWatch Logs.\n"
     "- Bằng chứng 2 (Extracted Plaintext Artifact): Lưu lại file text trung gian sau khi qua thư viện Apache PDFBox để đối chiếu xem văn bản đầu vào gửi cho AI có giữ nguyên vẹn nội dung các phần Skills và Experience hay không."),

    ("Câu 6: Hoàn thành kế hoạch 3 công việc cải thiện chất lượng cho Sprint 5 ở mục 6 tiếp theo.",
     "Trả lời: Nhóm đã xây dựng hoàn chỉnh Kế hoạch hành động 3 công việc ưu tiên cho Sprint 5 kết hợp cả yếu tố tần suất Pareto và mức độ nghiêm trọng bảo mật, chi tiết được trình bày tại Mục 6 dưới đây.")
]

for q_title, q_ans in pareto_qa:
    add_p(q_title, bold=True, color="1F4E79")
    for ans_line in q_ans.split('\\n'):
        if ans_line.strip():
            add_p(ans_line.strip(), space_after=3)
    add_p("", space_after=3)

# 6. Kế hoạch cải thiện chất lượng cho Sprint 5
add_h2("6. Kế hoạch cải thiện chất lượng cho Sprint 5 (Quality Improvement Plan)")
add_p("Kế hoạch hành động được nhóm thiết lập dựa trên nguyên tắc cân bằng giữa Tần suất lỗi Pareto (L01, L02) và Tính chất bảo mật sống còn của hệ thống (L05). Mỗi công việc đều có người chủ trì, người kiểm tra độc lập và tiêu chí nghiệm thu định lượng kiểm chứng được:")

col_w_action = [2400, 6960]
headers_action = ["Thuộc tính công việc", "Nội dung kế hoạch chi tiết cho Sprint 5"]

# Action 1: Fix L05
data_action1 = [
    [["Tên công việc & Mã lỗi liên quan", True], ["CÔNG VIỆC 1: Cứng hóa phân quyền xác thực đa tầng và vá lỗ hổng IDOR trên API Hồ sơ ứng tuyển (Khắc phục lỗi L05)", True]],
    ["Lý do ưu tiên xử lý", "Lỗ hổng bảo mật cấp độ Critical (Blocker), đe dọa vi phạm dữ liệu cá nhân PII của ứng viên và vi phạm nguyên tắc Admin/Recruiter Least Privilege. Cần xử lý triệt để ngay đầu Sprint 5 trước khi phát triển các tính năng đánh giá."],
    ["Người chủ trì (Owner)", "Trần Thanh Hiệp (Backend Architect / Tech Lead)"],
    ["Người kiểm tra (Reviewer)", "Thành viên 4 (QA Tester) + Security Reviewer"],
    ["Điều kiện nghiệm thu & Minh chứng kiểm chứng", "- 100% các endpoint /api/v1/applications/{id} và /api/v1/applications/{id}/cv được bảo vệ bởi bộ đánh giá phân quyền máy chủ ApplicationOwnershipEvaluator kết hợp @PreAuthorize.\\n- Candidate chỉ truy cập được đúng application của mình; Recruiter chỉ xem được application thuộc Job mình sở hữu; Admin không thể download raw CV.\\n- Minh chứng kiểm chứng: Bổ sung 15 automated negative authorization tests trong CI pipeline (đều pass 100%) và kết quả quét bảo mật OWASP ZAP không còn cảnh báo IDOR."]
]
add_p("Kế hoạch công việc 1: Khắc phục lỗi bảo mật L05", bold=True, color="1F4E79")
add_table_data(col_w_action, headers_action, data_action1)

# Action 2: Fix L01
data_action2 = [
    [["Tên công việc & Mã lỗi liên quan", True], ["CÔNG VIỆC 2: Cải tiến Adapter Gemini 2.5 Flash, hoàn thiện cơ chế sanitize markdown và Strict Schema Validation (Khắc phục lỗi L01)", True]],
    ["Lý do ưu tiên xử lý", "Nhóm lỗi chiếm tần suất cao nhất (28% tổng số lỗi phát sinh), làm tê liệt luồng xử lý tự động trích xuất CV – tính năng giá trị cốt lõi nhất của Web MVP SmartRecruit."],
    ["Người chủ trì (Owner)", "Thành viên 5 (Backend / AI Integration Engineer)"],
    ["Người kiểm tra (Reviewer)", "Thành viên 2 (BA / PO) + Trần Thanh Hiệp (Tech Lead)"],
    ["Điều kiện nghiệm thu & Minh chứng kiểm chứng", "- Nâng cấp GeminiAdapter: tự động bóc tách các khối markdown code fence (```json ... ```) trước khi chuyển qua bộ parse Jackson.\\n- Cấu hình Jackson ObjectMapper với DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES = false và bắt chặt các trường bắt buộc; nếu thiếu trường cốt lõi, tự động gán cờ needsHumanReview = true thay vì văng Exception.\\n- Minh chứng kiểm chứng: Tỷ lệ trích xuất thành công và parse hợp lệ đạt >= 95% trên bộ dữ liệu kiểm thử chuẩn 20+ CV mẫu, có file log ghi nhận metrics thời gian xử lý và token."]
]
add_p("Kế hoạch công việc 2: Khắc phục lỗi Gemini AI trích xuất L01", bold=True, color="1F4E79")
add_table_data(col_w_action, headers_action, data_action2)

# Action 3: Fix L02
data_action3 = [
    [["Tên công việc & Mã lỗi liên quan", True], ["CÔNG VIỆC 3: Xử lý Race Condition khi Refresh Token và đồng bộ trạng thái Session trên React 19 (Khắc phục lỗi L02)", True]],
    ["Lý do ưu tiên xử lý", "Nhóm lỗi chiếm tần suất cao thứ hai (22% tổng số lỗi), trực tiếp phá hỏng trải nghiệm người dùng, gây văng phiên làm việc và lỗi 401 lặp vô hạn khi Access Token 15 phút hết hạn."],
    ["Người chủ trì (Owner)", "Thành viên 3 (Frontend UI-UX Engineer)"],
    ["Người kiểm tra (Reviewer)", "Trần Thanh Hiệp (Tech Lead / Backend)"],
    ["Điều kiện nghiệm thu & Minh chứng kiểm chứng", "- Triển khai Axios Interceptor với cơ chế hàng đợi Promise (Refresh Token Queue): Khi có nhiều request đồng thời gặp lỗi 401, chỉ 1 request duy nhất gọi endpoint /auth/refresh, các request khác tạm dừng chờ token mới rồi tự động thử lại (retry).\\n- Đồng bộ cache TanStack Query v5 và dọn dẹp sạch sẽ session state khi người dùng thực hiện Logout hoặc bị thu hồi quyền.\\n- Minh chứng kiểm chứng: Kịch bản kiểm thử tự động với Playwright mô phỏng 5 API calls đồng thời khi token hết hạn hoạt động trơn tru; người dùng thao tác liên tục trong 120 phút không bị văng ra trang Login."]
]
add_p("Kế hoạch công việc 3: Khắc phục lỗi vòng lặp xác thực phiên L02", bold=True, color="1F4E79")
add_table_data(col_w_action, headers_action, data_action3)

# 7. Nộp bài và tiêu chí chấm điểm
add_h2("7. Bàn giao sản phẩm và tiêu chí đánh giá bài thực hành Pareto")
add_p("Hồ sơ bàn giao thực hành của nhóm [Nhóm 03] bao gồm file bảng tính Nhom03_Lab_Pareto.xlsx (chứa đầy đủ sheet Phan_tich và sheet Ket_luan) cùng nội dung tích hợp trực tiếp trong báo cáo dự án QLDA_Work.docx, được đánh giá theo thang điểm 10 chuẩn:")

col_w_eval_pareto = [2400, 5760, 1200]
headers_eval_pareto = ["Nội dung đánh giá", "Mô tả chuẩn mực đạt mức Tốt / Xuất sắc", "Điểm"]
data_eval_pareto = [
    ["Dữ liệu & Sắp xếp", "Dữ liệu lỗi chuẩn hóa theo bối cảnh SmartRecruit, sắp xếp giảm dần chính xác, tổng số lượng = 100.", "1,0"],
    ["Công thức toán học Excel", "Thiết lập đúng 100% công thức tính tỷ lệ % và tỷ lệ lũy kế bằng hàm SUM tuyệt đối/tương đối trên Excel.", "2,0"],
    ["Biểu đồ Pareto Combo", "Vẽ đúng biểu đồ kết hợp Combo Chart: cột số lượng trục chính, đường lũy kế và đường ngưỡng 80% trên trục phụ (0-100%).", "2,0"],
    ["Phân tích nguyên lý 80–20", "Nhận diện đúng 4 nhóm lỗi trọng yếu (Vital Few), giải thích sâu sắc bản chất Heuristic của quy tắc 80-20 trong phần mềm.", "2,0"],
    ["Xử lý lỗi nghiêm trọng & Action", "Lập luận xuất sắc việc ưu tiên lỗi bảo mật L05; thiết lập 3 công việc cải thiện có tiêu chí nghiệm thu kiểm chứng được.", "2,0"],
    ["Phân công & Đúng hạn", "Phân công trách nhiệm rõ ràng cho đủ 5 thành viên nhóm, hoàn thành đúng hạn 30 phút, trình bày chuẩn mực.", "1,0"],
    [["TỔNG ĐIỂM", True], ["ĐÁNH GIÁ NĂNG LỰC QUẢN TRỊ CHẤT LƯỢNG DỰ ÁN PHẦN MỀM (PARETO)", True], [["10,0", True]]]
]
add_table_data(col_w_eval_pareto, headers_eval_pareto, data_eval_pareto, alignments=['L', 'L', 'C'])

print("Finished appending Pareto section.")
'''

# Insert pareto_code right before Section 11 (print("Writing Sections 11 to 13 & Phụ lục..."))
target_marker = 'print("Writing Sections 11 to 13 & Phụ lục...")'

if target_marker in code:
    code = code.replace(target_marker, pareto_code + "\n" + target_marker)
    with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Pareto section injected successfully before Section 11.")
else:
    print("Error: Target marker not found in generate_full_qlda_work.py")
