import json

html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sơ Đồ Mạng PERT / CPM Dự Án SmartRecruit - Nhóm 03</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    .node-box {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
      transition: all 0.2s ease-in-out;
    }
    .node-box:hover {
      filter: drop-shadow(0 6px 12px rgba(31, 78, 121, 0.2));
      transform: translateY(-2px);
    }
    .arrow-critical {
      stroke: #dc2626;
      stroke-width: 2.5;
      fill: none;
    }
    .arrow-normal {
      stroke: #2563eb;
      stroke-width: 2;
      fill: none;
    }
    .marker-critical {
      fill: #dc2626;
    }
    .marker-normal {
      fill: #2563eb;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased p-4 md:p-8 font-sans">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Top Header Card -->
    <header class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
            <span>Quản Lý Dự Án CNTT</span> • <span>Học phần 2026</span> • <span>Nhóm 03</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">SƠ ĐỒ MẠNG PERT / CPM NỀN TẢNG SMARTRECRUIT</h1>
          <p class="text-sm text-slate-500 mt-1">Định dạng chuẩn Activity-On-Node (AON) với 6 tham số (ES - Duration - EF | LS - Slack - LF), đường găng và xác suất hoàn thành</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button id="btnTab1" onclick="switchTab(1)" class="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 text-white shadow-sm transition">
            1. PERT Phân Tích & Chức Năng (13 ngày)
          </button>
          <button id="btnTab2" onclick="switchTab(2)" class="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
            2. PERT Toàn Dự Án Sprint 1–8 (39 ngày)
          </button>
        </div>
      </div>
    </header>

    <!-- TAB 1: PERT PHÂN TÍCH & THIẾT KẾ (CHUẨN FORM MẪU) -->
    <main id="tabContent1" class="space-y-6">
      
      <!-- Banner Giải thích mô hình -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">15</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Quy mô hoạt động</div>
            <div class="text-sm font-bold text-slate-800">15 Nút (Node A – O)</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">13</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Độ dài đường găng</div>
            <div class="text-sm font-bold text-rose-600">13 Ngày làm việc</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">18</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Tổng số đường mạng</div>
            <div class="text-sm font-bold text-slate-800">18 Đường công việc</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">✓</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Đường găng (Critical)</div>
            <div class="text-sm font-bold text-slate-800">A → D → G → J → M → O</div>
          </div>
        </div>
      </div>

      <!-- Node Structure Legend -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-4 h-1 bg-red-600 inline-block rounded"></span>
            <span class="font-medium text-slate-700">Đường găng (Critical Path - Slack = 0)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-4 h-1 bg-blue-600 inline-block rounded"></span>
            <span class="font-medium text-slate-700">Đường không găng (Non-critical)</span>
          </div>
        </div>
        <!-- Cấu trúc 1 Node -->
        <div class="flex items-center gap-2 text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span class="font-semibold text-slate-600">Quy ước Node:</span>
          <div class="border border-slate-400 bg-white rounded text-[11px] text-center w-36 overflow-hidden">
            <div class="bg-slate-100 font-bold text-emerald-700 py-0.5 border-b border-slate-300">Mã [A]</div>
            <div class="grid grid-cols-3 border-b border-slate-200 text-slate-600 py-0.5 font-mono">
              <span title="Early Start">ES</span><span title="Duration">t</span><span title="Early Finish">EF</span>
            </div>
            <div class="py-1 px-1 text-[10px] text-slate-800 font-medium truncate">Tên công việc</div>
            <div class="grid grid-cols-3 bg-slate-50 text-slate-600 py-0.5 font-mono border-t border-slate-200">
              <span title="Late Start">LS</span><span title="Slack (Float)">Float</span><span title="Late Finish">LF</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sơ đồ trực quan SVG -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-x-auto">
        <div class="min-w-[1100px]">
          
          <!-- Phase Title Banners -->
          <div class="grid grid-cols-12 gap-2 mb-4 text-center font-bold text-xs uppercase tracking-wider text-white">
            <div class="col-span-3 bg-blue-700 py-2.5 rounded-lg shadow-sm">
              Giai đoạn 1: Phác thảo cơ sở dữ liệu (4 Sơ đồ)
            </div>
            <div class="col-span-5 bg-amber-600 py-2.5 rounded-lg shadow-sm">
              Giai đoạn 2: Phác thảo các giao diện (6 Màn hình)
            </div>
            <div class="col-span-4 bg-emerald-700 py-2.5 rounded-lg shadow-sm">
              Giai đoạn 3: Phác thảo các chức năng (5 Module)
            </div>
          </div>

          <!-- SVG Canvas Container -->
          <svg viewBox="0 0 1150 480" class="w-full h-auto select-none">
            <defs>
              <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#dc2626" />
              </marker>
              <marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
              </marker>
            </defs>

            <!-- ================= ARROWS (CONNECTIONS) ================= -->
            <!-- Critical Path: A -> D -> G -> J -> M -> O -->
            <!-- A(x=95, y=140) to D(x=245, y=300): Red -->
            <path d="M 160 140 L 195 140 L 195 300 L 210 300" class="arrow-critical" marker-end="url(#arrowRed)" />
            <!-- D(x=275, y=300) to G(x=415, y=370): Red -->
            <path d="M 340 300 L 370 300 L 370 370 L 380 370" class="arrow-critical" marker-end="url(#arrowRed)" />
            <!-- G(x=445, y=370) to J(x=595, y=370): Red -->
            <path d="M 510 370 L 560 370" class="arrow-critical" marker-end="url(#arrowRed)" />
            <!-- J(x=625, y=370) to M(x=775, y=370): Red -->
            <path d="M 690 370 L 740 370" class="arrow-critical" marker-end="url(#arrowRed)" />
            <!-- M(x=805, y=370) to O(x=955, y=370): Red -->
            <path d="M 870 370 L 920 370" class="arrow-critical" marker-end="url(#arrowRed)" />

            <!-- Non-critical Arrows (Blue) -->
            <!-- A to C(x=245, y=140) -->
            <path d="M 160 140 L 210 140" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- B(x=95, y=300) to D(x=245, y=300) -->
            <path d="M 160 300 L 210 300" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- D to E(x=415, y=90) -->
            <path d="M 340 300 L 365 300 L 365 90 L 380 90" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- D to F(x=415, y=230) -->
            <path d="M 340 300 L 365 300 L 365 230 L 380 230" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- G to H(x=595, y=90) -->
            <path d="M 510 370 L 545 370 L 545 90 L 560 90" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- G to I(x=595, y=230) -->
            <path d="M 510 370 L 545 370 L 545 230 L 560 230" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- J to K(x=775, y=90) -->
            <path d="M 690 370 L 725 370 L 725 90 L 740 90" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- J to L(x=775, y=230) -->
            <path d="M 690 370 L 725 370 L 725 230 L 740 230" class="arrow-normal" marker-end="url(#arrowBlue)" />
            <!-- M to N(x=955, y=230) -->
            <path d="M 870 370 L 905 370 L 905 230 L 920 230" class="arrow-normal" marker-end="url(#arrowBlue)" />

            <!-- ================= NODES ================= -->
            
            <!-- NODE HELPER MACRO RENDERING -->
            <!-- NODE A (Critical) -->
            <g class="node-box" transform="translate(30, 95)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">A</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <!-- ES t EF -->
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">0</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">2</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">2</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <!-- Desc -->
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.1.1 Use Case SmartRecruit</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <!-- LS Slack LF -->
              <rect y="68" width="130" height="22" fill="#fef2f2" rx="0 0 6 6" />
              <text x="22" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">0</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626" font-family="monospace">0</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">2</text>
            </g>

            <!-- NODE B -->
            <g class="node-box" transform="translate(30, 255)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">B</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">0</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">1</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.1.2 Class Diagram Domain</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">1</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">1</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">2</text>
            </g>

            <!-- NODE C -->
            <g class="node-box" transform="translate(210, 95)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">C</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">2</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">3</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.1.3 Sơ đồ DFD SmartRecruit</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">10</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE D (Critical) -->
            <g class="node-box" transform="translate(210, 255)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">D</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">2</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">2</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">4</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.1.4 ERD 16 bảng MySQL</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <rect y="68" width="130" height="22" fill="#fef2f2" rx="0 0 6 6" />
              <text x="22" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">2</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626" font-family="monospace">0</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">4</text>
            </g>

            <!-- NODE E -->
            <g class="node-box" transform="translate(380, 45)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">E</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">4</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">5</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.2.1 Phác thảo Trang chủ</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">8</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE F -->
            <g class="node-box" transform="translate(380, 185)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">F</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">4</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">5</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.2.2 Trang Login & OIDC</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">8</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE G (Critical) -->
            <g class="node-box" transform="translate(380, 325)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">G</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">4</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">2</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">6</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.2.3 Quản lý tin Job</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <rect y="68" width="130" height="22" fill="#fef2f2" rx="0 0 6 6" />
              <text x="22" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">4</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626" font-family="monospace">0</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">6</text>
            </g>

            <!-- NODE H -->
            <g class="node-box" transform="translate(560, 45)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">H</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">6</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">7</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.2.4 Nộp CV & Parse AI</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">6</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE I -->
            <g class="node-box" transform="translate(560, 185)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">I</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">6</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">7</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.2.5 Ranking ứng viên</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">6</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE J (Critical) -->
            <g class="node-box" transform="translate(560, 325)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">J</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">6</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">2</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">8</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.2.6 Dashboard Thống kê</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <rect y="68" width="130" height="22" fill="#fef2f2" rx="0 0 6 6" />
              <text x="22" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">6</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626" font-family="monospace">0</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">8</text>
            </g>

            <!-- NODE K -->
            <g class="node-box" transform="translate(740, 45)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">K</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">8</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">9</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.3.1 Xác thực RBAC</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">4</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE L -->
            <g class="node-box" transform="translate(740, 185)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">L</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">8</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">2</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">10</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.3.2 Lưu trữ CV S3 Private</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">11</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">3</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE M (Critical) -->
            <g class="node-box" transform="translate(740, 325)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">M</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">8</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">3</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">11</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.3.3 Gemini AI & Match Score</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <rect y="68" width="130" height="22" fill="#fef2f2" rx="0 0 6 6" />
              <text x="22" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">8</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626" font-family="monospace">0</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">11</text>
            </g>

            <!-- NODE N -->
            <g class="node-box" transform="translate(920, 185)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">N</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">11</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">1</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.3.4 Đánh giá & Rubric HR</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <text x="22" y="83" text-anchor="middle" font-size="11" font-family="monospace">12</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb" font-family="monospace">1</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" font-family="monospace">13</text>
            </g>

            <!-- NODE O (Critical) -->
            <g class="node-box" transform="translate(920, 325)">
              <rect width="130" height="90" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect width="130" height="22" rx="6" fill="#f8fafc" />
              <text x="65" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">O</text>
              <line x1="0" y1="22" x2="130" y2="22" stroke="#e2e8f0" />
              <text x="22" y="37" text-anchor="middle" font-size="11" font-family="monospace">11</text>
              <text x="65" y="37" text-anchor="middle" font-size="11" font-weight="bold" font-family="monospace">2</text>
              <text x="108" y="37" text-anchor="middle" font-size="11" font-family="monospace">13</text>
              <line x1="0" y1="44" x2="130" y2="44" stroke="#e2e8f0" />
              <text x="65" y="58" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#1e293b">3.1.3.5 Báo cáo KPI Tuyển dụng</text>
              <line x1="0" y1="68" x2="130" y2="68" stroke="#e2e8f0" />
              <rect y="68" width="130" height="22" fill="#fef2f2" rx="0 0 6 6" />
              <text x="22" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">11</text>
              <text x="65" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626" font-family="monospace">0</text>
              <text x="108" y="83" text-anchor="middle" font-size="11" fill="#dc2626" font-family="monospace">13</text>
            </g>

          </svg>
        </div>
      </div>

      <!-- Path Table -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>BẢNG TỔNG HỢP 18 ĐƯỜNG CÔNG VIỆC VÀ XÁC ĐỊNH ĐƯỜNG GĂNG (CRITICAL PATH)</span>
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th class="py-2.5 px-3 w-12 text-center">STT</th>
                <th class="py-2.5 px-4">Chuỗi công việc chi tiết</th>
                <th class="py-2.5 px-3 w-28 text-center">Tổng thời gian</th>
                <th class="py-2.5 px-4 w-40 text-center">Đánh giá tính chất</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">1</td><td class="px-4">A(2) → C(1)</td><td class="text-center font-bold">3 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">2</td><td class="px-4">A(2) → D(2) → E(1)</td><td class="text-center font-bold">5 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">3</td><td class="px-4">A(2) → D(2) → F(1)</td><td class="text-center font-bold">5 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">4</td><td class="px-4">A(2) → D(2) → G(2) → H(1)</td><td class="text-center font-bold">7 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">5</td><td class="px-4">A(2) → D(2) → G(2) → I(1)</td><td class="text-center font-bold">7 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">6</td><td class="px-4">A(2) → D(2) → G(2) → J(2) → K(1)</td><td class="text-center font-bold">9 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">7</td><td class="px-4">A(2) → D(2) → G(2) → J(2) → L(2)</td><td class="text-center font-bold">10 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">8</td><td class="px-4">A(2) → D(2) → G(2) → J(2) → M(3) → N(1)</td><td class="text-center font-bold">12 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ (Slack = 1)</td></tr>
              <tr class="bg-rose-50 border-l-4 border-rose-600 font-semibold"><td class="py-2 px-3 text-center text-rose-700 font-bold">9</td><td class="px-4 text-rose-800">A(2) → D(2) → G(2) → J(2) → M(3) → O(2)</td><td class="text-center font-bold text-rose-700 text-xs">13 ngày</td><td class="text-center text-rose-700 font-bold font-sans">★ ĐƯỜNG GĂNG (CPM)</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">10</td><td class="px-4">B(1) → C(1)</td><td class="text-center font-bold">2 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">11</td><td class="px-4">B(1) → D(2) → E(1)</td><td class="text-center font-bold">4 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">12</td><td class="px-4">B(1) → D(2) → F(1)</td><td class="text-center font-bold">4 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">13</td><td class="px-4">B(1) → D(2) → G(2) → H(1)</td><td class="text-center font-bold">6 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">14</td><td class="px-4">B(1) → D(2) → G(2) → I(1)</td><td class="text-center font-bold">6 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">15</td><td class="px-4">B(1) → D(2) → G(2) → J(2) → K(1)</td><td class="text-center font-bold">8 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">16</td><td class="px-4">B(1) → D(2) → G(2) → J(2) → L(2)</td><td class="text-center font-bold">9 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">17</td><td class="px-4">B(1) → D(2) → G(2) → J(2) → M(3) → N(1)</td><td class="text-center font-bold">11 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-3 text-center">18</td><td class="px-4">B(1) → D(2) → G(2) → J(2) → M(3) → O(2)</td><td class="text-center font-bold">12 ngày</td><td class="text-center text-slate-500 font-sans">Đường phụ (Slack = 1)</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- TAB 2: PERT TOÀN DỰ ÁN SMARTRECRUIT SPRINT 1 - 8 (PMBOK BASELINE) -->
    <main id="tabContent2" class="space-y-6 hidden">
      
      <!-- Metrics Card -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">39</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Thời gian kỳ vọng (TE)</div>
            <div class="text-sm font-bold text-slate-800">39.0 Ngày làm việc</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">40</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Hạn ngạch 08 Sprint</div>
            <div class="text-sm font-bold text-emerald-600">40 Ngày (Dự phòng 1d)</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">74.9%</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Xác suất trước Sprint 8</div>
            <div class="text-sm font-bold text-blue-800">P(T ≤ 40d) = 74.86%</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">91.0%</div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Xác suất mốc 03/11 (UAT)</div>
            <div class="text-sm font-bold text-purple-800">P(T ≤ 41d) = 90.99%</div>
          </div>
        </div>
      </div>

      <!-- Bảng Tính PERT 3 Điểm & CPM -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>BẢNG TÍNH TOÁN PERT 3 ĐIỂM (O – M – P) & TIẾN TRÌNH CPM TOÀN DỰ ÁN</span>
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th class="py-2.5 px-2 text-center w-10">Mã</th>
                <th class="py-2.5 px-3">Tên hoạt động kỹ thuật cốt lõi (SmartRecruit WBS)</th>
                <th class="py-2.5 px-2 text-center w-14">Tiên quyết</th>
                <th class="py-2.5 px-2 text-center w-8">O</th>
                <th class="py-2.5 px-2 text-center w-8">M</th>
                <th class="py-2.5 px-2 text-center w-8">P</th>
                <th class="py-2.5 px-2 text-center w-14 font-semibold text-blue-700">TE</th>
                <th class="py-2.5 px-2 text-center w-14">Var (σ²)</th>
                <th class="py-2.5 px-2 text-center w-10">ES</th>
                <th class="py-2.5 px-2 text-center w-10">EF</th>
                <th class="py-2.5 px-2 text-center w-10">LS</th>
                <th class="py-2.5 px-2 text-center w-10">LF</th>
                <th class="py-2.5 px-2 text-center w-12 font-bold">Slack</th>
                <th class="py-2.5 px-3 text-center w-24">Găng?</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">A</td><td class="px-3 font-sans font-medium text-slate-800">WBS 1.1: Khởi động dự án & khóa baseline kỹ thuật</td><td class="text-center">-</td><td class="text-center">1</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center font-bold text-rose-700">2.00</td><td class="text-center">0.111</td><td class="text-center">0</td><td class="text-center">2</td><td class="text-center">0</td><td class="text-center">2</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">B</td><td class="px-3 font-sans font-medium text-slate-800">WBS 1.2-1.3: Phân tích yêu cầu, SRS & State machine</td><td class="text-center">A</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">2</td><td class="text-center">5</td><td class="text-center">2</td><td class="text-center">5</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">C</td><td class="px-3 font-sans font-medium text-slate-800">WBS 1.4: Spike Gemini: trích xuất cấu trúc & guardrail</td><td class="text-center">A</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">2</td><td class="text-center">5</td><td class="text-center">2</td><td class="text-center">5</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">D</td><td class="px-3 font-sans font-medium text-slate-800">WBS 1.5: Thiết kế kiến trúc Modular Monolith & ADR</td><td class="text-center">B, C</td><td class="text-center">1</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center font-bold text-rose-700">2.00</td><td class="text-center">0.111</td><td class="text-center">5</td><td class="text-center">7</td><td class="text-center">5</td><td class="text-center">7</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">E</td><td class="px-3 font-sans font-medium text-slate-800">WBS 2.1-2.2: Thiết kế ERD 16 bảng & Schema Flyway</td><td class="text-center">D</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">7</td><td class="text-center">10</td><td class="text-center">7</td><td class="text-center">10</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">F</td><td class="px-3 font-sans font-medium text-slate-800">WBS 2.3-2.4: Design system UI & Scaffold Web/API</td><td class="text-center">D</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">7</td><td class="text-center">10</td><td class="text-center">7</td><td class="text-center">10</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">G</td><td class="px-3 font-sans font-medium text-slate-800">WBS 3.1 & 3.6: Auth RBAC (Google OIDC) & Admin API</td><td class="text-center">E, F</td><td class="text-center">3</td><td class="text-center">5</td><td class="text-center">7</td><td class="text-center font-bold text-rose-700">5.00</td><td class="text-center">0.444</td><td class="text-center">10</td><td class="text-center">15</td><td class="text-center">10</td><td class="text-center">15</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="hover:bg-slate-50"><td class="py-1.5 px-2 text-center font-bold text-slate-600">H</td><td class="px-3 font-sans font-medium text-slate-700">WBS 3.3-3.5: Job posting API, Recruiter UI & Taxonomy</td><td class="text-center">G</td><td class="text-center">2</td><td class="text-center">4</td><td class="text-center">6</td><td class="text-center font-bold text-slate-700">4.00</td><td class="text-center">0.444</td><td class="text-center">15</td><td class="text-center">19</td><td class="text-center">16</td><td class="text-center">20</td><td class="text-center font-bold text-blue-600">1.0</td><td class="text-center font-sans text-slate-500">Không</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">I</td><td class="px-3 font-sans font-medium text-slate-800">WBS 4.1-4.2: Upload CV S3 private & Gemini Adapter</td><td class="text-center">G</td><td class="text-center">3</td><td class="text-center">5</td><td class="text-center">7</td><td class="text-center font-bold text-rose-700">5.00</td><td class="text-center">0.444</td><td class="text-center">15</td><td class="text-center">20</td><td class="text-center">15</td><td class="text-center">20</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">J</td><td class="px-3 font-sans font-medium text-slate-800">WBS 4.3-4.5: Candidate CV Intake UI & End-to-End</td><td class="text-center">H, I</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">20</td><td class="text-center">23</td><td class="text-center">20</td><td class="text-center">23</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">K</td><td class="px-3 font-sans font-medium text-slate-800">WBS 5.1-5.2: Match Scoring Engine & Evaluation API</td><td class="text-center">J</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center">5</td><td class="text-center font-bold text-rose-700">4.00</td><td class="text-center">0.111</td><td class="text-center">23</td><td class="text-center">27</td><td class="text-center">23</td><td class="text-center">27</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">L</td><td class="px-3 font-sans font-medium text-slate-800">WBS 5.3-5.5: Ranking UI, Feedback Review & Email</td><td class="text-center">K</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">27</td><td class="text-center">30</td><td class="text-center">27</td><td class="text-center">30</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">M</td><td class="px-3 font-sans font-medium text-slate-800">WBS 6.3-6.5: Docker hardening, Compose & CI/CD</td><td class="text-center">L</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">30</td><td class="text-center">33</td><td class="text-center">30</td><td class="text-center">33</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">N</td><td class="px-3 font-sans font-medium text-slate-800">WBS 7.1 & 7.4: Integration/E2E QA & Security Review</td><td class="text-center">M</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">33</td><td class="text-center">36</td><td class="text-center">33</td><td class="text-center">36</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
              <tr class="bg-rose-50 font-medium"><td class="py-1.5 px-2 text-center font-bold text-rose-700">P</td><td class="px-3 font-sans font-medium text-slate-800">WBS 8.1-8.5: AWS Deploy, Observability & UAT Handover</td><td class="text-center">N</td><td class="text-center">2</td><td class="text-center">3</td><td class="text-center">4</td><td class="text-center font-bold text-rose-700">3.00</td><td class="text-center">0.111</td><td class="text-center">36</td><td class="text-center">39</td><td class="text-center">36</td><td class="text-center">39</td><td class="text-center font-bold text-rose-700">0.0</td><td class="text-center font-bold font-sans text-rose-700">CÓ</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Kế Hoạch Ứng Phó Crashing vs Fast-tracking -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center gap-2 text-amber-700 font-bold mb-2">
            <span>⚡ Phương án 1: Fast-tracking (Làm song song gối đầu)</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed mb-3">
            Bắt đầu phát triển giao diện nộp hồ sơ CV (WBS 4.3 thuộc J) dựa trên hợp đồng Mock API ngay khi hoạt động I (Upload S3 & Gemini adapter) mới hoàn thành 50%, không đợi I hoàn tất 100%.
          </p>
          <div class="text-[11px] bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200">
            <strong>Ưu / Nhược điểm:</strong> Không làm phát sinh chi phí ngân sách, nhưng tăng rủi ro sửa lại code (rework) nếu API contract thay đổi đột xuất.
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center gap-2 text-rose-700 font-bold mb-2">
            <span>🚀 Phương án 2: Crashing (Nén tiến độ bằng nguồn lực)</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed mb-3">
            Tập trung nhân lực tăng ca hoặc áp dụng Pair-programming vào các công việc găng có độ phức tạp cao, đặc biệt là hoạt động I (WBS 4.2 Gemini) và hoạt động N (WBS 7.1/7.4 Test & Security).
          </p>
          <div class="text-[11px] bg-rose-50 text-rose-900 p-2.5 rounded-lg border border-rose-200">
            <strong>Ưu / Nhược điểm:</strong> Chắc chắn rút ngắn 1–2 ngày làm việc, nhưng làm tăng áp lực cho đội ngũ phát triển và có thể phát sinh chi phí phụ cấp.
          </div>
        </div>
      </div>

    </main>

  </div>

  <script>
    function switchTab(tabId) {
      const tab1 = document.getElementById('tabContent1');
      const tab2 = document.getElementById('tabContent2');
      const btn1 = document.getElementById('btnTab1');
      const btn2 = document.getElementById('btnTab2');

      if (tabId === 1) {
        tab1.classList.remove('hidden');
        tab2.classList.add('hidden');
        btn1.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 text-white shadow-sm transition';
        btn2.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition';
      } else {
        tab1.classList.add('hidden');
        tab2.classList.remove('hidden');
        btn1.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition';
        btn2.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 text-white shadow-sm transition';
      }
    }
  </script>
</body>
</html>
"""

with open('/Users/ProM2/.gemini/antigravity/brain/8ef6efd5-0012-4594-be9e-5fed9984d871/pert_diagram_smartrecruit.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Saved pert_diagram_smartrecruit.html successfully!")
