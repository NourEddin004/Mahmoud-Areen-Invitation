#!/usr/bin/env python3
"""
Draws the soft botanical art for the first screen:
  assets/corner.svg  — eucalyptus, olive, white roses and baby's breath
                       spilling from a top corner (mirrored/rotated in CSS)
  assets/wreath.svg  — the little floral wreath behind the monogram
Seeded, so re-running gives the same picture.   python3 tools/botanicals.py
"""
import math, random, pathlib
random.seed(11)
ASSETS = pathlib.Path(__file__).resolve().parent.parent / "assets"

def f(v): return f"{v:.1f}".rstrip("0").rstrip(".")

DEFS = """
<radialGradient id="eu" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#C2D1C6"/><stop offset=".55" stop-color="#9AB0A3"/><stop offset="1" stop-color="#76917F"/></radialGradient>
<radialGradient id="eu2" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#B2C4B5"/><stop offset=".6" stop-color="#8AA393"/><stop offset="1" stop-color="#668170"/></radialGradient>
<linearGradient id="ol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5F7046"/><stop offset=".5" stop-color="#7F9160"/><stop offset="1" stop-color="#9AA97A"/></linearGradient>
<radialGradient id="olv" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#A6AF6A"/><stop offset="1" stop-color="#5E6A2E"/></radialGradient>
<radialGradient id="pet" cx="50%" cy="85%" r="90%"><stop offset="0" stop-color="#E9DFC9"/><stop offset=".45" stop-color="#F8F3E8"/><stop offset="1" stop-color="#FFFEFA"/></radialGradient>
<radialGradient id="petIn" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#E3D6B8"/><stop offset="1" stop-color="#FBF7EE"/></radialGradient>
<radialGradient id="rl" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#8FA27A"/><stop offset="1" stop-color="#55693F"/></radialGradient>
"""

class Canvas:
    def __init__(self): self.out = []
    def add(self, s): self.out.append(s)

def leaf_path(x, y, L, W, ang):
    a = math.radians(ang); ca, sa = math.cos(a), math.sin(a)
    P = lambda dx, dy: (x + dx * ca - dy * sa, y + dx * sa + dy * ca)
    t = P(L, 0); l1 = P(L * .25, -W); l2 = P(L * .75, -W * .8); r1 = P(L * .25, W); r2 = P(L * .75, W * .8)
    return (f"M{f(x)} {f(y)}C{f(l1[0])} {f(l1[1])} {f(l2[0])} {f(l2[1])} {f(t[0])} {f(t[1])}"
            f"C{f(r2[0])} {f(r2[1])} {f(r1[0])} {f(r1[1])} {f(x)} {f(y)}Z"), P

def eucalyptus(c, pts, n, r0, r1):
    """A stem along a quadratic curve with pairs of round silver-dollar leaves."""
    (x0, y0), (cx, cy), (x1, y1) = pts
    c.add(f'<path d="M{x0} {y0}Q{cx} {cy} {x1} {y1}" fill="none" stroke="#7D8F7B" stroke-width="1.4" stroke-linecap="round"/>')
    for i in range(n):
        t = .08 + .9 * i / (n - 1)
        x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1
        y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1
        dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx); dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy)
        ang = math.degrees(math.atan2(dy, dx))
        r = r0 + (r1 - r0) * t
        for side in (-1, 1):
            a = math.radians(ang + side * (70 + random.uniform(-12, 12)))
            lx, ly = x + math.cos(a) * r * 1.05, y + math.sin(a) * r * 1.05
            g = "eu" if random.random() < .55 else "eu2"
            c.add(f'<line x1="{f(x)}" y1="{f(y)}" x2="{f(lx)}" y2="{f(ly)}" stroke="#7D8F7B" stroke-width=".8"/>')
            c.add(f'<ellipse cx="{f(lx)}" cy="{f(ly)}" rx="{f(r)}" ry="{f(r*.86)}" transform="rotate({f(ang)} {f(lx)} {f(ly)})" '
                  f'fill="url(#{g})" opacity="{f(.82 + random.random()*.15)}"/>')
            c.add(f'<path d="M{f(lx - math.cos(a)*r*.7)} {f(ly - math.sin(a)*r*.7)}L{f(lx + math.cos(a)*r*.6)} {f(ly + math.sin(a)*r*.6)}" '
                  f'stroke="#E2EBE2" stroke-width=".6" opacity=".6"/>')

def olive(c, x0, y0, L, ang, n):
    a = math.radians(ang); x1, y1 = x0 + math.cos(a) * L, y0 + math.sin(a) * L
    c.add(f'<path d="M{f(x0)} {f(y0)}Q{f((x0+x1)/2 + 10)} {f((y0+y1)/2 - 8)} {f(x1)} {f(y1)}" fill="none" stroke="#6D7A55" stroke-width="1.1"/>')
    for i in range(n):
        t = .1 + .88 * i / (n - 1); x = x0 + (x1 - x0) * t + 6 * math.sin(t * 3); y = y0 + (y1 - y0) * t - 5 * math.sin(t * 3)
        side = 1 if i % 2 else -1
        d, _ = leaf_path(x, y, 30 - 10 * t, 4.2, ang + side * (38 + random.uniform(-8, 8)))
        c.add(f'<path d="{d}" fill="url(#ol)" opacity=".92"/>')
    for k in range(3):
        t = .35 + .2 * k; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t
        c.add(f'<ellipse cx="{f(x + 6)}" cy="{f(y + 9)}" rx="4.2" ry="5.4" fill="url(#olv)"/>')

def rose_leaves(c, x, y, ang):
    for da in (-30, 25):
        d, P = leaf_path(x, y, 26, 9, ang + da)
        c.add(f'<path d="{d}" fill="url(#rl)" opacity=".95"/>')
        m = P(22, 0); c.add(f'<path d="M{f(x)} {f(y)}L{f(m[0])} {f(m[1])}" stroke="#B9C7A6" stroke-width=".6" opacity=".7"/>')

def rose(c, cx, cy, R, rot=0):
    """A white garden rose: outer cupped petals, a ring of mid petals, a curled heart."""
    def petal(r_in, r_out, a0, w, fill, op=1):
        a = math.radians(a0); wa = math.radians(w)
        p0 = (cx + r_in * math.cos(a - wa), cy + r_in * math.sin(a - wa))
        p1 = (cx + r_in * math.cos(a + wa), cy + r_in * math.sin(a + wa))
        c1 = (cx + r_out * 1.15 * math.cos(a - wa * 1.1), cy + r_out * 1.15 * math.sin(a - wa * 1.1))
        c2 = (cx + r_out * 1.15 * math.cos(a + wa * 1.1), cy + r_out * 1.15 * math.sin(a + wa * 1.1))
        c.add(f'<path d="M{f(p0[0])} {f(p0[1])}C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p1[0])} {f(p1[1])}Z" '
              f'fill="url(#{fill})" stroke="#D9CDB3" stroke-width=".6" opacity="{op}"/>')
    for k in range(5): petal(R * .2, R, rot + k * 72, 40, "pet")
    for k in range(5): petal(R * .15, R * .72, rot + 36 + k * 72, 36, "pet")
    for k in range(4): petal(R * .1, R * .46, rot + 18 + k * 90, 40, "petIn")
    c.add(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(R*.2)}" fill="url(#petIn)"/>')
    c.add(f'<path d="M{f(cx-R*.16)} {f(cy)}a{f(R*.16)} {f(R*.12)} 0 1 1 {f(R*.2)} {f(R*.08)}a{f(R*.08)} {f(R*.06)} 0 1 0 -{f(R*.1)} -{f(R*.04)}" '
          f'fill="none" stroke="#C9B994" stroke-width=".8"/>')

def babys_breath(c, x, y, n, spread):
    for k in range(n):
        a = math.radians(-90 + (k - n / 2) * spread + random.uniform(-6, 6)); L = 18 + random.uniform(0, 14)
        ex, ey = x + math.cos(a) * L, y + math.sin(a) * L
        c.add(f'<path d="M{f(x)} {f(y)}L{f(ex)} {f(ey)}" stroke="#93A386" stroke-width=".6"/>')
        for j in range(5):
            aa = j * 1.256
            c.add(f'<circle cx="{f(ex + 2*math.cos(aa))}" cy="{f(ey + 2*math.sin(aa))}" r="1.6" fill="#FFFFFF" stroke="#DCD3C0" stroke-width=".3"/>')
        c.add(f'<circle cx="{f(ex)}" cy="{f(ey)}" r="1" fill="#E9DDB8"/>')

# ── the top-left corner ───────────────────────────────────────────────
c = Canvas()
eucalyptus(c, [(-10, 30), (90, 30), (190, 110)], 9, 11, 6)
eucalyptus(c, [(10, -10), (30, 90), (70, 190)], 8, 10, 5.5)
olive(c, -6, 70, 150, 38, 12)
eucalyptus(c, [(40, -10), (130, -6), (220, 40)], 8, 8.5, 5)
babys_breath(c, 120, 92, 7, 20)
babys_breath(c, 52, 140, 6, 22)
rose_leaves(c, 46, 58, 30); rose_leaves(c, 22, 92, 80)
rose(c, 30, 40, 30, 10)
rose(c, 76, 22, 20, -20)
rose(c, 14, 104, 17, 40)
CORNER = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 220"><defs>{DEFS}</defs>'
          + "".join(c.out) + "</svg>")
(ASSETS / "corner.svg").write_text(CORNER)

# ── the wreath behind the monogram ────────────────────────────────────
w = Canvas()
for side in (-1, 1):
    # two arcs of eucalyptus curving up each side of the letters
    pts = [(60, 112), (60 + side * 56, 98), (60 + side * 50, 20)]
    eucalyptus(w, pts, 7, 6, 3.6)
rose(w, 60, 110, 13, 0)
rose(w, 44, 104, 8, 30); rose(w, 76, 104, 8, -30)
babys_breath(w, 60, 104, 5, 26)
WREATH = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128"><defs>{DEFS}</defs>'
          + "".join(w.out) + "</svg>")
(ASSETS / "wreath.svg").write_text(WREATH)

# ── a smooth, organic wax-seal outline (printed for index.html) ───────
pts = []
N = 22
for i in range(N):
    a = 2 * math.pi * i / N
    r = 53 + 1.3 * math.sin(4 * a + .6) + .9 * math.sin(7 * a + 1.9) + random.uniform(-.5, .5)
    pts.append((60 + r * math.cos(a), 60 + r * math.sin(a)))
d = f"M{f(pts[0][0])} {f(pts[0][1])}"
for i in range(N):  # Catmull-Rom → cubic Bézier, closed
    p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % N], pts[(i + 2) % N]
    c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
    c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
    d += f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
(ASSETS.parent / "tools" / "seal-path.txt").write_text(d + "Z")
print("wrote corner.svg, wreath.svg, tools/seal-path.txt")
