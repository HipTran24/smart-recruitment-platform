with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r') as f:
    code = f.read()

helper_def = '''
def process_cell_val(val):
    runs = []
    if isinstance(val, str):
        runs = [(val, False, False, None, None)]
    elif isinstance(val, (list, tuple)):
        if len(val) >= 1 and isinstance(val[0], str) and (len(val) == 1 or not isinstance(val[1], (list, tuple))):
            txt = val[0]
            b = val[1] if len(val) > 1 and isinstance(val[1], bool) else False
            it = val[2] if len(val) > 2 and isinstance(val[2], bool) else False
            col = val[3] if len(val) > 3 and isinstance(val[3], str) else (val[2] if len(val) > 2 and isinstance(val[2], str) else None)
            runs = [(txt, b, it, col, None)]
        else:
            for item in val:
                if isinstance(item, str):
                    runs.append((item, False, False, None, None))
                elif isinstance(item, (list, tuple)):
                    txt = item[0]
                    b = item[1] if len(item) > 1 and isinstance(item[1], bool) else False
                    it = item[2] if len(item) > 2 and isinstance(item[2], bool) else False
                    col = item[3] if len(item) > 3 and isinstance(item[3], str) else (item[2] if len(item) > 2 and isinstance(item[2], str) else None)
                    runs.append((txt, b, it, col, None))
    return runs
'''

code = code.replace("def add_table_data(col_widths,", helper_def + "\ndef add_table_data(col_widths,")

target_block = '''            if isinstance(val, str):
                p.add_run(val)
            elif isinstance(val, list):
                for v_item in val:
                    txt = v_item[0]
                    b = v_item[1] if len(v_item) > 1 else False
                    it = v_item[2] if len(v_item) > 2 else False
                    col = v_item[3] if len(v_item) > 3 else None
                    r = p.add_run(txt)
                    if b: r.bold = True
                    if it: r.italic = True
                    if col: r.font.color.rgb = RGBColor.from_string(col)'''

replacement_block = '''            cell_runs = process_cell_val(val)
            for (txt, b, it, col, sz) in cell_runs:
                r = p.add_run(txt)
                if b: r.bold = True
                if it: r.italic = True
                if col: r.font.color.rgb = RGBColor.from_string(col)
                if sz: r.font.size = Pt(sz)'''

code = code.replace(target_block, replacement_block)

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w') as f:
    f.write(code)

print("Patched table processing successfully.")
