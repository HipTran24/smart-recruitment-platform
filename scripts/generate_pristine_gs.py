gs_code = '''/**
 * GOOGLE APPS SCRIPT: VẼ SƠ ĐỒ PERT CHUYÊN NGHIỆP BẰNG ĐƯỜNG KẺ VIỀN CHUẨN XÁC 100%
 * DỰ ÁN: SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ)
 * Học phần: Quản lý Dự án Công nghệ Thông tin - Nhóm 03
 */

function capNhatPertSmartRecruitThat100() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERT_SmartRecruit");
  
  if (!sheet) {
    sheet = ss.insertSheet("PERT_SmartRecruit");
  } else {
    sheet.clear();
    // Xóa hình ảnh trôi nổi cũ nếu có
    var images = sheet.getImages();
    for (var i = 0; i < images.length; i++) {
      images[i].remove();
    }
    // Hủy liên kết ô cũ (unmerge)
    var maxRows = sheet.getMaxRows();
    var maxCols = sheet.getMaxColumns();
    if (maxRows > 1 && maxCols > 1) {
      sheet.getRange(1, 1, maxRows, maxCols).breakApart();
    }
  }

  // 1. Phủ màu nền 3 Giai đoạn cốt lõi (Rows 3 đến 19)
  sheet.getRange("B3:J19").setBackground("#EBF1F5");  // Xanh xám nhạt (Stage 1)
  sheet.getRange("K3:V19").setBackground("#FFFDF5");  // Vàng kem nhạt (Stage 2)
  sheet.getRange("W3:AD19").setBackground("#F4FAF2"); // Xanh lục nhạt (Stage 3)

  // 2. Tiêu đề chính (Row 1)
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

  // 3. Tiêu đề 3 Giai đoạn (Row 2)
  sheet.getRange("B2:J2").merge().setValue("Giai đoạn 1: Phát thảo các sơ đồ và kiến trúc cốt lõi (Sprint 1 - 2)")
    .setBackground("#D9E1F2").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("K2:V2").merge().setValue("Giai đoạn 2: Phát triển giao diện & Core API tuyển dụng (Sprint 3 - 4)")
    .setBackground("#FFF2CC").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("W2:AD2").merge().setValue("Giai đoạn 3: Tích hợp AI Gemini & Nghiệm thu UAT đóng dự án (Sprint 5 - 8)")
    .setBackground("#E2EFDA").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(2, 24);

  // 4. Dữ liệu 15 Khung tác vụ SmartRecruit
  var nodes = {
    'A': {code: 'SCRUM-11', role: 'PM', dur: 2, es: 0, ef: 2, ls: 0, slk: 0, lf: 2, name: 'Họp Kick-off MVP, thống nhất phạm vi & lập Project Charter', col: 2, row: 3, cp: true},
    'B': {code: 'SCRUM-1',  role: 'BE', dur: 1, es: 0, ef: 1, ls: 1, slk: 1, lf: 2, name: 'Khởi tạo source base Spring Boot & cấu hình khung dự án', col: 2, row: 9, cp: false},
    'C': {code: 'SCRUM-2',  role: 'DevOps', dur: 1, es: 2, ef: 3, ls: 12, slk: 10, lf: 13, name: 'Thiết lập môi trường Docker Compose & kết nối Server ban đầu', col: 8, row: 3, cp: false},
    'D': {code: 'SCRUM-6',  role: 'DB & BA', dur: 2, es: 2, ef: 4, ls: 2, slk: 0, lf: 4, name: 'Thiết kế mô hình ERD 16 bảng MySQL & DDL Schema cốt lõi', col: 8, row: 9, cp: true},
    'E': {code: 'SCRUM-5',  role: 'FE', dur: 1, es: 4, ef: 5, ls: 12, slk: 8, lf: 13, name: 'Thiết kế UI/UX trên Figma & Wireframe nguyên mẫu tuyển dụng', col: 13, row: 3, cp: false},
    'F': {code: 'SCRUM-8',  role: 'FE', dur: 1, es: 4, ef: 5, ls: 12, slk: 8, lf: 13, name: 'Cài đặt ReactJS Router, Tailwind & khung layout Dashboard', col: 13, row: 9, cp: false},
    'G': {code: 'SCRUM-21', role: 'BE', dur: 2, es: 4, ef: 6, ls: 4, slk: 0, lf: 6, name: 'Xây dựng Authentication JWT & phân quyền Role-based Spring Sec', col: 13, row: 15, cp: true},
    'H': {code: 'SCRUM-23', role: 'BE', dur: 1, es: 6, ef: 7, ls: 12, slk: 6, lf: 13, name: 'Xây dựng RESTful API CRUD Quản lý tin tuyển dụng (Job Post)', col: 18, row: 3, cp: false},
    'I': {code: 'SCRUM-25', role: 'DB', dur: 1, es: 6, ef: 7, ls: 12, slk: 6, lf: 13, name: 'Thiết kế bảng từ điển danh mục kỹ năng chuẩn hóa (Skill Taxonomy)', col: 18, row: 9, cp: false},
    'J': {code: 'SCRUM-26', role: 'BE', dur: 2, es: 6, ef: 8, ls: 6, slk: 0, lf: 8, name: 'Viết module tiếp nhận & Upload file CV lưu trữ S3 Private', col: 18, row: 15, cp: true},
    'K': {code: 'SCRUM-28', role: 'FE', dur: 1, es: 8, ef: 9, ls: 12, slk: 4, lf: 13, name: 'Dựng giao diện ứng viên nộp hồ sơ trực tuyến & kéo thả CV', col: 23, row: 3, cp: false},
    'L': {code: 'SCRUM-29', role: 'QA', dur: 2, es: 8, ef: 10, ls: 11, slk: 3, lf: 13, name: 'Viết test case API Postman, xác thực cấu trúc JSON từ Gemini', col: 23, row: 9, cp: false},
    'M': {code: 'SCRUM-27', role: 'AI & BE', dur: 3, es: 8, ef: 11, ls: 8, slk: 0, lf: 11, name: 'Tích hợp Gemini 2.5 Flash API trích xuất kỹ năng/kinh nghiệm CV', col: 23, row: 15, cp: true},
    'N': {code: 'SCRUM-33', role: 'FE', dur: 1, es: 11, ef: 12, ls: 12, slk: 1, lf: 13, name: 'Phát triển giao diện Bảng xếp hạng ứng viên theo điểm AI Match', col: 28, row: 3, cp: false},
    'O': {code: 'SCRUM-48', role: 'QA & PM', dur: 2, es: 11, ef: 13, ls: 11, slk: 0, lf: 13, name: 'Kiểm thử chấp nhận UAT Production, Retrospective & Đóng dự án', col: 28, row: 9, cp: true}
  };

  // Vẽ 15 Khung hộp tác vụ
  for (var k in nodes) {
    var n = nodes[k];
    var r = n.row;
    var c = n.col;
    var isCp = n.cp;
    
    var bg = isCp ? "#FFF5F5" : "#FFFFFF";
    var bdrColor = isCp ? "#DC2626" : "#1F2937";
    var hdrColor = isCp ? "#DC2626" : "#1E7E34";
    var nameColor = isCp ? "#991B1B" : "#1F2937";
    var numColor = isCp ? "#DC2626" : "#111827";

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

    // Viền khung hộp
    sheet.getRange(r, c, 4, 3).setBorder(true, true, true, true, true, true, bdrColor, isCp ? SpreadsheetApp.BorderStyle.SOLID_MEDIUM : SpreadsheetApp.BorderStyle.SOLID);
  }

  // 5. VẼ CÁC ĐƯỜNG KẺ BẰNG VIỀN Ô (ĐƯỜNG KẺ CHẮC CHẮN NỐI TỪ KHUNG TỚI KHUNG)
  var RED = "#DC2626";
  var BLUE = "#2563EB";
  var MED = SpreadsheetApp.BorderStyle.SOLID_MEDIUM;
  var SOLID = SpreadsheetApp.BorderStyle.SOLID;

  // --- ĐƯỜNG GĂNG (MÀU ĐỎ) ---
  // A -> D (Top to Mid)
  sheet.getRange("E4").setBorder(null, null, true, null, null, null, RED, MED);
  sheet.getRange("F4").setBorder(null, null, true, true, null, null, RED, MED);
  sheet.getRange("F5:F9").setBorder(null, null, null, true, null, null, RED, MED);
  sheet.getRange("F10").setBorder(null, null, true, true, null, null, RED, MED);
  sheet.getRange("G10").setBorder(null, null, true, null, null, null, RED, MED);
  sheet.getRange("G10").setValue("►").setFontColor(RED).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // D -> G (Mid to Bot)
  sheet.getRange("K10").setBorder(null, null, true, null, null, null, RED, MED);
  sheet.getRange("L10").setBorder(null, null, true, true, null, null, RED, MED);
  sheet.getRange("L11:L15").setBorder(null, null, null, true, null, null, RED, MED);
  sheet.getRange("L16").setBorder(null, null, true, true, null, null, RED, MED);
  sheet.getRange("L16").setValue("►").setFontColor(RED).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // G -> J (Bot to Bot straight)
  sheet.getRange("P16:Q16").setBorder(null, null, true, null, null, null, RED, MED);
  sheet.getRange("Q16").setValue("►").setFontColor(RED).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // J -> M (Bot to Bot straight)
  sheet.getRange("U16:V16").setBorder(null, null, true, null, null, null, RED, MED);
  sheet.getRange("V16").setValue("►").setFontColor(RED).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // M -> O (Bot to Mid)
  sheet.getRange("Z16").setBorder(null, null, true, null, null, null, RED, MED);
  sheet.getRange("AA16").setBorder(null, null, true, true, null, null, RED, MED);
  sheet.getRange("AA11:AA15").setBorder(null, null, null, true, null, null, RED, MED);
  sheet.getRange("AA10").setBorder(null, null, true, true, null, null, RED, MED);
  sheet.getRange("AA10").setValue("►").setFontColor(RED).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // --- NHÁNH PHỤ (MÀU XANH DƯƠNG) ---
  // A -> C: Top to Top
  sheet.getRange("E3:G3").setBorder(null, null, true, null, null, null, BLUE, SOLID);
  sheet.getRange("G3").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // B -> D: Mid to Mid
  sheet.getRange("E9:G9").setBorder(null, null, true, null, null, null, BLUE, SOLID);
  sheet.getRange("G9").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // D -> E: Mid to Top
  sheet.getRange("K9").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("K5:K8").setBorder(null, true, null, null, null, null, BLUE, SOLID);
  sheet.getRange("K4:L4").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("L4").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // D -> F: Mid to Mid
  sheet.getRange("K9:L9").setBorder(null, null, true, null, null, null, BLUE, SOLID);
  sheet.getRange("L9").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // G -> H: Bot to Top
  sheet.getRange("P15").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("P5:P14").setBorder(null, true, null, null, null, null, BLUE, SOLID);
  sheet.getRange("P4:Q4").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("Q4").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // G -> I: Bot to Mid
  sheet.getRange("P9:Q9").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("Q9").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // J -> K: Bot to Top
  sheet.getRange("U15").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("U5:U14").setBorder(null, true, null, null, null, null, BLUE, SOLID);
  sheet.getRange("U4:V4").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("V4").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // J -> L: Bot to Mid
  sheet.getRange("U9:V9").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("V9").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // M -> N: Bot to Top
  sheet.getRange("Z15").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("Z5:Z14").setBorder(null, true, null, null, null, null, BLUE, SOLID);
  sheet.getRange("Z4:AA4").setBorder(null, true, true, null, null, null, BLUE, SOLID);
  sheet.getRange("AA4").setValue("►").setFontColor(BLUE).setFontWeight("bold").setFontSize(11).setHorizontalAlignment("right").setVerticalAlignment("bottom");

  // 6. Định dạng kích thước hàng & cột
  [3, 9, 15].forEach(function(row) {
    sheet.setRowHeight(row, 20);
    sheet.setRowHeight(row+1, 18);
    sheet.setRowHeight(row+2, 36);
    sheet.setRowHeight(row+3, 18);
  });
  [7, 8, 13, 14, 19, 20].forEach(function(row) {
    sheet.setRowHeight(row, 14);
  });

  sheet.setColumnWidth(1, 25);
  [2, 3, 4, 8, 9, 10, 13, 14, 15, 18, 19, 20, 23, 24, 25, 28, 29, 30].forEach(function(c) {
    sheet.setColumnWidth(c, 55);
  });
  [5, 6, 7].forEach(function(c) {
    sheet.setColumnWidth(c, 35);
  });
  [11, 12, 16, 17, 21, 22, 26, 27].forEach(function(c) {
    sheet.setColumnWidth(c, 45);
  });

  // 7. BẢNG CÁC ĐƯỜNG CÔNG VIỆC (Row 22 - 42)
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

  for (var i = 0; i < paths.length; i++) {
    var pRow = 24 + i;
    var isCritical = (paths[i][0] === 9);
    var pBg = isCritical ? "#FFF5F5" : "#FFFFFF";
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

  // 8. KHUNG KẾT LUẬN ĐƯỜNG GĂNG (Cols L to AD, Rows 23 - 40)
  sheet.getRange("L23:AD24").merge()
    .setValue("DỰA VÀO ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỜNG GANTT THIẾT YẾU (ĐƯỜNG GĂNG - CRITICAL PATH) NHƯ SAU:")
    .setBackground("#FFF5F5").setFontColor("#DC2626").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("L25:AD27").merge()
    .setValue("A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ O(2)")
    .setBackground("#FFF5F5").setFontColor("#991B1B").setFontWeight("bold").setFontSize(13)
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
}
'''

with open('scripts/dong_bo_pert_that_100.gs', 'w') as f:
    f.write(gs_code)
print("Updated scripts/dong_bo_pert_that_100.gs with native cell border lines!")
