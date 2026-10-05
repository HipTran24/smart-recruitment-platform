import openpyxl
import json

wb = openpyxl.load_workbook('sheet.xlsx', data_only=True)
ws = wb['PERT_SmartRecruit']

max_r = ws.max_row
max_c = ws.max_column

data = []
for r in range(1, max_r + 1):
    row = []
    for c in range(1, max_c + 1):
        v = ws.cell(r, c).value
        row.append("" if v is None else str(v))
    data.append(row)

json_data = json.dumps(data, ensure_ascii=False)

script = f"""function capNhatPertSmartRecruitThat100() {{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERT_SmartRecruit");
  if (!sheet) {{
    sheet = ss.insertSheet("PERT_SmartRecruit");
  }}
  
  sheet.clear();
  sheet.clearFormats();
  
  var data = {json_data};
  var numRows = data.length;
  var numCols = data[0].length;
  
  sheet.getRange(1, 1, numRows, numCols).setValues(data);
  
  // Format Title
  sheet.getRange("B1:N1").merge()
    .setBackground("#FCE4D6").setFontColor("#000000").setFontWeight("bold").setFontSize(13)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 35);
  
  sheet.getRange("B2:N2").merge()
    .setFontColor("#595959").setFontStyle("italic").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
    
  // Format Table Header
  sheet.getRange("B4:N4").setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(4, 28);
  
  // Format Grid Borders & Critical Path
  var rangeTable = sheet.getRange(5, 2, 50, 13);
  rangeTable.setBorder(true, true, true, true, true, true, "#D9D9D9", SpreadsheetApp.BorderStyle.SOLID);
  
  // Highlight critical rows
  for (var r = 5; r <= 54; r++) {{
    var val = sheet.getRange(r, 14).getValue();
    if (val.toString().indexOf("CÓ") !== -1) {{
      sheet.getRange(r, 2, 1, 13).setBackground("#FEE2E2").setFontColor("#DC2626").setFontWeight("bold");
    }}
  }}
  
  // Auto Resize Columns
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 380);
  sheet.setColumnWidth(4, 85);
  sheet.setColumnWidth(5, 75);
  sheet.setColumnWidth(6, 75);
  sheet.setColumnWidth(7, 65);
  sheet.setColumnWidth(8, 160);
  sheet.setColumnWidth(9, 65);
  sheet.setColumnWidth(10, 65);
  sheet.setColumnWidth(11, 65);
  sheet.setColumnWidth(12, 65);
  sheet.setColumnWidth(13, 85);
  sheet.setColumnWidth(14, 130);
  
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert("Đã cập nhật thành công 100% dữ liệu PERT từ 50 task Sơ đồ Gantt vào sheet PERT_SmartRecruit!");
}}
"""

with open('/Users/ProM2/Documents/smart-recruitment/scripts/dong_bo_pert_that_100.gs', 'w', encoding='utf-8') as f:
    f.write(script)

print("Created dong_bo_pert_that_100.gs successfully!")
