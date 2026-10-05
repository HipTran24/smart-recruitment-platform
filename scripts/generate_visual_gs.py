import sys

gs_code = '''/**
 * GOOGLE APPS SCRIPT: VẼ SƠ ĐỒ PERT CÓ KHUNG Ô & BẢNG ĐƯỜNG CÔNG VIỆC CHUẨN MẪU
 * DỰ ÁN: SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ 08 SPRINT)
 * Học phần: Quản lý Dự án Công nghệ Thông tin - Nhóm 03
 */

function capNhatPertSmartRecruitThat100() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERT_SmartRecruit");
  
  if (!sheet) {
    sheet = ss.insertSheet("PERT_SmartRecruit");
  } else {
    sheet.clear();
    // Xóa các liên kết ô cũ (unmerge)
    var maxRows = sheet.getMaxRows();
    var maxCols = sheet.getMaxColumns();
    if (maxRows > 1 && maxCols > 1) {
      sheet.getRange(1, 1, maxRows, maxCols).breakApart();
    }
  }

  // 1. Tiêu đề chính
  sheet.getRange("B1:AD1").merge();
  var title = sheet.getRange("B1");
  title.setValue("3.4.1 - SƠ ĐỒ PERT TIẾN TRÌNH DỰ ÁN NỀN TẢNG TUYỂN DỤNG THÔNG MINH SMARTRECRUIT");
  title.setBackground("#FCE4D6");
  title.setFontColor("#000000");
  title.setFontSize(13);
  title.setFontWeight("bold");
  title.setHorizontalAlignment("center");
  title.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);

  // Subtitle
  sheet.getRange("B2:AD2").merge();
  var sub = sheet.getRange("B2");
  sub.setValue("Nguồn dữ liệu: 100% trích xuất từ Sơ đồ Gantt (50 Tasks SCRUM) & WBS SmartRecruit | Tiến độ: 08 Sprint (08/09/2026 - 03/11/2026)");
  sub.setFontSize(9);
  sub.setFontStyle("italic");
  sub.setFontColor("#595959");
  sub.setHorizontalAlignment("center");
  sub.setVerticalAlignment("middle");
  sheet.setRowHeight(2, 20);

  // 2. Tiêu đề 3 Giai đoạn (Phase Headers)
  sheet.getRange("B3:H3").merge().setValue("GIAI ĐOẠN 1: KHỞI ĐỘNG & KIẾN TRÚC DỮ LIỆU (Sprint 1 - 2)")
    .setBackground("#D9E1F2").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("J3:P3").merge().setValue("GIAI ĐOẠN 2: NỀN TẢNG GIAO DIỆN & CORE API TUYỂN DỤNG (Sprint 3 - 4)")
    .setBackground("#FFF2CC").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("R3:AD3").merge().setValue("GIAI ĐOẠN 3: AI GEMINI MATCHING, TESTING & UAT NGHIỆM THU (Sprint 5 - 8)")
    .setBackground("#E2EFDA").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(3, 25);

  // 3. Danh sách 19 Node (A -> S)
  var nodes = {
    'A': {code: 'SCRUM-11', role: 'PM', dur: 1, es: 0, ef: 1, ls: 0, slk: 0, lf: 1, name: 'Họp Kick-off MVP & Lập Project Charter', col: 2, row: 5, cp: true},
    'B': {code: 'SCRUM-1',  role: 'BE', dur: 2, es: 1, ef: 3, ls: 5, slk: 4, lf: 7, name: 'Khởi tạo source base Spring Boot & Config', col: 2, row: 11, cp: false},
    'C': {code: 'SCRUM-5',  role: 'FE', dur: 2, es: 1, ef: 3, ls: 10, slk: 9, lf: 12, name: 'Thiết kế Figma UI & Khởi tạo React Client', col: 2, row: 17, cp: false},
    
    'D': {code: 'SCRUM-12', role: 'BA', dur: 2, es: 1, ef: 3, ls: 1, slk: 0, lf: 3, name: 'Thu thập yêu cầu tuyển dụng & lọc CV', col: 6, row: 5, cp: true},
    'E': {code: 'SCRUM-6',  role: 'DB', dur: 2, es: 3, ef: 5, ls: 3, slk: 0, lf: 5, name: 'Thiết kế chi tiết mô hình ERD 16 bảng MySQL', col: 6, row: 11, cp: true},
    'F': {code: 'SCRUM-17', role: 'DB', dur: 2, es: 5, ef: 7, ls: 5, slk: 0, lf: 7, name: 'Khởi tạo DB Schema DDL & Indexes tối ưu', col: 6, row: 17, cp: true},

    'G': {code: 'SCRUM-20', role: 'BE', dur: 1, es: 7, ef: 8, ls: 7, slk: 0, lf: 8, name: 'Spring Boot JPA Review kiến trúc S2', col: 10, row: 5, cp: true},
    'H': {code: 'SCRUM-21', role: 'BE', dur: 2, es: 8, ef: 10, ls: 8, slk: 0, lf: 10, name: 'Xây dựng Authentication JWT & Phân quyền', col: 10, row: 11, cp: true},
    'I': {code: 'SCRUM-23', role: 'BE', dur: 2, es: 10, ef: 12, ls: 21, slk: 11, lf: 23, name: 'Xây dựng REST API CRUD Quản lý Job', col: 10, row: 17, cp: false},

    'J': {code: 'SCRUM-26', role: 'BE', dur: 1, es: 10, ef: 11, ls: 10, slk: 0, lf: 11, name: 'Module xử lý upload file CV lên AWS S3', col: 14, row: 5, cp: true},
    'K': {code: 'SCRUM-27', role: 'AI', dur: 2, es: 11, ef: 13, ls: 11, slk: 0, lf: 13, name: 'Kết nối Gemini 2.5 Flash parse dữ liệu CV', col: 14, row: 11, cp: true},
    'L': {code: 'SCRUM-28', role: 'FE', dur: 2, es: 11, ef: 13, ls: 12, slk: 1, lf: 14, name: 'Giao diện ứng viên nộp CV trực tuyến', col: 14, row: 17, cp: false},

    'M': {code: 'SCRUM-30', role: 'FE', dur: 1, es: 13, ef: 14, ls: 14, slk: 1, lf: 15, name: 'Tích hợp luồng nộp hồ sơ & Review S4', col: 18, row: 5, cp: false},
    'N': {code: 'SCRUM-31', role: 'AI', dur: 2, es: 13, ef: 15, ls: 13, slk: 0, lf: 15, name: 'Thuật toán AI Matching Score ứng viên', col: 18, row: 11, cp: true},
    'O': {code: 'SCRUM-33', role: 'FE', dur: 2, es: 15, ef: 17, ls: 15, slk: 0, lf: 17, name: 'Giao diện bảng xếp hạng ứng viên theo AI', col: 18, row: 17, cp: true},

    'P': {code: 'SCRUM-34', role: 'FE', dur: 2, es: 17, ef: 19, ls: 17, slk: 0, lf: 19, name: 'Giao diện Form đánh giá ứng viên HR', col: 22, row: 5, cp: true},
    'Q': {code: 'SCRUM-41', role: 'QA', dur: 2, es: 19, ef: 21, ls: 19, slk: 0, lf: 21, name: 'Kiểm thử tích hợp (Integration Test) E2E', col: 22, row: 11, cp: true},

    'R': {code: 'SCRUM-48', role: 'QA', dur: 1, es: 21, ef: 22, ls: 21, slk: 0, lf: 22, name: 'Kiểm thử UAT trên Production & Báo cáo QA', col: 26, row: 5, cp: true},
    'S': {code: 'SCRUM-50', role: 'PM', dur: 1, es: 22, ef: 23, ls: 22, slk: 0, lf: 23, name: 'Họp Sprint Retrospective & Nghiệm thu MVP', col: 26, row: 11, cp: true}
  };

  // Hàm vẽ từng Node Box (4 dòng, 3 cột)
  for (var k in nodes) {
    var n = nodes[k];
    var r = n.row;
    var c = n.col;
    var isCp = n.cp;
    
    var bg = isCp ? "#FEE2E2" : "#FFFFFF";
    var bdrColor = isCp ? "#DC2626" : "#000000";
    var hdrColor = isCp ? "#DC2626" : "#1E7E34";
    var nameColor = isCp ? "#991B1B" : "#1F2937";
    var numColor = isCp ? "#DC2626" : "#000000";

    // Row 1: Header (Mã Node & Ticket)
    sheet.getRange(r, c, 1, 3).merge()
      .setValue(k + ": " + n.code + " [" + n.role + "]")
      .setFontColor(hdrColor).setFontWeight("bold").setFontSize(9)
      .setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 2: ES | t | EF
    sheet.getRange(r+1, c).setValue(n.es).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+1, c+1).setValue(n.dur).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+1, c+2).setValue(n.ef).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 3: Tên nhiệm vụ
    sheet.getRange(r+2, c, 1, 3).merge()
      .setValue(n.name)
      .setFontColor(nameColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(8).setWrap(true)
      .setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 4: LS | Slack | LF
    sheet.getRange(r+3, c).setValue(n.ls).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+3, c+1).setValue(n.slk).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+3, c+2).setValue(n.lf).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Border toàn bộ khung Node
    sheet.getRange(r, c, 4, 3).setBorder(true, true, true, true, true, true, bdrColor, isCp ? SpreadsheetApp.BorderStyle.SOLID_MEDIUM : SpreadsheetApp.BorderStyle.SOLID);
  }

  // Set chiều cao các hàng Node
  [5, 11, 17].forEach(function(row) {
    sheet.setRowHeight(row, 18);
    sheet.setRowHeight(row+1, 16);
    sheet.setRowHeight(row+2, 34);
    sheet.setRowHeight(row+3, 16);
  });
  sheet.setRowHeight(9, 14);
  sheet.setRowHeight(10, 14);
  sheet.setRowHeight(15, 14);
  sheet.setRowHeight(16, 14);

  // 4. Mũi tên kết nối (Arrows)
  var redArrow = sheet.getRange("E6").setValue("══►").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("G9").setValue("▼").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("G15").setValue("▼").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("I18").setValue("══►").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("K9").setValue("▼").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("M12").setValue("══►").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("O9").setValue("▼").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("Q12").setValue("══►").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("S15").setValue("▼").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("U18").setValue("══►").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("W9").setValue("▼").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("Y12").setValue("══►").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("AA9").setValue("▼").setFontColor("#DC2626").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");

  // Mũi tên xanh (Nhánh phụ)
  sheet.getRange("C9").setValue("──►").setFontColor("#2563EB").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("C15").setValue("──►").setFontColor("#2563EB").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("E12").setValue("──►").setFontColor("#2563EB").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("K15").setValue("──►").setFontColor("#2563EB").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("O15").setValue("──►").setFontColor("#2563EB").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("Q6").setValue("──►").setFontColor("#2563EB").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("S9").setValue("──►").setFontColor("#2563EB").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle");

  // 5. Bảng các đường công việc (Row 22 - 34)
  sheet.getRange("B22:J22").merge().setValue("BẢNG DANH MỤC CÁC ĐƯỜNG CÔNG VIỆC TRONG MẠNG TIẾN ĐỘ (NETWORK PATHS):")
    .setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10).setVerticalAlignment("middle");

  sheet.getRange("B23").setValue("STT");
  sheet.getRange("C23:H23").merge().setValue("Đường công việc chi tiết trong mạng PERT");
  sheet.getRange("I23").setValue("Tổng (ngày)");
  sheet.getRange("J23").setValue("Phân loại");
  sheet.getRange("B23:J23").setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(9).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(23, 24);

  var paths = [
    [1, "A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ I(2)", 8, "Nhánh phụ"],
    [2, "A(1) ➔ C(2) ➔ L(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 14, "Nhánh phụ Frontend"],
    [3, "A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ I(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 16, "Nhánh phụ Backend Job"],
    [4, "A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ L(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 18, "Nhánh phụ Storage UI"],
    [5, "A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 18, "Nhánh phụ Tích hợp CV"],
    [6, "A(1) ➔ B(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ N(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 19, "Nhánh cận găng"],
    [7, "A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ I(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 20, "Nhánh phụ DB API"],
    [8, "A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ L(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 22, "Cận găng (Slack=1)"],
    [9, "A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ M(1) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 22, "Cận găng (Slack=1)"],
    [10, "A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ N(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)", 23, "ĐƯỜNG GĂNG (CRITICAL PATH)"]
  ];

  for (var i = 0; i < paths.length; i++) {
    var pRow = 24 + i;
    var isCritical = (i === 9);
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
  }

  // 6. Hộp kết luận Đường Găng bên phải (L23:AB33)
  sheet.getRange("L23:AB24").merge()
    .setValue("DỰA VÀO ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỜNG GANTT THIẾT YẾU (ĐƯỜNG GĂNG - CRITICAL PATH) NHƯ SAU:")
    .setBackground("#FEE2E2").setFontColor("#DC2626").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("L25:AB27").merge()
    .setValue("A(1) ➔ D(2) ➔ E(2) ➔ F(2) ➔ G(1) ➔ H(2) ➔ J(1) ➔ K(2) ➔ N(2) ➔ O(2) ➔ P(2) ➔ Q(2) ➔ R(1) ➔ S(1)")
    .setBackground("#FEE2E2").setFontColor("#991B1B").setFontWeight("bold").setFontSize(11).setWrap(true)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("L28:AB33").merge()
    .setValue("KẾT LUẬN & THÔNG SỐ QUẢN TRỊ DỰ ÁN SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ):\\n" +
              "• Tổng thời lượng đường găng: 23 ngày làm việc liên tục (Critical Path Length = 23 days).\\n" +
              "• Tổng thời gian lịch trình dự án: 57 ngày lịch trình (08 Sprint: từ 08/09/2026 đến 03/11/2026).\\n" +
              "• Mốc bắt đầu dự án: A (SCRUM-11: Họp Kick-off, xác định mục tiêu MVP & lập Project Charter vào 08/09/2026).\\n" +
              "• Mốc kết thúc dự án: S (SCRUM-50: Họp tổng kết Sprint Retrospective, nghiệm thu UAT & bàn giao ngày 03/11/2026).\\n" +
              "• Điểm kiểm soát rủi ro trọng yếu (Critical Bottleneck): K (SCRUM-27: Tích hợp Gemini 2.5 Flash trích xuất CV) " +
              "và N (SCRUM-31: AI Matching Scoring Engine). Mọi sự chậm trễ tại các mắt xích này sẽ làm trễ trực tiếp tiến độ giao sản phẩm!")
    .setBackground("#F0F4F8").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(9).setWrap(true)
    .setHorizontalAlignment("left").setVerticalAlignment("middle");

  sheet.getRange("L23:AB33").setBorder(true, true, true, true, true, true, "#DC2626", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // Set Column Widths
  sheet.setColumnWidth(1, 25);
  [2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28].forEach(function(col) {
    sheet.setColumnWidth(col, 60);
  });
  [5, 9, 13, 17, 21, 25].forEach(function(col) {
    sheet.setColumnWidth(col, 40);
  });
  sheet.setColumnWidth(29, 25);
  sheet.setColumnWidth(30, 25);
}
'''

with open('scripts/dong_bo_pert_that_100.gs', 'w') as f:
    f.write(gs_code)
print("Successfully generated scripts/dong_bo_pert_that_100.gs with complete visual boxes & frames!")
