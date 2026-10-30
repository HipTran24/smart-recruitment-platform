# Generate an interactive HTML diagram of this 15-node SmartRecruit PERT chart
html = """<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Sơ đồ PERT Dự án SmartRecruit</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    margin: 0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .header {
    text-align: center;
    margin-bottom: 24px;
  }
  .header h1 {
    color: #f8fafc;
    font-size: 24px;
    margin-bottom: 8px;
  }
  .header p {
    color: #94a3b8;
    font-size: 14px;
  }
  .diagram-container {
    background: #1e293b;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    max-width: 100%;
    overflow-x: auto;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>3.4.1 - SƠ ĐỒ PERT TIẾN TRÌNH DỰ ÁN NỀN TẢNG TUYỂN DỤNG THÔNG MINH SMARTRECRUIT</h1>
    <p>100% Dữ liệu thực tế dự án SmartRecruit | Chuỗi Đường Găng (Critical Path): A ➔ D ➔ G ➔ J ➔ M ➔ O (13 ngày găng)</p>
  </div>
  <div class="diagram-container">
    <img src="/tmp/pert_arrows.png" style="display:block; max-width: 100%; height: auto;" />
  </div>
</body>
</html>"""

with open('/Users/ProM2/.gemini/antigravity/brain/8ef6efd5-0012-4594-be9e-5fed9984d871/pert_diagram_smartrecruit.html', 'w') as f:
    f.write(html)
print("Updated HTML interactive diagram!")
