/**
 * SƠ ĐỒ MẠNG TIẾN TRÌNH PERT / CPM HOÀN CHỈNH - DỰ ÁN SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ)
 * Học phần: Quản lý Dự án Công nghệ Thông tin - Nhóm 03
 * Kiến trúc mạng: 15 Node AON chuẩn mực, 3 Phase dải màu Kanban, 17 Đường tiến độ,
 * và Hệ thống Mũi tên Vector Bus-Spur kết nối trực tiếp từ mép khung tới khung (Không lệch 1 pixel).
 */

function veSoDoPertSmartRecruitChuan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERT_SmartRecruit");
  
  if (!sheet) {
    sheet = ss.insertSheet("PERT_SmartRecruit");
  } else {
    sheet.clear();
    // 1. Dọn dẹp hình ảnh cũ
    var images = sheet.getImages();
    for (var i = 0; i < images.length; i++) {
      images[i].remove();
    }
    // 2. Hủy unmerge các ô cũ
    var maxRows = sheet.getMaxRows();
    var maxCols = sheet.getMaxColumns();
    if (maxRows > 1 && maxCols > 1) {
      sheet.getRange(1, 1, maxRows, maxCols).breakApart();
    }
  }

  // 1. KÍCH THƯỚC CHUẨN HÓA HÀNG & CỘT (PIXEL)
  sheet.setColumnWidth(1, 25); // Cột lề A
  
  // 6 Cột Khung Node: (B,C,D), (H,I,J), (M,N,O), (R,S,T), (W,X,Y), (AB,AC,AD)
  [2, 3, 4, 8, 9, 10, 13, 14, 15, 18, 19, 20, 23, 24, 25, 28, 29, 30].forEach(function(c) {
    sheet.setColumnWidth(c, 55);
  });
  
  // Cột khoảng đệm (Gutter) giữa các nhóm Node:
  [5, 6, 7].forEach(function(c) { sheet.setColumnWidth(c, 35); }); // Gutter 1->2 (105px)
  [11, 12, 16, 17, 21, 22, 26, 27].forEach(function(c) { sheet.setColumnWidth(c, 45); }); // Gutter 2..6 (90px)

  // Chiều cao hàng
  sheet.setRowHeight(1, 32); // Banner Tiêu đề chính
  sheet.setRowHeight(2, 24); // Banner Giai đoạn Sprint
  [3, 9, 15].forEach(function(r) {
    sheet.setRowHeight(r, 20);   // Header Node (Mã & Role)
    sheet.setRowHeight(r+1, 18); // ES | t | EF
    sheet.setRowHeight(r+2, 36); // Tên tác vụ kỹ thuật
    sheet.setRowHeight(r+3, 18); // LS | Slack | LF
  });
  [7, 8, 13, 14, 19, 20].forEach(function(r) { sheet.setRowHeight(r, 16); }); // Đệm hàng

  // 2. MÀU NỀN 3 GIAI ĐOẠN (SOFT PASTEL LANES)
  sheet.getRange("B3:J19").setBackground("#EBF1F5");  // Giai đoạn 1: Xanh xám nhạt (Khởi tạo)
  sheet.getRange("K3:V19").setBackground("#FFFDF5");  // Giai đoạn 2: Vàng kem nhạt (Core API & UI)
  sheet.getRange("W3:AD19").setBackground("#F4FAF2"); // Giai đoạn 3: Xanh lục nhạt (AI & UAT)

  // 3. TIÊU ĐỀ CHÍNH & TIÊU ĐỀ GIAI ĐOẠN
  sheet.getRange("B1:AD1").merge().setValue("3.4.1 - SƠ ĐỒ PERT TIẾN TRÌNH DỰ ÁN NỀN TẢNG TUYỂN DỤNG THÔNG MINH SMARTRECRUIT")
    .setBackground("#FCE4D6").setFontColor("#000000").setFontSize(13).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("B2:J2").merge().setValue("Giai đoạn 1: Phát thảo các sơ đồ và dữ liệu cốt lõi (Sprint 1 - 2)")
    .setBackground("#D9E1F2").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("K2:V2").merge().setValue("Giai đoạn 2: Phát triển giao diện & Core API tuyển dụng (Sprint 3 - 4)")
    .setBackground("#FFF2CC").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("W2:AD2").merge().setValue("Giai đoạn 3: Tích hợp AI Gemini & Nghiệm thu UAT đóng dự án (Sprint 5 - 8)")
    .setBackground("#E2EFDA").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  // 4. DANH MỤC 15 KHUNG TÁC VỤ (100% SMARTRECRUIT REAL DATA)
  var nodes = {
    'A': {code: 'SCRUM-11', role: 'PM', dur: 2, es: 0, ef: 2, ls: 0, slk: 0, lf: 2, name: 'Họp Kick-off MVP, thống nhất phạm vi & lập Project Charter', col: 2, row: 3, cp: true},
    'B': {code: 'SCRUM-1',  role: 'BE', dur: 1, es: 0, ef: 1, ls: 1, slk: 1, lf: 2, name: 'Khởi tạo source base Spring Boot 4 & cấu hình khung dự án', col: 2, row: 9, cp: false},
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

    // Row 1: Header (Mã Node, Ticket, Role)
    sheet.getRange(r, c, 1, 3).merge()
      .setValue(k + ": " + n.code + " [" + n.role + "]")
      .setFontColor(hdrColor).setFontWeight("bold").setFontSize(9)
      .setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 2: ES | t | EF
    sheet.getRange(r+1, c).setValue(n.es).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+1, c+1).setValue(n.dur).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+1, c+2).setValue(n.ef).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 3: Tên nhiệm vụ kỹ thuật
    sheet.getRange(r+2, c, 1, 3).merge()
      .setValue(n.name)
      .setFontColor(nameColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(8).setWrap(true)
      .setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 4: LS | Slack | LF
    sheet.getRange(r+3, c).setValue(n.ls).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+3, c+1).setValue(n.slk).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.getRange(r+3, c+2).setValue(n.lf).setFontColor(numColor).setFontWeight(isCp ? "bold" : "normal").setFontSize(9).setBackground(bg).setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Đường viền hộp AON sắc nét
    sheet.getRange(r, c, 4, 3).setBorder(true, true, true, true, true, true, bdrColor, isCp ? SpreadsheetApp.BorderStyle.SOLID_MEDIUM : SpreadsheetApp.BorderStyle.SOLID);
  }

  // 5. CHÈN HỆ THỐNG MŨI TÊN VECTOR CHUẨN XÁC 100% NỐI TỪ MÉP KHUNG TỚI KHUNG
  var b64Data = "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AAAAAMDEBgUAAAAAAJiY4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABAjuAAAAAAAQILgDAAAAAECA4A4AAAAAAAGCOwAAAAAABPwfAAAA//9XuGP1AAAABklEQVQDAAIyWDkW481PAAAAAElFTkSuQmCC";
  var blob = Utilities.newBlob(Utilities.base64Decode(b64Data), "image/png", "pert_perfect_arrows.png");
  sheet.insertImage(blob, 1, 1, 0, 0);

  // 6. BẢNG CÁC ĐƯỜNG CÔNG VIỆC TRONG MẠNG (Row 22 - 42)
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

  // 7. KHUNG KẾT LUẬN & THÔNG SỐ QUẢN TRỊ DỰ ÁN (Cols L to AD, Rows 23 - 40)
  sheet.getRange("L23:AD24").merge()
    .setValue("DỰA VÀO ĐƯỜNG CÔNG VIỆC, XÁC ĐỊNH ĐƯỜNG GANTT THIẾT YẾU (ĐƯỜNG GĂNG - CRITICAL PATH) NHƯ SAU:")
    .setBackground("#FFF5F5").setFontColor("#DC2626").setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("L25:AD27").merge()
    .setValue("A(2) ➔ D(2) ➔ G(2) ➔ J(2) ➔ M(3) ➔ O(2)")
    .setBackground("#FFF5F5").setFontColor("#991B1B").setFontWeight("bold").setFontSize(13)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.getRange("L28:AD40").merge()
    .setValue("KẾT LUẬN & THÔNG SỐ QUẢN TRỊ DỰ ÁN SMARTRECRUIT (100% DỮ LIỆU THỰC TẾ):\n" +
              "• Tổng thời lượng đường găng: 13 ngày làm việc găng chuẩn tiến độ (Critical Path = 13 days).\n" +
              "• Tổng thời gian lịch trình dự án: 57 ngày lịch trình (08 Sprint: từ 08/09/2026 đến 03/11/2026).\n" +
              "• Chuỗi tác vụ găng (Critical Path Flow):\n" +
              "  1. A: SCRUM-11 [PM] - Họp Kick-off MVP & lập Project Charter (08/09 - 09/09, 2 ngày)\n" +
              "  2. D: SCRUM-6  [DB/BA] - Thiết kế ERD 16 bảng MySQL & DDL Schema (10/09 - 11/09, 2 ngày)\n" +
              "  3. G: SCRUM-21 [Backend] - Authentication JWT & phân quyền Role-based (22/09 - 23/09, 2 ngày)\n" +
              "  4. J: SCRUM-26 [Backend] - Xử lý upload file CV lên S3 Private Storage (29/09 - 30/09, 2 ngày)\n" +
              "  5. M: SCRUM-27 [AI/BE] - Tích hợp Gemini 2.5 Flash trích xuất dữ liệu CV (01/10 - 05/10, 3 ngày)\n" +
              "  6. O: SCRUM-48 [QA/PM] - Kiểm thử UAT trên Production & Nghiệm thu MVP (30/10 - 03/11, 2 ngày)\n" +
              "• Kiểm soát điểm nghẽn rủi ro (Critical Bottleneck): Mắt xích M (SCRUM-27: Gemini AI Parsing) " +
              "chiếm tới 3 ngày làm việc trên đường găng. Bất kỳ sự chậm trễ nào tại module AI này sẽ làm trễ trực tiếp ngày nghiệm thu đồ án!")
    .setBackground("#F0F4F8").setFontColor("#1F4E79").setFontWeight("bold").setFontSize(9).setWrap(true)
    .setHorizontalAlignment("left").setVerticalAlignment("middle");

  sheet.getRange("L23:AD40").setBorder(true, true, true, true, true, true, "#DC2626", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}
