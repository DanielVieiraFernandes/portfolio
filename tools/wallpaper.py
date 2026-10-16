"""Topographic wallpaper: contour lines of Daniel's portrait rising out of
a noisy terrain, rendered as an SVG map. Usage: python wallpaper.py avatar out.svg"""
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H = 1920, 1080
CELL = 5
GW, GH = W // CELL + 1, H // CELL + 1
rng = np.random.default_rng(1105)  # fixed seed: same map every build

def smooth_noise(cells_x, cells_y, scale):
    small = Image.fromarray((rng.random((cells_y, cells_x)) * 255).astype('uint8'))
    big = small.resize((GW, GH), Image.BICUBIC).filter(ImageFilter.GaussianBlur(scale))
    a = np.asarray(big, dtype=float) / 255
    return (a - a.min()) / (a.max() - a.min())

terrain = 0.65 * smooth_noise(9, 5, 14) + 0.35 * smooth_noise(22, 12, 6)

# Portrait height field, placed to the right of the desktop icons.
SIZE = 1000                      # px on the wallpaper
cx, cy = 1330, 560               # portrait centre
cells = SIZE // CELL
img = Image.open(sys.argv[1]).convert('L').resize((cells, cells), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.4))
lum = np.asarray(img, dtype=float) / 255
lum = np.clip((lum - 0.08) / 0.75, 0, 1)
yy, xx = np.mgrid[0:cells, 0:cells] / (cells - 1)
fade = np.clip(1 - ((xx - .5) ** 2 / .26 + (yy - .45) ** 2 / .33), 0, 1) ** .6
portrait = lum * fade

field = 0.30 * terrain
x0, y0 = (cx - SIZE // 2) // CELL, (cy - SIZE // 2) // CELL
ys0, xs0 = max(0, -y0), max(0, -x0)
ys1, xs1 = min(cells, GH - y0), min(cells, GW - x0)
field[y0 + ys0:y0 + ys1, x0 + xs0:x0 + xs1] += 0.9 * portrait[ys0:ys1, xs0:xs1]

def contours(f, level):
    """Marching squares, chained into polylines."""
    b = f > level
    idx = (b[:-1, :-1] * 8 + b[:-1, 1:] * 4 + b[1:, 1:] * 2 + b[1:, :-1] * 1)
    def pt(edge, i, j):
        # edges: 0 top (i,j)-(i,j+1), 1 right, 2 bottom, 3 left
        if edge == 0: a, c, p, q = f[i, j], f[i, j + 1], (j, i), (j + 1, i)
        elif edge == 1: a, c, p, q = f[i, j + 1], f[i + 1, j + 1], (j + 1, i), (j + 1, i + 1)
        elif edge == 2: a, c, p, q = f[i + 1, j], f[i + 1, j + 1], (j, i + 1), (j + 1, i + 1)
        else: a, c, p, q = f[i, j], f[i + 1, j], (j, i), (j, i + 1)
        t = (level - a) / (c - a) if c != a else .5
        return (p[0] + t * (q[0] - p[0])) * CELL, (p[1] + t * (q[1] - p[1])) * CELL
    def key(edge, i, j):
        if edge == 0: return ('h', i, j)
        if edge == 2: return ('h', i + 1, j)
        if edge == 3: return ('v', i, j)
        return ('v', i, j + 1)
    table = {1: [(3, 2)], 2: [(2, 1)], 3: [(3, 1)], 4: [(0, 1)], 6: [(0, 2)], 7: [(3, 0)],
             8: [(3, 0)], 9: [(0, 2)], 11: [(0, 1)], 12: [(3, 1)], 13: [(2, 1)], 14: [(3, 2)]}
    adj, coords = {}, {}
    for i, j in zip(*np.nonzero((idx != 0) & (idx != 15))):
        c = idx[i, j]
        if c in (5, 10):
            centre = f[i:i + 2, j:j + 2].mean() > level
            segs = [(3, 0), (2, 1)] if (c == 5) == centre else [(3, 2), (0, 1)]
        else:
            segs = table[c]
        for e1, e2 in segs:
            k1, k2 = key(e1, i, j), key(e2, i, j)
            coords.setdefault(k1, pt(e1, i, j)); coords.setdefault(k2, pt(e2, i, j))
            adj.setdefault(k1, []).append(k2); adj.setdefault(k2, []).append(k1)
    seen, lines = set(), []
    starts = [k for k, v in adj.items() if len(v) == 1] + list(adj)
    for s in starts:
        if s in seen: continue
        line, cur, prev = [s], s, None
        seen.add(s)
        while True:
            nxt = [n for n in adj[cur] if n != prev and n not in seen]
            if not nxt:
                if len(line) > 2 and s in adj[cur] and prev is not None: line.append(s)
                break
            prev, cur = cur, nxt[0]
            seen.add(cur); line.append(cur)
        if len(line) >= 4: lines.append([coords[k] for k in line])
    return lines

def chaikin(p, closed):
    out = [p[0]] if not closed else []
    for a, b in zip(p, p[1:]):
        out += [(.75 * a[0] + .25 * b[0], .75 * a[1] + .25 * b[1]), (.25 * a[0] + .75 * b[0], .25 * a[1] + .75 * b[1])]
    if not closed: out.append(p[-1])
    return out

def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(round(a[k] + (b[k] - a[k]) * t) for k in range(3))

levels = np.arange(0.07, field.max(), 0.05)
paths = []
for n, lv in enumerate(levels):
    t = n / max(1, len(levels) - 1)
    index = n % 5 == 0
    color = mix('#6b4fb0', '#b18cff', t * 2) if t < .5 else mix('#b18cff', '#74f0c4', (t - .5) * 2)
    op = .16 + .55 * t ** .8 + (.12 if index else 0)
    sw = 1.7 if index else .9
    d = []
    for line in contours(field, lv):
        if sum(abs(a[0] - b[0]) + abs(a[1] - b[1]) for a, b in zip(line, line[1:])) < 70: continue
        closed = line[0] == line[-1]
        pts = chaikin(line, closed)
        d.append('M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ('Z' if closed else ''))
    if d:
        paths.append(f'<path d="{"".join(d)}" stroke="{color}" stroke-opacity="{op:.2f}" stroke-width="{sw}"/>')

grid = ''.join(f'<path d="M{x} 0V{H}"/>' for x in range(0, W + 1, 160)) + ''.join(f'<path d="M0 {y}H{W}"/>' for y in range(0, H + 1, 160))
ticks_lat = ''.join(f'<text x="{W - 14}" y="{y - 6}" text-anchor="end">22°{48 + i}′S</text>' for i, y in enumerate(range(160, H, 160)))
ticks_lon = ''.join(f'<text x="{x + 6}" y="{H - 14}">47°{18 - i}′W</text>' for i, x in enumerate(range(160, W, 160)))

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">
<!-- DanielOS wallpaper: topographic map whose highest ground is Daniel's portrait. Generated, do not edit by hand. -->
<defs>
<radialGradient id="glow" cx="{cx / W:.3f}" cy="{cy / H:.3f}" r=".55"><stop offset="0" stop-color="#2a1748"/><stop offset=".55" stop-color="#160c27"/><stop offset="1" stop-color="#0e0718"/></radialGradient>
<radialGradient id="mint" cx=".08" cy=".95" r=".5"><stop offset="0" stop-color="#74f0c4" stop-opacity=".10"/><stop offset="1" stop-color="#74f0c4" stop-opacity="0"/></radialGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#glow)"/>
<rect width="{W}" height="{H}" fill="url(#mint)"/>
<g stroke="#f5f0ff" stroke-opacity=".035" stroke-width="1">{grid}</g>
<g fill="none" stroke-linejoin="round" stroke-linecap="round">{"".join(paths)}</g>
<g font-family="JetBrains Mono, Consolas, monospace" font-size="11" fill="#8679a2" fill-opacity=".55" letter-spacing=".08em">{ticks_lat}{ticks_lon}
</g>
</svg>'''
open(sys.argv[2], 'w', encoding='utf-8').write(svg)
print(len(svg) // 1024, 'KB,', len(levels), 'levels')
