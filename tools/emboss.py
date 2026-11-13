#!/usr/bin/env python3
"""Draws assets/emboss.svg — the blind-embossed florals pressed into the
envelope paper. No ink: every line is a white highlight on the upper-left
and a soft shadow on the lower-right, the way a real die catches light."""
import math, pathlib
T = 440                                   # tile size
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "emboss.svg"
shapes = []

def f(v): return f"{v:.1f}".rstrip("0").rstrip(".")

def petal(cx, cy, r, ang):
    a = math.radians(ang)
    def P(dx, dy):  # rotate a local point
        return (cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a))
    p0 = P(0, 0); c1 = P(-r * .55, -r * .35); c2 = P(-r * .62, -r * 1.05); tip = P(0, -r * 1.02)
    c3 = P(r * .62, -r * 1.05); c4 = P(r * .55, -r * .35); notch = P(0, -r * .9)
    return (f"M{f(p0[0])} {f(p0[1])}C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(tip[0]-r*.08)} {f(tip[1])}"
            f"Q{f(notch[0])} {f(notch[1])} {f(tip[0]+r*.08)} {f(tip[1])}"
            f"C{f(c3[0])} {f(c3[1])} {f(c4[0])} {f(c4[1])} {f(p0[0])} {f(p0[1])}Z")

def flower(cx, cy, r, rot=0):
    for k in range(5):
        shapes.append(petal(cx, cy, r, rot + k * 72))
        a = math.radians(rot + k * 72 - 90)       # a vein down each petal
        shapes.append(f"M{f(cx + r*.22*math.cos(a))} {f(cy + r*.22*math.sin(a))}L{f(cx + r*.6*math.cos(a))} {f(cy + r*.6*math.sin(a))}")
    shapes.append(f"M{f(cx + r*.17)} {f(cy)}A{f(r*.17)} {f(r*.17)} 0 1 0 {f(cx - r*.17)} {f(cy)}A{f(r*.17)} {f(r*.17)} 0 1 0 {f(cx + r*.17)} {f(cy)}Z")
    for k in range(12):                            # stamens
        a = math.radians(k * 30)
        x, y = cx + r * .27 * math.cos(a), cy + r * .27 * math.sin(a)
        shapes.append(f"M{f(x+1.6)} {f(y)}A1.6 1.6 0 1 0 {f(x-1.6)} {f(y)}A1.6 1.6 0 1 0 {f(x+1.6)} {f(y)}Z")

def leaf(x, y, L, ang, w=.36):
    a = math.radians(ang); ca, sa = math.cos(a), math.sin(a)
    P = lambda dx, dy: (x + dx * ca - dy * sa, y + dx * sa + dy * ca)
    tip = P(L, 0); l1 = P(L * .3, -L * w); l2 = P(L * .75, -L * w * .8); r1 = P(L * .3, L * w); r2 = P(L * .75, L * w * .8)
    shapes.append(f"M{f(x)} {f(y)}C{f(l1[0])} {f(l1[1])} {f(l2[0])} {f(l2[1])} {f(tip[0])} {f(tip[1])}"
                  f"C{f(r2[0])} {f(r2[1])} {f(r1[0])} {f(r1[1])} {f(x)} {f(y)}Z")
    m = P(L * .92, 0); shapes.append(f"M{f(x)} {f(y)}L{f(m[0])} {f(m[1])}")     # midrib
    for t in (.3, .5, .7):                                                         # veins
        b = P(L * t, 0); e1 = P(L * (t + .14), -L * w * .55); e2 = P(L * (t + .14), L * w * .55)
        shapes.append(f"M{f(b[0])} {f(b[1])}L{f(e1[0])} {f(e1[1])}M{f(b[0])} {f(b[1])}L{f(e2[0])} {f(e2[1])}")

def branch(pts, leaves):
    d = f"M{f(pts[0][0])} {f(pts[0][1])}C" + " ".join(f"{f(x)} {f(y)}" for x, y in pts[1:])
    shapes.append(d)
    for (x, y, L, ang) in leaves: leaf(x, y, L, ang)

def berries(x, y, n, spread, ang):
    for k in range(n):
        a = math.radians(ang + (k - n / 2) * spread)
        ex, ey = x + 26 * math.cos(a), y + 26 * math.sin(a)
        shapes.append(f"M{f(x)} {f(y)}Q{f((x+ex)/2 + 4)} {f((y+ey)/2 - 4)} {f(ex)} {f(ey)}")
        shapes.append(f"M{f(ex+3.4)} {f(ey)}A3.4 3.4 0 1 0 {f(ex-3.4)} {f(ey)}A3.4 3.4 0 1 0 {f(ex+3.4)} {f(ey)}Z")

flower(120, 118, 62, 8)
flower(328, 318, 50, -14)
branch([(18, 430), (60, 360), (120, 320), (200, 250)],
       [(70, 362, 46, -120), (92, 344, 44, 10), (128, 316, 42, -110), (150, 300, 40, 20), (182, 268, 36, -80)])
branch([(250, 20), (300, 70), (360, 90), (425, 170)],
       [(286, 58, 40, -60), (312, 80, 40, 70), (350, 92, 36, -40), (384, 120, 34, 80)])
berries(372, 40, 5, 22, -150)
berries(60, 252, 4, 24, -40)
leaf(200, 40, 44, 150); leaf(214, 60, 36, 200)
leaf(232, 410, 40, -30); leaf(420, 250, 34, 200)

D = "".join(shapes)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{T}" height="{T}" viewBox="0 0 {T} {T}">'
       f'<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
       f'<path d="{D}" stroke="#8E7A58" stroke-opacity=".16" stroke-width="1.5" transform="translate(.9 1.1)"/>'
       f'<path d="{D}" stroke="#FFFFFF" stroke-opacity=".8" stroke-width="1" transform="translate(-.5 -.6)"/>'
       f'</g></svg>')
OUT.write_text(svg)
print(f"wrote {OUT} ({len(svg)//1024} KB)")
