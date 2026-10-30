import json

code = """function veSoDoPertSmartRecruit() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERT_SmartRecruit");
  if (!sheet) {
    sheet = ss.insertSheet("PERT_SmartRecruit");
  }
  
  // Xóa trắng để vẽ lại từ đầu cực đẹp
  sheet.clear();
  sheet.clearFormats();
  
  // 1. Tiêu đề chính
  sheet.getRange("B1:X1").merge()
    .setValue("3.4.1 - SƠ ĐỒ PERT CHO CÔNG VIỆC PHÂN TÍCH, XỬ LÝ YÊU CẦU DỰ ÁN SMARTRECRUIT")
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setBackground("#FCE4D6").setFontColor("#000000");
  sheet.setRowHeight(1, 35);
  
  // 2. Banner 3 giai đoạn
  sheet.getRange("B2:H2").merge()
    .setValue("Giai đoạn 1: Phác thảo cơ sở dữ liệu SmartRecruit")
    .setBackground("#2F5597").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
    
  sheet.getRange("J2:P2").merge()
    .setValue("Giai đoạn 2: Phác thảo các giao diện SmartRecruit")
    .setBackground("#C65911").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
    
  sheet.getRange("R2:X2").merge()
    .setValue("Giai đoạn 3: Phác thảo các chức năng SmartRecruit")
    .setBackground("#375623").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(2, 28);

  // Hàm phụ trợ tạo 1 Node Box chuẩn AON (4 hàng x 3 cột)
  function createNode(colStart, rowStart, id, es, t, ef, desc, ls, slack, lf, isCritical) {
    var c1 = colStart;
    var c2 = colStart + 1;
    var c3 = colStart + 2;
    
    // Hàng 1: Mã Node (gộp 3 cột)
    sheet.getRange(rowStart, c1, 1, 3).merge()
      .setValue(id).setFontWeight("bold").setFontSize(11)
      .setFontColor(isCritical ? "#DC2626" : "#1E7E34")
      .setHorizontalAlignment("center").setVerticalAlignment("middle")
      .setBackground("#F8FAFC");
      
    // Hàng 2: ES, t, EF
    sheet.getRange(rowStart + 1, c1).setValue(es).setHorizontalAlignment("center");
    sheet.getRange(rowStart + 1, c2).setValue(t).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(rowStart + 1, c3).setValue(ef).setHorizontalAlignment("center");
    
    // Hàng 3: Tên công việc (gộp 3 cột)
    sheet.getRange(rowStart + 2, c1, 1, 3).merge()
      .setValue(desc).setFontSize(9).setWrap(true)
      .setHorizontalAlignment("center").setVerticalAlignment("middle")
      .setBackground("#FFFFFF");
      
    // Hàng 4: LS, Slack, LF
    sheet.getRange(rowStart + 3, c1).setValue(ls).setHorizontalAlignment("center");
    sheet.getRange(rowStart + 3, c2).setValue(slack).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(rowStart + 3, c3).setValue(lf).setHorizontalAlignment("center");
    
    // Viền khung
    var boxRange = sheet.getRange(rowStart, c1, 4, 3);
    if (isCritical) {
      boxRange.setBorder(true, true, true, true, true, true, "#DC2626", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      sheet.getRange(rowStart + 3, c1, 1, 3).setBackground("#FEF2F2").setFontColor("#DC2626");
    } else {
      boxRange.setBorder(true, true, true, true, true, true, "#94A3B8", SpreadsheetApp.BorderStyle.SOLID);
      sheet.getRange(rowStart + 3, c1, 1, 3).setBackground("#F1F5F9").setFontColor("#2563EB");
    }
  }

  // 3. Vẽ 15 Node Boxes
  // Cột 1: A, B (Cols B..D = cols 2..4)
  createNode(2, 7, "A", 0, 2, 2, "3.1.1.1 - Sơ đồ Use Case SmartRecruit", 0, 0, 2, true);
  createNode(2, 13, "B", 0, 1, 1, "3.1.1.2 - Sơ đồ Class / Domain Model", 1, 1, 2, false);
  
  // Cột 2: C, D (Cols F..H = cols 6..8)
  createNode(6, 7, "C", 2, 1, 3, "3.1.1.3 - Sơ đồ luồng dữ liệu - DFD", 12, 10, 13, false);
  createNode(6, 13, "D", 2, 2, 4, "3.1.1.4 - ERD 16 bảng MySQL", 2, 0, 4, true);
  
  // Cột 3: E, F, G (Cols J..L = cols 10..12)
  createNode(10, 4, "E", 4, 1, 5, "3.1.2.1 - Trang chủ & Landing Page", 12, 8, 13, false);
  createNode(10, 10, "F", 4, 1, 5, "3.1.2.2 - Trang đăng nhập & OIDC", 12, 8, 13, false);
  createNode(10, 16, "G", 4, 2, 6, "3.1.2.3 - Trang quản lý tin (Job)", 4, 0, 6, true);
  
  // Cột 4: H, I, J (Cols N..P = cols 14..16)
  createNode(14, 4, "H", 6, 1, 7, "3.1.2.4 - Trang nộp CV & parse AI", 12, 6, 13, false);
  createNode(14, 10, "I", 6, 1, 7, "3.1.2.5 - Trang ranking ứng viên", 12, 6, 13, false);
  createNode(14, 16, "J", 6, 2, 8, "3.1.2.6 - Dashboard thống kê phễu", 6, 0, 8, true);
  
  // Cột 5: K, L, M (Cols R..T = cols 18..20)
  createNode(18, 4, "K", 8, 1, 9, "3.1.3.1 - Xác thực RBAC", 12, 4, 13, false);
  createNode(18, 10, "L", 8, 2, 10, "3.1.3.2 - Lưu trữ CV S3 Private", 11, 3, 13, false);
  createNode(18, 16, "M", 8, 3, 11, "3.1.3.3 - Gemini AI & Match Score", 8, 0, 11, true);
  
  // Cột 6: N, O (Cols V..X = cols 22..24)
  createNode(22, 10, "N", 11, 1, 12, "3.1.3.4 - Đánh giá rubric HR", 12, 1, 13, false);
  createNode(22, 16, "O", 11, 2, 13, "3.1.3.5 - Báo cáo KPI Tuyển dụng", 11, 0, 13, true);

  // 4. Bảng 18 đường công việc
  sheet.getRange("B24").setValue("STT").setFontWeight("bold").setHorizontalAlignment("center").setBackground("#F1F5F9");
  sheet.getRange("C24:H24").merge().setValue("Chuỗi đường công việc chi tiết").setFontWeight("bold").setHorizontalAlignment("center").setBackground("#F1F5F9");
  sheet.getRange("I24").setValue("Tổng ngày").setFontWeight("bold").setHorizontalAlignment("center").setBackground("#F1F5F9");
  sheet.getRange("B24:I24").setBorder(true, true, true, true, true, true);
  
  var paths = [
    [1, "A(2)", "C(1)", "", "", "", "", 3],
    [2, "A(2)", "D(2)", "E(1)", "", "", "", 5],
    [3, "A(2)", "D(2)", "F(1)", "", "", "", 5],
    [4, "A(2)", "D(2)", "G(2)", "H(1)", "", "", 7],
    [5, "A(2)", "D(2)", "G(2)", "I(1)", "", "", 7],
    [6, "A(2)", "D(2)", "G(2)", "J(2)", "K(1)", "", 9],
    [7, "A(2)", "D(2)", "G(2)", "J(2)", "L(2)", "", 10],
    [8, "A(2)", "D(2)", "G(2)", "J(2)", "M(3)", "N(1)", 12],
    [9, "A(2)", "D(2)", "G(2)", "J(2)", "M(3)", "O(2)", 13],
    [10, "B(1)", "C(1)", "", "", "", "", 2],
    [11, "B(1)", "D(2)", "E(1)", "", "", "", 4],
    [12, "B(1)", "D(2)", "F(1)", "", "", "", 4],
    [13, "B(1)", "D(2)", "G(2)", "H(1)", "", "", 6],
    [14, "B(1)", "D(2)", "G(2)", "I(1)", "", "", 6],
    [15, "B(1)", "D(2)", "G(2)", "J(2)", "K(1)", "", 8],
    [16, "B(1)", "D(2)", "G(2)", "J(2)", "L(2)", "", 9],
    [17, "B(1)", "D(2)", "G(2)", "J(2)", "M(3)", "N(1)", 11],
    [18, "B(1)", "D(2)", "G(2)", "J(2)", "M(3)", "O(2)", 12]
  ];
  
  for (var i = 0; i < paths.length; i++) {
    var p = paths[i];
    var r = 25 + i;
    sheet.getRange(r, 2).setValue(p[0]).setHorizontalAlignment("center");
    for (var col = 0; col < 6; col++) {
      sheet.getRange(r, 3 + col).setValue(p[1 + col]).setHorizontalAlignment("center");
    }
    sheet.getRange(r, 9).setValue(p[7]).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(r, 2, 1, 8).setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
    
    // Highlight đường găng dòng số 9 (STT 9)
    if (p[0] === 9) {
      sheet.getRange(r, 2, 1, 8).setBackground("#FEE2E2").setFontColor("#991B1B").setFontWeight("bold");
    }
  }

  // Kết luận đường găng 13 ngày
  sheet.getRange("K24:P24").merge().setValue("DỰA VÀO 18 ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỜNG GĂNG (CRITICAL PATH):")
    .setFontWeight("bold").setFontColor("#1E293B");
  sheet.getRange("K25:P25").merge().setValue("A(2)  →  D(2)  →  G(2)  →  J(2)  →  M(3)  →  O(2)")
    .setFontWeight("bold").setFontSize(12).setFontColor("#DC2626").setHorizontalAlignment("center").setBackground("#FEE2E2");
  sheet.getRange("K26:P26").merge().setValue("★ TỔNG ĐỘ DÀI ĐƯỜNG GĂNG LÀ 13 NGÀY LÀM VIỆC")
    .setFontWeight("bold").setFontColor("#002060").setHorizontalAlignment("center");

  // 5. Bảng ước lượng toàn dự án 3.4.2 (Sprint 1 - 8)
  var r2 = 46;
  sheet.getRange(r2, 2, 1, 14).merge()
    .setValue("3.4.2 - BẢNG ƯỚC LƯỢNG TIẾN ĐỘ PERT 3 ĐIỂM & ĐƯỜNG GĂNG TOÀN DỰ ÁN SMARTRECRUIT (08 SPRINT)")
    .setFontSize(13).setFontWeight("bold").setBackground("#2F5597").setFontColor("#FFFFFF").setHorizontalAlignment("center");
    
  var headers2 = ["Mã", "Tên hoạt động kỹ thuật cốt lõi (SmartRecruit WBS)", "Tiên quyết", "O", "M", "P", "TE (ngày)", "Var (σ²)", "ES", "EF", "LS", "LF", "Slack", "Đường găng?"];
  sheet.getRange(r2 + 2, 2, 1, 14).setValues([headers2])
    .setFontWeight("bold").setBackground("#1E3A8A").setFontColor("#FFFFFF").setHorizontalAlignment("center");
    
  var pertAll = [
    ["A", "WBS 1.1: Khởi động dự án & khóa baseline kỹ thuật", "-", 1, 2, 3, 2.0, 0.111, 0, 2, 0, 2, 0, "CÓ (Găng)"],
    ["B", "WBS 1.2-1.3: Phân tích yêu cầu, SRS & State machine", "A", 2, 3, 4, 3.0, 0.111, 2, 5, 2, 5, 0, "CÓ (Găng)"],
    ["C", "WBS 1.4: Spike Gemini: trích xuất cấu trúc & guardrail", "A", 2, 3, 4, 3.0, 0.111, 2, 5, 2, 5, 0, "CÓ (Găng)"],
    ["D", "WBS 1.5: Thiết kế kiến trúc Modular Monolith & ADR", "B, C", 1, 2, 3, 2.0, 0.111, 5, 7, 5, 7, 0, "CÓ (Găng)"],
    ["E", "WBS 2.1-2.2: Thiết kế ERD 16 bảng & Schema Flyway", "D", 2, 3, 4, 3.0, 0.111, 7, 10, 7, 10, 0, "CÓ (Găng)"],
    ["F", "WBS 2.3-2.4: Design system UI & Scaffold Web/API", "D", 2, 3, 4, 3.0, 0.111, 7, 10, 7, 10, 0, "CÓ (Găng)"],
    ["G", "WBS 3.1 & 3.6: Auth RBAC (Google OIDC) & Admin API", "E, F", 3, 5, 7, 5.0, 0.444, 10, 15, 10, 15, 0, "CÓ (Găng)"],
    ["H", "WBS 3.3-3.5: Job posting API, Recruiter UI & Taxonomy", "G", 2, 4, 6, 4.0, 0.444, 15, 19, 16, 20, 1.0, "Không"],
    ["I", "WBS 4.1-4.2: Upload CV S3 private & Gemini Adapter", "G", 3, 5, 7, 5.0, 0.444, 15, 20, 15, 20, 0, "CÓ (Găng)"],
    ["J", "WBS 4.3-4.5: Candidate CV Intake UI & End-to-End", "H, I", 2, 3, 4, 3.0, 0.111, 20, 23, 20, 23, 0, "CÓ (Găng)"],
    ["K", "WBS 5.1-5.2: Match Scoring Engine & Evaluation API", "J", 3, 4, 5, 4.0, 0.111, 23, 27, 23, 27, 0, "CÓ (Găng)"],
    ["L", "WBS 5.3-5.5: Ranking UI, Feedback Review & Email", "K", 2, 3, 4, 3.0, 0.111, 27, 30, 27, 30, 0, "CÓ (Găng)"],
    ["M", "WBS 6.3-6.5: Docker hardening, Compose & CI/CD", "L", 2, 3, 4, 3.0, 0.111, 30, 33, 30, 33, 0, "CÓ (Găng)"],
    ["N", "WBS 7.1 & 7.4: Integration/E2E QA & Security Review", "M", 2, 3, 4, 3.0, 0.111, 33, 36, 33, 36, 0, "CÓ (Găng)"],
    ["P", "WBS 8.1-8.5: AWS Deploy, Observability & UAT Handover", "N", 2, 3, 4, 3.0, 0.111, 36, 39, 36, 39, 0, "CÓ (Găng)"]
  ];
  
  for (var j = 0; j < pertAll.length; j++) {
    var rowData = pertAll[j];
    var currR = r2 + 3 + j;
    sheet.getRange(currR, 2, 1, 14).setValues([rowData]);
    sheet.getRange(currR, 9).setNumberFormat("0.000"); // Var định dạng 0.111
    sheet.getRange(currR, 2, 1, 14).setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
    if (rowData[13].indexOf("CÓ") !== -1) {
      sheet.getRange(currR, 15).setBackground("#FEE2E2").setFontColor("#991B1B").setFontWeight("bold");
    }
  }

  // Căn chỉnh độ rộng cột tối ưu
  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 50);
  sheet.setColumnWidth(3, 45);
  sheet.setColumnWidth(4, 45);
  sheet.setColumnWidth(5, 20);
  sheet.setColumnWidth(6, 45);
  sheet.setColumnWidth(7, 45);
  sheet.setColumnWidth(8, 45);
  sheet.setColumnWidth(9, 65);
  sheet.setColumnWidth(10, 45);
  sheet.setColumnWidth(11, 45);
  sheet.setColumnWidth(12, 45);
  sheet.setColumnWidth(13, 20);
  sheet.setColumnWidth(14, 45);
  sheet.setColumnWidth(15, 45);
  sheet.setColumnWidth(16, 45);
  sheet.setColumnWidth(17, 20);
  sheet.setColumnWidth(18, 45);
  sheet.setColumnWidth(19, 45);
  sheet.setColumnWidth(20, 45);
  sheet.setColumnWidth(21, 20);
  sheet.setColumnWidth(22, 45);
  sheet.setColumnWidth(23, 45);
  sheet.setColumnWidth(24, 45);
  
  SpreadsheetApp.flush();
}
"""

with open("/Users/ProM2/Documents/smart-recruitment/scripts/ve_so_do_pert.gs", "w", encoding="utf-8") as f:
    f.write(code)

print("Created ve_so_do_pert.gs successfully!")
