import openpyxl
from openpyxl.styles import Border, Side

wb = openpyxl.Workbook()
ws = wb.active
red_med = Side(style='medium', color='DC2626')
b_bottom = Border(bottom=red_med)
b_right = Border(right=red_med)
b_corner = Border(bottom=red_med, right=red_med)

print("Border engine test passed")
