import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.load_workbook('sheet.xlsx')
if 'PERT_SmartRecruit' in wb.sheetnames:
    wb.remove(wb['PERT_SmartRecruit'])
ws = wb.create_sheet('PERT_SmartRecruit', index=2)

# Ensure grid lines are visible
ws.views.sheetView[0].showGridLines = True

# Palettes
C_TITLE_BG = 'FCE4D6'       # Soft Peach
C_STAGE1_BG = 'EBF1F5'      # Soft Blue-Gray
C_STAGE1_HDR = 'D9E1F2'     # Light Blue Header
C_STAGE2_BG = 'FFFDF5'      # Soft Cream-Yellow
C_STAGE2_HDR = 'FFF2CC'     # Light Yellow Header
C_STAGE3_BG = 'F4FAF2'      # Soft Green
C_STAGE3_HDR = 'E2EFDA'     # Light Green Header

C_CP_BG = 'FFF5F5'          # Very soft red for CP boxes
C_CP_BORDER = 'DC2626'      # Red
C_NORM_BORDER = '4B5563'    # Slate Gray
C_BLUE_LINE = '2563EB'      # Blue for branches

# Fonts
f_main_title = Font(name='Arial', size=13, bold=True, color='000000')
f_stage_hdr = Font(name='Arial', size=10, bold=True, color='1F4E79')
f_node_hdr_cp = Font(name='Arial', size=10, bold=True, color='DC2626')
f_node_hdr = Font(name='Arial', size=10, bold=True, color='1E7E34')
f_num_cp = Font(name='Arial', size=9, bold=True, color='DC2626')
f_num = Font(name='Arial', size=9, bold=False, color='111827')
f_name_cp = Font(name='Arial', size=8, bold=True, color='991B1B')
f_name = Font(name='Arial', size=8, bold=False, color='1F2937')
f_arrow_red = Font(name='Arial', size=11, bold=True, color='DC2626')
f_arrow_blue = Font(name='Arial', size=11, bold=True, color='2563EB')

# Fills
fill_title = PatternFill(start_color=C_TITLE_BG, end_color=C_TITLE_BG, fill_type='solid')
fill_stg1_hdr = PatternFill(start_color=C_STAGE1_HDR, end_color=C_STAGE1_HDR, fill_type='solid')
fill_stg2_hdr = PatternFill(start_color=C_STAGE2_HDR, end_color=C_STAGE2_HDR, fill_type='solid')
fill_stg3_hdr = PatternFill(start_color=C_STAGE3_HDR, end_color=C_STAGE3_HDR, fill_type='solid')

fill_stg1_bg = PatternFill(start_color=C_STAGE1_BG, end_color=C_STAGE1_BG, fill_type='solid')
fill_stg2_bg = PatternFill(start_color=C_STAGE2_BG, end_color=C_STAGE2_BG, fill_type='solid')
fill_stg3_bg = PatternFill(start_color=C_STAGE3_BG, end_color=C_STAGE3_BG, fill_type='solid')

fill_box_white = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid')
fill_box_cp = PatternFill(start_color=C_CP_BG, end_color=C_CP_BG, fill_type='solid')
fill_tbl_hdr = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')

# Sides
side_thin_black = Side(style='thin', color='1F2937')
side_med_red = Side(style='medium', color=C_CP_BORDER)
side_thin_blue = Side(style='medium', color=C_BLUE_LINE)

bdr_node_normal = Border(left=side_thin_black, right=side_thin_black, top=side_thin_black, bottom=side_thin_black)
bdr_node_cp = Border(left=side_med_red, right=side_med_red, top=side_med_red, bottom=side_med_red)

# 1. Fill entire Stage Backgrounds (Rows 3 to 19)
for r in range(3, 20):
    for c in range(2, 11):      # Stage 1: Cols B - J
        ws.cell(r, c).fill = fill_stg1_bg
    for c in range(11, 23):     # Stage 2: Cols K - V
        ws.cell(r, c).fill = fill_stg2_bg
    for c in range(23, 31):     # Stage 3: Cols W - AD
        ws.cell(r, c).fill = fill_stg3_bg

# 2. Main Title (Row 1)
ws.merge_cells('B1:AD1')
c_title = ws.cell(1, 2, '3.4.1 - SƠ ĐỒ PERT TIẾN TRÌNH DỰ ÁN NỀN TẢNG TUYỂN DỤNG THÔNG MINH SMARTRECRUIT')
c_title.font = f_main_title
c_title.alignment = Alignment(horizontal='center', vertical='center')
c_title.fill = fill_title
ws.row_dimensions[1].height = 32

# 3. Stage Headers (Row 2)
ws.merge_cells('B2:J2')
c_stg1 = ws.cell(2, 2, 'Giai đoạn 1: Phát thảo các sơ đồ và kiến trúc cốt lõi (Sprint 1 - 2)')
c_stg1.font = f_stage_hdr
c_stg1.fill = fill_stg1_hdr
c_stg1.alignment = Alignment(horizontal='center', vertical='center')

ws.merge_cells('K2:V2')
c_stg2 = ws.cell(2, 11, 'Giai đoạn 2: Phát triển giao diện & Core API tuyển dụng (Sprint 3 - 4)')
c_stg2.font = f_stage_hdr
c_stg2.fill = fill_stg2_hdr
c_stg2.alignment = Alignment(horizontal='center', vertical='center')

ws.merge_cells('W2:AD2')
c_stg3 = ws.cell(2, 23, 'Giai đoạn 3: Tích hợp AI Gemini & Nghiệm thu UAT đóng dự án (Sprint 5 - 8)')
c_stg3.font = f_stage_hdr
c_stg3.fill = fill_stg3_hdr
c_stg3.alignment = Alignment(horizontal='center', vertical='center')
ws.row_dimensions[2].height = 24

# 4. 15 Nodes Data
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

# Draw 15 Node Boxes
for k, n in nodes.items():
    r = n['row']
    c = n['col']
    is_cp = n['cp']
    bg = fill_box_cp if is_cp else fill_box_white
    bdr = bdr_node_cp if is_cp else bdr_node_normal
    
    # Row 1: Header
    ws.merge_cells(start_row=r, start_column=c, end_row=r, end_column=c+2)
    ch = ws.cell(r, c, f"{k}: {n['code']} [{n['role']}]")
    ch.font = f_node_hdr_cp if is_cp else f_node_hdr
    ch.fill = bg
    ch.alignment = Alignment(horizontal='center', vertical='center')
    
    # Row 2: ES | t | EF
    for col_off, val in enumerate([n['es'], n['dur'], n['ef']]):
        cell = ws.cell(r+1, c+col_off, val)
        cell.font = f_num_cp if is_cp else f_num
        cell.fill = bg
        cell.alignment = Alignment(horizontal='center', vertical='center')
        
    # Row 3: Name
    ws.merge_cells(start_row=r+2, start_column=c, end_row=r+2, end_column=c+2)
    cn = ws.cell(r+2, c, n['name'])
    cn.font = f_name_cp if is_cp else f_name
    cn.fill = bg
    cn.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    
    # Row 4: LS | Slack | LF
    for col_off, val in enumerate([n['ls'], n['slk'], n['lf']]):
        cell = ws.cell(r+3, c+col_off, val)
        cell.font = f_num_cp if is_cp else f_num
        cell.fill = bg
        cell.alignment = Alignment(horizontal='center', vertical='center')
        
    for ro in range(r, r+4):
        for co in range(c, c+3):
            ws.cell(ro, co).border = bdr

# 5. DRAW CONNECTING LINES VIA CELL BORDERS
# Helper to set border properties safely
def add_border(cell, top=None, bottom=None, left=None, right=None):
    existing = cell.border
    new_top = top if top is not None else existing.top
    new_bottom = bottom if bottom is not None else existing.bottom
    new_left = left if left is not None else existing.left
    new_right = right if right is not None else existing.right
    cell.border = Border(top=new_top, bottom=new_bottom, left=new_left, right=new_right)

# --- CRITICAL PATH (RED) ---
# A -> D: From Box A (Col D, Row 4) to Box D (Col H, Row 10)
add_border(ws.cell(4, 5), bottom=side_med_red)             # E4 bottom
add_border(ws.cell(4, 6), bottom=side_med_red, right=side_med_red) # F4 corner
for r in range(5, 10):
    add_border(ws.cell(r, 6), right=side_med_red)          # F5-F9 right
add_border(ws.cell(10, 6), right=side_med_red, bottom=side_med_red) # F10 corner
add_border(ws.cell(10, 7), bottom=side_med_red)            # G10 bottom
c_arrow_ad = ws.cell(10, 7)
c_arrow_ad.value = '►'
c_arrow_ad.font = f_arrow_red
c_arrow_ad.alignment = Alignment(horizontal='right', vertical='center')

# D -> G: From Box D (Col J, Row 10) to Box G (Col M, Row 16)
add_border(ws.cell(10, 11), bottom=side_med_red)           # K10 bottom
add_border(ws.cell(10, 12), bottom=side_med_red, right=side_med_red) # L10 corner
for r in range(11, 16):
    add_border(ws.cell(r, 12), right=side_med_red)         # L11-L15 right
add_border(ws.cell(16, 12), right=side_med_red, bottom=side_med_red) # L16 corner
c_arrow_dg = ws.cell(16, 12)
c_arrow_dg.value = '►'
c_arrow_dg.font = f_arrow_red
c_arrow_dg.alignment = Alignment(horizontal='right', vertical='center')

# G -> J: From Box G (Col O, Row 16) to Box J (Col R, Row 16) - STRAIGHT RED
add_border(ws.cell(16, 16), bottom=side_med_red)           # P16 bottom
add_border(ws.cell(16, 17), bottom=side_med_red)           # Q16 bottom
c_arrow_gj = ws.cell(16, 17)
c_arrow_gj.value = '►'
c_arrow_gj.font = f_arrow_red
c_arrow_gj.alignment = Alignment(horizontal='right', vertical='center')

# J -> M: From Box J (Col T, Row 16) to Box M (Col W, Row 16) - STRAIGHT RED
add_border(ws.cell(16, 21), bottom=side_med_red)           # U16 bottom
add_border(ws.cell(16, 22), bottom=side_med_red)           # V16 bottom
c_arrow_jm = ws.cell(16, 22)
c_arrow_jm.value = '►'
c_arrow_jm.font = f_arrow_red
c_arrow_jm.alignment = Alignment(horizontal='right', vertical='center')

# M -> O: From Box M (Col Y, Row 16) to Box O (Col AB, Row 10)
add_border(ws.cell(16, 26), bottom=side_med_red)           # Z16 bottom
add_border(ws.cell(16, 27), bottom=side_med_red, right=side_med_red) # AA16 corner
for r in range(11, 16):
    add_border(ws.cell(r, 27), right=side_med_red)         # AA11-AA15 right
add_border(ws.cell(10, 27), right=side_med_red, bottom=side_med_red) # AA10 corner
c_arrow_mo = ws.cell(10, 27)
c_arrow_mo.value = '►'
c_arrow_mo.font = f_arrow_red
c_arrow_mo.alignment = Alignment(horizontal='right', vertical='center')

# --- BLUE BRANCH LINES ---
# A -> C: Top to Top straight (Row 3 bottom)
add_border(ws.cell(3, 5), bottom=side_thin_blue)
add_border(ws.cell(3, 6), bottom=side_thin_blue)
add_border(ws.cell(3, 7), bottom=side_thin_blue)
c_ac = ws.cell(3, 7)
c_ac.value = '►'
c_ac.font = f_arrow_blue
c_ac.alignment = Alignment(horizontal='right', vertical='center')

# B -> D: Mid to Mid straight (Row 9 bottom)
add_border(ws.cell(9, 5), bottom=side_thin_blue)
add_border(ws.cell(9, 6), bottom=side_thin_blue)
add_border(ws.cell(9, 7), bottom=side_thin_blue)
c_bd = ws.cell(9, 7)
c_bd.value = '►'
c_bd.font = f_arrow_blue
c_bd.alignment = Alignment(horizontal='right', vertical='center')

# D -> E: Mid to Top (from Col J, Row 9 turning up at Col K)
add_border(ws.cell(9, 11), bottom=side_thin_blue, left=side_thin_blue)
for r in range(5, 9):
    add_border(ws.cell(r, 11), left=side_thin_blue)
add_border(ws.cell(4, 11), left=side_thin_blue, bottom=side_thin_blue)
add_border(ws.cell(4, 12), bottom=side_thin_blue)
c_de = ws.cell(4, 12)
c_de.value = '►'
c_de.font = f_arrow_blue
c_de.alignment = Alignment(horizontal='right', vertical='center')

# D -> F: Mid to Mid straight (Row 9 bottom)
add_border(ws.cell(9, 11), bottom=side_thin_blue)
add_border(ws.cell(9, 12), bottom=side_thin_blue)
c_df = ws.cell(9, 12)
c_df.value = '►'
c_df.font = f_arrow_blue
c_df.alignment = Alignment(horizontal='right', vertical='center')

# G -> H: Bot to Top (from Col O, Row 15 turning up at Col P)
add_border(ws.cell(15, 16), bottom=side_thin_blue, left=side_thin_blue)
for r in range(5, 15):
    add_border(ws.cell(r, 16), left=side_thin_blue)
add_border(ws.cell(4, 16), left=side_thin_blue, bottom=side_thin_blue)
add_border(ws.cell(4, 17), bottom=side_thin_blue)
c_gh = ws.cell(4, 17)
c_gh.value = '►'
c_gh.font = f_arrow_blue
c_gh.alignment = Alignment(horizontal='right', vertical='center')

# G -> I: Bot to Mid (turns up at Col P to Row 9)
add_border(ws.cell(9, 16), left=side_thin_blue, bottom=side_thin_blue)
add_border(ws.cell(9, 17), bottom=side_thin_blue)
c_gi = ws.cell(9, 17)
c_gi.value = '►'
c_gi.font = f_arrow_blue
c_gi.alignment = Alignment(horizontal='right', vertical='center')

# J -> K: Bot to Top (from Col T, Row 15 turning up at Col U)
add_border(ws.cell(15, 21), bottom=side_thin_blue, left=side_thin_blue)
for r in range(5, 15):
    add_border(ws.cell(r, 21), left=side_thin_blue)
add_border(ws.cell(4, 21), left=side_thin_blue, bottom=side_thin_blue)
add_border(ws.cell(4, 22), bottom=side_thin_blue)
c_jk = ws.cell(4, 22)
c_jk.value = '►'
c_jk.font = f_arrow_blue
c_jk.alignment = Alignment(horizontal='right', vertical='center')

# J -> L: Bot to Mid (turns up at Col U to Row 9)
add_border(ws.cell(9, 21), left=side_thin_blue, bottom=side_thin_blue)
add_border(ws.cell(9, 22), bottom=side_thin_blue)
c_jl = ws.cell(9, 22)
c_jl.value = '►'
c_jl.font = f_arrow_blue
c_jl.alignment = Alignment(horizontal='right', vertical='center')

# M -> N: Bot to Top (from Col Y, Row 15 turning up at Col Z)
add_border(ws.cell(15, 26), bottom=side_thin_blue, left=side_thin_blue)
for r in range(5, 15):
    add_border(ws.cell(r, 26), left=side_thin_blue)
add_border(ws.cell(4, 26), left=side_thin_blue, bottom=side_thin_blue)
add_border(ws.cell(4, 27), bottom=side_thin_blue)
c_mn = ws.cell(4, 27)
c_mn.value = '►'
c_mn.font = f_arrow_blue
c_mn.alignment = Alignment(horizontal='right', vertical='center')

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

# Table of Paths (Rows 22 - 42)
ws.merge_cells('B22:J22')
c_tbl_title = ws.cell(22, 2, 'BẢNG DANH MỤC CÁC ĐƯỜNG CÔNG VIỆC TRONG MẠNG TIẾN ĐỘ PERT (17 ĐƯỜNG):')
c_tbl_title.font = f_stage_hdr

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
    cell.border = bdr_node_normal
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
    bg = fill_box_cp if is_cp else fill_box_white
    fnt = f_num_cp if is_cp else f_num
    
    ws.cell(r, 2, stt).alignment = Alignment(horizontal='center', vertical='center')
    ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=8)
    ws.cell(r, 3, p_str).alignment = Alignment(horizontal='left', vertical='center')
    ws.cell(r, 9, tot).alignment = Alignment(horizontal='center', vertical='center')
    ws.cell(r, 10, note).alignment = Alignment(horizontal='center', vertical='center')
    
    for c in range(2, 11):
        cell = ws.cell(r, c)
        cell.fill = bg
        cell.font = fnt
        cell.border = bdr_node_cp if is_cp else bdr_node_normal
    ws.row_dimensions[r].height = 20

# Conclusion Box on Right
ws.merge_cells('L23:AD24')
ws.cell(23, 12, 'DỰA VÀO ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỢNG GANTT THIẾT YẾU (ĐƯỜNG GĂNG - CRITICAL PATH) NHƯ SAU:').font = f_node_hdr_cp
ws.cell(23, 12).alignment = Alignment(horizontal='center', vertical='center')
ws.cell(23, 12).fill = fill_box_cp

ws.merge_cells('L25:AD27')
ws.cell(25, 12, 'A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ O(2)').font = Font(name='Arial', size=13, bold=True, color='991B1B')
ws.cell(25, 12).alignment = Alignment(horizontal='center', vertical='center')
ws.cell(25, 12).fill = fill_box_cp

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
        ws.cell(r, c).border = bdr_node_cp

wb.save('sheet.xlsx')
wb.save('PERT_SmartRecruit_100Percent.xlsx')
print("Pristine PERT generated with native cell borders in sheet.xlsx!")
