import sys
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

template_path = '/Users/ProM2/Documents/Lab_QLDA_CNTT_Claude_Projects.docx'
output_path = '/Users/ProM2/Documents/QLDA_Work.docx'

print("Opening template...")
doc = docx.Document(template_path)
body = doc._body._element

# Clear existing children except sectPr
children = list(body)
for c in children[:-1]:
    body.remove(c)

# Set Header
sec = doc.sections[0]
if sec.header.paragraphs:
    sec.header.paragraphs[0].text = "Lab QLDA CNTT – Gemini AI (Gói Pro): SmartRecruit Project"

# Base helper functions
def add_p(text="", style='Normal', align=None, space_before=None, space_after=6, line_spacing=1.2, bold=False, italic=False, color=None, font_size=None):
    p = doc.add_paragraph(style=style)
    pf = p.paragraph_format
    if align is not None:
        pf.alignment = align
    if space_before is not None:
        pf.space_before = Pt(space_before)
    if space_after is not None:
        pf.space_after = Pt(space_after)
    if line_spacing is not None:
        pf.line_spacing = line_spacing
    
    if text:
        run = p.add_run(text)
        if bold: run.bold = True
        if italic: run.italic = True
        if color: run.font.color.rgb = RGBColor.from_string(color)
        if font_size: run.font.size = Pt(font_size)
    return p


def normalize_run_item(item):
    if isinstance(item, str):
        return (item, False, False, None, None)
    txt = item[0]
    b = item[1] if len(item) > 1 else False
    it = item[2] if len(item) > 2 else False
    col = item[3] if len(item) > 3 else None
    sz = item[4] if len(item) > 4 else None
    return (txt, b, it, col, sz)

def add_runs_p(runs, style='Normal', align=None, space_before=None, space_after=6, line_spacing=1.2):
    p = doc.add_paragraph(style=style)
    pf = p.paragraph_format
    if align is not None:
        pf.alignment = align
    if space_before is not None:
        pf.space_before = Pt(space_before)
    if space_after is not None:
        pf.space_after = Pt(space_after)
    if line_spacing is not None:
        pf.line_spacing = line_spacing
    
    for r_item in runs:
        txt, b, it, col, sz = normalize_run_item(r_item)
        run = p.add_run(txt)
        if b: run.bold = True
        if it: run.italic = True
        if col: run.font.color.rgb = RGBColor.from_string(col)
        if sz: run.font.size = Pt(sz)
    return p

def add_bullet(runs, space_after=3, line_spacing=1.2):
    p = doc.add_paragraph(style='List Paragraph')
    pf = p.paragraph_format
    pf.space_after = Pt(space_after)
    pf.line_spacing = line_spacing
    
    numPr = parse_xml(f'<w:numPr {nsdecls("w")}><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>')
    p._p.get_or_add_pPr().append(numPr)

    if isinstance(runs, str):
        runs = [(runs, False, False, None)]
    
    for item in runs:
        txt, b, it, col, sz = normalize_run_item(item)
        r = p.add_run(txt)
        if b: r.bold = True
        if it: r.italic = True
        if col: r.font.color.rgb = RGBColor.from_string(col)
        if sz: r.font.size = Pt(sz)
    return p

def add_h1(text):
    return add_p(text, style='Heading 1', bold=True)

def add_h2(text):
    return add_p(text, style='Heading 2', bold=True)

def add_h3(text):
    return add_p(text, style='Heading 3', bold=True)

def add_callout(title, lines):
    t = doc.add_table(rows=1, cols=1)
    tblPr = t._tbl.tblPr
    tblPr.append(parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
            <w:left w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
            <w:right w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
        </w:tblBorders>
    '''))
    tblPr.append(parse_xml(f'<w:tblW {nsdecls("w")} w:w="9360" w:type="dxa"/>'))
    
    cell = t.rows[0].cells[0]
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
            <w:left w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
            <w:right w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
        </w:tcBorders>
    '''))
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="F2F2F2"/>'))
    tcPr.append(parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar>'))
    
    p0 = cell.paragraphs[0]
    p0.style = 'Normal'
    p0.paragraph_format.space_after = Pt(4)
    p0.paragraph_format.line_spacing = 1.15
    r0 = p0.add_run(title)
    r0.bold = True
    r0.font.color.rgb = RGBColor.from_string("1F4E79")
    
    for l in lines:
        p = cell.add_paragraph(style='Normal')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if isinstance(l, str):
            p.add_run(l)
        elif isinstance(l, list):
            for run_item in l:
                txt = run_item[0]
                b = run_item[1] if len(run_item) > 1 else False
                it = run_item[2] if len(run_item) > 2 else False
                col = run_item[3] if len(run_item) > 3 else None
                r = p.add_run(txt)
                if b: r.bold = True
                if it: r.italic = True
                if col: r.font.color.rgb = RGBColor.from_string(col)
    add_p("", space_after=3)


def process_cell_val(val):
    runs = []
    if isinstance(val, str):
        runs = [(val, False, False, None, None)]
    elif isinstance(val, (list, tuple)):
        if len(val) >= 1 and isinstance(val[0], str) and (len(val) == 1 or not isinstance(val[1], (list, tuple))):
            txt = val[0]
            b = val[1] if len(val) > 1 and isinstance(val[1], bool) else False
            it = val[2] if len(val) > 2 and isinstance(val[2], bool) else False
            col = val[3] if len(val) > 3 and isinstance(val[3], str) else (val[2] if len(val) > 2 and isinstance(val[2], str) else None)
            runs = [(txt, b, it, col, None)]
        else:
            for item in val:
                if isinstance(item, str):
                    runs.append((item, False, False, None, None))
                elif isinstance(item, (list, tuple)):
                    txt = item[0]
                    b = item[1] if len(item) > 1 and isinstance(item[1], bool) else False
                    it = item[2] if len(item) > 2 and isinstance(item[2], bool) else False
                    col = item[3] if len(item) > 3 and isinstance(item[3], str) else (item[2] if len(item) > 2 and isinstance(item[2], str) else None)
                    runs.append((txt, b, it, col, None))
    return runs

def add_table_data(col_widths, headers, data, alignments=None):
    t = doc.add_table(rows=len(data) + 1, cols=len(headers))
    tblPr = t._tbl.tblPr
    tblPr.append(parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
        </w:tblBorders>
    '''))
    tblPr.append(parse_xml(f'<w:tblW {nsdecls("w")} w:w="9360" w:type="dxa"/>'))
    
    # Header Row
    hdr_row = t.rows[0]
    hdr_trPr = hdr_row._tr.get_or_add_trPr()
    hdr_trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    hdr_trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

    for c_idx, h_text in enumerate(headers):
        cell = hdr_row.cells[c_idx]
        tcPr = cell._tc.get_or_add_tcPr()
        tcPr.append(parse_xml(f'<w:tcW {nsdecls("w")} w:w="{col_widths[c_idx]}" w:type="dxa"/>'))
        tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="1F4E79"/>'))
        tcPr.append(parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>'))
        
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if (alignments and alignments[c_idx] == 'C') else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.1
        r = p.add_run(h_text)
        r.bold = True
        r.font.color.rgb = RGBColor.from_string("FFFFFF")

    # Data Rows
    for r_idx, row_data in enumerate(data):
        row = t.rows[r_idx + 1]
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        
        shd_fill = "F7FAFD" if (r_idx % 2 == 1) else "FFFFFF"

        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            tcPr = cell._tc.get_or_add_tcPr()
            tcPr.append(parse_xml(f'<w:tcW {nsdecls("w")} w:w="{col_widths[c_idx]}" w:type="dxa"/>'))
            if shd_fill != "FFFFFF":
                tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="{shd_fill}"/>'))
            tcPr.append(parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>'))
            
            p = cell.paragraphs[0]
            if alignments:
                if alignments[c_idx] == 'C':
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif alignments[c_idx] == 'R':
                    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            
            cell_runs = process_cell_val(val)
            for (txt, b, it, col, sz) in cell_runs:
                r = p.add_run(txt)
                if b: r.bold = True
                if it: r.italic = True
                if col: r.font.color.rgb = RGBColor.from_string(col)
                if sz: r.font.size = Pt(sz)
    add_p("", space_after=3)

print("Framework functions initialized.")

# ==================== BEGIN DOCUMENT GENERATION ====================
print("Writing Title Block...")
add_p("HỌC PHẦN: QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=12, color="595959", space_after=3)
add_p("Chuyên ngành Kỹ thuật Phần mềm – Sinh viên năm 4", align=WD_ALIGN_PARAGRAPH.CENTER, font_size=11, color="595959", space_after=3)
add_p("BÀI THỰC HÀNH (LAB)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=18, color="1F4E79", space_before=12, space_after=4)
add_p("Lập kế hoạch dự án phần mềm với trợ lý Google Gemini AI (Gói Pro)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=15, color="1F4E79", space_after=12)

# Table 0: Lab Information Table
col_w_t0 = [2400, 6960]
headers_t0 = ["Mục", "Thông tin"]
data_t0 = [
    ["Thời lượng", "1 buổi – 1 tiết (khoảng 45 phút)"],
    ["Hình thức", "Làm việc nhóm 3–5 sinh viên, mỗi nhóm dùng chung 1 tài khoản/môi trường Gemini AI gói Pro (Đơn vị: [Nhóm 03])"],
    ["Công cụ", "Google Gemini AI – Gói Pro (gemini.google.com / Google AI Studio với model Gemini Pro), Microsoft Word/Excel hoặc Google Docs/Sheets, Jira Software"],
    ["Tình huống dự án", "Nền tảng tuyển dụng thông minh SmartRecruit (Web MVP Sàng lọc CV & Đánh giá ứng viên hỗ trợ bởi AI)"],
    ["Sản phẩm nộp", "Project Charter, WBS & Từ điển WBS, Lịch dự án & PERT/CPM, Sổ đăng ký rủi ro (Risk Register), Báo cáo phản biện Gemini AI (Gói Pro) & Nhật ký sử dụng Gemini AI"]
]
add_table_data(col_w_t0, headers_t0, data_t0)

# Section 1
print("Writing Section 1: Mục tiêu...")
add_h1("1. Mục tiêu bài thực hành")
add_p("Sau buổi thực hành, sinh viên có thể:")
add_bullet([("Thiết lập môi trường làm việc với ", False), ("Gemini AI", True), (" đúng cách (System Instructions + Knowledge) để dùng Gemini AI gói Pro làm trợ lý quản lý dự án cho hệ thống SmartRecruit.")])
add_bullet([("Xây dựng ", False), ("Project Charter", True), (" (Tuyên bố dự án) cho SmartRecruit từ bộ ngữ cảnh kỹ thuật (Project Setup) và yêu cầu nghiệp vụ.")])
add_bullet([("Phân rã phạm vi thành ", False), ("WBS", True), (" (Work Breakdown Structure) 3 cấp và lập từ điển WBS cho các gói công việc cốt lõi (Admin RBAC, AI Gemini Extraction, Matching Engine).")])
add_bullet([("Ước lượng thời gian bằng PERT ba điểm, lập ", False), ("lịch dự án", True), (", xác định ", False), ("đường găng", True), (" (Critical Path) và kiểm tra khả năng đáp ứng thời hạn 08 Sprint (08/09/2026 – 02/11/2026).")])
add_bullet([("Nhận diện, phân tích và lập ", False), ("sổ đăng ký rủi ro", True), (" (Risk Register), xây dựng ma trận rủi ro và kế hoạch dự phòng cho các rủi ro trọng yếu.")])
add_bullet([("Đánh giá phản biện", True), (" đầu ra của Gemini AI gói Pro: phát hiện sai lệch số học, ảo giác về ngân sách/phạm vi và chỉnh sửa có căn cứ kỹ thuật vững chắc.")])

# Section 2
print("Writing Section 2: Chuẩn bị...")
add_h1("2. Chuẩn bị trước buổi học")
add_h3("Sinh viên")
add_bullet("Tạo sẵn/kích hoạt tài khoản Google Gemini gói Pro (Gemini Advanced hoặc Google AI Studio sử dụng model Gemini Pro) để tận dụng cửa sổ ngữ cảnh lớn (Context Window lên tới 1–2 triệu tokens) và khả năng suy luận logic chuyên sâu.")
add_bullet("Ôn lại kiến thức quản lý dự án phần mềm: vòng đời dự án, Project Charter, WBS (quy tắc 100% và 8/80), PERT/CPM, quản lý rủi ro và quản lý chi phí (theo PMBOK 7 & Agile/Scrum).")
add_bullet("Chia nhóm và phân vai trong nhóm [Nhóm 03]: Trưởng nhóm (PM / Tech Lead), Thư ký (ghi nhật ký prompt), BA / PO, Backend Architect, Frontend UI-UX, QA Tester, DevOps Cloud.")
add_h3("Giảng viên")
add_bullet([("Chuẩn bị tài liệu kỹ thuật ", False), ("SmartRecruit_ProjectSetup.docx", True), (" (bộ ngữ cảnh kỹ thuật thống nhất v1.1 ở Phụ lục A) để phát cho các nhóm đưa vào Knowledge.")])
add_bullet([("Chuẩn bị file ", False), ("Mau_ProjectCharter.docx", True), (" (khung mẫu ở Phụ lục B) để các nhóm tham chiếu cấu trúc chuẩn.")])
add_bullet("Kiểm tra kết nối Internet phòng máy và quyền truy cập gemini.google.com / aistudio.google.com, bảo đảm băng thông cho các nhóm tương tác Gemini AI gói Pro đồng thời.")

# Section 3
print("Writing Section 3: Tiến trình...")
add_h1("3. Tiến trình buổi thực hành")
col_w_t1 = [2000, 5760, 1600]
headers_t1 = ["Hoạt động", "Nội dung", "Thời gian"]
data_t1 = [
    ["Khởi động", "Giảng viên giới thiệu tình huống dự án SmartRecruit, mục tiêu, tiêu chí chấm", "10 phút"],
    ["Phần A", "Thiết lập môi trường Gemini AI gói Pro (tạo Gem/Project, System Instructions, nạp Knowledge)", "25 phút"],
    ["Phần B", "Bài 1 – Lập Project Charter và phân tích yêu cầu làm rõ với Sponsor", "25 phút"],
    ["Phần C", "Bài 2 – Phân rã phạm vi, xây dựng WBS 3 cấp và từ điển WBS", "30 phút"],
    ["Nghỉ giải lao", "Giải lao giữa giờ, rà soát lại kết quả WBS của nhóm", "10 phút"],
    ["Phần D", "Bài 3 – Ước lượng PERT 3 điểm, lập lịch dự án, xác định đường găng (CPM)", "30 phút"],
    ["Phần E", "Bài 4 – Quản lý chi phí, lập Risk Register và ma trận rủi ro", "20 phút"],
    ["Phần F", "Bài 5 – Kiểm tra phản biện đầu ra Gemini AI gói Pro, chất vấn Sponsor, đánh giá chất lượng", "15 phút"],
    ["Tổng kết", "Các nhóm trình bày nhanh kết quả, giảng viên nhận xét và đánh giá", "15 phút"]
]
add_table_data(col_w_t1, headers_t1, data_t1, alignments=['L', 'L', 'C'])

# Section 4
print("Writing Section 4: Tình huống SmartRecruit...")
add_h1("4. Tình huống dự án: SmartRecruit")
add_p("Hệ thống tuyển dụng thông minh SmartRecruit là nền tảng web MVP hỗ trợ nhà tuyển dụng quản lý tin tuyển dụng (Job), tiếp nhận hồ sơ ứng tuyển (CV định dạng PDF/DOCX), trích xuất thông tin có cấu trúc bằng mô hình AI Gemini (gemini-2.5-flash), đối chiếu kỹ năng/kinh nghiệm theo tiêu chí định lượng và chuẩn bị dự thảo phản hồi cho ứng viên. Hệ thống tuân thủ nghiêm ngặt nguyên tắc Human-in-the-loop: kết quả AI chỉ đóng vai trò là gợi ý minh bạch; Recruiter là người toàn quyền xem xét, điều chỉnh và ra quyết định tuyển dụng cuối cùng. Admin quản trị tài khoản, taxonomy kỹ năng và nhật ký audit theo nguyên tắc tối thiểu quyền (least privilege), không can thiệp vào quyết định tuyển dụng hay xem CV raw.")
add_bullet([("Ngân sách: ", True), ("33.052.000 VNĐ là baseline ngân sách tổng thể được xác lập theo định mức dự toán WBS (gồm 30.240.000 VNĐ nhân công cho 108 ngày công, 1.300.000 VNĐ chi phí trực tiếp hạ tầng/công nghệ và 1.512.000 VNĐ dự phòng rủi ro).")])
add_bullet([("Thời hạn: ", True), ("08 Sprint làm việc liên tục (kéo dài từ 08/09/2026 đến 02/11/2026); ngày 03/11/2026 là mốc UAT/nghiệm thu/đóng dự án (không gọi 03/11 là Sprint 9).")])
add_bullet([("Đội dự án: ", True), ("Nhóm sinh viên [Nhóm 03] đảm nhận các vai trò chuyên trách: 1 PM / Tech Lead, 1 BA / PO, 1 Backend Architect, 1 Frontend UI-UX, 1 QA Tester, 1 DevOps Cloud.")])
add_bullet([("Trợ lý AI hỗ trợ quản trị: ", True), ("Sử dụng Google Gemini AI gói Pro (Gemini Pro) làm trợ lý phương pháp luận; chi tiết yêu cầu kỹ thuật xem Phụ lục A – đây là tài liệu cốt lõi nạp vào Knowledge của Gemini AI gói Pro.")])

# Section 5
print("Writing Section 5: Phần A - Thiết lập...")
add_h1("5. Phần A – Thiết lập môi trường Google Gemini AI – Gói Pro (25 phút)")
add_h2("Bước A1. Tạo Project")
add_bullet("Đăng nhập gemini.google.com bằng tài khoản gói Pro (Gemini Advanced) hoặc truy cập Google AI Studio (aistudio.google.com, chọn model Gemini Pro) → bấm Create Gem / New Prompt để tạo không gian làm việc chuyên biệt.")
add_bullet([("Đặt tên theo quy ước chuẩn: ", False), ("QLDA_[Nhóm 03]_SmartRecruit", True), (" (giữ mã định danh nhóm để phân biệt).")])
add_bullet("Mô tả: “Trợ lý quản lý và lập kế hoạch dự án Nền tảng tuyển dụng thông minh SmartRecruit – môn Quản lý dự án CNTT”.")

add_h2("Bước A2. Viết Project Instructions")
add_p("Mở phần Instructions (hướng dẫn dự án) và dán nội dung sau, sau đó điều chỉnh các phần trong ngoặc vuông cho phù hợp với nhóm:")

instructions_lines = [
    "# VAI TRÒ",
    "Bạn là trợ lý quản lý dự án phần mềm chuyên nghiệp trên nền tảng Gemini AI (Gói Pro), có kinh nghiệm sâu sắc theo chuẩn PMBOK (PMI) và Agile/Scrum. Bạn hỗ trợ nhóm sinh viên [Nhóm 03] lập kế hoạch và điều hành dự án Nền tảng tuyển dụng thông minh SmartRecruit.",
    "",
    "# BỐI CẢNH DỰ ÁN",
    "- Dự án: Hệ thống Web MVP SmartRecruit hỗ trợ quản lý Job, tiếp nhận CV, AI trích xuất có cấu trúc (Gemini 2.5 Flash), đối chiếu kỹ năng và chuẩn bị phản hồi (xem file Knowledge).",
    "- Ràng buộc cốt lõi: Ngân sách 33.052.000 VNĐ baseline (30.240.000 VNĐ nhân công + 1.300.000 VNĐ trực tiếp + 1.512.000 VNĐ dự phòng), thời hạn 08 Sprint (08/09/2026 – 02/11/2026), ngày 03/11/2026 là UAT/nghiệm thu/đóng dự án. Đội ngũ gồm 6 vai trò: PM/Tech Lead, BA/PO, Backend, Frontend, QA, DevOps.",
    "- Kiến trúc & Công nghệ: Modular monolith Spring Boot 3.5.16 + Java 21 LTS, React 19.3 + TypeScript + Vite 8, CSDL MySQL 8.4 LTS, lưu trữ S3 private, hạ tầng AWS EC2/RDS/S3/ECR.",
    "- Nguyên tắc AI: AI chỉ đóng vai trò trợ lý gợi ý minh bạch, Recruiter toàn quyền quyết định; Admin quản trị role/status và audit theo least-privilege, không tự động loại ứng viên hay can thiệp tuyển dụng.",
    "",
    "# QUY TẮC ĐẦU RA",
    "- Trả lời bằng tiếng Việt chuyên nghiệp, chuẩn xác; thuật ngữ quản lý dự án và kỹ thuật kèm tiếng Anh trong ngoặc đơn.",
    "- Ưu tiên tuyệt đối trình bày dạng bảng chi tiết khi liệt kê công việc (WBS), rủi ro, phân bổ thời gian và chi phí.",
    "- Mọi con số (giờ công, ngày làm việc, chi phí ngân sách) phải ghi rõ công thức, căn cứ và giả định tính toán.",
    "- Chỉ dựa trên thông tin chính xác trong Knowledge; tuyệt đối không tự bịa đặt (hallucinate) thông tin. Nếu thiếu dữ liệu, hãy liệt kê câu hỏi cần làm rõ với Sponsor/Khách hàng thay vì tự suy diễn.",
    "",
    "# CÁCH LÀM VIỆC",
    "- Không làm hộ toàn bộ: sau mỗi sản phẩm đầu ra, đặt 2–3 câu hỏi gợi mở sâu sắc để nhóm tự kiểm tra, đối chiếu thực tế và cải thiện.",
    "- Khi được yêu cầu \"phản biện\", hãy đóng vai Sponsor/Chuyên gia khó tính, chỉ ra các lỗ hổng kỹ thuật, điểm yếu về lịch trình, rủi ro chi phí và sự bất khả thi của kế hoạch."
]
add_callout("Mẫu System Instructions cho Gemini AI Gói Pro (Dự án SmartRecruit)", instructions_lines)

note_a2 = [
    "System Instructions áp dụng cho MỌI cuộc trò chuyện trong Gemini AI gói Pro. Việc khai thác gói Pro với cửa sổ ngữ cảnh cực lớn (Context Window lên tới hàng triệu tokens) cho phép nạp trọn vẹn toàn bộ tài liệu kỹ thuật mà không lo bị cắt xén hay quên ngữ cảnh.",
    "Dòng “Không làm hộ toàn bộ…” kết hợp năng lực suy luận đa bước của Gemini Pro giúp AI đóng vai người phản biện sắc sảo thay vì chỉ trả lời rập khuôn – đây là tiêu chuẩn đánh giá quan trọng của bài thực hành."
]
add_callout("Lưu ý cho sinh viên", note_a2)

add_h2("Bước A3. Nạp tài liệu vào Knowledge")
add_bullet("Trong giao diện Project, chọn Add content / Upload files ở mục Knowledge (Tài liệu dự án).")
add_bullet([("Tải lên file ", False), ("SmartRecruit_ProjectSetup.docx", True), (" (nội dung ở Phụ lục A) và file ", False), ("Mau_ProjectCharter.docx", True), (" (khung mẫu ở Phụ lục B).")])
add_bullet("Kiểm tra kết nối: mở một cuộc hội thoại mới với Gemini AI gói Pro và hỏi: “Tóm tắt 5 ràng buộc kỹ thuật và nguyên tắc vận hành của hệ thống SmartRecruit”. Nếu Gemini AI gói Pro trả lời chính xác các nội dung (Ngân sách 33.052.000 VNĐ, 08 Sprint, Modular Monolith, Human-in-the-loop, Admin Least Privilege), môi trường làm việc đã sẵn sàng.")

add_h2("Bước A4. Quy ước làm việc trong Project")
add_bullet("Mỗi bài tập mở một cuộc chat riêng biệt, đặt tên chuẩn: “Bai1_Charter”, “Bai2_WBS”, “Bai3_Schedule”, “Bai4_Risk”, “Bai5_PhanBien”.")
add_bullet("Khi có sản phẩm đạt yêu cầu chất lượng, nhóm xuất thành file và tải ngược lên Knowledge để các bài tiếp theo tái sử dụng dữ liệu kế thừa (ví dụ: WBS dùng cho bài lập lịch PERT).")
add_bullet("Thư ký nhóm chịu trách nhiệm ghi nhật ký prompt (theo mẫu Phụ lục C) xuyên suốt quá trình làm việc với Gemini AI gói Pro.")

print("Finished Section 1 to 5 framework.")

# ==================== BEGIN DETAILED LAB EXERCISES (BÀI 1 ĐẾN BÀI 5) ====================

# Section 6: Bài 1 - Project Charter
print("Writing Section 6: Bài 1 - Project Charter...")
add_h1("6. Phần B – Bài 1: Project Charter (25 phút)")
add_p("Yêu cầu: Lập Tuyên bố dự án (Project Charter) cho SmartRecruit, gồm: mục đích, mục tiêu SMART, phạm vi sơ bộ (trong/ngoài phạm vi), các bên liên quan, mốc chính, ngân sách tổng, giả định, ràng buộc, tiêu chí thành công.")

prompt_b1 = [
    "Dựa trên tài liệu kỹ thuật SmartRecruit trong Knowledge, hãy soạn Project Charter cho dự án Nền tảng tuyển dụng thông minh SmartRecruit theo khung chuẩn 12 mục: (1) Tên dự án / Mã dự án, (2) Nhà tài trợ / PM, (3) Mục đích & Lý do thực hiện (Business Case), (4) Mục tiêu SMART, (5) Trong/ngoài phạm vi, (6) Sản phẩm bàn giao chính, (7) Các bên liên quan & Ma trận RACI, (8) Mốc thời gian chính (8 Sprint), (9) Ngân sách tổng 33.052.000 VNĐ, (10) Giả định & Ràng buộc, (11) Rủi ro cấp cao, (12) Tiêu chí thành công và nghiệm thu. Cuối cùng liệt kê 3 câu hỏi quan trọng nhất cần làm rõ với Sponsor."
]
add_callout("Prompt mẫu cho Bài 1", prompt_b1)

add_p("Nhóm tự thực hiện:", bold=True)
add_bullet("Kiểm tra từng mục tiêu có thật sự SMART (đo lường được, có thời hạn cụ thể) không; viết lại ít nhất 2 mục tiêu có tiêu chí định lượng rõ ràng.")
add_bullet("Đối chiếu phần “ngoài phạm vi” với Phụ lục A – Gemini AI gói Pro có bỏ sót hoặc tự ý thêm các tính năng không có trong tài liệu baseline kỹ thuật không?")
add_bullet("Chọn 3 câu hỏi quan trọng nhất cần chất vấn và làm rõ với khách hàng/Sponsor, phân tích lý do vì sao.")

add_h2("KẾT QUẢ THỰC HIỆN BÀI 1: BẢN TUYÊN BỐ DỰ ÁN (PROJECT CHARTER) HOÀN CHỈNH CHO SMARTRECRUIT")
add_p("Dưới đây là bản Project Charter hoàn chỉnh được nhóm [Nhóm 03] xây dựng, chuẩn hóa dựa trên bộ ngữ cảnh kỹ thuật baseline v1.1 của dự án SmartRecruit:")

col_w_charter = [2400, 6960]
headers_charter = ["Mục", "Nội dung chi tiết"]
data_charter = [
    ["Tên dự án / Mã dự án", "Nền tảng tuyển dụng thông minh SmartRecruit (Smart Recruitment Platform)\nMã dự án: SR-2026-MVP"],
    ["Nhà tài trợ (Sponsor) / Quản lý dự án (PM)", "Nhà tài trợ (Sponsor): Hội đồng Khoa Công nghệ Thông tin & Doanh nghiệp Đối tác\nQuản lý dự án (PM): Trưởng nhóm [Nhóm 03] (Phụ trách điều phối kỹ thuật và tiến độ)"],
    ["Mục đích và lý do thực hiện (Business Case)", "Quy trình tuyển dụng hiện tại phụ thuộc nặng nề vào việc đọc và sàng lọc CV thủ công, gây lãng phí từ 40–60% thời gian của bộ phận nhân sự (HR), dễ bỏ sót ứng viên tiềm năng và thiếu căn cứ khách quan, minh bạch trong việc đối chiếu kỹ năng. SmartRecruit được xây dựng như một nền tảng Web MVP hiện đại, tích hợp mô hình AI tiên tiến (Google Gemini 2.5 Flash) nhằm tự động trích xuất thông tin CV có cấu trúc, đối chiếu kỹ năng theo tiêu chí định lượng và hỗ trợ dự thảo phản hồi chuyên nghiệp. Hệ thống giải quyết bài toán năng suất sàng lọc hồ sơ, đảm bảo quyền riêng tư dữ liệu và duy trì nguyên tắc con người toàn quyền quyết định tuyển dụng (Human-in-the-loop)."],
    ["Mục tiêu SMART", "1. Hoàn thành phát triển, kiểm thử và đóng gói hệ thống Web MVP gồm 24 màn hình chức năng và 16 bảng CSDL MySQL 8.4 theo đúng kiến trúc Modular Monolith Spring Boot 3.5.16 + React 19.\n2. Đưa hệ thống vào vận hành thử nghiệm (UAT) đúng hạn vào ngày 03/11/2026 sau 08 Sprint phát triển liên tục (08/09/2026 – 02/11/2026).\n3. Đạt độ chính xác trích xuất kỹ năng CV ≥ 85% trên tập 20+ CV mẫu kiểm thử; thời gian tính điểm đối chiếu (matching score) cho 50 hồ sơ ứng viên dưới 2 giây (không tính độ trễ mạng gọi API ngoài).\n4. Kiểm soát tổng chi phí phát triển, nhân sự và triển khai thử nghiệm trên AWS trong phạm vi ngân sách baseline được duyệt là 33.052.000 VNĐ, không để phát sinh chi phí vượt định mức."],
    ["Phạm vi dự án (Scope)", "Trong phạm vi (In-Scope):\n- Giao diện React SPA đa chế độ: Admin neutral-black dark theme, Recruiter & Candidate professional light theme.\n- Backend Spring Boot REST API modular monolith, CSDL MySQL 8.4 LTS với Flyway migration.\n- Xác thực JWT + Google OpenID Connect (OIDC Authorization Code Flow + PKCE).\n- Phân quyền RBAC 3 vai trò: Candidate, Recruiter, Admin; Admin Console quản trị role/status, taxonomy và audit log.\n- Quản lý Job, nộp hồ sơ ứng tuyển, tải lên CV PDF/DOCX lưu trữ bảo mật trên AWS S3 private bucket.\n- Trích xuất cấu trúc CV qua Gemini 2.5 Flash Adapter (JSON Schema, timeout, retry, guardrails).\n- Thuật toán tính điểm khớp kỹ năng có giải thích minh bạch (Match Scoring Engine).\n- Đánh giá ứng viên, duyệt bản nháp phản hồi và gửi thông báo email đã phê duyệt.\n- Container hóa Docker (dev/prod), CI/CD GitHub Actions, triển khai demo an toàn trên AWS EC2/RDS/S3/ECR.\n\nNgoài phạm vi (Out-of-Scope):\n- Không phát triển ứng dụng di động native (iOS/Android).\n- Không hỗ trợ OCR quét hình ảnh CV viết tay hoặc bản scan chất lượng kém.\n- Không tích hợp với hệ thống phần mềm doanh nghiệp bên ngoài (ATS, HRIS, Payroll).\n- Không cho phép hệ thống tự động loại bỏ (auto-reject) hoặc tự động tuyển dụng mà không qua Recruiter duyệt.\n- Không cam kết SLA vận hành 24/7 cấp độ sản phẩm thương mại quy mô lớn; không xử lý CV thật khi chưa có sự đồng ý (consent) bằng văn bản."],
    ["Sản phẩm bàn giao chính (Deliverables)", "1. Bộ mã nguồn hoàn chỉnh (apps/web, apps/api) trên GitHub repository kèm tài liệu đóng gói.\n2. CSDL MySQL 8.4 hoàn chỉnh với bộ migration scripts (Flyway) và seed data mẫu an toàn.\n3. Bộ tài liệu kỹ thuật hoàn chỉnh: Kiến trúc Modular Monolith, ADR (0001–0004), ERD và API Contract (OpenAPI 3.0/Swagger).\n4. Bộ test suites tự động (Unit test, Integration test với Testcontainers, Playwright E2E, Postman collections) và báo cáo kiểm thử chất lượng.\n5. Bộ Dockerfile cứng hóa, compose file (dev/prod) và CI/CD pipeline hoàn chỉnh trên GitHub Actions.\n6. Môi trường demo trực tiếp trên nền tảng AWS (EC2 + RDS + S3 + ECR + SSM).\n7. Tài liệu hướng dẫn sử dụng (User Manual) có ảnh chụp minh họa cho 3 vai trò và biên bản nghiệm thu kỹ thuật (UAT Sign-off)."],
    ["Các bên liên quan và vai trò (Stakeholders)", "1. Hội đồng Sponsor & Giảng viên: Định hướng chiến lược, cấp vốn ngân sách, giám sát chất lượng và ký nghiệm thu sản phẩm.\n2. Trưởng nhóm / PM / Tech Lead: Điều phối chung tiến độ 08 Sprint, kiểm soát phạm vi WBS, kiến trúc hệ thống và quản trị rủi ro.\n3. BA / PO: Phân tích yêu cầu, chuẩn hóa backlog user story, viết tài liệu SRS và xác định tiêu chí nghiệm thu.\n4. Backend Architect / Developer: Thiết kế CSDL, phát triển API RESTful, tích hợp Gemini AI adapter, bảo mật RBAC và xử lý matching engine.\n5. Frontend / UI-UX Engineer: Xây dựng giao diện React SPA theo Design Tokens (Admin Dark, Recruiter/Candidate Light), tích hợp API và đảm bảo responsive.\n6. QA / Tester: Thiết kế test matrix, tự động hóa kiểm thử (Playwright, Testcontainers), đánh giá độ chính xác AI trích xuất và bảo mật OWASP.\n7. DevOps Cloud Engineer: Thiết lập môi trường Docker, CI/CD GitHub Actions, cấu hình và vận hành hạ tầng AWS (EC2, RDS, S3, ECR)."],
    ["Mốc thời gian chính (Milestones)", "M1 (14/09/2026): Hoàn thành Sprint 1 – Khóa Solution Architecture, SRS, Spike Gemini và baseline dự án.\nM2 (21/09/2026): Hoàn thành Sprint 2 – Foundation (ERD, Flyway MySQL, Scaffold React/Spring Boot).\nM3 (28/09/2026): Hoàn thành Sprint 3 – Authentication, RBAC, Job Management, Skill Taxonomy & Admin Console.\nM4 (05/10/2026): Hoàn thành Sprint 4 – CV Intake, S3 Private Storage, Gemini Extraction Adapter.\nM5 (12/10/2026): Hoàn thành Sprint 5 – Match Scoring Engine có giải thích, Evaluation & Approved Notification.\nM6 (19/10/2026): Hoàn thành Sprint 6 – Tối ưu hóa truy vấn, Analytics Dashboard và CI/CD GitHub Actions.\nM7 (26/10/2026): Hoàn thành Sprint 7 – QA Hardening, Test Matrix, Security Review & Release Candidate.\nM8 (02/11/2026): Hoàn thành Sprint 8 – Triển khai thành công trên AWS demo, hoàn thiện User Manual và gói bàn giao.\nM9 (03/11/2026): Cột mốc Đóng dự án – UAT nghiệm thu thực tế, Retrospective và chuyển giao sản phẩm."],
    ["Ngân sách tổng (Budget)", "Tổng ngân sách baseline chính thức: 33.052.000 VNĐ (chuẩn hóa theo cơ sở định mức WBS 108 ngày công và tài chính dự án), phân bổ cụ thể:\n- Chi phí nhân công trực tiếp (108 ngày công của đội ngũ phát triển 6 vai trò WBS): 30.240.000 VNĐ.\n- Chi phí trực tiếp hạ tầng & dịch vụ công nghệ (Cloud VPS/AWS, Quota Google Gemini API, Tên miền & SSL, công cụ kiểm thử): 1.300.000 VNĐ.\n- Quỹ dự phòng rủi ro tài chính (Contingency Reserve ~5%): 1.512.000 VNĐ.\nTổng cộng: 30.240.000 + 1.300.000 + 1.512.000 = 33.052.000 VNĐ."],
    ["Giả định và Ràng buộc (Assumptions & Constraints)", "Giả định:\n- Đội dự án 6 vai trò làm việc ăn ý, cam kết tối thiểu 20–25 giờ công/tuần/thành viên.\n- Google duy trì ổn định dịch vụ Gemini 2.5 Flash API và hạn mức không thay đổi đột ngột.\n- Môi trường máy tính của các thành viên đáp ứng tốt việc chạy Docker và công cụ lập trình.\n\nRàng buộc:\n- Ràng buộc ngân sách: Tuyệt đối không chi tiêu vượt quá hạn mức 33.052.000 VNĐ.\n- Ràng buộc thời gian: Đúng hạn 08 Sprint kết thúc trước 02/11/2026 và nghiệm thu ngày 03/11/2026.\n- Ràng buộc kiến trúc: Tuân thủ kiến trúc Modular Monolith; không dùng microservices gây phân tán nguồn lực.\n- Ràng buộc đạo đức & dữ liệu: Không sử dụng CV thật chứa PII chưa có sự cho phép; AI không được tự ý quyết định tuyển dụng."],
    ["Rủi ro cấp cao (High-level Risks)", "1. Vượt ngân sách AWS hoặc quota Gemini do vòng lặp kiểm thử tự động không kiểm soát.\n2. Rò rỉ thông tin cá nhân (PII) hoặc file CV ứng viên trên storage công khai hoặc nhật ký log.\n3. Lỗ hổng kiểm thử bảo mật phân quyền Admin dẫn đến nguy cơ leo thang đặc quyền (Privilege Escalation).\n4. Sai lệch tiến độ do thành viên chưa làm chủ công nghệ mới (Java 21, Spring Boot 3.5, React 19)."],
    ["Tiêu chí thành công và nghiệm thu (Success Criteria)", "1. 100% các tính năng cốt lõi (Must-have) hoạt động ổn định trên môi trường AWS demo.\n2. Tỷ lệ kiểm thử thành công đạt ≥ 95% trên toàn bộ ma trận kiểm thử tự động (Unit, Integration, E2E).\n3. Bộ tài liệu kỹ thuật (ADR, SRS, WBS, User Manual, Runbook, OpenAPI) đạt chuẩn chất lượng học thuật và công nghiệp.\n4. Được Hội đồng Sponsor và Giảng viên hướng dẫn ký biên bản nghiệm thu chuyển giao chính thức vào ngày 03/11/2026."],
    ["Phê duyệt (Sign-off)", "Đại diện Hội đồng Sponsor: ....................................................   Ngày: 08/09/2026\nĐại diện Quản lý dự án (PM): ...................................................   Ngày: 08/09/2026"]
]
add_table_data(col_w_charter, headers_charter, data_charter)

add_h3("Phân tích phản biện và viết lại mục tiêu SMART")
add_p("Trong quá trình làm việc với trợ lý Gemini AI gói Pro, bản nháp ban đầu do Gemini AI gói Pro sinh ra có một số mục tiêu chung chung như “xây dựng hệ thống tuyển dụng thông minh hiệu quả” và “đảm bảo hệ thống chạy tốt, ít lỗi”. Nhóm đã tiến hành phân tích phản biện và viết lại 2 mục tiêu then chốt để bảo đảm chuẩn SMART (Specific, Measurable, Achievable, Relevant, Time-bound):")
add_bullet([("Mục tiêu 1 (Chất lượng & Hiệu năng trích xuất AI): ", True), ("Viết lại thành: “Đạt độ chính xác trích xuất kỹ năng CV ≥ 85% trên tập dữ liệu kiểm thử 20+ CV mẫu chuẩn hóa theo rubric thẩm định; thời gian tính điểm đối chiếu (matching score) cho 50 hồ sơ ứng viên dưới 2 giây (không tính độ trễ mạng gọi API ngoài) trước ngày 12/10/2026 (Sprint 5)” -> Mục tiêu này đo lường được chính xác bằng số liệu benchmark và có thời hạn cụ thể.")])
add_bullet([("Mục tiêu 2 (Quản trị chi phí và triển khai hạ tầng): ", True), ("Viết lại thành: “Thiết lập hạ tầng đám mây AWS an toàn (EC2 + RDS + S3 + ECR) với toàn bộ cảnh báo chi phí (AWS Budget Alert và Gemini Quota Alert), bảo đảm tổng chi phí thực tế cho demo và kiểm thử không vượt quá hạn mức baseline 33.052.000 VNĐ tính đến ngày đóng dự án 03/11/2026” -> Mục tiêu này có ranh giới ngân sách rõ ràng, có cơ chế kiểm soát kỹ thuật và thời điểm chốt sổ.")])

add_h3("Đối chiếu phạm vi Ngoài phạm vi (Out-of-Scope)")
add_p("Nhóm đã đối chiếu kỹ lưỡng phần Ngoài phạm vi với tài liệu Project Setup v1.1. Dù sử dụng Gemini AI gói Pro với độ hiểu biết sâu, mô hình ban đầu vẫn có xu hướng đề xuất thêm các tính năng mở rộng như “ứng dụng di động đa nền tảng” hoặc “tự động gửi thư từ chối ứng viên nếu điểm dưới 50”. Nhóm đã kiên quyết loại bỏ và xác nhận đây là phạm vi ngoài (Out-of-scope) vì vi phạm nguyên tắc Human-in-the-loop (AI không được tự ý từ chối con người) và vi phạm ràng buộc nguồn lực của đội ngũ sinh viên trong 08 Sprint.")

add_h3("3 câu hỏi quan trọng nhất cần làm rõ với Sponsor")
add_bullet([("Câu hỏi 1 (Về cơ chế giải ngân ngân sách): ", True), ("“Hạn mức dự toán 33.052.000 VNĐ (gồm 30.240.000 VNĐ nhân công và 2.812.000 VNĐ chi phí trực tiếp + dự phòng) được giải ngân, nghiệm thu theo từng giai đoạn Sprint như thế nào giữa Nhà trường/Sponsor và nhóm?” – ", False), ("Lý do: ", True), ("Cần xác định rõ cơ chế ghi nhận chi phí nhân công và quy trình thanh toán chi phí trực tiếp đám mây/API để nhóm chủ động duy trì dịch vụ liên tục.")])
add_bullet([("Câu hỏi 2 (Về chính sách bảo mật dữ liệu và mẫu CV): ", True), ("“Sponsor và Nhà trường có cung cấp bộ dữ liệu CV mẫu ẩn danh có bản quyền hay nhóm phải tự tạo mock fixtures; chính sách lưu trữ và xóa dữ liệu CV sau buổi nghiệm thu UAT ngày 03/11 là gì?” – ", False), ("Lý do: ", True), ("CV chứa thông tin định danh cá nhân nhạy cảm (PII); việc đưa CV thật vào hệ sinh thái AI mà không có văn bản chấp thuận (consent) sẽ vi phạm pháp luật và đạo đức nghiên cứu.")])
add_bullet([("Câu hỏi 3 (Về quy trình bàn giao tài khoản Admin tối cao): ", True), ("“Cơ chế bootstrap tài khoản Admin ban đầu qua lệnh CLI/SSM sẽ được bàn giao cho cá nhân nào thuộc Hội đồng Sponsor; tiêu chí đánh giá nghiệm thu đối với Admin Console có bao gồm thẩm định lỗ hổng leo thang đặc quyền không?” – ", False), ("Lý do: ", True), ("Admin Console trong SmartRecruit là vùng quản trị cực kỳ nhạy cảm; cần làm rõ người nhận bàn giao để bảo đảm tính bảo mật và toàn vẹn của hệ thống sau khi nhóm kết thúc dự án.")])

print("Finished Section 6 (Bài 1).")

doc.save(output_path)
print(f"Saved checkpoint to {output_path}")

# ==================== SECTION 7: BÀI 2 - WBS ====================
print("Writing Section 7: Bài 2 - WBS...")
add_h1("7. Phần C – Bài 2: Phạm vi và WBS (30 phút)")
add_p("Yêu cầu: Xây dựng WBS tối thiểu 3 cấp, theo hướng sản phẩm bàn giao (deliverable-oriented), gói công việc (work package) không quá 80 giờ công (quy tắc 8/80).")

prompt_c = [
    "Từ Project Charter đã thống nhất, hãy xây dựng WBS 3 cấp cho SmartRecruit bao phủ toàn bộ 08 Sprint và ngày đóng dự án 03/11/2026, đánh mã 1.0, 1.1, 1.1.1... Trình bày dạng bảng: Mã WBS | Tên gói công việc (Jira Key) | Sản phẩm bàn giao (Deliverable) | Ước lượng giờ công. Đảm bảo tuân thủ nghiêm ngặt quy tắc 100% và quy tắc 8/80 (không gói nào vượt quá 80 giờ). Sau đó viết từ điển WBS (WBS Dictionary) chi tiết cho 3 gói công việc quan trọng nhất: WBS 3.6 (Admin Console & Quản trị người dùng), WBS 4.2 (Gemini Extraction Service) và WBS 5.1 (Match Scoring Engine có giải thích)."
]
add_callout("Prompt mẫu cho Bài 2", prompt_c)

add_p("Nhóm tự thực hiện:", bold=True)
add_bullet("Kiểm tra quy tắc 100%: tổng công việc con có bao phủ trọn vẹn phạm vi cha không? Có đầy đủ các hạng mục quản lý dự án, kiến trúc, kiểm thử, CI/CD, triển khai đám mây và đào tạo bàn giao chưa?")
add_bullet("Biểu diễn WBS dưới dạng sơ đồ cây phân cấp trực quan – không chỉ dừng lại ở bảng danh sách của Gemini AI gói Pro.")
add_bullet("Lưu WBS cuối cùng thành file tài liệu kỹ thuật và tải ngược lên phần ngữ cảnh tài liệu (Knowledge) của Gemini AI gói Pro để phục vụ bài lập lịch tiếp theo.")

add_h2("KẾT QUẢ THỰC HIỆN BÀI 2: WBS 3 CẤP VÀ TỪ ĐIỂN WBS HOÀN CHỈNH CHO SMARTRECRUIT")
add_p("Bảng phân rã cấu trúc công việc WBS 3 cấp dưới đây bao phủ toàn bộ 41 nhiệm vụ kỹ thuật thực tế của dự án SmartRecruit (tương ứng các issue từ SCRUM-11 đến SCRUM-50 cùng task Admin 3.6). Mỗi gói công việc đều có sản phẩm bàn giao đo lường được và định mức giờ công tuân thủ quy tắc 8/80:")

col_w_wbs = [1200, 3600, 3360, 1200]
headers_wbs = ["Mã WBS", "Gói công việc / Task (Jira Key)", "Sản phẩm bàn giao (Deliverable)", "Giờ công"]
data_wbs = [
    [["1.0", True], ["GIAI ĐOẠN 1: KHỞI ĐỘNG & KIẾN TRÚC GIẢI PHÁP (SPRINT 1)", True], ["Bộ tài liệu kỹ thuật khởi tạo và baseline hệ thống", True], ["150h", True]],
    ["1.1", "Khởi động dự án & khóa baseline (SCRUM-11)", "README.md, working-agreement.md, ADR-0001, ma trận WBS-Jira", "24h"],
    ["1.2", "Phân tích yêu cầu & backlog ưu tiên (SCRUM-12)", "requirements.md, backlog.md, glossary.md, bảng NFR đo được", "32h"],
    ["1.3", "SRS, use case & state machine (SCRUM-13)", "srs.md, sơ đồ use cases, application-state.md, API contract draft", "28h"],
    ["1.4", "Spike Gemini: trích xuất có cấu trúc (SCRUM-14)", "gemini-spike.md, cv-extraction-schema.json, prompt v1, mock fixtures", "36h"],
    ["1.5", "Kiến trúc Modular Monolith & ADR (SCRUM-15)", "c4-context.md, c4-container.md, data-flow.md, bộ ADR 0001–0004", "30h"],
    
    [["2.0", True], ["GIAI ĐOẠN 2: NỀN TẢNG DỮ LIỆU & SCAFFOLD HỆ THỐNG (SPRINT 2)", True], ["Cơ sở dữ liệu lõi và khung mã nguồn chuẩn hóa", True], ["150h", True]],
    ["2.1", "ERD & mô hình dữ liệu lõi 16 bảng (SCRUM-16)", "docs/data/erd.md, data-dictionary.md, migration plan 16 bảng", "32h"],
    ["2.2", "Schema MySQL, Flyway & seed data an toàn (SCRUM-17)", "Flyway V1__initial_schema.sql, migration test, demo seed profile", "28h"],
    ["2.3", "Design system & prototype dark mode (SCRUM-18)", "design-tokens.md, Figma prototype 24 màn hình, states inventory", "40h"],
    ["2.4", "Monorepo tree & scaffold frontend React 19 (SCRUM-19)", "apps/web skeleton, package-lock.json, .nvmrc, .editorconfig", "24h"],
    ["2.5", "Bootstrap Spring Boot 3.5 & health check (SCRUM-20)", "apps/api skeleton, pom.xml, mvnw, profiles, Actuator /health UP", "26h"],
    
    [["3.0", True], ["GIAI ĐOẠN 3: ĐỊNH DANH, VIỆC LÀM & QUẢN TRỊ ADMIN (SPRINT 3)", True], ["Module Auth, Quản lý Job, Taxonomy và Admin Console", True], ["236h", True]],
    ["3.1", "Authentication, RBAC & Google OIDC (SCRUM-21)", "auth module, JWT access, HttpOnly refresh cookie, security tests", "48h"],
    ["3.2", "Màn hình Auth & UX session revocation (SCRUM-22)", "features/auth/*, route guards, accessible forms, responsive layout", "36h"],
    ["3.3", "Job posting API & ownership rule (SCRUM-23)", "jobs module, DTOs, OpenAPI spec, ownership authorization tests", "32h"],
    ["3.4", "Recruiter dashboard & Job management UI (SCRUM-24)", "features/jobs/*, pages/recruiter/*, data table responsive 4 views", "40h"],
    ["3.5", "Skill taxonomy API & seed chuẩn hóa (SCRUM-25)", "skills module, curation guidelines, synonym mapping migration", "24h"],
    ["3.6", "Admin Console & quản trị người dùng (Jira TBD)", "admin module, features/admin/*, audit explorer, role/status mutation", "56h"],
    
    [["4.0", True], ["GIAI ĐOẠN 4: TIẾP NHẬN HỒ SƠ & AI GEMINI EXTRACTION (SPRINT 4)", True], ["Luồng nộp CV, lưu trữ S3 private và adapter Gemini", True], ["188h", True]],
    ["4.1", "Upload CV & lưu trữ an toàn S3 private (SCRUM-26)", "cv module, S3 storage adapter, magic byte validator, retention note", "36h"],
    ["4.2", "Gemini extraction service & structured JSON (SCRUM-27)", "ai module, GeminiClient interface, JSON schema validator, metrics", "48h"],
    ["4.3", "Candidate CV upload UI & async progress (SCRUM-28)", "features/cv-upload/*, dropzone PDF/DOCX, progress/polling states", "36h"],
    ["4.4", "Kiểm thử extraction & AI guardrails (SCRUM-29)", "tests/ai-fixtures, Postman/Newman collection, benchmark 20+ CVs", "32h"],
    ["4.5", "Tích hợp E2E luồng tiếp nhận CV (SCRUM-30)", "End-to-end integration test, correlation ID tracking, sequence doc", "36h"],
    
    [["5.0", True], ["GIAI ĐOẠN 5: ĐỐI CHIẾU KỸ NĂNG, ĐÁNH GIÁ & THÔNG BÁO (SPRINT 5)", True], ["Engine chấm điểm minh bạch, Đánh giá và Dispatch email", True], ["172h", True]],
    ["5.1", "Match scoring engine có giải thích (SCRUM-31)", "matching module, deterministic scoring service, explanation contract", "40h"],
    ["5.2", "Evaluation & recruiter approval API (SCRUM-32)", "evaluations & feedback modules, audit log, draft->approved state", "36h"],
    ["5.3", "Candidate ranking UI & filter minh bạch (SCRUM-33)", "features/ranking/*, ScoreBreakdown drawer, accessible data table", "36h"],
    ["5.4", "Evaluation form & review feedback draft UI (SCRUM-34)", "features/evaluation/*, rubric evaluation form, confirmation dialog", "32h"],
    ["5.5", "Notification email dispatch đã phê duyệt (SCRUM-35)", "notification module, email template, idempotency log, sandbox mail", "28h"],
    
    [["6.0", True], ["GIAI ĐOẠN 6: PHÂN TÍCH, TỐI ƯU HÓA & TỰ ĐỘNG HÓA CI/CD (SPRINT 6)", True], ["Module Analytics, tối ưu truy vấn và pipeline GitHub Actions", True], ["148h", True]],
    ["6.1", "Tối ưu hóa truy vấn CSDL & reporting API (SCRUM-36)", "query analysis report, EXPLAIN indexes migration, summary APIs", "28h"],
    ["6.2", "Analytics dashboard UI trực quan (SCRUM-37)", "features/analytics/*, recruitment funnel, skill distribution charts", "36h"],
    ["6.3", "Dockerfile frontend/backend hardened đa tầng (SCRUM-38)", "apps/web/Dockerfile, apps/api/Dockerfile, non-root runtime images", "24h"],
    ["6.4", "Docker Compose local & staging tách biệt (SCRUM-39)", "infra/docker/compose.dev.yml, compose.prod.yml, runbooks", "24h"],
    ["6.5", "CI/CD GitHub Actions & quality gates (SCRUM-40)", ".github/workflows/ci.yml, staging deploy, Admin security checks", "36h"],
    
    [["7.0", True], ["GIAI ĐOẠN 7: KIỂM THỬ TOÀN DIỆN, BẢO MẬT & GIA CỐ (SPRINT 7)", True], ["Báo cáo kiểm thử đa tầng, rà soát bảo mật và Release Candidate", True], ["180h", True]],
    ["7.1", "Integration & E2E test matrix toàn diện (SCRUM-41)", "docs/qa/test-matrix.md, Testcontainers suites, Playwright E2E", "48h"],
    ["7.2", "Responsive, accessibility & UX test (SCRUM-42)", "docs/qa/responsive-accessibility.md, defect triage log, screenshots", "28h"],
    ["7.3", "Performance/load test k6 & capacity note (SCRUM-43)", "k6 load scripts, p50/p95 latency report, CPU/RAM capacity note", "28h"],
    ["7.4", "Security review OWASP & rate limiting (SCRUM-44)", "threat model, ZAP security scan report, rate limit Gemini/API", "36h"],
    ["7.5", "Bug-fix buffer & gắn tag Release Candidate (SCRUM-45)", "bug board resolved, release candidate tag v1.0.0-rc, go/no-go record", "40h"],
    
    [["8.0", True], ["GIAI ĐOẠN 8: TRIỂN KHAI AWS, NGHIỆM THU & BÀN GIAO (SPRINT 8)", True], ["Hạ tầng AWS demo, tài liệu bàn giao và biên bản đóng dự án", True], ["152h", True]],
    ["8.1", "AWS infrastructure baseline (SCRUM-46)", "infra/aws/runbook.md, private RDS, S3 block public, budget alarm", "36h"],
    ["8.2", "Deploy production, observability AWS (SCRUM-47)", "deployment playbook, CloudWatch alarms, SSM deploy, rollback drill", "32h"],
    ["8.3", "UAT chạy kịch bản & báo cáo chất lượng cuối (SCRUM-48)", "UAT execution log, QA final report, known limitations list", "32h"],
    ["8.4", "User manual, OpenAPI & handover package (SCRUM-49)", "docs/user-manual.pdf, Swagger UI published, handover checklist", "36h"],
    ["8.5", "Nghiệm thu, retrospective & đóng dự án 03/11 (SCRUM-50)", "final closure report, actual cost evidence, lessons learned document", "16h"],
    
    [["TỔNG", True], ["TOÀN BỘ 41 GÓI CÔNG VIỆC DỰ ÁN SMARTRECRUIT", True], ["Hệ thống hoàn chỉnh sẵn sàng bàn giao nghiệm thu", True], ["1.376h", True]]
]
add_table_data(col_w_wbs, headers_wbs, data_wbs, alignments=['C', 'L', 'L', 'C'])

add_h3("Kiểm tra tính tuân thủ Quy tắc 100% và Quy tắc 8/80")
add_bullet([("Quy tắc 100% (Tính bao phủ toàn vẹn): ", True), ("WBS đã bao quát 100% phạm vi công việc cần thiết để hoàn thành MVP SmartRecruit: từ khởi tạo baseline, phân tích yêu cầu (SRS, use cases), thiết kế dữ liệu (ERD, Flyway), phát triển chức năng (Auth, Jobs, CV Intake, Gemini AI, Matching, Analytics, Admin), kiểm thử đa tầng (Unit, Integration, E2E, Load test, Security), cấu hình hạ tầng container/CI-CD và triển khai thực tế trên AWS, cho tới tài liệu bàn giao và nghiệm thu. Không có công việc nào nằm ngoài mục tiêu dự án bị đưa vào và không có yêu cầu bắt buộc nào bị bỏ sót.")])
add_bullet([("Quy tắc 8/80 (Định mức kích thước gói công việc): ", True), ("Tất cả 41 gói công việc cấp thấp nhất đều có định mức giờ công nằm nghiêm ngặt trong khoảng từ 16 giờ đến 56 giờ công (nhỏ nhất là WBS 8.5 với 16h cho buổi nghiệm thu/retrospective; lớn nhất là WBS 3.6 với 56h do bao gồm cả Backend RBAC mutation và giao diện Admin Console neutral-black). Không có công việc nào vượt quá 80 giờ công (tránh rủi ro mất kiểm soát) và không có công việc nào dưới 8 giờ (tránh phân rã quá vụn vặt).")])

add_h3("Cấu trúc phân rã công việc dạng cây (WBS Tree Hierarchy)")
add_p("Cấu trúc cây WBS 3 cấp được tổng hợp theo các phân hệ nghiệp vụ chính như sau:")
tree_lines = [
    "SmartRecruit MVP (SR-2026-MVP)",
    "├── 1.0 Khởi động & Kiến trúc (Sprint 1) ── [1.1 Baseline, 1.2 Backlog, 1.3 SRS, 1.4 Spike Gemini, 1.5 Modular Monolith]",
    "├── 2.0 Nền tảng & Cấu trúc dữ liệu (Sprint 2) ── [2.1 ERD 16 bảng, 2.2 Flyway Schema, 2.3 Design Tokens, 2.4 Scaffold Web, 2.5 Scaffold API]",
    "├── 3.0 Định danh, Việc làm & Quản trị (Sprint 3) ── [3.1 Auth OIDC, 3.2 Auth UI, 3.3 Job API, 3.4 Recruiter Dashboard, 3.5 Skill Taxonomy, 3.6 Admin Console]",
    "├── 4.0 Tiếp nhận hồ sơ & AI Gemini (Sprint 4) ── [4.1 S3 Upload, 4.2 Gemini Extraction, 4.3 Upload UI, 4.4 AI Guardrails Test, 4.5 E2E Intake]",
    "├── 5.0 Đánh giá, Khớp kỹ năng & Thông báo (Sprint 5) ── [5.1 Match Engine, 5.2 Evaluation API, 5.3 Ranking UI, 5.4 Feedback Review UI, 5.5 Email Dispatch]",
    "├── 6.0 Phân tích & Tự động hóa CI/CD (Sprint 6) ── [6.1 Query Optimization, 6.2 Analytics Dashboard, 6.3 Hardened Docker, 6.4 Docker Compose, 6.5 CI/CD Pipeline]",
    "├── 7.0 Kiểm thử toàn diện & Gia cố bảo mật (Sprint 7) ── [7.1 Test Matrix, 7.2 Responsive/A11y, 7.3 Load Test k6, 7.4 OWASP Security, 7.5 Bug-fix Buffer]",
    "└── 8.0 Triển khai AWS & Bàn giao dự án (Sprint 8 & Closeout) ── [8.1 AWS Infra, 8.2 Production Deploy, 8.3 UAT Execution, 8.4 User Manual, 8.5 Closeout 03/11]"
]
for tl in tree_lines:
    add_p(tl, style='Normal', space_after=2, font_size=9.5)

add_h3("Từ điển WBS (WBS Dictionary) cho 3 gói công việc quan trọng nhất")

# Dictionary Table
col_w_dict = [2400, 6960]
headers_dict = ["Thuộc tính từ điển WBS", "Nội dung quy định chi tiết"]

# Dict 1: WBS 3.6
data_dict1 = [
    [["Mã WBS & Tên gói công việc", True], ["WBS 3.6 – Admin Console và quản trị người dùng (Jira TBD - Child of SCRUM-53)", True]],
    ["Mô tả nội dung công việc", "Xây dựng toàn diện giao diện và API cho phân hệ Admin Console tách biệt (sử dụng giao diện neutral-black dark theme). Cho phép Admin quản trị danh sách người dùng, kích hoạt/vô hiệu hóa tài khoản, cập nhật vai trò (CANDIDATE/RECRUITER/ADMIN), quản trị danh mục skill taxonomy và tra cứu nhật ký audit. Admin tuyệt đối không được cấp quyền mặc định xem/tải CV raw hoặc can thiệp sửa kết quả tuyển dụng."],
    ["Sản phẩm bàn giao (Deliverables)", "1. Module backend admin (Controller, Service, Repository, DTOs).\n2. Giao diện frontend features/admin/* (6 màn hình Admin theo token neutral-black).\n3. Bộ API contract OpenAPI cho Admin (/api/v1/admin/*).\n4. Bộ test case kiểm thử phân quyền tiêu cực (Negative Authorization Tests)."],
    ["Tiêu chí hoàn thành (Definition of Done)", "- Phân quyền máy chủ nghiêm ngặt (server-side RBAC); Candidate/Recruiter truy cập nhận mã 403 Forbidden.\n- Mọi thao tác thay đổi role/status bắt buộc nhập lý do (reason), tự động hủy phiên (revoke session) của tài khoản đích và ghi nhật ký audit với traceId.\n- Chặn tuyệt đối hành vi tự nâng quyền (self-escalation) và chặn vô hiệu hóa tài khoản Admin active cuối cùng.\n- Không để lộ thông tin nhạy cảm (CV raw, mật khẩu, JWT token) trên giao diện hoặc payload API."],
    ["Tài nguyên & Người phụ trách", "Owner: Backend Architect + Frontend UI-UX Engineer; Reviewer: Security Reviewer; Giờ công dự kiến: 56h."],
    ["Quan hệ phụ thuộc", "Phụ thuộc hoàn thành: WBS 2.1 (ERD), WBS 2.2 (Flyway), WBS 2.3 (Design tokens), WBS 3.1 (Auth module)."]
]
add_p("Từ điển WBS 1: Gói công việc WBS 3.6 (Admin Console)", bold=True, color="1F4E79")
add_table_data(col_w_dict, headers_dict, data_dict1)

# Dict 2: WBS 4.2
data_dict2 = [
    [["Mã WBS & Tên gói công việc", True], ["WBS 4.2 – Gemini Extraction Service và Structured Output JSON (SCRUM-27)", True]],
    ["Mô tả nội dung công việc", "Triển khai service backend tích hợp mô hình Google Gemini 2.5 Flash thông qua adapter độc lập. Nhận văn bản trích xuất từ file CV (PDFBox/POI), áp dụng kỹ thuật prompt engineering phiên bản hóa kèm JSON Schema định sẵn để trích xuất thông tin kỹ năng, kinh nghiệm, học vấn và cảnh báo rủi ro. Thiết lập cơ chế kiểm soát ngoại lệ, retry tối đa 2 lần, timeout rõ ràng và theo dõi chi phí quota."],
    ["Sản phẩm bàn giao (Deliverables)", "1. Module backend ai (GeminiClient interface, GeminiAdapter, ExtractionValidator).\n2. JSON Schema chuẩn hóa cv-extraction-v1 và bộ prompt versioned (v1).\n3. Cơ chế Mock Gemini Adapter phục vụ kiểm thử cục bộ không tốn chi phí quota.\n4. Bảng ghi nhận metrics thời gian gọi API và ước lượng token sử dụng."],
    ["Tiêu chí hoàn thành (Definition of Done)", "- Dữ liệu AI trả về phải được validate nghiêm ngặt qua JSON Schema; nếu sai schema, gán trạng thái FAILED/HUMAN_REVIEW_REQUIRED, không được bỏ qua âm thầm.\n- Tên model được cấu hình qua biến môi trường GEMINI_MODEL=gemini-2.5-flash, không dùng alias 'latest' trên production.\n- Không lưu toàn bộ văn bản CV raw vào bảng nhật ký để bảo đảm quyền riêng tư.\n- Vượt qua 100% các unit test với Mock Adapter và integration test với test container."],
    ["Tài nguyên & Người phụ trách", "Owner: Backend / AI Integration Engineer; Reviewer: PM / Tech Lead; Giờ công dự kiến: 48h."],
    ["Quan hệ phụ thuộc", "Phụ thuộc hoàn thành: WBS 1.4 (Spike Gemini), WBS 4.1 (S3 Upload CV)."]
]
add_p("Từ điển WBS 2: Gói công việc WBS 4.2 (Gemini Extraction Service)", bold=True, color="1F4E79")
add_table_data(col_w_dict, headers_dict, data_dict2)

# Dict 3: WBS 5.1
data_dict3 = [
    [["Mã WBS & Tên gói công việc", True], ["WBS 5.1 – Match Scoring Engine có giải thích minh bạch (SCRUM-31)", True]],
    ["Mô tả nội dung công việc", "Xây dựng engine tính toán điểm số đối chiếu giữa hồ sơ ứng viên và tiêu chí Job. Thuật toán hoạt động theo nguyên tắc xác định (deterministic rule-based), tính toán độc lập dựa trên trọng số cấu hình: required skills, optional skills, experience và education. Điểm số trả về kèm cấu trúc giải trình chi tiết (Score Explanation Breakdown) gồm kỹ năng khớp, kỹ năng còn thiếu và phiên bản thuật toán."],
    ["Sản phẩm bàn giao (Deliverables)", "1. Module backend matching (MatchingService, ScoreCalculator, ExplanationBuilder).\n2. Tài liệu đặc tả thuật toán ADR về cơ chế tính điểm và trọng số mặc định.\n3. Hợp đồng dữ liệu API trả về điểm tổng hợp và điểm thành phần kèm căn cứ đối chiếu.\n4. Bộ test case kiểm thử biên và kiểm thử hiệu năng."],
    ["Tiêu chí hoàn thành (Definition of Done)", "- Thuật toán mang tính xác định tuyệt đối (cùng input CV và Job phải luôn ra một kết quả score duy nhất, không phụ thuộc tính ngẫu nhiên của AI).\n- Thời gian tính toán cho kịch bản demo 50 ứng viên đạt dưới 2 giây (không tính thời gian gọi mạng bên ngoài).\n- Điểm số và xếp hạng chỉ mang tính chất hỗ trợ gợi ý sàng lọc; nghiêm cấm sử dụng điểm số để tự động loại ứng viên (auto-reject).\n- Đầy đủ unit test đạt độ bao phủ mã nguồn (code coverage) ≥ 90%."],
    ["Tài nguyên & Người phụ trách", "Owner: Backend Architect / Developer; Reviewer: BA / PO; Giờ công dự kiến: 40h."],
    ["Quan hệ phụ thuộc", "Phụ thuộc hoàn thành: WBS 3.3 (Job API), WBS 3.5 (Skill Taxonomy), WBS 4.2 (Gemini Extraction)."]
]
add_p("Từ điển WBS 3: Gói công việc WBS 5.1 (Match Scoring Engine)", bold=True, color="1F4E79")
add_table_data(col_w_dict, headers_dict, data_dict3)

print("Finished Section 7 (Bài 2).")

# ==================== SECTION 8: BÀI 3 - PERT & LỊCH DỰ ÁN ====================
print("Writing Section 8: Bài 3 - PERT & Lịch...")
add_h1("8. Phần D – Bài 3: Ước lượng, lịch dự án và đường găng (30 phút)")
add_p("Yêu cầu: Ước lượng thời gian bằng PERT ba điểm (O – M – P) với trợ lý Gemini AI gói Pro, xác định quan hệ phụ thuộc, tính đường găng và kiểm tra lịch có đáp ứng thời hạn 08 Sprint (kết thúc trước 03/11) không.")

prompt_d = [
    "Dùng WBS trong Knowledge, hãy chọn 15 hoạt động chính đại diện cho chuỗi giá trị phát triển của SmartRecruit từ Sprint 1 đến ngày đóng dự án 03/11. Với mỗi hoạt động hãy đưa ra: Mã hoạt động | Tên hoạt động | Hoạt động tiên quyết | O (Lạc quan) | M (Khả năng cao nhất) | P (Bi quan) | Thời gian kỳ vọng TE = (O + 4M + P)/6 (đơn vị: ngày làm việc). Sau đó tính toán tiến trình xuôi/ngược (ES, EF, LS, LF, Slack), xác định đường găng (Critical Path), tổng thời gian dự án và độ lệch chuẩn của đường găng. Trình bày chi tiết từng bước tính và so sánh với hạn định 40 ngày làm việc (08 Sprint)."
]
add_callout("Prompt mẫu cho Bài 3", prompt_d)

note_d = [
    "Lưu ý cho sinh viên: Mặc dù Gemini AI gói Pro có khả năng suy luận logic vượt trội, mô hình ngôn ngữ vẫn có thể tính sai số học, nhầm lẫn công thức làm tròn hoặc xác định chưa tối ưu độ trễ Slack. Toàn bộ bảng tính toán dưới đây BẮT BUỘC phải được nhóm lập công thức và kiểm tra chéo bằng Microsoft Excel/Google Sheets – đây là tiêu chuẩn chấm điểm bắt buộc."
]
add_callout("Lưu ý kiểm tra số học", note_d)

add_p("Nhóm tự thực hiện:", bold=True)
add_bullet("Tính toán độc lập bằng Excel các chỉ số TE, ES, EF, LS, LF, Slack và độ lệch chuẩn sigma; đối chiếu từng dòng với kết quả đề xuất của Gemini AI gói Pro để phát hiện sai lệch.")
add_bullet("Xác định chính xác đường găng và đánh giá rủi ro trễ hạn của các hoạt động không nằm trên đường găng.")
add_bullet("Đề xuất và phân tích định lượng hai phương án xử lý nén tiến độ: Crashing (tăng cường nguồn lực) và Fast-tracking (chuyển giao đoạn gối đầu song song).")

add_h2("KẾT QUẢ THỰC HIỆN BÀI 3: BẢNG ƯỚC LƯỢNG PERT VÀ PHÂN TÍCH ĐƯỜNG GĂNG (CPM)")
add_p("Nhóm [Nhóm 03] đã lựa chọn 15 hoạt động kỹ thuật cốt lõi xâu chuỗi toàn bộ vòng đời phát triển của SmartRecruit. Thời gian ước lượng tính theo ngày làm việc chuẩn (1 ngày = 8 giờ làm việc của nhóm):")

# PERT Table
col_w_pert = [800, 3600, 1100, 600, 600, 600, 1060, 1000]
headers_pert = ["Mã", "Tên hoạt động kỹ thuật", "Tiên quyết", "O", "M", "P", "TE (ngày)", "Var (σ²)"]
data_pert = [
    ["A", "WBS 1.1: Khởi động dự án & khóa baseline kỹ thuật", "-", "1", "2", "3", "2.00", "0.111"],
    ["B", "WBS 1.2-1.3: Phân tích yêu cầu, SRS & State machine", "A", "2", "3", "4", "3.00", "0.111"],
    ["C", "WBS 1.4: Spike Gemini: trích xuất cấu trúc & guardrail", "A", "2", "3", "4", "3.00", "0.111"],
    ["D", "WBS 1.5: Thiết kế kiến trúc Modular Monolith & ADR", "B, C", "1", "2", "3", "2.00", "0.111"],
    ["E", "WBS 2.1-2.2: Thiết kế ERD 16 bảng & Schema Flyway", "D", "2", "3", "4", "3.00", "0.111"],
    ["F", "WBS 2.3-2.4: Design system UI & Scaffold Web/API", "D", "2", "3", "4", "3.00", "0.111"],
    ["G", "WBS 3.1 & 3.6: Auth RBAC (Google OIDC) & Admin API", "E, F", "3", "5", "7", "5.00", "0.444"],
    ["H", "WBS 3.3-3.5: Job posting API, Recruiter UI & Taxonomy", "G", "2", "4", "6", "4.00", "0.444"],
    ["I", "WBS 4.1-4.2: Upload CV S3 private & Gemini Adapter", "G", "3", "5", "7", "5.00", "0.444"],
    ["J", "WBS 4.3-4.5: Candidate CV Intake UI & End-to-End", "H, I", "2", "3", "4", "3.00", "0.111"],
    ["K", "WBS 5.1-5.2: Match Scoring Engine & Evaluation API", "J", "3", "4", "5", "4.00", "0.111"],
    ["L", "WBS 5.3-5.5: Ranking UI, Feedback Review & Email", "K", "2", "3", "4", "3.00", "0.111"],
    ["M", "WBS 6.3-6.5: Docker hardening, Compose & CI/CD", "L", "2", "3", "4", "3.00", "0.111"],
    ["N", "WBS 7.1 & 7.4: Integration/E2E QA & Security Review", "M", "2", "3", "4", "3.00", "0.111"],
    ["P", "WBS 8.1-8.5: AWS Deploy, Observability & UAT Handover", "N", "2", "3", "4", "3.00", "0.111"]
]
add_table_data(col_w_pert, headers_pert, data_pert, alignments=['C', 'L', 'C', 'C', 'C', 'C', 'C', 'C'])

add_h3("Bảng tính toán tiến trình Forward / Backward Pass và xác định Đường găng")
add_p("Áp dụng phương pháp CPM tính toán thời gian bắt đầu sớm (ES), kết thúc sớm (EF), bắt đầu muộn (LS), kết thúc muộn (LF) và độ trễ toàn phần Slack = LS - ES:")

col_w_cpm = [800, 3600, 900, 800, 800, 800, 800, 860, 800]
headers_cpm = ["Mã", "Tên hoạt động", "TE", "ES", "EF", "LS", "LF", "Slack", "Găng?"]
data_cpm = [
    [["A", True], "Khởi động dự án & khóa baseline", "2.0", "0.0", "2.0", "0.0", "2.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["B", True], "Phân tích yêu cầu, SRS & State machine", "3.0", "2.0", "5.0", "2.0", "5.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["C", True], "Spike Gemini: trích xuất cấu trúc", "3.0", "2.0", "5.0", "2.0", "5.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["D", True], "Thiết kế kiến trúc Modular Monolith", "2.0", "5.0", "7.0", "5.0", "7.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["E", True], "Thiết kế ERD 16 bảng & Flyway", "3.0", "7.0", "10.0", "7.0", "10.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["F", True], "Design system UI & Scaffold Web/API", "3.0", "7.0", "10.0", "7.0", "10.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["G", True], "Auth RBAC (OIDC) & Admin API", "5.0", "10.0", "15.0", "10.0", "15.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    ["H", "Job posting API, Recruiter UI & Taxonomy", "4.0", "15.0", "19.0", "16.0", "20.0", "1.0", "Không"],
    [["I", True], "Upload CV S3 & Gemini Extraction", "5.0", "15.0", "20.0", "15.0", "20.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["J", True], "Candidate CV Intake UI & End-to-End", "3.0", "20.0", "23.0", "20.0", "23.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["K", True], "Match Scoring Engine & Evaluation API", "4.0", "23.0", "27.0", "23.0", "27.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["L", True], "Ranking UI, Feedback Review & Email", "3.0", "27.0", "30.0", "27.0", "30.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["M", True], "Docker hardening, Compose & CI/CD", "3.0", "30.0", "33.0", "30.0", "33.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["N", True], "Integration/E2E QA & Security Review", "3.0", "33.0", "36.0", "33.0", "36.0", "0.0", ["CÓ", True, False, "1F4E79"]],
    [["P", True], "AWS Deploy, Observability & UAT Handover", "3.0", "36.0", "39.0", "36.0", "39.0", "0.0", ["CÓ", True, False, "1F4E79"]]
]
add_table_data(col_w_cpm, headers_cpm, data_cpm, alignments=['C', 'L', 'C', 'C', 'C', 'C', 'C', 'C', 'C'])

add_h3("Kết luận phân tích Đường găng và Xác suất hoàn thành")
add_bullet([("Xác định Đường găng (Critical Path): ", True), ("Đường găng của dự án bao gồm chuỗi các hoạt động có độ trễ toàn phần bằng 0 (Slack = 0): ", False), ("A → B → C → D → E → F → G → I → J → K → L → M → N → P", True, False, "1F4E79"), (". Duy nhất hoạt động H (WBS 3.3-3.5: Job API & Recruiter UI) có độ trễ Slack = 1.0 ngày (có thể bắt đầu chậm 1 ngày mà không làm ảnh hưởng tiến độ chung).")])
add_bullet([("Tổng thời gian kỳ vọng của dự án: ", True), ("TE_project = 39.0 ngày làm việc", True), (" (tương đương 7.8 tuần làm việc). So với quỹ thời gian 08 Sprint (8 tuần × 5 ngày = 40 ngày làm việc), dự án có biên độ an toàn dự phòng là 1.0 ngày làm việc trước khi bước vào ngày nghiệm thu chính thức 03/11/2026 (ngày thứ 41).")])
add_bullet([("Phương sai và Độ lệch chuẩn của đường găng: ", True), ("Phương sai đường găng: σ²_CP = 0.111 + 0.111 + 0.111 + 0.111 + 0.111 + 0.111 + 0.444 + 0.444 + 0.111 + 0.111 + 0.111 + 0.111 + 0.111 + 0.111 = ", False), ("2.222", True), ("; Độ lệch chuẩn: σ_CP = √2.222 ≈ ", False), ("1.49 ngày làm việc", True), (".")])
add_bullet([("Xác suất hoàn thành đúng hạn 40 ngày làm việc (08 Sprint): ", True), ("Chỉ số Z = (40 – 39.0) / 1.49 = ", False), ("+0.67", True), (". Tra bảng phân phối chuẩn tắc: P(Z ≤ 0.67) ≈ ", False), ("74.86%", True), (".")])
add_bullet([("Xác suất hoàn thành tính đến ngày mốc đóng dự án 03/11/2026 (ngày 41): ", True), ("Chỉ số Z = (41 – 39.0) / 1.49 = ", False), ("+1.34", True), (". Tra bảng phân phối chuẩn: P(Z ≤ 1.34) ≈ ", False), ("90.99%", True), (" -> Dự án có độ tin cậy rất cao (>90%) để kịp tiến độ nghiệm thu chính thức trước Hội đồng.")])

add_h3("Đề xuất và so sánh phương án xử lý nén tiến độ: Crashing vs Fast-tracking")
add_p("Trong trường hợp phát sinh biến cố kỹ thuật làm kéo dài các công việc trên đường găng (ví dụ: lỗi tích hợp Gemini API ở hoạt động I hoặc lỗi kiểm thử bảo mật ở hoạt động N), nhóm đã chuẩn bị sẵn 2 kịch bản ứng phó:")
add_bullet([("Phương án 1: Fast-tracking (Làm song song gối đầu): ", True), ("Cho phép tiến hành song song các hoạt động vốn có quan hệ phụ thuộc tuần tự. Cụ thể: Bắt đầu phát triển giao diện nộp hồ sơ CV (WBS 4.3 thuộc J) dựa trên hợp đồng Mock API ngay khi hoạt động I (Upload S3 & Gemini adapter) mới hoàn thành 50%, không đợi I hoàn tất 100%. Đánh giá: Không làm phát sinh thêm chi phí tài chính nhưng gia tăng rủi ro phải sửa lại giao diện (rework) nếu API contract có thay đổi đột xuất.")])
add_bullet([("Phương án 2: Crashing (Nén tiến độ bằng bổ sung nguồn lực): ", True), ("Tập trung toàn bộ nhân lực của nhóm để tăng ca (overtime) hoặc áp dụng kỹ thuật lập trình cặp (Pair-programming) vào các công việc găng có độ phức tạp cao, đặc biệt là hoạt động I (WBS 4.2 Gemini) và hoạt động N (WBS 7.1/7.4 Test & Security). Đánh giá: Giúp rút ngắn chắc chắn thời gian từ 1–2 ngày làm việc nhưng làm tăng áp lực làm việc của thành viên và có thể phát sinh chi phí phụ cấp/văn phòng phẩm nhóm.")])
add_bullet([("Kết luận lựa chọn của nhóm: ", True), ("Ưu tiên áp dụng Fast-tracking có kiểm soát thông qua cơ chế Mock Service và hợp đồng OpenAPI chuẩn hóa từ Sprint 4; chỉ áp dụng Crashing ở Sprint 7 nếu tỷ lệ lỗi tồn đọng (bug backlog) vượt quá 10 defect nghiêm trọng.")])

print("Finished Section 8 (Bài 3).")

# ==================== SECTION 9: BÀI 4 - RISK REGISTER ====================
print("Writing Section 9: Bài 4 - Risk Register...")
add_h1("9. Phần E – Bài 4: Quản lý chi phí & Quản lý rủi ro (20 phút)")
add_p("Yêu cầu: Lập Risk Register với tối thiểu 8–10 rủi ro thực tế thuộc các nhóm: kỹ thuật, con người, khách hàng/yêu cầu, bên ngoài (hạ tầng, chi phí, nhà cung cấp).")

prompt_e = [
    "Lập Risk Register cho dự án SmartRecruit gồm 10 rủi ro thực tế, trình bày dạng bảng chi tiết: ID | Mô tả rủi ro (Nguyên nhân – Sự kiện – Hậu quả) | Nhóm rủi ro | Xác suất (P: 1–5) | Tác động (I: 1–5) | Điểm rủi ro = P × I | Chiến lược ứng phó (Tránh/Chuyển/Giảm/Chấp nhận) | Hành động ứng phó cụ thể | Người phụ trách. Sắp xếp bảng theo Điểm rủi ro giảm dần. Đánh dấu rõ 2 rủi ro thực chiến nhóm tự bổ sung từ kinh nghiệm lập trình. Vẽ ma trận rủi ro 5×5 và lập kế hoạch dự phòng chi tiết cho rủi ro có điểm số cao nhất."
]
add_callout("Prompt mẫu cho Bài 4", prompt_e)

add_p("Nhóm tự thực hiện:", bold=True)
add_bullet("Bổ sung ít nhất 2 rủi ro kỹ thuật chuyên sâu mà Gemini AI gói Pro thường bỏ sót (liên quan đến upload file độc hại và cơ chế vô hiệu hóa session khi đổi quyền Admin).")
add_bullet("Thiết lập ma trận xác suất – tác động (5×5) và định vị chính xác vị trí của từng mã rủi ro.")
add_bullet("Viết kế hoạch dự phòng (Contingency Plan) chi tiết, cụ thể cho rủi ro có điểm số cao nhất.")

add_h2("KẾT QUẢ THỰC HIỆN BÀI 4: SỔ ĐĂNG KÝ RỦI RO (RISK REGISTER) VÀ MA TRẬN RỦI RO")
add_p("Dưới đây là bảng Risk Register hoàn chỉnh gồm 10 rủi ro thực tế của dự án SmartRecruit, sắp xếp thứ tự ưu tiên theo điểm số rủi ro:")

col_w_risk = [600, 2400, 1100, 500, 500, 600, 960, 1800, 900]
headers_risk = ["ID", "Mô tả rủi ro (Nguyên nhân – Sự kiện – Hậu quả)", "Nhóm", "P", "I", "Điểm", "Chiến lược", "Hành động ứng phó cụ thể", "Phụ trách"]
data_risk = [
    ["R01", "Do chạy vòng lặp test tự động hoặc bị spam gọi API trích xuất CV -> Vượt hạn mức Quota Gemini và phát sinh phí AWS quá mức -> Ngân sách chi phí trực tiếp bị cạn kiệt, tài khoản đám mây bị tạm khóa.", "Chi phí / Hạ tầng", "4", "4", [["16", True, False, "DC2626"]], "Giảm thiểu (Mitigate)", "Cài đặt AWS Budget Alarm ở mức 70% định mức chi phí trực tiếp; thiết lập hard-limit quota trên Google Cloud Console; dùng Mock Adapter khi chạy test cục bộ và CI.", "DevOps + PM"],
    ["R02", "Do cấu hình nhầm quyền S3 bucket hoặc ghi log chứa dữ liệu thô -> Rò rỉ thông tin cá nhân (PII) và file CV ứng viên ra ngoài -> Vi phạm nghiêm trọng luật bảo vệ dữ liệu và mất uy tín dự án.", "Bảo mật / Pháp lý", "3", "5", [["15", True, False, "DC2626"]], "Tránh (Avoid)", "Bật S3 Block Public Access tuyệt đối; mã hóa SSE-S3; lọc bỏ PII trong log; chỉ trả link truy cập dạng presigned URL có thời hạn ngắn khi đã xác thực.", "Backend + Security"],
    ["R03", "Do thiếu sót test case kiểm thử phân quyền Admin -> Lỗ hổng cho phép người dùng tự nâng quyền (Self-escalation) hoặc khóa Admin cuối cùng -> Hệ thống mất kiểm soát phân quyền.", "Kỹ thuật / Bảo mật", "3", "5", [["15", True, False, "DC2626"]], "Tránh (Avoid)", "Viết bộ test case phân quyền tiêu cực (Negative Authorization Tests) trong CI; kiểm tra máy chủ nghiêm ngặt; chặn khóa tài khoản Admin duy nhất.", "Backend + QA"],
    ["R04", "Do phụ thuộc dịch vụ Google Gemini bên ngoài -> Dịch vụ AI bị quá tải, phản hồi chậm (>10s) hoặc trả JSON sai định dạng -> Luồng nộp hồ sơ bị tắc nghẽn, ứng viên không thấy kết quả.", "Kỹ thuật / AI", "4", "3", [["12", True, False, "D97706"]], "Giảm thiểu (Mitigate)", "Xử lý trích xuất bất đồng bộ (Async queue); thiết lập timeout 8s, retry tối đa 2 lần; nếu lỗi gán trạng thái FAILED và thông báo Recruiter xử lý thủ công.", "Backend (AI)"],
    ["R05", "Do các thành viên cập nhật tiến độ không đều trên Jira board -> Kế hoạch WBS thực tế bị sai lệch với trạng thái Jira -> PM không nắm được tiến độ thật, phát sinh nghẽn ngầm.", "Quy trình / Con người", "4", "3", [["12", True, False, "D97706"]], "Giảm thiểu (Mitigate)", "Tổ chức Daily Standup 10 phút đầu ngày; quy định Definition of Done bắt buộc cập nhật Jira trước khi merge PR; PM đối soát WBS hàng tuần.", "PM / Tech Lead"],
    ["R06", "Do cấu hình mạng VPC, Security Group hoặc SSM trên AWS bị lỗi -> Môi trường demo không thể kết nối tới cơ sở dữ liệu RDS private -> Buổi demo báo cáo bị gián đoạn, thất bại.", "Hạ tầng / Bên ngoài", "3", "4", [["12", True, False, "D97706"]], "Giảm thiểu (Mitigate)", "Viết runbook triển khai chi tiết từng bước; diễn tập deploy và rollback trên staging từ Sprint 6; không mở cổng RDS ra Internet công cộng.", "DevOps Cloud"],
    ["R07", "Do đội ngũ sinh viên 6 người phải gánh 41 WBS tasks trong 8 tuần -> Thành viên bị quá tải (burnout), dẫn tới giảm chất lượng mã nguồn hoặc trễ hạn -> Trễ tiến độ phát hành chung.", "Con người / Nhân lực", "4", "3", [["12", True, False, "D97706"]], "Giảm thiểu (Mitigate)", "Phân bổ khối lượng theo quy tắc 8/80; ưu tiên các task Must-have; cắt giảm tính năng Should-have/Could-have nếu phát hiện trễ tiến độ găng.", "Toàn đội (All)"],
    ["R08", "Do nhà tuyển dụng ỷ lại vào điểm số AI -> Tự động từ chối hồ sơ mà không đọc lại CV -> Vi phạm nguyên tắc đạo đức AI và bỏ sót nhân tài phù hợp.", "Sản phẩm / Đạo đức", "2", "5", [["10", True, False, "D97706"]], "Tránh (Avoid)", "Khóa tính năng tự động từ chối trên hệ thống; mọi quyết định thay đổi trạng thái Reject/Interview bắt buộc phải do Recruiter click duyệt có audit log.", "BA / PO + Backend"],
    ["R09 (*)", "Do ứng viên tải lên file PDF/DOCX chứa mã độc hoặc macro tấn công hệ thống -> Máy chủ xử lý file bị chiếm quyền điều khiển -> Hư hỏng hệ thống và mất an toàn thông tin.", "Kỹ thuật / Bảo mật", "2", "4", [["8", True, False, "16A34A"]], "Giảm thiểu (Mitigate)", "Validate tệp đa tầng: giới hạn dung lượng ≤ 10MB, kiểm tra magic bytes thực tế thay vì tin đuôi file; chạy tiến trình parse văn bản trong sandbox non-root.", "Backend Reviewer"],
    ["R10 (*)", "Do Admin thay đổi Role/Status của User nhưng phía Client vẫn còn JWT token cũ còn hạn -> User vẫn thao tác được các tính năng trái quyền trong thời gian token chưa hết hạn.", "Kỹ thuật / Auth", "3", "3", [["9", True, False, "16A34A"]], "Giảm thiểu (Mitigate)", "Thiết lập cơ chế Revoke Session tức thì tại máy chủ khi Admin mutate quyền; giảm thời gian sống của Access Token xuống 15 phút kèm refresh xoay vòng.", "Backend Architect"]
]
add_table_data(col_w_risk, headers_risk, data_risk, alignments=['C', 'L', 'L', 'C', 'C', 'C', 'L', 'L', 'L'])
add_p("Ghi chú: (*) R09 và R10 là 2 rủi ro thực chiến do nhóm tự phân tích và bổ sung dựa trên đặc thù kỹ thuật của SmartRecruit, không phụ thuộc vào gợi ý ban đầu của Gemini AI gói Pro.", italic=True, font_size=10, color="595959")

add_h3("Ma trận xác suất – tác động (5×5 Probability - Impact Matrix)")
add_p("Phân bổ 10 rủi ro trên ma trận đánh giá rủi ro 5 cấp độ:")

col_w_mat = [1800, 1512, 1512, 1512, 1512, 1512]
headers_mat = ["Xác suất (P)", "1 - Rất thấp", "2 - Thấp", "3 - Trung bình", "4 - Cao", "5 - Nghiêm trọng"]
data_mat = [
    ["5 - Rất cao", "-", "-", "-", "-", "-"],
    ["4 - Cao", "-", "-", "R04 (12), R05 (12), R07 (12)", [["R01 (16)", True, False, "DC2626"]], "-"],
    ["3 - Trung bình", "-", "-", "R10 (*) (9)", "R06 (12)", [["R02 (15), R03 (15)", True, False, "DC2626"]]],
    ["2 - Thấp", "-", "-", "-", "R09 (*) (8)", "R08 (10)"],
    ["1 - Rất thấp", "-", "-", "-", "-", "-"]
]
add_table_data(col_w_mat, headers_mat, data_mat, alignments=['L', 'C', 'C', 'C', 'C', 'C'])

add_h3("Kế hoạch dự phòng chi tiết (Contingency Plan) cho rủi ro điểm cao nhất: R01 (Quota Gemini & Chi phí AWS)")
add_bullet([("Điều kiện kích hoạt (Trigger Event): ", True), ("Khi hóa đơn tích lũy dịch vụ AWS và Gemini API vượt ngưỡng 900.000 VNĐ (khoảng 70% chi phí trực tiếp) trước tuần thứ 4, hoặc số lượng token Gemini tiêu thụ trong 1 ngày vượt quá 100.000 tokens mà không rõ nguyên nhân.")])
add_bullet([("Quy trình phản ứng nhanh trong 2 giờ đầu: ", True), ("(1) DevOps lập tức kiểm tra nhật ký gọi API trên CloudWatch và Google AI Studio để cô lập nguồn gọi; (2) Tạm thời kích hoạt cờ feature flag chuyển toàn bộ môi trường dev/test sang sử dụng Mock Adapter có sẵn dữ liệu fixture; (3) Hủy các tài nguyên AWS EC2/RDS dung lượng cao không cần thiết hoặc tắt máy chủ ngoài giờ làm việc.")])
add_bullet([("Giải pháp thay thế dài hạn: ", True), ("Chuyển đổi sang mô hình Gemini Flash Lite với chi phí rẻ hơn 50%; áp dụng cơ chế cache kết quả trích xuất cho các file mẫu trùng lặp; chỉ gửi tối đa 1.000 từ quan trọng trong CV thay vì gửi toàn bộ văn bản dài.")])
add_bullet([("Trách nhiệm thực thi: ", True), ("DevOps Cloud Engineer chịu trách nhiệm hạ tầng; PM chịu trách nhiệm thông báo và xin ý kiến phê duyệt ngân sách bổ sung từ Sponsor nếu tình huống khẩn cấp.")])

print("Finished Section 9 (Bài 4).")

# ==================== SECTION 10: BÀI 5 - PHẢN BIỆN AI ====================
print("Writing Section 10: Bài 5 - Phản biện AI...")
add_h1("10. Phần F – Bài 5: Kiểm tra phản biện đầu ra Gemini AI gói Pro & Quản lý chất lượng dự án (15 phút)")
add_p("Mở chat mới “Bai5_PhanBien” và yêu cầu Gemini AI gói Pro đóng vai nhà tài trợ dự án (Sponsor) khó tính để chất vấn kế hoạch:")

prompt_f = [
    "Hãy đóng vai Nhà tài trợ dự án (Sponsor / Giám đốc kỹ thuật) cực kỳ khó tính và giàu kinh nghiệm. Hãy đọc kỹ toàn bộ Project Charter, WBS 3 cấp, bảng tiến độ PERT/CPM và Risk Register của dự án SmartRecruit trong Knowledge, sau đó đặt ra 5 câu hỏi chất vấn hóc búa nhất về tính khả thi của kế hoạch (tập trung vào thời gian 08 Sprint, rủi ro ngân sách 33.052.000 VNĐ, áp lực nhân lực 6 người, đạo đức AI và bảo mật Admin RBAC)."
]
add_callout("Prompt mẫu cho Bài 5", prompt_f)

add_p("Nhóm tự thực hiện:", bold=True)
add_bullet("Sinh viên tự viết toàn bộ câu trả lời giải trình cho 5 câu hỏi chất vấn (tuyệt đối không nhờ Gemini AI gói Pro làm hộ) và ghi vào báo cáo.")
add_bullet("Thực hiện phần phản tư (Reflection) sâu sắc về vai trò của Gemini AI gói Pro trong quản lý dự án phần mềm.")

add_h2("KẾT QUẢ THỰC HIỆN BÀI 5: TRẢ LỜI CHẤT VẤN CỦA SPONSOR VÀ PHẦN PHẢN TƯ QUẢN TRỊ")
add_p("Dưới đây là 5 câu hỏi chất vấn khó tính từ góc nhìn Sponsor và phần giải trình đầy đủ căn cứ kỹ thuật của nhóm [Nhóm 03]:")

qa_pairs = [
    ("Câu hỏi 1 (Về tính khả thi của lịch trình): “Dự án có tới 41 gói công việc kỹ thuật nhưng các bạn chỉ lên lịch gói gọn trong 08 Sprint (khoảng 8 tuần làm việc). Đội ngũ sinh viên vừa học vừa làm, lại phải tiếp cận nhiều công nghệ mới như Java 21, Spring Boot 3.5, React 19 và Gemini SDK. Cơ sở thực tế nào chứng minh các bạn không bị vỡ trận tiến độ?”",
     "Trả lời giải trình của nhóm: Nhóm hoàn toàn ý thức được áp lực thời gian của 08 Sprint. Tuy nhiên, tính khả thi của lịch trình được bảo đảm bởi 3 căn cứ kỹ thuật vững chắc:\n1. Phân định ranh giới phạm vi nghiêm ngặt: Nhóm kiên quyết giữ mô hình MVP Modular Monolith, loại bỏ toàn bộ các tính năng phức tạp như native app, OCR viết tay hay tích hợp HRIS ra ngoài phạm vi (Out-of-scope).\n2. Chiến lược kiến trúc giảm tải: Chúng tôi sử dụng Spring Boot BOM chuẩn, React Hook Form + Zod và Flyway migration để tự động hóa toàn bộ công việc lặp lại. Việc kiểm thử PERT cho thấy tổng thời gian găng là 39 ngày, nằm trong hạn định 40 ngày làm việc với xác suất thành công đạt 74.86% (và đạt 90.99% trước ngày đóng dự án 03/11).\n3. Cơ chế kiểm soát tiến độ Agile: Nhóm chia đều 41 task thành các gói nhỏ tuân thủ quy tắc 8/80 (không gói nào quá 56 giờ), tổ chức Daily Standup 10 phút và chuẩn bị sẵn kế hoạch Fast-tracking gối đầu bằng Mock API từ Sprint 4."),
     
    ("Câu hỏi 2 (Về ngân sách 33.052.000 VNĐ và rủi ro vượt chi phí): “Dự toán tổng ngân sách là 33.052.000 VNĐ, trong đó phần chi phí trực tiếp cho hạ tầng đám mây và API Gemini là 1.300.000 VNĐ. Nếu trong quá trình chạy kiểm thử tải hoặc do lỗi lặp vô hạn khiến hóa đơn đám mây tăng vọt vượt hạn mức này, ai sẽ là người chịu trách nhiệm chi trả?”",
     "Trả lời giải trình của nhóm: Nhóm đã thiết lập cơ chế khóa van an toàn kỹ thuật (Technical Cost Guardrails) ba tầng để ngăn chặn triệt để rủi ro này:\n1. Tầng máy chủ: Chúng tôi phát triển Mock Adapter cho Gemini API; toàn bộ quá trình phát triển tính năng, unit test và CI chỉ chạy trên dữ liệu giả lập (mock fixtures), tuyệt đối không gọi API thật tốn phí.\n2. Tầng cảnh báo hạ tầng: Cấu hình AWS CloudWatch Budgets với ngưỡng báo động tự động gửi email và tin nhắn khi chi phí đạt 70% (7.000.000 VNĐ) và tự động ngắt các tài nguyên phụ khi chạm ngưỡng 90%.\n3. Quỹ dự phòng: Trong cơ cấu ngân sách 33.052.000 VNĐ, nhóm đã để riêng 1.512.000 VNĐ làm quỹ dự phòng rủi ro (Contingency Reserve). Nếu chi phí trực tiếp chạm ngưỡng 70%, PM sẽ chủ động họp với Sponsor để xin ý kiến tối ưu hóa thay vì âm thầm để phát sinh vượt định mức."),

    ("Câu hỏi 3 (Về thẩm quyền của Admin Console): “Tại sao trong bản đặc tả các bạn lại tước bỏ quyền xem CV raw và quyền sửa điểm tuyển dụng của tài khoản Admin? Liệu điều này có làm giảm quyền lực quản trị của hệ thống không?”",
     "Trả lời giải trình của nhóm: Đây là một quyết định kiến trúc và quản trị có chủ đích dựa trên nguyên tắc An toàn thông tin tối thiểu quyền (Least Privilege) và quy định bảo vệ dữ liệu cá nhân:\n1. Tách biệt trách nhiệm (Separation of Concerns): Admin là quản trị viên kỹ thuật (quản lý user, taxonomy, phân quyền và cấu hình hệ thống), không phải là chuyên viên nhân sự (Recruiter). Việc ngăn Admin xem CV raw nhằm bảo vệ tính riêng tư của ứng viên và ngăn ngừa hành vi lạm quyền xem thông tin nhạy cảm.\n2. Tính khách quan tuyển dụng: Điểm số và đánh giá là nghiệp vụ chuyên môn của Recruiter. Nếu Admin có thể sửa đổi điểm số mà không có căn cứ chuyên môn, quy trình tuyển dụng sẽ mất đi tính minh bạch và công bằng.\n3. Tính toàn vẹn: Mọi thao tác quản trị của Admin (đổi role/status) đều bắt buộc nhập lý do, tự động hủy phiên và lưu vết audit log không thể sửa đổi."),

    ("Câu hỏi 4 (Về rủi ro đạo đức và tính chính xác của AI): “Các mô hình ngôn ngữ lớn (LLM) như Gemini 2.5 Flash luôn có tỷ lệ bịa đặt (hallucination) nhất định. Nếu AI trích xuất sai kỹ năng khiến một ứng viên giỏi bị chấm điểm thấp và mất cơ hội việc làm, ai sẽ chịu trách nhiệm?”",
     "Trả lời giải trình của nhóm: Hệ thống SmartRecruit được thiết kế loại bỏ hoàn toàn rủi ro này nhờ triết lý Human-in-the-loop:\n1. AI chỉ là công cụ trích xuất và gợi ý: AI không bao giờ được cấp quyền đưa ra quyết định tuyển dụng hay tự động gửi email từ chối ứng viên. Điểm số khớp kỹ năng được tính bằng thuật toán xác định (deterministic rule-based) minh bạch, không phải điểm số ngẫu nhiên do AI phán xét.\n2. Quyền can thiệp của Recruiter: Giao diện Recruiter luôn hiển thị bảng giải trình chi tiết (Score Explanation Breakdown) gồm các bằng chứng trích xuất từ CV. Recruiter bắt buộc phải đọc lại, có toàn quyền ghi đè (override) điểm số trước khi lưu bản đánh giá.\n3. Tiêu chuẩn đánh giá: Nhóm đặt tiêu chí chất lượng trích xuất ≥ 85% trên 20+ CV mẫu kiểm thử, đồng thời có cờ cảnh báo 'needsHumanReview' nếu phát hiện hồ sơ thiếu thông tin."),

    ("Câu hỏi 5 (Về tính bền vững khi bàn giao): “Sau ngày nghiệm thu 03/11, nhóm sinh viên giải tán. Nếu doanh nghiệp hoặc Nhà trường muốn tiếp quản hệ thống để chạy thật thì làm sao duy trì khi không còn các bạn hỗ trợ?”",
     "Trả lời giải trình của nhóm: Khả năng chuyển giao (Maintainability & Handover) đã được nhóm chuẩn bị ngay từ Sprint 1:\n1. Tài liệu hóa chuẩn công nghiệp: Dự án sở hữu đầy đủ bộ tài liệu kiến trúc C4, các quyết định kiến trúc quan trọng (ADR 0001–0004), tài liệu API OpenAPI (Swagger) cập nhật tự động và tài liệu hướng dẫn vận hành (Runbook) chi tiết từng câu lệnh.\n2. Đóng gói chuẩn mực: Ứng dụng được container hóa hoàn toàn qua Dockerfile hardened đa tầng và cấu hình Docker Compose chuẩn, bảo đảm một kỹ sư mới có thể khởi chạy toàn bộ hệ thống chỉ với một câu lệnh.\n3. Bàn giao trách nhiệm rõ ràng: Tại cột mốc WBS 8.4 và 8.5, nhóm bàn giao toàn bộ kho mã nguồn GitHub, tài khoản đám mây AWS đã dọn dẹp, và tổ chức 1 buổi chuyển giao kỹ thuật trực tiếp cho đội ngũ kế thừa.")
]

for q_title, q_ans in qa_pairs:
    add_p(q_title, bold=True, color="1F4E79")
    for ans_p in q_ans.split('\n'):
        if ans_p.strip():
            add_p(ans_p.strip(), space_after=3)
    add_p("", space_after=3)

add_h3("Phần phản tư về vai trò của Gemini AI gói Pro trong Quản lý dự án phần mềm (Reflection)")
add_p("Qua toàn bộ quá trình thực hành thiết lập và tương tác với trợ lý AI (Gemini AI gói Pro) cho dự án SmartRecruit, nhóm [Nhóm 03] rút ra các bài học phản tư sâu sắc:")
add_bullet([("Những khâu Gemini AI gói Pro giúp nhóm tăng tốc vượt trội: ", True), ("Gemini AI gói Pro phát huy sức mạnh tối đa nhờ năng lực xử lý cửa sổ ngữ cảnh cực lớn (Context Window hàng triệu tokens), giúp phân tích đồng thời toàn bộ tài liệu kiến trúc, gợi ý cấu trúc WBS phân rã chuẩn xác, chuyển đổi nhanh chóng yêu cầu nghiệp vụ thành User Story có tiêu chí chấp nhận (Given-When-Then), và đóng vai phản biện đa chiều rất sâu sắc. Nhờ Gemini Pro, nhóm tiết kiệm được khoảng 50% thời gian soạn thảo sơ bộ.")])
add_bullet([("Những điểm Gemini AI gói Pro vẫn có thể sai sót hoặc cần lưu ý: ", True), ("(1) ", False), ("Ảo giác số học và công thức: ", True), ("Gemini Pro dù thông minh nhưng tính toán số học vẫn có thể sai lệch khi cộng dồn giờ công WBS hoặc tính toán tiến trình xuôi/ngược PERT (cần kiểm tra chéo bằng Excel); (2) ", False), ("Mở rộng phạm vi vô căn cứ: ", True), ("Gemini Pro có xu hướng đề xuất các giải pháp hoàn hảo cấp doanh nghiệp (như mobile app, tích hợp HRIS) vượt ngoài ràng buộc ngân sách 33.052.000 VNĐ; (3) ", False), ("Bỏ quên các ràng buộc an ninh ngầm: ", True), ("Gemini Pro ban đầu không tự thiết lập cơ chế khóa tự nâng quyền Admin hay cơ chế xóa session khi đổi quyền nếu ta không nhắc rõ.")])
add_bullet([("Những quyết định then chốt KHÔNG ĐƯỢC giao phó cho Gemini AI gói Pro: ", True), ("(1) ", False), ("Quyết định cam kết ngân sách và thời hạn: ", True), ("Chỉ có con người mới hiểu rõ năng lực thật và nguồn vốn thực tế; (2) ", False), ("Đánh giá và đưa ra quyết định tuyển dụng con người: ", True), ("Gemini AI chỉ là công cụ tính toán hỗ trợ, con người phải chịu trách nhiệm pháp lý và đạo đức; (3) ", False), ("Phê duyệt kiến trúc và chính sách an toàn thông tin: ", True), ("Việc cấp quyền truy cập, bảo vệ dữ liệu PII và quyết định go/no-go khi phát hành sản phẩm bắt buộc phải do các kỹ sư trưởng và PM phê duyệt.")])

print("Finished Section 10 (Bài 5).")

# ==================== SECTIONS 11 TO 13 & PHỤ LỤC ====================

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
     "3. Phía Gemini 2.5 Flash đôi khi bọc output trong markdown code blocks khiến bộ deserialize Jackson của Spring Boot bị vấp ngoại lệ JsonParseException.\n"
     "Hai loại bằng chứng cụ thể cần thu thập để điều tra nguyên nhân gốc:\n"
     "- Bằng chứng 1 (Raw Network & AI Payload Dump): Trích xuất toàn bộ chuỗi JSON raw request và raw response trao đổi giữa Spring Boot và Gemini API thông qua correlation ID / traceId được ghi nhận trên CloudWatch Logs.\n"
     "- Bằng chứng 2 (Extracted Plaintext Artifact): Lưu lại file text trung gian sau khi qua thư viện Apache PDFBox để đối chiếu xem văn bản đầu vào gửi cho AI có giữ nguyên vẹn nội dung các phần Skills và Experience hay không."),

    ("Câu 6: Hoàn thành kế hoạch 3 công việc cải thiện chất lượng cho Sprint 5 ở mục 6 tiếp theo.",
     "Trả lời: Nhóm đã xây dựng hoàn chỉnh Kế hoạch hành động 3 công việc ưu tiên cho Sprint 5 kết hợp cả yếu tố tần suất Pareto và mức độ nghiêm trọng bảo mật, chi tiết được trình bày tại Mục 6 dưới đây.")
]

for q_title, q_ans in pareto_qa:
    add_p(q_title, bold=True, color="1F4E79")
    for ans_line in q_ans.split('\n'):
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
    ["Điều kiện nghiệm thu & Minh chứng kiểm chứng", "- 100% các endpoint /api/v1/applications/{id} và /api/v1/applications/{id}/cv được bảo vệ bởi bộ đánh giá phân quyền máy chủ ApplicationOwnershipEvaluator kết hợp @PreAuthorize.\n- Candidate chỉ truy cập được đúng application của mình; Recruiter chỉ xem được application thuộc Job mình sở hữu; Admin không thể download raw CV.\n- Minh chứng kiểm chứng: Bổ sung 15 automated negative authorization tests trong CI pipeline (đều pass 100%) và kết quả quét bảo mật OWASP ZAP không còn cảnh báo IDOR."]
]
add_p("Kế hoạch công việc 1: Khắc phục lỗi bảo mật L05", bold=True, color="1F4E79")
add_table_data(col_w_action, headers_action, data_action1)

# Action 2: Fix L01
data_action2 = [
    [["Tên công việc & Mã lỗi liên quan", True], ["CÔNG VIỆC 2: Cải tiến Adapter Gemini 2.5 Flash, hoàn thiện cơ chế sanitize markdown và Strict Schema Validation (Khắc phục lỗi L01)", True]],
    ["Lý do ưu tiên xử lý", "Nhóm lỗi chiếm tần suất cao nhất (28% tổng số lỗi phát sinh), làm tê liệt luồng xử lý tự động trích xuất CV – tính năng giá trị cốt lõi nhất của Web MVP SmartRecruit."],
    ["Người chủ trì (Owner)", "Thành viên 5 (Backend / AI Integration Engineer)"],
    ["Người kiểm tra (Reviewer)", "Thành viên 2 (BA / PO) + Trần Thanh Hiệp (Tech Lead)"],
    ["Điều kiện nghiệm thu & Minh chứng kiểm chứng", "- Nâng cấp GeminiAdapter: tự động bóc tách các khối markdown code fence (```json ... ```) trước khi chuyển qua bộ parse Jackson.\n- Cấu hình Jackson ObjectMapper với DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES = false và bắt chặt các trường bắt buộc; nếu thiếu trường cốt lõi, tự động gán cờ needsHumanReview = true thay vì văng Exception.\n- Minh chứng kiểm chứng: Tỷ lệ trích xuất thành công và parse hợp lệ đạt >= 95% trên bộ dữ liệu kiểm thử chuẩn 20+ CV mẫu, có file log ghi nhận metrics thời gian xử lý và token."]
]
add_p("Kế hoạch công việc 2: Khắc phục lỗi Gemini AI trích xuất L01", bold=True, color="1F4E79")
add_table_data(col_w_action, headers_action, data_action2)

# Action 3: Fix L02
data_action3 = [
    [["Tên công việc & Mã lỗi liên quan", True], ["CÔNG VIỆC 3: Xử lý Race Condition khi Refresh Token và đồng bộ trạng thái Session trên React 19 (Khắc phục lỗi L02)", True]],
    ["Lý do ưu tiên xử lý", "Nhóm lỗi chiếm tần suất cao thứ hai (22% tổng số lỗi), trực tiếp phá hỏng trải nghiệm người dùng, gây văng phiên làm việc và lỗi 401 lặp vô hạn khi Access Token 15 phút hết hạn."],
    ["Người chủ trì (Owner)", "Thành viên 3 (Frontend UI-UX Engineer)"],
    ["Người kiểm tra (Reviewer)", "Trần Thanh Hiệp (Tech Lead / Backend)"],
    ["Điều kiện nghiệm thu & Minh chứng kiểm chứng", "- Triển khai Axios Interceptor với cơ chế hàng đợi Promise (Refresh Token Queue): Khi có nhiều request đồng thời gặp lỗi 401, chỉ 1 request duy nhất gọi endpoint /auth/refresh, các request khác tạm dừng chờ token mới rồi tự động thử lại (retry).\n- Đồng bộ cache TanStack Query v5 và dọn dẹp sạch sẽ session state khi người dùng thực hiện Logout hoặc bị thu hồi quyền.\n- Minh chứng kiểm chứng: Kịch bản kiểm thử tự động với Playwright mô phỏng 5 API calls đồng thời khi token hết hạn hoạt động trơn tru; người dùng thao tác liên tục trong 120 phút không bị văng ra trang Login."]
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

print("Writing Sections 11 to 13 & Phụ lục...")

# Section 11
add_h1("11. Sản phẩm nộp")
add_p("Hồ sơ nộp bài thực hành của nhóm gồm 1 file Word/PDF hoàn chỉnh đặt tên QLDA_[Nhóm 03]_Lab.docx và 1 file bảng tính Excel tính toán tiến độ, bao gồm đầy đủ các cấu phần sau:")
add_bullet("Ảnh chụp màn hình Gemini AI gói Pro: cấu hình System Instructions / Gem và danh mục tài liệu nạp vào Knowledge.")
add_bullet("Project Charter bản chính thức hoàn chỉnh đã được thẩm định và chỉnh sửa.")
add_bullet("Cấu trúc WBS 3 cấp (sơ đồ cây phân cấp + bảng phân rã 41 task chi tiết) và Từ điển WBS cho 3 gói trọng yếu.")
add_bullet("Bảng tính toán PERT 3 điểm, bảng CPM tiến trình xuôi/ngược, xác định đường găng và biểu đồ Gantt tiến độ (đính kèm file Excel).")
add_bullet("Sổ đăng ký rủi ro (Risk Register 10 rủi ro), ma trận rủi ro 5×5 và kế hoạch dự phòng chi tiết.")
add_bullet("Biên bản phản biện chất vấn với Sponsor (5 câu hỏi chất vấn kèm câu trả lời) và bài học phản tư quản trị.")
add_bullet("Nhật ký sử dụng Gemini AI gói Pro (Prompt Log theo mẫu Phụ lục C) ghi nhận đầy đủ tiến trình tương tác.")

# Section 12
add_h1("12. Tiêu chí đánh giá (thang 10)")
col_w_eval = [2400, 5760, 1200]
headers_eval = ["Tiêu chí đánh giá", "Mô tả chuẩn mực đạt mức Tốt / Xuất sắc", "Điểm"]
data_eval = [
    ["Thiết lập Gemini AI gói Pro", "System Instructions định nghĩa rõ ràng vai trò, bối cảnh, quy tắc và cơ chế gợi mở; khai thác tốt context window lớn của gói Pro; Knowledge nạp đầy đủ tài liệu baseline.", "1,0"],
    ["Project Charter", "Đầy đủ 12 mục theo chuẩn PMBOK; mục tiêu SMART đo lường được; nêu được 3 câu hỏi làm rõ có giá trị chuyên sâu với Sponsor.", "1,5"],
    ["WBS & Từ điển WBS", "Phân rã ≥ 3 cấp bao phủ 41 task thực tế, tuân thủ tuyệt đối quy tắc 100% và 8/80; có sơ đồ cây và từ điển WBS chi tiết cho 3 gói cốt lõi.", "2,0"],
    ["Lịch dự án & Đường găng", "Ước lượng PERT chuẩn xác, tính toán tiến trình ES/EF/LS/LF bằng Excel, chỉ ra đúng đường găng và phân tích định lượng Crashing/Fast-tracking.", "2,0"],
    ["Quản lý rủi ro & Chi phí", "Đủ 10 rủi ro thực tế mô tả đúng cấu trúc chuẩn, có 2 rủi ro kỹ thuật nhóm tự bổ sung, có ma trận 5×5 và kế hoạch dự phòng chi tiết cho rủi ro cao nhất.", "1,5"],
    ["Tư duy phản biện Gemini AI gói Pro", "Chỉ rõ được các điểm yếu và ảo giác của Gemini AI gói Pro; trả lời sắc sảo 5 câu hỏi chất vấn khó của Sponsor; bài học phản tư sâu sắc, thực tế.", "1,5"],
    ["Nhật ký Gemini AI gói Pro & Trình bày", "Ghi chép đầy đủ nhật ký prompt tương tác với Gemini AI gói Pro qua từng bài; văn bản định dạng chuẩn mực, đồng nhất font chữ, bảng biểu chuyên nghiệp, nộp đúng hạn.", "0,5"],
    [["TỔNG ĐIỂM", True], ["ĐÁNH GIÁ TOÀN DIỆN NĂNG LỰC QUẢN TRỊ DỰ ÁN VỚI TRỢ LÝ GEMINI AI (GÓI PRO)", True], [["10,0", True]]]
]
add_table_data(col_w_eval, headers_eval, data_eval, alignments=['L', 'L', 'C'])

# Section 13
add_h1("13. Quy định sử dụng Gemini AI (Gói Pro) có trách nhiệm")
add_bullet("Gemini AI gói Pro đóng vai trò là trợ lý ảo hỗ trợ phương pháp luận; toàn thể thành viên trong nhóm chịu trách nhiệm cuối cùng và tuyệt đối cho mọi con số, mã nguồn và nội dung báo cáo nộp.")
add_bullet("Nghiêm cấm hành vi sao chép nguyên văn đầu ra của Gemini AI gói Pro mà không qua kiểm tra, đối chiếu kỹ thuật. Bài nộp vi phạm sẽ bị trừ tối thiểu 50% điểm số của tiêu chí tương ứng.")
add_bullet("Tuyệt đối không đưa thông tin định danh cá nhân thật (PII), thông tin mật của tổ chức, khóa bí mật API hoặc dữ liệu CV chưa được cấp quyền vào bất kỳ giao diện Gemini AI gói Pro nào.")
add_bullet("Phải ghi chép minh bạch và trung thực các câu lệnh prompt trong nhật ký sử dụng Gemini AI gói Pro, phân định rõ phần nào do Gemini AI gợi ý và phần nào do nhóm tự phân tích, điều chỉnh.")

# Phụ lục A
add_h1("Phụ lục A – Tài liệu yêu cầu kỹ thuật & phạm vi SmartRecruit")
add_p("Tài liệu kỹ thuật baseline v1.1 được chuẩn hóa để sinh viên đưa vào Knowledge của Gemini AI gói Pro:")
add_h3("A1. Giới thiệu tổng quan hệ thống")
add_p("SmartRecruit là nền tảng Web MVP hỗ trợ nhà tuyển dụng tiếp nhận hồ sơ ứng tuyển, trích xuất dữ liệu có cấu trúc từ CV (PDF/DOCX) bằng mô hình Google Gemini 2.5 Flash, đối chiếu tiêu chí kỹ năng định lượng và hỗ trợ chuẩn bị dự thảo email phản hồi. Hệ thống áp dụng kiến trúc Modular Monolith Spring Boot 3.5.16 + Java 21 LTS kết hợp React 19 SPA. Cơ chế bảo mật dựa trên JWT + Google OpenID Connect (OIDC PKCE) và phân quyền 3 vai trò: Candidate, Recruiter, Admin.")

add_h3("A2. Yêu cầu chức năng (Functional Requirements)")
col_w_fr = [1200, 6960, 1200]
headers_fr = ["Mã FR", "Nội dung yêu cầu chức năng", "Ưu tiên"]
data_fr = [
    ["FR01", "Đăng ký, đăng nhập tài khoản qua Email/Password và Google OIDC; phân quyền RBAC 3 vai trò.", "Bắt buộc"],
    ["FR02", "Recruiter tạo, chỉnh sửa, đóng và lưu trữ tin tuyển dụng (Job) kèm tiêu chí kỹ năng bắt buộc/tùy chọn.", "Bắt buộc"],
    ["FR03", "Candidate tìm kiếm Job, nộp hồ sơ và tải lên CV định dạng PDF/DOCX (lưu trữ S3 private bucket).", "Bắt buộc"],
    ["FR04", "Tự động trích xuất thông tin có cấu trúc từ CV (kỹ năng, kinh nghiệm, học vấn) qua Gemini 2.5 Flash.", "Bắt buộc"],
    ["FR05", "Thuật toán tính điểm khớp kỹ năng (Match Scoring Engine) minh bạch, có bảng giải trình chi tiết.", "Bắt buộc"],
    ["FR06", "Recruiter đánh giá ứng viên, chấm điểm rubric, xem dự thảo phản hồi AI và phê duyệt gửi email.", "Bắt buộc"],
    ["FR07", "Admin Console quản trị danh sách người dùng, thay đổi role/status kèm lý do và xem nhật ký audit.", "Bắt buộc"],
    ["FR08", "Dashboard báo cáo thống kê tuyển dụng: phễu ứng tuyển (funnel) và phân bố kỹ năng ứng viên.", "Nên có"]
]
add_table_data(col_w_fr, headers_fr, data_fr, alignments=['C', 'L', 'C'])

add_h3("A3. Yêu cầu phi chức năng (Non-Functional Requirements)")
add_bullet("Bảo mật: Phân quyền máy chủ nghiêm ngặt; mật khẩu băm Argon2/BCrypt; không lưu token trong localStorage; Admin không có quyền mặc định xem CV raw; không để lộ secret trên repo.")
add_bullet("Hiệu năng: Thời gian tính điểm xếp hạng cho 50 hồ sơ ứng viên dưới 2 giây (không tính thời gian gọi API bên ngoài); thời gian phản hồi giao diện trung bình dưới 1.5 giây.")
add_bullet("Độ chính xác AI: Tỷ lệ trích xuất kỹ năng chính xác đạt ≥ 85% trên tập dữ liệu kiểm thử chuẩn hóa.")
add_bullet("Khả năng vận hành: Endpoint Actuator /health kiểm tra trạng thái; ghi log có cấu trúc kèm correlation ID; tự động sao lưu CSDL trước khi chạy migration.")

add_h3("A4. Ràng buộc kiến trúc & công nghệ")
add_bullet("Ngân sách baseline chính thức: 33.052.000 VNĐ (gồm 30.240.000 VNĐ chi phí nhân công 108 ngày công, 1.300.000 VNĐ chi phí trực tiếp và 1.512.000 VNĐ quỹ dự phòng rủi ro).")
add_bullet("Thời hạn: Đúng 08 Sprint (08/09/2026 – 02/11/2026); cột mốc UAT và đóng dự án là 03/11/2026.")
add_bullet("Công nghệ bắt buộc: Java 21, Spring Boot 3.5.16, MySQL 8.4 LTS, React 19, TypeScript, Vite 8, Gemini 2.5 Flash, AWS EC2/RDS/S3.")

note_gv = [
    "Ghi chú dành cho giảng viên: Bộ tài liệu này được thiết kế có các điểm kiểm soát chặt chẽ về mặt kỹ thuật (phân quyền Admin least-privilege, mô hình AI Human-in-the-loop, ràng buộc ngân sách AWS). Nhóm nào nắm bắt được bản chất kỹ thuật và phản biện xuất sắc các câu hỏi của Sponsor sẽ đạt điểm tối đa."
]
add_callout("Ghi chú dành cho giảng viên", note_gv)

# Phụ lục B
add_h1("Phụ lục B – Khung mẫu Project Charter")
col_w_b = [3000, 6360]
headers_b = ["Mục chuẩn", "Nội dung yêu cầu hoàn thiện"]
data_b = [
    ["Tên dự án / Mã dự án", "Tên đầy đủ và mã định danh duy nhất của dự án"],
    ["Nhà tài trợ (Sponsor) / Quản lý dự án (PM)", "Họ tên, chức danh và thẩm quyền của Sponsor và PM"],
    ["Mục đích và lý do thực hiện (Business Case)", "Bối cảnh thực tế, vấn đề cần giải quyết và giá trị mang lại"],
    ["Mục tiêu SMART", "Các mục tiêu cụ thể, đo lường được, khả thi, thực tế và có thời hạn"],
    ["Phạm vi: trong phạm vi / ngoài phạm vi", "Ranh giới rõ ràng những gì sẽ làm và những gì không làm"],
    ["Sản phẩm bàn giao chính (Deliverables)", "Danh mục mã nguồn, tài liệu, container, môi trường deploy"],
    ["Các bên liên quan và vai trò (RACI)", "Xác định vai trò của các tác nhân trong và ngoài dự án"],
    ["Mốc thời gian chính (Milestones)", "Lịch trình các Sprint và cột mốc đóng dự án"],
    ["Ngân sách tổng và cơ cấu phân bổ", "Hạn mức ngân sách và dự toán chi tiết cho từng hạng mục"],
    ["Giả định và Ràng buộc", "Các tiền đề công nhận và giới hạn bắt buộc phải tuân thủ"],
    ["Rủi ro cấp cao", "Các rủi ro chiến lược và kỹ thuật lớn nhất đe dọa dự án"],
    ["Tiêu chí thành công và nghiệm thu", "Điều kiện bắt buộc để Sponsor ký biên bản bàn giao"],
    ["Phê duyệt (Ký tên, ngày tháng)", "Chữ ký xác nhận của đại diện Sponsor và PM"]
]
add_table_data(col_w_b, headers_b, data_b)

# Phụ lục C
add_h1("Phụ lục C – Nhật ký sử dụng Gemini AI (Gói Pro) (Prompt Log)")
add_p("Bảng nhật ký ghi lại các lượt prompt quan trọng của nhóm [Nhóm 03] trong suốt quá trình hoàn thành 5 bài tập thực hành:")

col_w_log = [600, 1200, 2760, 2400, 2400]
headers_log = ["STT", "Bài thực hành", "Prompt đã dùng (tóm tắt)", "Gemini AI gói Pro trả lời tốt ở điểm nào", "Nhóm đã sửa / bổ sung gì"]
data_log = [
    ["1", "Phần A (Setup)", "Soạn Instructions cho Project SmartRecruit bám sát modular monolith, ngân sách 33.052.000 VNĐ, 08 Sprint.", "Cấu trúc vai trò rõ ràng, thiết lập phong cách phản biện sư phạm tốt.", "Bổ sung quy tắc bắt buộc Admin least privilege và cấm tự động loại ứng viên."],
    ["2", "Bài 1 (Charter)", "Yêu cầu lập Project Charter 12 mục từ tài liệu Knowledge và đề xuất 3 câu hỏi cho Sponsor.", "Soạn thảo Business Case và phân tích các bên liên quan rất đầy đủ.", "Viết lại 2 mục tiêu SMART có số liệu đo lường cụ thể và bổ sung câu hỏi giải ngân AWS."],
    ["3", "Bài 2 (WBS)", "Xây dựng WBS 3 cấp 41 task tuân thủ quy tắc 100% và 8/80; viết từ điển WBS cho 3 task lõi.", "Phân rã chuẩn theo 8 Sprint; gợi ý sản phẩm bàn giao tương đối khớp.", "Chuẩn hóa lại định mức giờ công cho task Admin 3.6 và bổ sung chi tiết tiêu chí DoD an toàn."],
    ["4", "Bài 3 (Lịch PERT)", "Ước lượng PERT 15 hoạt động chính, tính ES/EF/LS/LF, tìm đường găng và độ lệch chuẩn.", "Gợi ý trình tự phụ thuộc giữa các công việc khá logic.", "Gemini AI gói Pro tính sai phép cộng Slack; nhóm đã lập bảng tính Excel kiểm tra lại toàn bộ số học."],
    ["5", "Bài 4 (Rủi ro)", "Lập Risk Register 10 rủi ro có cấu trúc chuẩn; lập ma trận 5x5 và contingency plan cho R01.", "Mô tả cấu trúc Nguyên nhân - Sự kiện - Hậu quả rất bài bản.", "Bổ sung 2 rủi ro kỹ thuật thực chiến (mã độc file upload và mất đồng bộ session token)."],
    ["6", "Bài 5 (Phản biện)", "Đóng vai Sponsor khó tính chất vấn 5 câu hỏi hóc búa về tiến độ, chi phí, đạo đức AI và bảo mật.", "Đặt câu hỏi chất vấn rất sắc sảo, đánh đúng vào các điểm nhạy cảm của đồ án.", "Nhóm tự nghiên cứu và viết 100% câu trả lời giải trình, không nhờ Gemini AI gói Pro trả lời hộ."]
]
add_table_data(col_w_log, headers_log, data_log, alignments=['C', 'C', 'L', 'L', 'L'])

# Phụ lục D
add_h1("Phụ lục D – Gợi ý prompt nâng cao cho SmartRecruit với Gemini AI gói Pro")
add_bullet([("So sánh kiến trúc phát triển: ", True), ("“Hãy phân tích ưu nhược điểm giữa phương án kiến trúc Modular Monolith và Microservices cho dự án SmartRecruit với đội ngũ 6 người trong 8 Sprint, đưa ra khuyến nghị lựa chọn có căn cứ.”")])
add_bullet([("Đặc tả User Story chuẩn: ", True), ("“Chuyển đổi yêu cầu FR04 và FR05 thành 3 user stories hoàn chỉnh theo mẫu: Là <vai trò>, tôi muốn <tính năng> để <lợi ích>, kèm theo bảng tiêu chí chấp nhận Acceptance Criteria dạng Given–When–Then.”")])
add_bullet([("Phân bổ ma trận trách nhiệm: ", True), ("“Lập ma trận RACI chi tiết cho 41 gói công việc WBS với 6 vai trò thành viên: PM, BA, Backend, Frontend, QA, DevOps.”")])
add_bullet([("Định mức chi phí nhân sự: ", True), ("“Dựa trên tổng số 1.376 giờ công của bảng WBS, hãy tính toán chi phí cơ hội nhân sự theo đơn giá thực tập sinh giả định và đối chiếu với ngân sách dự án.”")])
add_bullet([("Kế hoạch truyền thông dự án: ", True), ("“Soạn thảo Kế hoạch truyền thông (Communication Plan) xác định rõ kênh trao đổi, tần suất họp và cơ chế báo cáo tiến độ giữa nhóm sinh viên, giảng viên và Sponsor.”")])

print("Finished compiling all sections.")

doc.save(output_path)
print(f"SUCCESS: Saved final complete document to {output_path}")

