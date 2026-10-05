import openpyxl
from datetime import datetime

wb = openpyxl.load_workbook('sheet.xlsx', data_only=True)
ws = wb['Sơ đồ Gantt']
start_base = datetime(2026, 9, 8)

tasks = {}
for r in range(2, 52):
    stt = int(ws.cell(r, 1).value)
    name = ws.cell(r, 2).value
    dur = float(ws.cell(r, 3).value)
    start = ws.cell(r, 4).value
    end = ws.cell(r, 5).value
    start_day = (start - start_base).days + 1
    end_day = (end - start_base).days + 1
    tasks[stt] = {
        'id': f'SCRUM-{stt}',
        'stt': stt,
        'name': name,
        'dur': dur,
        'start_day': start_day,
        'end_day': end_day,
        'start_date': start.strftime('%d/%m'),
        'end_date': end.strftime('%d/%m')
    }

# Define predecessors based on engineering dependency in SmartRecruit Gantt
predecessors = {
    11: [],               # Kick-off PM
    1: [11],              # Backend Spring Boot setup
    5: [11],              # Frontend Figma UI
    12: [11],             # BA Thu thap yeu cau
    2: [1],               # DevOps Docker Compose
    6: [12],              # DB ERD 16 bang MySQL
    7: [1, 6],            # BE JPA connection
    8: [5],               # FE ReactJS router & layout Dashboard
    13: [12],             # BA SRS & Use Case
    9: [6, 7],            # DB & QA Tai lieu 8 bang & Auth test
    10: [2],              # DevOps AWS/Docker co ban
    14: [1],              # AI Gemini API format
    15: [1, 7, 13],       # BE Kien truc he thong Clean Arch
    16: [6],              # DB ERD 3NF
    17: [16],             # DB Schema DDL script
    18: [8, 13],          # UI/UX Figma Wireframe prototype
    19: [8, 18],          # FE Git repo, Tailwind
    20: [15, 17],         # BE Spring Boot JPA review S2
    3: [13, 20],          # BA DoR Sprint 3
    21: [20],             # BE Auth JWT
    22: [19, 21],         # FE UI Login/Register
    23: [21],             # BE API Job CRUD
    24: [22, 23],         # FE Dashboard Recruiter UI
    25: [17],             # DB Skill Taxonomy seed
    4: [23, 25],          # QA Test matrix CV upload
    26: [21],             # BE Upload file CV S3
    27: [14, 26],         # AI Gemini Pro API parsing
    28: [22, 26],         # FE Candidate Drag & Drop CV UI
    29: [27],             # QA Postman API & Gemini JSON
    30: [27, 28, 29],     # FE Tich hop CV & Review S4
    31: [25, 27],         # AI Match Scoring Engine
    32: [31],             # DB API Cham diem & HR evaluation
    33: [30, 31],         # FE UI Bang xep hang ung vien
    34: [32, 33],         # FE Form danh gia ung vien HR
    35: [32],             # BE Email JavaMailSender
    38: [10],             # DevOps Dockerfile backend/frontend
    36: [32],             # DB Toi uu query MySQL, Views
    37: [33],             # FE Dashboard Analytics Chart.js
    39: [38],             # DevOps Docker Compose multi-service
    40: [39],             # DevOps CI/CD GitHub Actions
    41: [30, 34, 35],     # QA Integration Test & E2E
    42: [37, 41],         # UI/UX Responsive & UX test
    44: [21, 40],         # DevOps Web Security OWASP & rate limit
    43: [36, 41],         # QA Performance Load test JMeter
    45: [41, 42],         # FE Fix bugs & UI polish
    46: [39, 44],         # DevOps Cloud VPS/AWS & SSL
    49: [34, 37],         # Docs User Manual & Swagger
    47: [40, 46],         # DevOps Deploy Production & logging
    48: [41, 45, 47],     # QA UAT Production & bao cao
    50: [48, 49]          # PM Sprint Retrospective & Dong du an
}

# Forward Pass (ES, EF)
# ES starts at 0 relative days (or 08/09 = day 0)
es = {}
ef = {}

# Topological order
import collections
in_degree = {i: len(predecessors[i]) for i in range(1, 51)}
graph = collections.defaultdict(list)
for i in range(1, 51):
    for p in predecessors[i]:
        graph[p].append(i)

queue = [i for i in range(1, 51) if in_degree[i] == 0]
topo_order = []
while queue:
    curr = queue.pop(0)
    topo_order.append(curr)
    for nxt in graph[curr]:
        in_degree[nxt] -= 1
        if in_degree[nxt] == 0:
            queue.append(nxt)

for node in topo_order:
    preds = predecessors[node]
    if not preds:
        es[node] = 0
    else:
        es[node] = max(ef[p] for p in preds)
    ef[node] = es[node] + tasks[node]['dur']

project_finish = max(ef.values())
print(f'Project Finish Duration (Sum of working days on CP): {project_finish} days')

# Backward Pass (LS, LF, Slack)
lf = {}
ls = {}
slack = {}

for node in reversed(topo_order):
    succs = graph[node]
    if not succs:
        lf[node] = project_finish
    else:
        lf[node] = min(ls[s] for s in succs)
    ls[node] = lf[node] - tasks[node]['dur']
    slack[node] = ls[node] - es[node]

# Critical Path
cp_nodes = [i for i in topo_order if slack[i] == 0]
print(f'Critical Path ({len(cp_nodes)} tasks):')
for i in cp_nodes:
    print(f"  {tasks[i]['id']:8s} | dur={tasks[i]['dur']}d | ES={es[i]:4.1f}, EF={ef[i]:4.1f} | {tasks[i]['name']}")

total_dur = sum(tasks[i]["dur"] for i in cp_nodes)
print(f"Total Critical Path Length = {total_dur} days!")
