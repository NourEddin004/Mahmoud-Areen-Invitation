#!/usr/bin/env python3
"""
Draws assets/lake.svg — the sepia "engraving" the invitation opens on:
a still lake, tree lines on both banks, distant hills, and two swans whose
necks meet in a heart.

Everything is plain SVG (no raster), seeded so the output is stable.
Re-run after editing:   python3 tools/scene.py
"""
import math, random, pathlib

random.seed(7)
W, H = 400, 760
HORIZON = 372          # where the far bank meets the water
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "lake.svg"

INK, DEEP, MID, LIGHT, PAPER = "#43361F", "#5E4D33", "#8C7A5C", "#C2B391", "#E8DFCB"

def f(x):  # compact numbers
    return f"{x:.1f}".rstrip("0").rstrip(".")

parts = []
add = parts.append

# ── defs: hatch patterns + grain ─────────────────────────────────────
add(f"""<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#D9CDB2"/><stop offset=".55" stop-color="#E9E1CD"/><stop offset="1" stop-color="#EFE8D6"/>
</linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#E4DAC3"/><stop offset=".5" stop-color="#D6C9AC"/><stop offset="1" stop-color="#BFAE8B"/>
</linearGradient>
<pattern id="hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
  <line x1="0" y1="0" x2="0" y2="3" stroke="{INK}" stroke-width=".7" opacity=".55"/>
</pattern>
<pattern id="hatchX" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
  <line x1="0" y1="0" x2="0" y2="3.4" stroke="{INK}" stroke-width=".6" opacity=".5"/>
</pattern>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/>
  <feColorMatrix values="0 0 0 0 .26  0 0 0 0 .21  0 0 0 0 .12  0 0 0 .22 0"/>
  <feComposite in2="SourceGraphic" operator="in"/>
</filter>
<filter id="ripple" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency=".004 .18" numOctaves="1" seed="9"/>
  <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<mask id="reflMask"><rect x="0" y="{HORIZON}" width="{W}" height="260" fill="url(#reflFade)"/></mask>
</defs>""")

# ── sky ──────────────────────────────────────────────────────────────
add(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
# engraved sky: long horizontal strokes, denser near the top, broken where clouds sit
sky = []
y = 6
while y < HORIZON - 40:
    dens = 1 - y / (HORIZON - 40)
    x = -10
    while x < W:
        seg = random.uniform(30, 140)
        cloud = 0.5 + 0.5 * math.sin(x / 70 + y / 23) * math.cos(y / 41)
        if random.random() < 0.35 + 0.55 * dens * cloud:
            sky.append(f"M{f(x)} {f(y + random.uniform(-.4,.4))}h{f(seg)}")
        x += seg + random.uniform(4, 22)
    y += 2.2 + 3.5 * (1 - dens)
add(f'<path d="{"".join(sky)}" stroke="{MID}" stroke-width=".45" opacity=".55" fill="none"/>')

# a few birds, far away
for bx, by, s in [(250, 120, 1), (268, 112, .8), (238, 131, .7)]:
    add(f'<path d="M{bx} {by}q{4*s} {-4*s} {8*s} 0q{4*s} {-4*s} {8*s} 0" stroke="{DEEP}" stroke-width=".8" fill="none"/>')

# ── distant hills ────────────────────────────────────────────────────
def ridge(base, amp, step, seed, color, op, hatch=None):
    r = random.Random(seed)
    pts = [(0, base)]
    x = 0
    while x <= W:
        pts.append((x, base - amp * (0.5 + 0.5 * math.sin(x / 61 + seed)) - r.uniform(0, amp * .25)))
        x += step
    d = "M0 " + f(HORIZON + 2) + "".join(f"L{f(a)} {f(b)}" for a, b in pts) + f"L{W} {HORIZON + 2}Z"
    add(f'<path d="{d}" fill="{color}" opacity="{op}"/>')
    if hatch:
        add(f'<path d="{d}" fill="url(#{hatch})" opacity="{op*.6}"/>')

ridge(HORIZON - 26, 22, 9, 1, LIGHT, .8)
ridge(HORIZON - 8, 12, 7, 4, MID, .55, "hatchX")

# ── trees ────────────────────────────────────────────────────────────
def tree(cx, base, h, w, kind="broad", shade=1.0, group=None):
    """A tree as clustered foliage clumps, each clump ink-outlined and hatched."""
    out = group if group is not None else parts
    r = random.Random(int(cx * 13 + base))
    # trunk
    out.append(f'<path d="M{f(cx-1.6)} {f(base)}C{f(cx-1)} {f(base-h*.4)} {f(cx+.8)} {f(base-h*.6)} {f(cx+.4)} {f(base-h*.8)}" '
               f'stroke="{INK}" stroke-width="{f(1.2+w*.02)}" fill="none"/>')
    clumps = []
    n = int(14 + h / 3.2)
    for i in range(n):
        t = r.random() ** .8
        if kind == "pine":
            yy = base - h * (0.12 + 0.88 * t)
            spread = w * (1 - t) * .6 + 4
        else:
            yy = base - h * (0.22 + 0.78 * t)
            spread = w * .55 * math.sin(math.pi * (0.18 + 0.8 * t)) + 5
        xx = cx + r.uniform(-spread, spread) * r.random() ** .4
        rad = r.uniform(5, 11) * (0.55 + w / 110)
        clumps.append((xx, yy, rad))
    clumps.sort(key=lambda c: c[1])
    for (xx, yy, rad) in clumps:
        # scalloped clump outline
        k = 7
        pts = []
        for j in range(k + 1):
            a = 2 * math.pi * j / k
            rr = rad * (0.82 + 0.25 * r.random())
            pts.append((xx + rr * math.cos(a), yy + rr * math.sin(a) * .8))
        d = f"M{f(pts[0][0])} {f(pts[0][1])}" + "".join(
            f"Q{f((pts[j][0]+pts[j+1][0])/2 + (pts[j][0]-xx)*.35)} {f((pts[j][1]+pts[j+1][1])/2 + (pts[j][1]-yy)*.35)} {f(pts[j+1][0])} {f(pts[j+1][1])}"
            for j in range(k)) + "Z"
        tone = MID if r.random() < .55 else DEEP
        out.append(f'<path d="{d}" fill="{tone}" fill-opacity="{f(.55*shade)}" stroke="{INK}" stroke-width=".45" stroke-opacity=".7"/>')
        out.append(f'<path d="{d}" fill="url(#hatch)" opacity="{f(.9*shade)}"/>')
        # light side
        out.append(f'<path d="M{f(xx-rad*.5)} {f(yy-rad*.45)}q{f(rad*.4)} {f(-rad*.3)} {f(rad*.8)} 0" stroke="{PAPER}" stroke-width=".7" fill="none" opacity=".65"/>')

bank = []          # collect trees once, draw them twice (scene + reflection)
def grove(spec):
    for s in spec:
        tree(*s, group=bank)

grove([
    # far bank, small
    (150, HORIZON + 1, 26, 22, "broad", .7), (172, HORIZON + 1, 34, 20, "pine", .7),
    (196, HORIZON + 1, 22, 18, "broad", .65), (224, HORIZON + 1, 30, 22, "pine", .7),
    (250, HORIZON + 1, 24, 22, "broad", .65),
    # left bank, tall and close
    (12, HORIZON + 6, 250, 120, "broad", 1), (60, HORIZON + 4, 190, 80, "broad", .95),
    (98, HORIZON + 3, 120, 52, "pine", .9), (124, HORIZON + 2, 70, 34, "broad", .8),
    # right bank
    (392, HORIZON + 6, 210, 104, "broad", 1), (346, HORIZON + 4, 140, 64, "pine", .92),
    (310, HORIZON + 3, 82, 40, "broad", .82), (284, HORIZON + 2, 46, 26, "pine", .75),
])

add('<g id="bank">' + "".join(bank) + "</g>")

# ── water ────────────────────────────────────────────────────────────
add(f'<rect x="0" y="{HORIZON}" width="{W}" height="{H-HORIZON}" fill="url(#water)"/>')
# reflection of the banks
add(f'<g mask="url(#reflMask)"><g filter="url(#ripple)" opacity=".5" '
    f'transform="translate(0 {2*HORIZON+4}) scale(1 -1)"><use href="#bank"/></g></g>')
# engraved water lines
wl = []
y = HORIZON + 3
while y < H:
    t = (y - HORIZON) / (H - HORIZON)
    x = random.uniform(-20, 0)
    while x < W:
        seg = random.uniform(14, 70) * (1 + t)
        if random.random() < .55 + .3 * t:
            wl.append(f"M{f(x)} {f(y)}h{f(seg)}")
        x += seg + random.uniform(6, 26)
    y += 1.6 + 5 * t
add(f'<path d="{"".join(wl)}" stroke="{DEEP}" stroke-width=".5" opacity=".42" fill="none"/>')
# shoreline
add(f'<path d="M0 {HORIZON+1}H{W}" stroke="{INK}" stroke-width=".6" opacity=".45"/>')

# ── swans ────────────────────────────────────────────────────────────
# The left swan is drawn facing right; the right one is its mirror.
# Origin (0,0) sits on the waterline at the centre between them.
SWAN_BODY = ("M-104 -20C-112 -30 -110 -44 -100 -48C-96 -36 -88 -32 -78 -34"
             "C-66 -46 -46 -46 -34 -36C-26 -30 -20 -24 -18 -16C-17 -8 -24 -2 -36 0"
             "L-86 0C-96 -2 -104 -10 -104 -20Z")
SWAN_NECK = ("M-30 -30C-48 -52 -56 -86 -42 -108C-30 -126 -8 -122 -4 -104"
             "C-2 -98 0 -92 1 -86L-1 -84C-6 -90 -10 -96 -12 -102"
             "C-18 -116 -32 -112 -36 -100C-42 -82 -34 -54 -20 -34Z")
SWAN_HEAD = "M-4 -104C-1 -100 2 -94 1 -86L-3 -88C-5 -94 -7 -98 -9 -101Z"   # dark beak
WING = ("M-90 -32C-80 -44 -60 -50 -44 -42M-86 -24C-74 -36 -56 -40 -42 -32"
        "M-80 -14C-68 -24 -54 -26 -40 -20M-98 -30L-92 -22M-70 -10C-60 -14 -50 -14 -40 -10")

def swan(mirror):
    s = "scale(-1 1)" if mirror else ""
    return (f'<g transform="{s}">'
            f'<path d="{SWAN_BODY}" fill="#F3EDDF" stroke="{INK}" stroke-width="1.1"/>'
            f'<path d="{SWAN_NECK}" fill="#F3EDDF" stroke="{INK}" stroke-width="1.1"/>'
            f'<path d="{WING}" fill="none" stroke="{MID}" stroke-width=".8"/>'
            f'<path d="M-36 -36C-30 -26 -28 -14 -34 -4" fill="none" stroke="{LIGHT}" stroke-width="2.4" opacity=".7"/>'
            f'<path d="{SWAN_HEAD}" fill="{INK}"/>'
            f'<circle cx="-13" cy="-106" r="1.3" fill="{INK}"/>'
            f'</g>')

SX, SY, SS = 200, 624, .9
pair = swan(False) + swan(True)
# reflection
add(f'<g transform="translate({SX} {SY+2}) scale({SS} {-SS*.8})" opacity=".28" filter="url(#ripple)">{pair}</g>')
# ripples around them
add(f'<g transform="translate({SX} {SY})" fill="none" stroke="{DEEP}" stroke-width=".7" opacity=".55">'
    + "".join(f'<ellipse rx="{rx}" ry="{rx*.09:.1f}" cy="2"/>' for rx in (96, 120, 146)) + "</g>")
add(f'<g id="swans" transform="translate({SX} {SY}) scale({SS})">{pair}</g>')

# ── reeds, foreground corners ────────────────────────────────────────
reeds = []
for side in (-1, 1):
    base_x = 0 if side < 0 else W
    for i in range(22):
        x0 = base_x - side * random.uniform(0, 70)
        hh = random.uniform(40, 120)
        lean = random.uniform(-14, 14)
        reeds.append(f"M{f(x0)} {H}Q{f(x0+lean*.3)} {f(H-hh*.6)} {f(x0+lean)} {f(H-hh)}")
    for i in range(4):  # cattails
        x0 = base_x - side * random.uniform(14, 56)
        hh = random.uniform(80, 130)
        reeds.append(f"M{f(x0)} {H}L{f(x0+side*-3)} {f(H-hh)}")
        add(f'<rect x="{f(x0+side*-3-2.2)}" y="{f(H-hh-4)}" width="4.4" height="16" rx="2.2" fill="{INK}" opacity=".85"/>')
add(f'<path d="{"".join(reeds)}" stroke="{INK}" stroke-width=".9" fill="none" opacity=".75"/>')

# ── paper grain over everything ──────────────────────────────────────
add(f'<rect width="{W}" height="{H}" filter="url(#grain)" fill="#000"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">'
       + "".join(parts) + "</svg>")
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(svg)
print(f"wrote {OUT}  ({len(svg)//1024} KB)")
