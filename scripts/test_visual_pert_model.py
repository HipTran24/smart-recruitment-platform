import sys

# Define the network of key SmartRecruit tasks across the 6 columns matching the visual layout
# Column 1 (Sprint 1: Discovery & Core Base)
#   A: SCRUM-11 [PM] Kick-off & Project Charter (t=1)
#   B: SCRUM-1  [BE] Spring Boot Base & Config (t=2)
#   C: SCRUM-5  [FE] UI/UX Figma & ReactJS Base (t=2)
# Column 2 (Sprint 1-2: Architecture & Database)
#   D: SCRUM-12 [BA] Yêu cầu nghiệp vụ & Tiêu chí lọc CV (t=2)
#   E: SCRUM-6  [DB] Thiết kế ERD 16 bảng MySQL (t=2)
#   F: SCRUM-17 [DB] Khởi tạo Database Schema DDL & Indexes (t=2)
# Column 3 (Sprint 2-3: Platform & Core API)
#   G: SCRUM-20 [BE] Spring Boot JPA & Review S2 (t=1)
#   H: SCRUM-21 [BE] Authentication JWT & Spring Security (t=2)
#   I: SCRUM-23 [BE] REST API CRUD Quản lý tin tuyển dụng (t=2)
# Column 4 (Sprint 4: CV Upload & Gemini AI)
#   J: SCRUM-26 [BE] Upload CV S3 Private Storage (t=1)
#   K: SCRUM-27 [AI] Gemini 2.5 Flash API Parse CV (t=2)
#   L: SCRUM-28 [FE] Giao diện ứng viên nộp hồ sơ CV (t=2)
# Column 5 (Sprint 4-5: Matching & Scoring)
#   M: SCRUM-30 [FE] Tích hợp luồng nộp CV & Review S4 (t=1)
#   N: SCRUM-31 [AI] Matching Scoring Engine (t=2)
#   O: SCRUM-33 [FE] Giao diện Bảng xếp hạng ứng viên (t=2)
# Column 6 (Sprint 5-8: Evaluation, UAT & Handover)
#   P: SCRUM-34 [FE] Form đánh giá ứng viên HR (t=2)
#   Q: SCRUM-41 [QA] Kiểm thử tích hợp E2E & Test Case (t=2)
#   R: SCRUM-48 [QA] Kiểm thử chấp nhận UAT Production (t=1)
#   S: SCRUM-50 [PM] Sprint Retrospective & Đóng dự án (t=1)

nodes = {
    'A': {'code': 'SCRUM-11', 'name': 'Họp Kick-off MVP & Lập Project Charter', 'dur': 1, 'role': 'PM', 'col': 1, 'row': 'top'},
    'B': {'code': 'SCRUM-1',  'name': 'Khởi tạo source base Spring Boot & Config', 'dur': 2, 'role': 'BE', 'col': 1, 'row': 'mid'},
    'C': {'code': 'SCRUM-5',  'name': 'Thiết kế Figma UI & Khởi tạo React Client', 'dur': 2, 'role': 'FE', 'col': 1, 'row': 'bot'},
    'D': {'code': 'SCRUM-12', 'name': 'Thu thập yêu cầu tuyển dụng & lọc CV', 'dur': 2, 'role': 'BA', 'col': 2, 'row': 'top'},
    'E': {'code': 'SCRUM-6',  'name': 'Thiết kế chi tiết mô hình ERD 16 bảng MySQL', 'dur': 2, 'role': 'DB', 'col': 2, 'row': 'mid'},
    'F': {'code': 'SCRUM-17', 'name': 'Khởi tạo DB Schema DDL & Indexes tối ưu', 'dur': 2, 'role': 'DB', 'col': 2, 'row': 'bot'},
    'G': {'code': 'SCRUM-20', 'name': 'Spring Boot JPA Review kiến trúc S2', 'dur': 1, 'role': 'BE', 'col': 3, 'row': 'top'},
    'H': {'code': 'SCRUM-21', 'name': 'Xây dựng Authentication JWT & Phân quyền', 'dur': 2, 'role': 'BE', 'col': 3, 'row': 'mid'},
    'I': {'code': 'SCRUM-23', 'name': 'Xây dựng REST API CRUD Quản lý Job', 'dur': 2, 'role': 'BE', 'col': 3, 'row': 'bot'},
    'J': {'code': 'SCRUM-26', 'name': 'Module xử lý upload file CV lên AWS S3', 'dur': 1, 'role': 'BE', 'col': 4, 'row': 'top'},
    'K': {'code': 'SCRUM-27', 'name': 'Kết nối Gemini 2.5 Flash parse dữ liệu CV', 'dur': 2, 'role': 'AI', 'col': 4, 'row': 'mid'},
    'L': {'code': 'SCRUM-28', 'name': 'Giao diện ứng viên nộp CV trực tuyến', 'dur': 2, 'role': 'FE', 'col': 4, 'row': 'bot'},
    'M': {'code': 'SCRUM-30', 'name': 'Tích hợp luồng nộp hồ sơ & Review S4', 'dur': 1, 'role': 'FE', 'col': 5, 'row': 'top'},
    'N': {'code': 'SCRUM-31', 'name': 'Thuật toán AI Matching Score ứng viên', 'dur': 2, 'role': 'AI', 'col': 5, 'row': 'mid'},
    'O': {'code': 'SCRUM-33', 'name': 'Giao diện bảng xếp hạng ứng viên theo AI', 'dur': 2, 'role': 'FE', 'col': 5, 'row': 'bot'},
    'P': {'code': 'SCRUM-34', 'name': 'Giao diện Form đánh giá ứng viên HR', 'dur': 2, 'role': 'FE', 'col': 6, 'row': 'top'},
    'Q': {'code': 'SCRUM-41', 'name': 'Kiểm thử tích hợp (Integration Test) E2E', 'dur': 2, 'role': 'QA', 'col': 6, 'row': 'mid'},
    'R': {'code': 'SCRUM-48', 'name': 'Kiểm thử UAT trên Production & Báo cáo QA', 'dur': 1, 'role': 'QA', 'col': 7, 'row': 'top'},
    'S': {'code': 'SCRUM-50', 'name': 'Họp Sprint Retrospective & Nghiệm thu MVP', 'dur': 1, 'role': 'PM', 'col': 7, 'row': 'mid'}
}

# Predecessors
preds = {
    'A': [],
    'B': ['A'],
    'C': ['A'],
    'D': ['A'],
    'E': ['D'],
    'F': ['E'],
    'G': ['B', 'F'],
    'H': ['G'],
    'I': ['H'],
    'J': ['H'],
    'K': ['J'],
    'L': ['C', 'J'],
    'M': ['K', 'L'],
    'N': ['K'],
    'O': ['M', 'N'],
    'P': ['O'],
    'Q': ['P'],
    'R': ['Q'],
    'S': ['R']
}

# Forward Pass
es = {}
ef = {}
# Topological sort order
topo = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S']

for n in topo:
    p_list = preds[n]
    if not p_list:
        es[n] = 0
    else:
        es[n] = max(ef[p] for p in p_list)
    ef[n] = es[n] + nodes[n]['dur']

project_finish = max(ef.values())
print(f"Project finish: {project_finish} days")

# Backward Pass
succs = {n: [] for n in topo}
for n in topo:
    for p in preds[n]:
        succs[p].append(n)

lf = {}
ls = {}
slack = {}

for n in reversed(topo):
    s_list = succs[n]
    if not s_list:
        lf[n] = project_finish
    else:
        lf[n] = min(ls[s] for s in s_list)
    ls[n] = lf[n] - nodes[n]['dur']
    slack[n] = ls[n] - es[n]

cp = [n for n in topo if slack[n] == 0]
print(f"Critical Path: {' -> '.join(cp)}")
print(f"CP Length = {sum(nodes[n]['dur'] for n in cp)} days")

for n in topo:
    is_cp = " *CP*" if slack[n] == 0 else ""
    print(f"{n} ({nodes[n]['code']:8s}): dur={nodes[n]['dur']} | ES={es[n]:2d}, EF={ef[n]:2d} | LS={ls[n]:2d}, LF={lf[n]:2d} | Slack={slack[n]:2d}{is_cp}")
