import subprocess
import os

html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 0; background: transparent; }
  svg { display: block; }
</style>
</head>
<body>
<svg width="1200" height="500" viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#DC2626" />
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
    </marker>
  </defs>
  <!-- Sample line -->
  <line x1="100" y1="100" x2="300" y2="100" stroke="#DC2626" stroke-width="3" marker-end="url(#arrow-red)" />
</svg>
</body>
</html>
"""

with open('/tmp/test_svg.html', 'w') as f:
    f.write(html_content)

chrome_path = "/Applications/Google Chrome .app/Contents/MacOS/Google Chrome"
cmd = [
    chrome_path,
    "--headless",
    "--disable-gpu",
    "--default-background-color=00000000",
    "--window-size=1200,500",
    "--screenshot=/tmp/test_out.png",
    "/tmp/test_svg.html"
]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
print("File exists:", os.path.exists('/tmp/test_out.png'))
if os.path.exists('/tmp/test_out.png'):
    print("File size:", os.path.getsize('/tmp/test_out.png'))
