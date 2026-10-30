import sys
from test_visual_pert_model import nodes, preds, topo

succs = {n: [] for n in topo}
for n in topo:
    for p in preds[n]:
        succs[p].append(n)

all_paths = []

def dfs(curr, path, length):
    if not succs[curr]:
        all_paths.append((list(path), length))
        return
    for nxt in succs[curr]:
        dfs(nxt, path + [f"{nxt}({nodes[nxt]['dur']})"], length + nodes[nxt]['dur'])

dfs('A', [f"A({nodes['A']['dur']})"], nodes['A']['dur'])

print(f"Total paths found: {len(all_paths)}")
for idx, (p, length) in enumerate(all_paths, 1):
    print(f"Path {idx:2d}: {' '.join(p):70s} | Total = {length}")
