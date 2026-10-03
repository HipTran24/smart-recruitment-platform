with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'r') as f:
    code = f.read()

helper_code = '''
def normalize_run_item(item):
    if isinstance(item, str):
        return (item, False, False, None, None)
    txt = item[0]
    b = item[1] if len(item) > 1 else False
    it = item[2] if len(item) > 2 else False
    col = item[3] if len(item) > 3 else None
    sz = item[4] if len(item) > 4 else None
    return (txt, b, it, col, sz)
'''

# Replace helper definitions
code = code.replace("def add_runs_p(runs,", helper_code + "\ndef add_runs_p(runs,")

old_runs_p_loop = '''    for r_item in runs:
        txt = r_item[0]
        b = r_item[1] if len(r_item) > 1 else False
        it = r_item[2] if len(r_item) > 2 else False
        col = r_item[3] if len(r_item) > 3 else None
        sz = r_item[4] if len(r_item) > 4 else None
        
        run = p.add_run(txt)
        if b: run.bold = True
        if it: run.italic = True
        if col: run.font.color.rgb = RGBColor.from_string(col)
        if sz: run.font.size = Pt(sz)'''

new_runs_p_loop = '''    for r_item in runs:
        txt, b, it, col, sz = normalize_run_item(r_item)
        run = p.add_run(txt)
        if b: run.bold = True
        if it: run.italic = True
        if col: run.font.color.rgb = RGBColor.from_string(col)
        if sz: run.font.size = Pt(sz)'''

code = code.replace(old_runs_p_loop, new_runs_p_loop)

old_bullet_loop = '''    for item in runs:
        txt = item[0]
        b = item[1] if len(item) > 1 else False
        it = item[2] if len(item) > 2 else False
        col = item[3] if len(item) > 3 else None
        sz = item[4] if len(item) > 4 else None
        
        r = p.add_run(txt)
        if b: r.bold = True
        if it: r.italic = True
        if col: r.font.color.rgb = RGBColor.from_string(col)
        if sz: r.font.size = Pt(sz)'''

new_bullet_loop = '''    for item in runs:
        txt, b, it, col, sz = normalize_run_item(item)
        r = p.add_run(txt)
        if b: r.bold = True
        if it: r.italic = True
        if col: r.font.color.rgb = RGBColor.from_string(col)
        if sz: r.font.size = Pt(sz)'''

code = code.replace(old_bullet_loop, new_bullet_loop)

with open('/Users/ProM2/Documents/smart-recruitment/scripts/generate_full_qlda_work.py', 'w') as f:
    f.write(code)

print("Patched successfully")
