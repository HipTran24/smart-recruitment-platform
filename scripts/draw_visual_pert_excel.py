import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.load_workbook('sheet.xlsx')

# Cleanly recreate PERT_SmartRecruit
if 'PERT_SmartRecruit' in wb.sheetnames:
    idx = wb.sheetnames.index('PERT_SmartRecruit')
    wb.remove(wb['PERT_SmartRecruit'])
    ws = wb.create_sheet('PERT_SmartRecruit', index=idx)
else:
    ws = wb.create_sheet('PERT_SmartRecruit', index=2)

# Styles
font_title = Font(name='Arial', size=13, bold=True, color='000000')
font_subtitle = Font(name='Arial', size=9, italic=True, color='595959')
font_stage = Font(name='Arial', size=10, bold=True, color='1F4E79')
font_node_header_cp = Font(name='Arial', size=9, bold=True, color='DC2626')
font_node_header = Font(name='Arial', size=9, bold=True, color='1E7E34')
font_val_cp = Font(name='Arial', size=9, bold=True, color='DC2626')
font_val = Font(name='Arial', size=9, bold=False, color='000000')
font_task_name_cp = Font(name='Arial', size=8, bold=True, color='991B1B')
font_task_name = Font(name='Arial', size=8, bold=False, color='1F2937')
font_arrow_cp = Font(name='Arial', size=11, bold=True, color='DC2626')
font_arrow = Font(name='Arial', size=11, bold=True, color='2563EB')

fill_title = PatternFill(start_color='FCE4D6', end_color='FCE4D6', fill_type='solid')
fill_stage1 = PatternFill(start_color='D9E1F2', end_color='D9E1F2', fill_type='solid') # Blue
fill_stage2 = PatternFill(start_color='FFF2CC', end_color='FFF2CC', fill_type='solid') # Yellow
fill_stage3 = PatternFill(start_color='E2EFDA', end_color='E2EFDA', fill_type='solid') # Green
fill_node_cp = PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid') # Light Red
fill_node = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid') # White
fill_tbl_header = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')

thin_black = Side(style='thin', color='000000')
medium_red = Side(style='medium', color='DC2626')
thin_gray = Side(style='thin', color='D9D9D9')

border_node_normal = Border(left=thin_black, right=thin_black, top=thin_black, bottom=thin_black)
border_node_cp = Border(left=medium_red, right=medium_red, top=medium_red, bottom=medium_red)

# 1. Main Title
ws.merge_cells('B1:AD1')
ws.cell(1, 2, '3.4.1 - SƠ ĐỒ PERT TIẾN TRÌNH DỰ ÁN NỀN TẢNG TUYỂN DỤNG THÔNG MINH SMARTRECRUIT')
ws.cell(1, 2).font = font_title
ws.cell(1, 2).alignment = Alignment(horizontal='center', vertical='center')
ws.cell(1, 2).fill = fill_title
ws.row_dimensions[1].height = 30

ws.merge_cells('B2:AD2')
ws.cell(2, 2, 'Nguồn dữ liệu: 100% trích xuất từ Sơ đồ Gantt (50 Tasks SCRUM) & WBS SmartRecruit | Tiến độ: 08 Sprint (08/09/2026 - 03/11/2026)')
ws.cell(2, 2).font = font_subtitle
ws.cell(2, 2).alignment = Alignment(horizontal='center', vertical='center')
ws.row_dimensions[2].height = 18

# 2. Stage Headers
# Stage 1: Cols B - H
ws.merge_cells('B3:H3')
ws.cell(3, 2, 'GIAI ĐOẠN 1: KHỞI ĐỘNG & KIẾN TRÚC DỮ LIỆU (Sprint 1 - 2)')
ws.cell(3, 2).font = font_stage
ws.cell(3, 2).fill = fill_stage1
ws.cell(3, 2).alignment = Alignment(horizontal='center', vertical='center')

# Stage 2: Cols J - P
ws.merge_cells('J3:P3')
ws.cell(3, 10, 'GIAI ĐOẠN 2: NỀN TẢNG GIAO DIỆN & CORE API TUYỂN DỤNG (Sprint 3 - 4)')
ws.cell(3, 10).font = font_stage
ws.cell(3, 10).fill = fill_stage2
ws.cell(3, 10).alignment = Alignment(horizontal='center', vertical='center')

# Stage 3: Cols R - AD
ws.merge_cells('R3:AD3')
ws.cell(3, 18, 'GIAI ĐOẠN 3: AI GEMINI MATCHING, TESTING & UAT NGHIỆM THU (Sprint 5 - 8)')
ws.cell(3, 18).font = font_stage
ws.cell(3, 18).fill = fill_stage3
ws.cell(3, 18).alignment = Alignment(horizontal='center', vertical='center')
ws.row_dimensions[3].height = 24

# Data of 19 nodes
from test_visual_pert_model import nodes, es, ef, ls, lf, slack, cp

# Coordinates of nodes: (start_row, start_col)
# Columns:
# Col 1: B, C, D (cols 2, 3, 4)
# Spacer: E (col 5)
# Col 2: F, G, H (cols 6, 7, 8)
# Spacer: I (col 9)
# Col 3: J, K, L (cols 10, 11, 12)
# Spacer: M (col 13)
# Col 4: N, O, P (cols 14, 15, 16)
# Spacer: Q (col 17)
# Col 5: R, S, T (cols 18, 19, 20)
# Spacer: U (col 21)
# Col 6: V, W, X (cols 22, 23, 24)
# Spacer: Y (col 25)
# Col 7: Z, AA, AB (cols 26, 27, 28)

col_map = {
    1: 2,   # B
    2: 6,   # F
    3: 10,  # J
    4: 14,  # N
    5: 18,  # R
    6: 22,  # V
    7: 26   # Z
}

row_map = {
    'top': 5,
    'mid': 11,
    'bot': 17
}

def draw_node(ws, key, n_data):
    is_cp = (key in cp)
    c_start = col_map[n_data['col']]
    r_start = row_map[n_data['row']]
    
    fill_bg = fill_node_cp if is_cp else fill_node
    bdr = border_node_cp if is_cp else border_node_normal
    f_hdr = font_node_header_cp if is_cp else font_node_header
    f_val = font_val_cp if is_cp else font_val
    f_name = font_task_name_cp if is_cp else font_task_name
    
    # Row 1: Header (Key: Ticket [Role])
    ws.merge_cells(start_row=r_start, start_column=c_start, end_row=r_start, end_column=c_start+2)
    c_hdr = ws.cell(r_start, c_start, f"{key}: {n_data['code']} [{n_data['role']}]")
    c_hdr.font = f_hdr
    c_hdr.alignment = Alignment(horizontal='center', vertical='center')
    c_hdr.fill = fill_bg
    
    # Row 2: ES | t | EF
    c_es = ws.cell(r_start+1, c_start, es[key])
    c_dur = ws.cell(r_start+1, c_start+1, n_data['dur'])
    c_ef = ws.cell(r_start+1, c_start+2, ef[key])
    for c in [c_es, c_dur, c_ef]:
        c.font = f_val
        c.alignment = Alignment(horizontal='center', vertical='center')
        c.fill = fill_bg
        
    # Row 3: Name
    ws.merge_cells(start_row=r_start+2, start_column=c_start, end_row=r_start+2, end_column=c_start+2)
    c_name = ws.cell(r_start+2, c_start, n_data['name'])
    c_name.font = f_name
    c_name.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    c_name.fill = fill_bg
    
    # Row 4: LS | Slack | LF
    c_ls = ws.cell(r_start+3, c_start, ls[key])
    c_slk = ws.cell(r_start+3, c_start+1, slack[key])
    c_lf = ws.cell(r_start+3, c_start+2, lf[key])
    for c in [c_ls, c_slk, c_lf]:
        c.font = f_val
        c.alignment = Alignment(horizontal='center', vertical='center')
        c.fill = fill_bg

    # Borders
    for r in range(r_start, r_start+4):
        for col in range(c_start, c_start+3):
            ws.cell(r, col).border = bdr

# Draw all nodes
for k, v in nodes.items():
    draw_node(ws, k, v)

# Row heights for node rows
for r in [5, 11, 17]:
    ws.row_dimensions[r].height = 18    # Header
    ws.row_dimensions[r+1].height = 16  # ES t EF
    ws.row_dimensions[r+2].height = 32  # Task Name
    ws.row_dimensions[r+3].height = 16  # LS Slack LF
ws.row_dimensions[9].height = 12
ws.row_dimensions[10].height = 12
ws.row_dimensions[15].height = 12
ws.row_dimensions[16].height = 12

# Draw Connector Arrows in spacer columns
# Critical Path: A(top,c1) -> D(top,c2) -> E(mid,c2) -> F(bot,c2) -> G(top,c3) -> H(mid,c3) -> J(top,c4) -> K(mid,c4) -> N(mid,c5) -> O(bot,c5) -> P(top,c6) -> Q(mid,c6) -> R(top,c7) -> S(mid,c7)

# Arrow A -> D: Col E (col 5), Row 6
ws.cell(6, 5, '══►').font = font_arrow_cp
ws.cell(6, 5).alignment = Alignment(horizontal='center', vertical='center')

# Arrow D -> E: Within Col 2, vertical arrow Row 9-10
ws.cell(9, 7, '▼').font = font_arrow_cp
ws.cell(9, 7).alignment = Alignment(horizontal='center', vertical='center')

# Arrow E -> F: Within Col 2, vertical arrow Row 15-16
ws.cell(15, 7, '▼').font = font_arrow_cp
ws.cell(15, 7).alignment = Alignment(horizontal='center', vertical='center')

# Arrow F -> G: From F (bot, c2) to G (top, c3): Col I (col 9)
ws.cell(18, 9, '══►').font = font_arrow_cp
ws.cell(18, 9).alignment = Alignment(horizontal='center', vertical='center')

# Arrow G -> H: Within Col 3, vertical arrow
ws.cell(9, 11, '▼').font = font_arrow_cp
ws.cell(9, 11).alignment = Alignment(horizontal='center', vertical='center')

# Arrow H -> J: From H (mid, c3) to J (top, c4): Col M (col 13)
ws.cell(12, 13, '══►').font = font_arrow_cp
ws.cell(12, 13).alignment = Alignment(horizontal='center', vertical='center')

# Arrow J -> K: Within Col 4, vertical arrow
ws.cell(9, 15, '▼').font = font_arrow_cp
ws.cell(9, 15).alignment = Alignment(horizontal='center', vertical='center')

# Arrow K -> N: From K (mid, c4) to N (mid, c5): Col Q (col 17), Row 12
ws.cell(12, 17, '══►').font = font_arrow_cp
ws.cell(12, 17).alignment = Alignment(horizontal='center', vertical='center')

# Arrow N -> O: Within Col 5, vertical arrow
ws.cell(15, 19, '▼').font = font_arrow_cp
ws.cell(15, 19).alignment = Alignment(horizontal='center', vertical='center')

# Arrow O -> P: From O (bot, c5) to P (top, c6): Col U (col 21), Row 18
ws.cell(18, 21, '══►').font = font_arrow_cp
ws.cell(18, 21).alignment = Alignment(horizontal='center', vertical='center')

# Arrow P -> Q: Within Col 6, vertical arrow
ws.cell(9, 23, '▼').font = font_arrow_cp
ws.cell(9, 23).alignment = Alignment(horizontal='center', vertical='center')

# Arrow Q -> R: From Q (mid, c6) to R (top, c7): Col Y (col 25), Row 12
ws.cell(12, 25, '══►').font = font_arrow_cp
ws.cell(12, 25).alignment = Alignment(horizontal='center', vertical='center')

# Arrow R -> S: Within Col 7, vertical arrow
ws.cell(9, 27, '▼').font = font_arrow_cp
ws.cell(9, 27).alignment = Alignment(horizontal='center', vertical='center')

# Non-critical arrows (Blue)
# A -> B (within col 1)
ws.cell(9, 3, '──►').font = font_arrow
ws.cell(9, 3).alignment = Alignment(horizontal='center', vertical='center')
# A -> C (within col 1)
ws.cell(15, 3, '──►').font = font_arrow
ws.cell(15, 3).alignment = Alignment(horizontal='center', vertical='center')
# B -> G (col E, row 12)
ws.cell(12, 5, '──►').font = font_arrow
ws.cell(12, 5).alignment = Alignment(horizontal='center', vertical='center')
# H -> I (within col 3)
ws.cell(15, 11, '──►').font = font_arrow
ws.cell(15, 11).alignment = Alignment(horizontal='center', vertical='center')
# J -> L (within col 4)
ws.cell(15, 15, '──►').font = font_arrow
ws.cell(15, 15).alignment = Alignment(horizontal='center', vertical='center')
# K -> M (col Q, row 6)
ws.cell(6, 17, '──►').font = font_arrow
ws.cell(6, 17).alignment = Alignment(horizontal='center', vertical='center')
# M -> O (within col 5)
ws.cell(9, 19, '──►').font = font_arrow
ws.cell(9, 19).alignment = Alignment(horizontal='center', vertical='center')

# -------------------------------------------------------------
# 3. Table of Paths below the diagram (Row 23)
# -------------------------------------------------------------
ws.cell(22, 2, 'BẢNG DANH MỤC CÁC ĐƯỜNG CÔNG VIỆC TRONG MẠNG TIẾN ĐỘ (NETWORK PATHS):')
ws.cell(22, 2).font = Font(name='Arial', size=11, bold=True, color='1F4E79')

headers_tbl = ['STT', 'Đường công việc chi tiết trong mạng PERT', 'Tổng thời gian (ngày)', 'Đánh giá']
ws.cell(23, 2, 'STT')
ws.cell(23, 3, 'Đường công việc chi tiết trong mạng PERT')
ws.merge_cells('C23:H23')
ws.cell(23, 9, 'Tổng (ngày)')
ws.cell(23, 10, 'Phân loại')

for col_idx in [2, 3, 4, 5, 6, 7, 8, 9, 10]:
    c = ws.cell(23, col_idx)
    c.fill = fill_tbl_header
    c.font = Font(name='Arial', size=9, bold=True, color='FFFFFF')
    c.alignment = Alignment(horizontal='center', vertical='center')
    c.border = border_node_normal
ws.row_dimensions[23].height = 24

paths_data = [
    (1, 'A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ I(2)', 8, 'Nhánh phụ'),
    (2, 'A(1) ➔ C(2) ➔ L(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 14, 'Nhánh phụ Frontend'),
    (3, 'A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ I(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 16, 'Nhánh phụ Backend Job'),
    (4, 'A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ L(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 18, 'Nhánh phụ Storage UI'),
    (5, 'A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 18, 'Nhánh phụ Tích hợp CV'),
    (6, 'A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ N(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 19, 'Nhánh dự phòng cận găng'),
    (7, 'A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ I(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 20, 'Nhánh phụ Database API'),
    (8, 'A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ L(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 22, 'Đường cận găng (Slack=1)'),
    (9, 'A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 22, 'Đường cận găng (Slack=1)'),
    (10, 'A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ N(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)', 23, 'ĐƯỜNG GĂNG (CRITICAL PATH)')
]

for idx, (stt, p_str, tot, note) in enumerate(paths_data):
    r = 24 + idx
    is_cp = (stt == 10)
    bg = fill_node_cp if is_cp else fill_node
    fnt = font_val_cp if is_cp else font_val
    
    ws.cell(r, 2, stt).alignment = Alignment(horizontal='center', vertical='center')
    ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=8)
    ws.cell(r, 3, p_str).alignment = Alignment(horizontal='left', vertical='center')
    ws.cell(r, 9, tot).alignment = Alignment(horizontal='center', vertical='center')
    ws.cell(r, 10, note).alignment = Alignment(horizontal='center', vertical='center')
    
    for c_idx in range(2, 11):
        cell = ws.cell(r, c_idx)
        cell.fill = bg
        cell.font = fnt
        cell.border = border_node_cp if is_cp else border_node_normal
    ws.row_dimensions[r].height = 20

# -------------------------------------------------------------
# 4. Critical Path Conclusion Box on the Right (Cols L to AB, Rows 23-33)
# -------------------------------------------------------------
ws.merge_cells('L23:AB24')
c_box_hdr = ws.cell(23, 12, 'DỰA VÀO ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỢNG GANTT THIẾT YẾU (ĐƯỜNG GĂNG - CRITICAL PATH) NHƯ SAU:')
c_box_hdr.font = Font(name='Arial', size=10, bold=True, color='DC2626')
c_box_hdr.alignment = Alignment(horizontal='center', vertical='center')
c_box_hdr.fill = fill_node_cp

ws.merge_cells('L25:AB27')
c_box_cp = ws.cell(25, 12, 'A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ N(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)')
c_box_cp.font = Font(name='Arial', size=11, bold=True, color='991B1B')
c_box_cp.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
c_box_cp.fill = fill_node_cp

ws.merge_cells('L28:AB33')
summary_text = (
    "KẾT LUẬN & THÔNG SỐ QUẢN TRỊ DỰ ÁN SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ):\n"
    "• Tổng thời lượng đường găng: 23 ngày làm việc liên tục (Critical Path Length = 23 days).\n"
    "• Tổng thời gian lịch trình dự án: 57 ngày lịch trình (08 Sprint: từ 08/09/2026 đến 03/11/2026).\n"
    "• Mốc bắt đầu dự án: A (SCRUM-11: Họp Kick-off, xác định mục tiêu MVP & lập Project Charter vào 08/09/2026).\n"
    "• Mốc kết thúc dự án: S (SCRUM-50: Họp tổng kết Sprint Retrospective, nghiệm thu UAT & bàn giao ngày 03/11/2026).\n"
    "• Điểm kiểm soát rủi ro trọng yếu (Critical Bottleneck): K (SCRUM-27: Tích hợp Gemini 2.5 Flash trích xuất CV) "
    "và N (SCRUM-31: AI Matching Scoring Engine). Mọi sự chậm trễ tại các mắt xích này sẽ làm trễ trực tiếp tiến độ giao sản phẩm!"
)
c_box_sum = ws.cell(28, 12, summary_text)
c_box_sum.font = Font(name='Arial', size=9, bold=True, color='1F4E79')
c_box_sum.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
c_box_sum.fill = PatternFill(start_color='F0F4F8', end_color='F0F4F8', fill_type='solid')

# Borders for conclusion box
for r in range(23, 34):
    for c in range(12, 29):
        ws.cell(r, c).border = border_node_cp

# Set column widths
ws.column_dimensions['A'].width = 3
# Node cols & spacers
for c_idx in [2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28]:
    ws.column_dimensions[get_column_letter(c_idx)].width = 7.5
for s_idx in [5, 9, 13, 17, 21, 25]:
    ws.column_dimensions[get_column_letter(s_idx)].width = 5
ws.column_dimensions['AC'].width = 3
ws.column_dimensions['AD'].width = 3

wb.save('sheet.xlsx')
wb.save('PERT_SmartRecruit_100Percent.xlsx')
print("Successfully generated visually drawn PERT chart with boxes in sheet.xlsx and PERT_SmartRecruit_100Percent.xlsx!")
