import subprocess
import os
import base64
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# 1. GENERATE THE VECTOR SVG OF CONNECTING ARROWS
# Dimensions: Width 1500px, Height 420px (covers row 1 to 18, cols B to AD)
# Col A = 25px
# Col B-D = 165px -> x: 25 to 190. Midpoint Y: Top=85, Mid=226, Bot=350
# Spacer 1 (E, F, G) = 105px -> x: 190 to 295
# Col H-J = 165px -> x: 295 to 460
# Spacer 2 (K, L) = 90px -> x: 460 to 550
# Col M-O = 165px -> x: 550 to 715
# Spacer 3 (P, Q) = 90px -> x: 715 to 805
# Col R-T = 165px -> x: 805 to 970
# Spacer 4 (U, V) = 90px -> x: 970 to 1060
# Col W-Y = 165px -> x: 1060 to 1225
# Spacer 5 (Z, AA) = 90px -> x: 1225 to 1315
# Col AB-AD = 165px -> x: 1315 to 1480

svg_content = """<svg width="1500" height="420" viewBox="0 0 1500 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#DC2626" />
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
    </marker>
  </defs>

  <!-- ==================== BLUE BRANCH LINES ==================== -->
  <!-- A -> C (top to top) -->
  <path d="M 190 85 L 292 85" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- B -> D (mid to mid) -->
  <path d="M 190 226 L 292 226" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- D -> E (mid to top) -->
  <path d="M 460 210 L 505 210 L 505 102 L 547 102" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- D -> F (mid to mid) -->
  <path d="M 460 226 L 547 226" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- G -> H (bot to top) -->
  <path d="M 715 335 L 760 335 L 760 102 L 802 102" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- G -> I (bot to mid) -->
  <path d="M 715 345 L 760 345 L 760 226 L 802 226" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- J -> K (bot to top) -->
  <path d="M 970 335 L 1015 335 L 1015 102 L 1057 102" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- J -> L (bot to mid) -->
  <path d="M 970 345 L 1015 345 L 1015 226 L 1057 226" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- M -> N (bot to top) -->
  <path d="M 1225 335 L 1270 335 L 1270 102 L 1312 102" fill="none" stroke="#2563EB" stroke-width="2" marker-end="url(#arrow-blue)" />

  <!-- ==================== CRITICAL PATH RED LINES ==================== -->
  <!-- A -> D (top to mid) -->
  <path d="M 190 102 L 242 102 L 242 226 L 291 226" fill="none" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow-red)" />

  <!-- D -> G (mid to bot) -->
  <path d="M 460 236 L 505 236 L 505 350 L 546 350" fill="none" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow-red)" />

  <!-- G -> J (bot to bot straight) -->
  <path d="M 715 350 L 801 350" fill="none" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" marker-end="url(#arrow-red)" />

  <!-- J -> M (bot to bot straight) -->
  <path d="M 970 350 L 1056 350" fill="none" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" marker-end="url(#arrow-red)" />

  <!-- M -> O (bot to mid) -->
  <path d="M 1225 350 L 1270 350 L 1270 226 L 1311 226" fill="none" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow-red)" />
</svg>"""

html_wrapper = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ background: transparent; width: 1500px; height: 420px; overflow: hidden; }}
  svg {{ display: block; }}
</style>
</head>
<body>
{svg_content}
</body>
</html>"""

with open('/tmp/pert_arrows.html', 'w') as f:
    f.write(html_wrapper)

chrome_bin = "/Applications/Google Chrome .app/Contents/MacOS/Google Chrome"
subprocess.run([
    chrome_bin,
    "--headless",
    "--disable-gpu",
    "--default-background-color=00000000",
    "--window-size=1500,420",
    "--screenshot=/tmp/pert_arrows.png",
    "/tmp/pert_arrows.html"
], check=True)

with open('/tmp/pert_arrows.png', 'rb') as f:
    png_bytes = f.read()
b64_png = base64.b64encode(png_bytes).decode('utf-8')
print(f"Generated transparent PNG overlay: {len(png_bytes)} bytes")

# 2. 15 NODES DATA MAPPED TO REAL SMARTRECRUIT PROJECT
nodes = {
    'A': {'code': 'SCRUM-11', 'role': 'PM', 'dur': 2, 'es': 0, 'ef': 2, 'ls': 0, 'slk': 0, 'lf': 2, 'name': 'Họp Kick-off MVP, thống nhất phạm vi & lập Project Charter', 'col': 2, 'row': 3, 'cp': True},
    'B': {'code': 'SCRUM-1',  'role': 'BE', 'dur': 1, 'es': 0, 'ef': 1, 'ls': 1, 'slk': 1, 'lf': 2, 'name': 'Khởi tạo source base Spring Boot & cấu hình khung dự án', 'col': 2, 'row': 9, 'cp': False},
    'C': {'code': 'SCRUM-2',  'role': 'DevOps', 'dur': 1, 'es': 2, 'ef': 3, 'ls': 12, 'slk': 10, 'lf': 13, 'name': 'Thiết lập môi trường Docker Compose & kết nối Server ban đầu', 'col': 8, 'row': 3, 'cp': False},
    'D': {'code': 'SCRUM-6',  'role': 'DB & BA', 'dur': 2, 'es': 2, 'ef': 4, 'ls': 2, 'slk': 0, 'lf': 4, 'name': 'Thiết kế mô hình ERD 16 bảng MySQL & DDL Schema cốt lõi', 'col': 8, 'row': 9, 'cp': True},
    'E': {'code': 'SCRUM-5',  'role': 'FE', 'dur': 1, 'es': 4, 'ef': 5, 'ls': 12, 'slk': 8, 'lf': 13, 'name': 'Thiết kế UI/UX trên Figma & Wireframe nguyên mẫu tuyển dụng', 'col': 13, 'row': 3, 'cp': False},
    'F': {'code': 'SCRUM-8',  'role': 'FE', 'dur': 1, 'es': 4, 'ef': 5, 'ls': 12, 'slk': 8, 'lf': 13, 'name': 'Cài đặt ReactJS Router, Tailwind & khung layout Dashboard', 'col': 13, 'row': 9, 'cp': False},
    'G': {'code': 'SCRUM-21', 'role': 'BE', 'dur': 2, 'es': 4, 'ef': 6, 'ls': 4, 'slk': 0, 'lf': 6, 'name': 'Xây dựng Authentication JWT & phân quyền Role-based Spring Sec', 'col': 13, 'row': 15, 'cp': True},
    'H': {'code': 'SCRUM-23', 'role': 'BE', 'dur': 1, 'es': 6, 'ef': 7, 'ls': 12, 'slk': 6, 'lf': 13, 'name': 'Xây dựng RESTful API CRUD Quản lý tin tuyển dụng (Job Post)', 'col': 18, 'row': 3, 'cp': False},
    'I': {'code': 'SCRUM-25', 'role': 'DB', 'dur': 1, 'es': 6, 'ef': 7, 'ls': 12, 'slk': 6, 'lf': 13, 'name': 'Thiết kế bảng từ điển danh mục kỹ năng chuẩn hóa (Skill Taxonomy)', 'col': 18, 'row': 9, 'cp': False},
    'J': {'code': 'SCRUM-26', 'role': 'BE', 'dur': 2, 'es': 6, 'ef': 8, 'ls': 6, 'slk': 0, 'lf': 8, 'name': 'Viết module tiếp nhận & Upload file CV lưu trữ S3 Private', 'col': 18, 'row': 15, 'cp': True},
    'K': {'code': 'SCRUM-28', 'role': 'FE', 'dur': 1, 'es': 8, 'ef': 9, 'ls': 12, 'slk': 4, 'lf': 13, 'name': 'Dựng giao diện ứng viên nộp hồ sơ trực tuyến & kéo thả CV', 'col': 23, 'row': 3, 'cp': False},
    'L': {'code': 'SCRUM-29', 'role': 'QA', 'dur': 2, 'es': 8, 'ef': 10, 'ls': 11, 'slk': 3, 'lf': 13, 'name': 'Viết test case API Postman, xác thực cấu trúc JSON từ Gemini', 'col': 23, 'row': 9, 'cp': False},
    'M': {'code': 'SCRUM-27', 'role': 'AI & BE', 'dur': 3, 'es': 8, 'ef': 11, 'ls': 8, 'slk': 0, 'lf': 11, 'name': 'Tích hợp Gemini 2.5 Flash API trích xuất kỹ năng/kinh nghiệm CV', 'col': 23, 'row': 15, 'cp': True},
    'N': {'code': 'SCRUM-33', 'role': 'FE', 'dur': 1, 'es': 11, 'ef': 12, 'ls': 12, 'slk': 1, 'lf': 13, 'name': 'Phát triển giao diện Bảng xếp hạng ứng viên theo điểm AI Match', 'col': 28, 'row': 3, 'cp': False},
    'O': {'code': 'SCRUM-48', 'role': 'QA & PM', 'dur': 2, 'es': 11, 'ef': 13, 'ls': 11, 'slk': 0, 'lf': 13, 'name': 'Kiểm thử chấp nhận UAT Production, Retrospective & Đóng dự án', 'col': 28, 'row': 9, 'cp': True}
}

# 3. BUILD OPENPYXL EXCEL SHEET (sheet.xlsx)
wb = openpyxl.load_workbook('sheet.xlsx')
if 'PERT_SmartRecruit' in wb.sheetnames:
    wb.remove(wb['PERT_SmartRecruit'])
ws = wb.create_sheet('PERT_SmartRecruit', index=2)

# Styles
font_title = Font(name='Arial', size=13, bold=True, color='000000')
font_stage = Font(name='Arial', size=10, bold=True, color='1F4E79')
font_node_hdr_cp = Font(name='Arial', size=10, bold=True, color='DC2626')
font_node_hdr = Font(name='Arial', size=10, bold=True, color='1E7E34')
font_num_cp = Font(name='Arial', size=9, bold=True, color='DC2626')
font_num = Font(name='Arial', size=9, bold=False, color='000000')
font_name_cp = Font(name='Arial', size=8, bold=True, color='991B1B')
font_name = Font(name='Arial', size=8, bold=False, color='1F2937')

fill_title = PatternFill(start_color='FCE4D6', end_color='FCE4D6', fill_type='solid')
fill_stg1 = PatternFill(start_color='D9E1F2', end_color='D9E1F2', fill_type='solid')
fill_stg2 = PatternFill(start_color='FFF2CC', end_color='FFF2CC', fill_type='solid')
fill_stg3 = PatternFill(start_color='E2EFDA', end_color='E2EFDA', fill_type='solid')
fill_cp = PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid')
fill_normal = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid')
fill_tbl_hdr = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')

thin_black = Side(style='thin', color='000000')
medium_red = Side(style='medium', color='DC2626')
bdr_normal = Border(left=thin_black, right=thin_black, top=thin_black, bottom=thin_black)
bdr_cp = Border(left=medium_red, right=medium_red, top=medium_red, bottom=medium_red)

# Title
ws.merge_cells('B1:AD1')
ws.cell(1, 2, '3.4.1 - SƠ ĐỒ PERT CHO DỰ ÁN NỀN TẢNG TUYỂN DỤNG THÔNG MINH SMARTRECRUIT')
ws.cell(1, 2).font = font_title
ws.cell(1, 2).alignment = Alignment(horizontal='center', vertical='center')
ws.cell(1, 2).fill = fill_title
ws.row_dimensions[1].height = 32

# Stages
ws.merge_cells('B2:J2')
ws.cell(2, 2, 'Phát thảo các sơ đồ và dữ liệu cốt lõi (Sprint 1 - 2)')
ws.cell(2, 2).font = font_stage
ws.cell(2, 2).fill = fill_stg1
ws.cell(2, 2).alignment = Alignment(horizontal='center', vertical='center')

ws.merge_cells('K2:V2')
ws.cell(2, 11, 'Phát triển giao diện & Core API tuyển dụng (Sprint 3 - 4)')
ws.cell(2, 11).font = font_stage
ws.cell(2, 11).fill = fill_stg2
ws.cell(2, 11).alignment = Alignment(horizontal='center', vertical='center')

ws.merge_cells('W2:AD2')
ws.cell(2, 23, 'Tích hợp AI Gemini & Nghiệm thu UAT đóng dự án (Sprint 5 - 8)')
ws.cell(2, 23).font = font_stage
ws.cell(2, 23).fill = fill_stg3
ws.cell(2, 23).alignment = Alignment(horizontal='center', vertical='center')
ws.row_dimensions[2].height = 24

# Draw 15 Nodes
for k, n in nodes.items():
    r = n['row']
    c = n['col']
    is_cp = n['cp']
    bg = fill_cp if is_cp else fill_normal
    bdr = bdr_cp if is_cp else bdr_normal
    
    # Row 1: Header
    ws.merge_cells(start_row=r, start_column=c, end_row=r, end_column=c+2)
    ch = ws.cell(r, c, f"{k}: {n['code']} [{n['role']}]")
    ch.font = font_node_hdr_cp if is_cp else font_node_hdr
    ch.fill = bg
    ch.alignment = Alignment(horizontal='center', vertical='center')
    
    # Row 2: ES | t | EF
    for col_off, val in enumerate([n['es'], n['dur'], n['ef']]):
        cell = ws.cell(r+1, c+col_off, val)
        cell.font = font_num_cp if is_cp else font_num
        cell.fill = bg
        cell.alignment = Alignment(horizontal='center', vertical='center')
        
    # Row 3: Name
    ws.merge_cells(start_row=r+2, start_column=c, end_row=r+2, end_column=c+2)
    cn = ws.cell(r+2, c, n['name'])
    cn.font = font_name_cp if is_cp else font_name
    cn.fill = bg
    cn.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    
    # Row 4: LS | Slack | LF
    for col_off, val in enumerate([n['ls'], n['slk'], n['lf']]):
        cell = ws.cell(r+3, c+col_off, val)
        cell.font = font_num_cp if is_cp else font_num
        cell.fill = bg
        cell.alignment = Alignment(horizontal='center', vertical='center')
        
    for ro in range(r, r+4):
        for co in range(c, c+3):
            ws.cell(ro, co).border = bdr

# Row heights
for r in [3, 9, 15]:
    ws.row_dimensions[r].height = 20
    ws.row_dimensions[r+1].height = 18
    ws.row_dimensions[r+2].height = 36
    ws.row_dimensions[r+3].height = 18
for r in [7, 8, 13, 14, 19, 20]:
    ws.row_dimensions[r].height = 14

# Column widths
ws.column_dimensions['A'].width = 3
for c in [2, 3, 4, 8, 9, 10, 13, 14, 15, 18, 19, 20, 23, 24, 25, 28, 29, 30]:
    ws.column_dimensions[get_column_letter(c)].width = 7.5
for c in [5, 6, 7]:
    ws.column_dimensions[get_column_letter(c)].width = 4.5
for c in [11, 12, 16, 17, 21, 22, 26, 27]:
    ws.column_dimensions[get_column_letter(c)].width = 5.5

# Embed Image into sheet.xlsx
from openpyxl.drawing.image import Image as OpenpyxlImage
img_obj = OpenpyxlImage('/tmp/pert_arrows.png')
ws.add_image(img_obj, 'A1')

# Table of Paths (Rows 22 - 42)
ws.merge_cells('B22:J22')
ws.cell(22, 2, 'BẢNG DANH MỤC CÁC ĐƯỜNG CÔNG VIỆC TRONG MẠNG TIẾN ĐỘ PERT (17 ĐƯỜNG):')
ws.cell(22, 2).font = font_stage

ws.cell(23, 2, 'STT')
ws.merge_cells('C23:H23')
ws.cell(23, 3, 'Đường công việc chi tiết trong mạng PERT')
ws.cell(23, 9, 'Tổng (ngày)')
ws.cell(23, 10, 'Phân loại')
for c in range(2, 11):
    cell = ws.cell(23, c)
    cell.fill = fill_tbl_hdr
    cell.font = Font(name='Arial', size=9, bold=True, color='FFFFFF')
    cell.alignment = Alignment(horizontal='center', vertical='center')
    cell.border = bdr_normal
ws.row_dimensions[23].height = 24

paths_data = [
    (1,  'A(2) ➔ C(1)', 3, 'Nhánh phụ Setup'),
    (2,  'A(2) ➔ D(2) ➔ E(1)', 5, 'Nhánh phụ UI/UX'),
    (3,  'A(2) ➔ D(2) ➔ F(1)', 5, 'Nhánh phụ Layout'),
    (4,  'A(2) ➔ D(2) ➔ G(2) ➔ H(1)', 7, 'Nhánh phụ Job API'),
    (5,  'A(2) ➔ D(2) ➔ G(2) ➔ I(1)', 7, 'Nhánh phụ Taxonomy'),
    (6,  'A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ K(1)', 9, 'Nhánh phụ Nộp CV'),
    (7,  'A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ L(2)', 10, 'Nhánh phụ QA Test'),
    (8,  'A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ N(1)', 12, 'Đường cận găng (Slack=1)'),
    (9,  'A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ O(2)', 13, 'ĐƯỜNG GĂNG (CRITICAL PATH)'),
    (10, 'B(1) ➔ C(1)', 2, 'Nhánh phụ Khởi tạo'),
    (11, 'B(1) ➔ D(2) ➔ E(1)', 4, 'Nhánh phụ UI Base'),
    (12, 'B(1) ➔ D(2) ➔ F(1)', 4, 'Nhánh phụ Frontend Base'),
    (13, 'B(1) ➔ D(2) ➔ G(2) ➔ H(1)', 6, 'Nhánh phụ Backend Job'),
    (14, 'B(1) ➔ D(2) ➔ G(2) ➔ I(1)', 6, 'Nhánh phụ Database'),
    (15, 'B(1) ➔ D(2) ➔ G(2) ➔ J(2) ➔ K(1)', 8, 'Nhánh phụ Candidate Portal'),
    (16, 'B(1) ➔ D(2) ➔ G(2) ➔ J(2) ➔ L(2)', 9, 'Nhánh phụ Postman QA'),
    (17, 'B(1) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ N(1)', 11, 'Nhánh phụ Ranking UI')
]

for idx, (stt, p_str, tot, note) in enumerate(paths_data):
    r = 24 + idx
    is_cp = (stt == 9)
    bg = fill_cp if is_cp else fill_normal
    fnt = font_num_cp if is_cp else font_num
    
    ws.cell(r, 2, stt).alignment = Alignment(horizontal='center', vertical='center')
    ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=8)
    ws.cell(r, 3, p_str).alignment = Alignment(horizontal='left', vertical='center')
    ws.cell(r, 9, tot).alignment = Alignment(horizontal='center', vertical='center')
    ws.cell(r, 10, note).alignment = Alignment(horizontal='center', vertical='center')
    
    for c in range(2, 11):
        cell = ws.cell(r, c)
        cell.fill = bg
        cell.font = fnt
        cell.border = bdr_cp if is_cp else bdr_normal
    ws.row_dimensions[r].height = 20

# Conclusion Box on Right
ws.merge_cells('L23:AD24')
ws.cell(23, 12, 'DỰA VÀO ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỢNG GANTT THIẾT YẾU (ĐƯỜNG GĂNG - CRITICAL PATH) NHƯ SAU:').font = font_node_hdr_cp
ws.cell(23, 12).alignment = Alignment(horizontal='center', vertical='center')
ws.cell(23, 12).fill = fill_cp

ws.merge_cells('L25:AD27')
ws.cell(25, 12, 'A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ O(2)').font = Font(name='Arial', size=13, bold=True, color='991B1B')
ws.cell(25, 12).alignment = Alignment(horizontal='center', vertical='center')
ws.cell(25, 12).fill = fill_cp

ws.merge_cells('L28:AD40')
summary_text = (
    "KẾT LUẬN & THÔNG SỐ QUẢN TRỊ DỰ ÁN SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ):\n"
    "• Tổng thời lượng đường găng: 13 ngày làm việc găng chuẩn tiến độ (Critical Path = 13 days).\n"
    "• Tổng thời gian lịch trình dự án: 57 ngày lịch trình (08 Sprint: từ 08/09/2026 đến 03/11/2026).\n"
    "• Chuỗi tác vụ găng (Critical Path Flow):\n"
    "  1. A: SCRUM-11 [PM] - Họp Kick-off MVP & lập Project Charter (08/09 - 09/09, 2 ngày)\n"
    "  2. D: SCRUM-6  [DB/BA] - Thiết kế ERD 16 bảng MySQL & DDL Schema (10/09 - 11/09, 2 ngày)\n"
    "  3. G: SCRUM-21 [Backend] - Authentication JWT & phân quyền Role-based (22/09 - 23/09, 2 ngày)\n"
    "  4. J: SCRUM-26 [Backend] - Xử lý upload file CV lên S3 Private Storage (29/09 - 30/09, 2 ngày)\n"
    "  5. M: SCRUM-27 [AI/BE] - Tích hợp Gemini 2.5 Flash trích xuất dữ liệu CV (01/10 - 05/10, 3 ngày)\n"
    "  6. O: SCRUM-48 [QA/PM] - Kiểm thử UAT trên Production & Nghiệm thu MVP (30/10 - 03/11, 2 ngày)\n"
    "• Kiểm soát điểm nghẽn rủi ro (Critical Bottleneck): Mắt xích M (SCRUM-27: Gemini AI Parsing) "
    "chiếm tới 3 ngày làm việc trên đường găng. Bất kỳ sự chậm trễ nào tại module AI này sẽ làm trễ trực tiếp ngày nghiệm thu đồ án!"
)
c_sum = ws.cell(28, 12, summary_text)
c_sum.font = Font(name='Arial', size=9, bold=True, color='1F4E79')
c_sum.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
c_sum.fill = PatternFill(start_color='F0F4F8', end_color='F0F4F8', fill_type='solid')

for r in range(23, 41):
    for c in range(12, 31):
        ws.cell(r, c).border = bdr_cp

wb.save('sheet.xlsx')
wb.save('PERT_SmartRecruit_100Percent.xlsx')
print("Saved sheet.xlsx and PERT_SmartRecruit_100Percent.xlsx successfully with embedded vector overlay!")

# 4. WRITE THE COMPLETE GOOGLE APPS SCRIPT (dong_bo_pert_that_100.gs)
gs_code = f'''/**
 * GOOGLE APPS SCRIPT: VẼ SƠ ĐỒ PERT CHUYÊN NGHIỆP CÓ KHUNG Ô & MŨI TÊN KÉO TỚI KHUNG
 * DỰ ÁN: SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ DỰ ÁN)
 * Học phần: Quản lý Dự án Công nghệ Thông tin - Nhóm 03
 */

function capNhatPertSmartRecruitThat100() {{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERT_SmartRecruit");
  
  if (!sheet) {{
    sheet = ss.insertSheet("PERT_SmartRecruit");
  }} else {{
    sheet.clear();
    // Xóa các hình vẽ / ảnh cũ nếu có
    var images = sheet.getImages();
    for (var i = 0; i < images.length; i++) {{
      images[i].remove();
    }}
    // Xóa unmerge
    var maxRows = sheet.getMaxRows();
    var maxCols = sheet.getMaxColumns();
    if (maxRows > 1 && maxCols > 1) {{
      sheet.getRange(1, 1, maxRows, maxCols).breakApart();
    }}
  }}

  // 1. Tiêu đề chính
  sheet.getRange("B1:AD1").merge();
  var title = sheet.getRange("B1");
  title.setValue("3.4.1 - SƠ ĐỒ PERT CHO DỰ ÁN NỀN TẢNG TUYỂN DỤNG THÔNG MINH SMARTRECRUIT");
  title.setBackground("#FCE4D6");
  title.setFontColor("#000000");
  title.setFontSize(13);
  title.setFontWeight("bold");
  title.setHorizontalAlignment("center");
  title.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);

  // 2. Tiêu đề 3 Giai đoạn
  sheet.getRange("B2:J2").merge().setValue("Phát thảo các sơ đồ và dữ liệu cốt lõi (Sprint 1 - 2)")
    .setBackground("#D9E1F2").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("K2:V2").merge().setValue("Phát triển giao diện & Core API tuyển dụng (Sprint 3 - 4)")
    .setBackground("#FFF2CC").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("W2:AD2").merge().setValue("Tích hợp AI Gemini & Nghiệm thu UAT đóng dự án (Sprint 5 - 8)")
    .setBackground("#E2EFDA").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(2, 24);

  // 3. 15 Node Boxes
  var nodes = {{
    'A': {{code: 'SCRUM-11', role: 'PM', dur: 2, es: 0, ef: 2, ls: 0, slk: 0, lf: 2, name: 'Họp Kick-off MVP, thống nhất phạm vi & lập Project Charter', col: 2, row: 3, cp: true}},
    'B': {{code: 'SCRUM-1',  role: 'BE', dur: 1, es: 0, ef: 1, ls: 1, slk: 1, lf: 2, name: 'Khởi tạo source base Spring Boot & cấu hình khung dự án', col: 2, row: 9, cp: false}},
    'C': {{code: 'SCRUM-2',  role: 'DevOps', dur: 1, es: 2, ef: 3, ls: 12, slk: 10, lf: 13, name: 'Thiết lập môi trường Docker Compose & kết nối Server ban đầu', col: 8, row: 3, cp: false}},
    'D': {{code: 'SCRUM-6',  role: 'DB & BA', dur: 2, es: 2, ef: 4, ls: 2, slk: 0, lf: 4, name: 'Thiết kế mô hình ERD 16 bảng MySQL & DDL Schema cốt lõi', col: 8, row: 9, cp: true}},
    'E': {{code: 'SCRUM-5',  role: 'FE', dur: 1, es: 4, ef: 5, ls: 12, slk: 8, lf: 13, name: 'Thiết kế UI/UX trên Figma & Wireframe nguyên mẫu tuyển dụng', col: 13, row: 3, cp: false}},
    'F': {{code: 'SCRUM-8',  role: 'FE', dur: 1, es: 4, ef: 5, ls: 12, slk: 8, lf: 13, name: 'Cài đặt ReactJS Router, Tailwind & khung layout Dashboard', col: 13, row: 9, cp: false}},
    'G': {{code: 'SCRUM-21', role: 'BE', dur: 2, es: 4, ef: 6, ls: 4, slk: 0, lf: 6, name: 'Xây dựng Authentication JWT & phân quyền Role-based Spring Sec', col: 13, row: 15, cp: true}},
    'H': {{code: 'SCRUM-23', role: 'BE', dur: 1, es: 6, ef: 7, ls: 12, slk: 6, lf: 13, name: 'Xây dựng RESTful API CRUD Quản lý tin tuyển dụng (Job Post)', col: 18, row: 3, cp: false}},
    'I': {{code: 'SCRUM-25', role: 'DB', dur: 1, es: 6, ef: 7, ls: 12, slk: 6, lf: 13, name: 'Thiết kế bảng từ điển danh mục kỹ năng chuẩn hóa (Skill Taxonomy)', col: 18, row: 9, cp: false}},
    'J': {{code: 'SCRUM-26', role: 'BE', dur: 2, es: 6, ef: 8, ls: 6, slk: 0, lf: 8, name: 'Viết module tiếp nhận & Upload file CV lưu trữ S3 Private', col: 18, row: 15, cp: true}},
    'K': {{code: 'SCRUM-28', role: 'FE', dur: 1, es: 8, ef: 9, ls: 12, slk: 4, lf: 13, name: 'Dựng giao diện ứng viên nộp hồ sơ trực tuyến & kéo thả CV', col: 23, row: 3, cp: false}},
    'L': {{code: 'SCRUM-29', role: 'QA', dur: 2, es: 8, ef: 10, ls: 11, slk: 3, lf: 13, name: 'Viết test case API Postman, xác thực cấu trúc JSON từ Gemini', col: 23, row: 9, cp: false}},
    'M': {{code: 'SCRUM-27', role: 'AI & BE', dur: 3, es: 8, ef: 11, ls: 8, slk: 0, lf: 11, name: 'Tích hợp Gemini 2.5 Flash API trích xuất kỹ năng/kinh nghiệm CV', col: 23, row: 15, cp: true}},
    'N': {{code: 'SCRUM-33', role: 'FE', dur: 1, es: 11, ef: 12, ls: 12, slk: 1, lf: 13, name: 'Phát triển giao diện Bảng xếp hạng ứng viên theo điểm AI Match', col: 28, row: 3, cp: false}},
    'O': {{code: 'SCRUM-48', role: 'QA & PM', dur: 2, es: 11, ef: 13, ls: 11, slk: 0, lf: 13, name: 'Kiểm thử chấp nhận UAT Production, Retrospective & Đóng dự án', col: 28, row: 9, cp: true}}
  }};

  for (var k in nodes) {{
    var n = nodes[k];
    var r = n.row;
    var c = n.col;
    var isCp = n.cp;
    
    var bg = isCp ? "#FEE2E2" : "#FFFFFF";
    var bdrColor = isCp ? "#DC2626" : "#000000";
    var hdrColor = isCp ? "#DC2626" : "#1E7E34";
    var nameColor = isCp ? "#991B1B" : "#1F2937";
    var numColor = isCp ? "#DC2626" : "#000000";

    // Row 1: Header
    sheet.getRange(r, c, 1, 3).merge()
      .setValue(k + ": " + n.code + " [" + n.role + "]")
      .setFontColor(hdrColor).setFontWeight("bold").setFontSize(9)
      .setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 2: ES | t | EF
    sheet.getRange(r+1, c).setValue(n.es).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+1, c+1).setValue(n.dur).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+1, c+2).setValue(n.ef).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 3: Name
    sheet.getRange(r+2, c, 1, 3).merge()
      .setValue(n.name)
      .setFontColor(nameColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(8).setWrap(true)
      .setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 4: LS | Slack | LF
    sheet.getRange(r+3, c).setValue(n.ls).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+3, c+1).setValue(n.slk).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+3, c+2).setValue(n.lf).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Border khung Node
    sheet.getRange(r, c, 4, 3).setBorder(true, true, true, true, true, true, bdrColor, isCp ? SpreadsheetApp.BorderStyle.SOLID_MEDIUM : SpreadsheetApp.BorderStyle.SOLID);
  }}

  // Set Row Heights
  [3, 9, 15].forEach(function(row) {{
    sheet.setRowHeight(row, 20);
    sheet.setRowHeight(row+1, 18);
    sheet.setRowHeight(row+2, 36);
    sheet.setRowHeight(row+3, 18);
  }});
  [7, 8, 13, 14, 19, 20].forEach(function(row) {{
    sheet.setRowHeight(row, 14);
  }});

  // Set Column Widths
  sheet.setColumnWidth(1, 25);
  [2, 3, 4, 8, 9, 10, 13, 14, 15, 18, 19, 20, 23, 24, 25, 28, 29, 30].forEach(function(c) {{
    sheet.setColumnWidth(c, 55);
  }});
  [5, 6, 7].forEach(function(c) {{
    sheet.setColumnWidth(c, 35);
  }});
  [11, 12, 16, 17, 21, 22, 26, 27].forEach(function(c) {{
    sheet.setColumnWidth(c, 45);
  }});

  // 4. CHÈN HÌNH ẢNH MŨI TÊN VECTOR TRỰC QUAN (NỐI TỪ KHUNG TỚI KHUNG)
  // Neo chính xác từ ô A1 để độ lệch pixel khớp 100% với các khung
  var b64Data = "{b64_png}";
  var blob = Utilities.newBlob(Utilities.base64Decode(b64Data), "image/png", "pert_arrows.png");
  sheet.insertImage(blob, 1, 1, 0, 0);

  // 5. BẢNG CÁC ĐƯỜNG CÔNG VIỆC (Row 22 - 42)
  sheet.getRange("B22:J22").merge().setValue("BẢNG DANH MỤC CÁC ĐƯỜNG CÔNG VIỆC TRONG MẠNG TIẾN ĐỘ PERT (17 ĐƯỜNG):")
    .setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10).setVerticalAlignment("middle");

  sheet.getRange("B23").setValue("STT");
  sheet.getRange("C23:H23").merge().setValue("Đường công việc chi tiết trong mạng PERT");
  sheet.getRange("I23").setValue("Tổng (ngày)");
  sheet.getRange("J23").setValue("Phân loại");
  sheet.getRange("B23:J23").setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(9).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(23, 24);

  var paths = [
    [1,  "A(2) ➔ C(1)", 3, "Nhánh phụ Setup"],
    [2,  "A(2) ➔ D(2) ➔ E(1)", 5, "Nhánh phụ UI/UX"],
    [3,  "A(2) ➔ D(2) ➔ F(1)", 5, "Nhánh phụ Layout"],
    [4,  "A(2) ➔ D(2) ➔ G(2) ➔ H(1)", 7, "Nhánh phụ Job API"],
    [5,  "A(2) ➔ D(2) ➔ G(2) ➔ I(1)", 7, "Nhánh phụ Taxonomy"],
    [6,  "A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ K(1)", 9, "Nhánh phụ Nộp CV"],
    [7,  "A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ L(2)", 10, "Nhánh phụ QA Test"],
    [8,  "A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ N(1)", 12, "Đường cận găng (Slack=1)"],
    [9,  "A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ O(2)", 13, "ĐƯỜNG GĂNG (CRITICAL PATH)"],
    [10, "B(1) ➔ C(1)", 2, "Nhánh phụ Khởi tạo"],
    [11, "B(1) ➔ D(2) ➔ E(1)", 4, "Nhánh phụ UI Base"],
    [12, "B(1) ➔ D(2) ➔ F(1)", 4, "Nhánh phụ Frontend Base"],
    [13, "B(1) ➔ D(2) ➔ G(2) ➔ H(1)", 6, "Nhánh phụ Backend Job"],
    [14, "B(1) ➔ D(2) ➔ G(2) ➔ I(1)", 6, "Nhánh phụ Database"],
    [15, "B(1) ➔ D(2) ➔ G(2) ➔ J(2) ➔ K(1)", 8, "Nhánh phụ Candidate Portal"],
    [16, "B(1) ➔ D(2) ➔ G(2) ➔ J(2) ➔ L(2)", 9, "Nhánh phụ Postman QA"],
    [17, "B(1) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ N(1)", 11, "Nhánh phụ Ranking UI"]
  ];

  for (var i = 0; i < paths.length; i++) {{
    var pRow = 24 + i;
    var isCritical = (paths[i][0] === 9);
    var pBg = isCritical ? "#FEE2E2" : "#FFFFFF";
    var pColor = isCritical ? "#DC2626" : "#000000";

    sheet.getRange(pRow, 2).setValue(paths[i][0]).setHorizontalAlignment("center");
    sheet.getRange(pRow, 3, 1, 6).merge().setValue(paths[i][1]).setHorizontalAlignment("left");
    sheet.getRange(pRow, 9).setValue(paths[i][2]).setHorizontalAlignment("center");
    sheet.getRange(pRow, 10).setValue(paths[i][3]).setHorizontalAlignment("center");

    var rRange = sheet.getRange(pRow, 2, 1, 9);
    rRange.setBackground(pBg).setFontColor(pColor).setFontSize(9).setFontWeight(isCritical ? "bold" : "normal").setVerticalAlignment("middle");
    rRange.setBorder(true, true, true, true, true, true, isCritical ? "#DC2626" : "#D9D9D9", SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(pRow, 20);
  }}

  // 6. KHUNG KẾT LUẬN ĐƯỜNG GĂNG (Cols L to AD, Rows 23 - 40)
  sheet.getRange("L23:AD24").merge()
    .setValue("DỰA VÀO ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỜNG GANTT THIẾT YẾU (ĐƯỜNG GĂNG - CRITICAL PATH) NHƯ SAU:")
    .setBackground("#FEE2E2").setFontColor("#DC2626").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("L25:AD27").merge()
    .setValue("A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ O(2)")
    .setBackground("#FEE2E2").setFontColor("#991B1B").setFontWeight("bold").setFontSize(13)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("L28:AD40").merge()
    .setValue("KẾT LUẬN & THÔNG SỐ QUẢN TRỊ DỰ ÁN SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ):\\n" +
              "• Tổng thời lượng đường găng: 13 ngày làm việc găng chuẩn tiến độ (Critical Path = 13 days).\\n" +
              "• Tổng thời gian lịch trình dự án: 57 ngày lịch trình (08 Sprint: từ 08/09/2026 đến 03/11/2026).\\n" +
              "• Chuỗi tác vụ găng (Critical Path Flow):\\n" +
              "  1. A: SCRUM-11 [PM] - Họp Kick-off MVP & lập Project Charter (08/09 - 09/09, 2 ngày)\\n" +
              "  2. D: SCRUM-6  [DB/BA] - Thiết kế ERD 16 bảng MySQL & DDL Schema (10/09 - 11/09, 2 ngày)\\n" +
              "  3. G: SCRUM-21 [Backend] - Authentication JWT & phân quyền Role-based (22/09 - 23/09, 2 ngày)\\n" +
              "  4. J: SCRUM-26 [Backend] - Xử lý upload file CV lên S3 Private Storage (29/09 - 30/09, 2 ngày)\\n" +
              "  5. M: SCRUM-27 [AI/BE] - Tích hợp Gemini 2.5 Flash trích xuất dữ liệu CV (01/10 - 05/10, 3 ngày)\\n" +
              "  6. O: SCRUM-48 [QA/PM] - Kiểm thử UAT trên Production & Nghiệm thu MVP (30/10 - 03/11, 2 ngày)\\n" +
              "• Kiểm soát điểm nghẽn rủi ro (Critical Bottleneck): Mắt xích M (SCRUM-27: Gemini AI Parsing) " +
              "chiếm tới 3 ngày làm việc trên đường găng. Bất kỳ sự chậm trễ nào tại module AI này sẽ làm trễ trực tiếp ngày nghiệm thu đồ án!")
    .setBackground("#F0F4F8").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(9).setWrap(true)
    .setHorizontalAlignment("left").setVerticalAlignment("middle");

  sheet.getRange("L23:AD40").setBorder(true, true, true, true, true, true, "#DC2626", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}}
'''

with open('scripts/dong_bo_pert_that_100.gs', 'w') as f:
    f.write(gs_code)

print("Master visual PERT generated successfully!")
