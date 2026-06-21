"""Ruthless rim audit: a pixel is a defect if it sits on the BACKGROUND side of the
garment edge and is LIGHTER than the garment core (catches gray AA halos, not just
near-white). White garments pass automatically (edge ~ core). Logos are interior, not
counted. Outputs a pass/fail table + a contact sheet composited on the real-ish dark
card background at the size the rim would show."""
import os, glob, sys
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
from scipy import ndimage

SUF = sys.argv[1] if len(sys.argv) > 1 else "v3"
PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"
OUT = rf"C:\Users\lucid\Desktop\evolve-lifestyle\screenshots\strict_{SUF}.jpg"
CARD_BG = (12, 13, 12)   # dark card-ish background (void-800-ish)
FAIL_RIM = 12            # > this many lighter-than-garment edge px => FAIL

def audit(img):
    arr = np.array(img.convert("RGBA"))
    a = arr[:, :, 3]
    lum = arr[:, :, :3].astype(np.float32).mean(axis=2)
    solid = a > 235
    if solid.sum() < 50:
        return 128, 0, True
    core = ndimage.binary_erosion(solid, iterations=4)
    core_lum = float(np.median(lum[core])) if core.sum() else float(np.median(lum[solid]))
    trans = a < 10
    # opaque pixels within 2px of a transparent pixel (the background-side rim) + any partial
    near_bg = ndimage.binary_dilation(trans, iterations=2) & (a > 60)
    partial = (a > 10) & (a < 235)
    edge = near_bg | partial
    # a visible white line is BRIGHT and clearly lighter than the garment
    margin = 45
    rim = edge & (lum > core_lum + margin) & (lum > 120)
    rim_count = int(rim.sum())
    light_garment = core_lum > 165
    status = light_garment or rim_count <= FAIL_RIM
    return core_lum, rim_count, status

def card(img, W=300, H=370):
    c = Image.new("RGBA", (W, H), CARD_BG + (255,))
    pad = int(W * 0.10); s = min((W - 2 * pad) / img.width, (H - 2 * pad) / img.height)
    im = img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))))
    c.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2))
    return c.convert("RGB")

files = sorted(glob.glob(os.path.join(PROD, f"p*-0-{SUF}.png")))
rows = []
fails = []
for f in files:
    stem = os.path.basename(f)[:-4]
    img = Image.open(f).convert("RGBA")
    cl, rc, ok = audit(img)
    print(f"{stem}  coreLum={cl:5.1f}  rim={rc:5d}  {'PASS' if ok else 'FAIL <==='}")
    if not ok:
        fails.append(stem)
    c = card(img)
    d = ImageDraw.Draw(c)
    d.rectangle([0, 0, c.width, 13], fill=(0, 0, 0))
    d.text((2, 2), f"{stem[1:10]} rim{rc} {'OK' if ok else 'FAIL'}",
           fill=(120, 255, 120) if ok else (255, 80, 80))
    rows.append(c)
cols = 6; cw, ch = rows[0].size
sheet = Image.new("RGB", (cw * cols, ch * ((len(rows) + cols - 1) // cols)), (20, 20, 20))
for i, c in enumerate(rows):
    sheet.paste(c, ((i % cols) * cw, (i // cols) * ch))
sheet.save(OUT, quality=90)
print(f"\nFAILS ({len(fails)}): {fails}")
print("wrote", OUT)
