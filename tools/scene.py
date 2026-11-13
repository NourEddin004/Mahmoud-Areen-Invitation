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

# birds: real silhouettes, flapping as they cross the sky (CSS in <style>)
def bird(cls, x, y, sc, delay, dur):
    wing = "M0 0C-3 -5 -9 -8 -16 -7C-12 -5 -8 -2 -6 1C-4 0 -2 0 0 0Z"
    return (f'<g class="fly" style="animation-duration:{dur}s;animation-delay:{delay}s">'
            f'<g transform="translate({x} {y}) scale({sc})">'
            f'<ellipse rx="5.5" ry="1.7" fill="{INK}"/>'
            f'<path d="M5 -.5C6.5 -1.6 8 -1.2 8.5 0L5 .8Z" fill="{INK}"/>'
            f'<path d="M-5 0L-9 -1.6L-8.6 1.4Z" fill="{INK}"/>'
            f'<g class="wing"><path d="{wing}" fill="{INK}"/></g>'
            f'<g class="wing w2"><path d="{wing}" transform="scale(-1 1)" fill="{DEEP}" opacity=".85"/></g>'
            f'</g></g>')
BIRDS = (bird("a", -30, 118, .9, 0, 46) + bird("b", -60, 104, .7, -9, 52) + bird("c", -10, 140, .6, -20, 58)
         + bird("d", -45, 92, .55, -31, 64))

add(BIRDS)

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
# Mute swans with arched ("busking") wings. The left swan faces right;
# the right one is its mirror. (0,0) is the waterline between them.
SWAN_BODY = ("M-22 -14C-22 -6 -28 -1 -38 0L-96 -1C-104 -3 -110 -8 -116 -19"
             "C-110 -17 -106 -18 -103 -22C-101 -38 -90 -52 -72 -54"
             "C-57 -56 -44 -47 -36 -35C-30 -28 -24 -22 -22 -14Z")
# folded wing sitting inside the body, with a scalloped feather edge
WING_IN = ("M-102 -22C-99 -38 -88 -49 -71 -49C-58 -49 -48 -42 -43 -33"
           "C-47 -29 -51 -30 -54 -27C-58 -30 -62 -28 -65 -25C-69 -28 -73 -26 -76 -23"
           "C-80 -26 -84 -24 -87 -21C-91 -24 -95 -22 -98 -19C-100 -21 -101 -21 -102 -22Z")
FEATHERS = ("M-96 -30C-90 -36 -82 -40 -74 -40M-92 -38C-84 -44 -74 -46 -64 -44"
            "M-86 -24C-80 -30 -72 -33 -64 -32M-76 -20C-70 -25 -62 -27 -55 -26"
            "M-108 -16C-104 -14 -100 -12 -96 -10M-104 -8C-98 -6 -92 -5 -86 -4"
            "M-60 -6C-52 -8 -44 -8 -36 -6")
SWAN_NECK = ("M-40 -30C-58 -58 -61 -94 -43 -112C-31 -124 -12 -122 -6 -108"
             "C-5 -104 -6 -101 -9 -100C-11 -101 -14 -103 -17 -104"
             "C-29 -108 -45 -93 -44 -76C-43 -58 -37 -45 -27 -32Z")
BEAK = "M-8 -106C-4 -102 -1 -96 1 -89L-2 -88C-5 -93 -8 -98 -12 -101Z"
KNOB = "M-12 -108C-9 -110 -6 -108 -6 -105L-9 -102C-11 -103 -13 -105 -12 -108Z"

def swan(mirror):
    s = "scale(-1 1)" if mirror else ""
    return (f'<g transform="{s}">'
            f'<path d="{SWAN_NECK}" fill="url(#plumeN)" stroke="{INK}" stroke-width="1"/>'
            f'<path d="M-50 -64C-52 -80 -48 -96 -40 -104" fill="none" stroke="{LIGHT}" stroke-width="1.6" opacity=".8"/>'
            f'<path d="{SWAN_BODY}" fill="url(#plume)" stroke="{INK}" stroke-width="1"/>'
            f'<path d="{WING_IN}" fill="#F8F4EA" stroke="{DEEP}" stroke-width=".7"/>'
            f'<path d="{FEATHERS}" fill="none" stroke="{MID}" stroke-width=".6"/>'
            f'<path d="{BEAK}" fill="#B7773F" stroke="{INK}" stroke-width=".5"/>'
            f'<path d="{KNOB}" fill="{INK}"/>'
            f'<circle cx="-15" cy="-107" r="1.2" fill="{INK}"/>'
            f'</g>')

PLUME = ('<linearGradient id="plume" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="#FBF8F0"/><stop offset=".65" stop-color="#EFE7D6"/><stop offset="1" stop-color="#C9BA98"/></linearGradient>'
         '<linearGradient id="plumeN" x1="0" y1="0" x2="1" y2="0">'
         '<stop offset="0" stop-color="#E6DCC6"/><stop offset=".5" stop-color="#FBF8F0"/><stop offset="1" stop-color="#EDE4D1"/></linearGradient>')
STYLE = '''<style>
.fly{ animation:fly 50s linear infinite } .wing{ transform-box:fill-box; transform-origin:100% 100%; animation:flap .9s ease-in-out infinite alternate }
.w2{ transform-origin:0% 100% }
.bob{ animation:bob 5s ease-in-out infinite } .bobR{ animation:bob 5s ease-in-out infinite reverse }
.rip{ transform-box:fill-box; transform-origin:center; animation:rip 7.2s ease-out infinite; opacity:0 }
@keyframes fly{ from{ transform:translate(0,0) } 50%{ transform:translate(230px,-14px) } to{ transform:translate(470px,4px) } }
@keyframes flap{ from{ transform:scaleY(1) } to{ transform:scaleY(-.55) } }
@keyframes bob{ 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-2.2px) } }
@keyframes rip{ 0%{ transform:scale(.9); opacity:.55 } 100%{ transform:scale(2.2); opacity:0 } }
@media (prefers-reduced-motion:reduce){ *{ animation:none !important } .rip{ opacity:.3 } }
</style>
'''
parts[0] = parts[0].replace("</defs>", PLUME + STYLE + "</defs>")

SX, SY, SS = 200, 626, .92
pair = swan(False) + swan(True)
RIPPLES = "".join(f'<ellipse class="rip" style="animation-delay:{d}s" rx="70" ry="6.5" cy="2"/>' for d in (0, 2.4, 4.8))
add(f'<g transform="translate({SX} {SY})" fill="none" stroke="{DEEP}" stroke-width=".8">{RIPPLES}</g>')
add(f'<g transform="translate({SX} {SY+2}) scale({SS} {-SS*.8})" opacity=".26" filter="url(#ripple)"><g class="bobR">{pair}</g></g>')
add(f'<g transform="translate({SX} {SY}) scale({SS})"><g class="bob" id="swans">{pair}</g></g>')

# standalone engraved pair for the venue + closing (assets/swans.svg)
SWANS_ONLY = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-130 -140 260 168">'
              f'<defs>{PLUME}<filter id="ripple" x="-5%" y="-5%" width="110%" height="110%">'
              f'<feTurbulence type="fractalNoise" baseFrequency=".004 .18" numOctaves="1" seed="9"/>'
              f'<feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>'
              f'<path d="M-124 1H124" stroke="{MID}" stroke-width=".8" opacity=".6"/>'
              + "".join(f'<path d="M{x} {y}h{w}" stroke="{MID}" stroke-width=".6" opacity=".45"/>' for x, y, w in
                        [(-110, 7, 60), (-30, 6, 80), (60, 8, 50), (-90, 13, 50), (10, 14, 70), (-50, 20, 40), (30, 21, 30)])
              + f'<g transform="translate(0 3) scale(1 -.55)" opacity=".22" filter="url(#ripple)">{pair}</g>'
              + pair + '</svg>')
(OUT.parent / "swans.svg").write_text(SWANS_ONLY)

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
