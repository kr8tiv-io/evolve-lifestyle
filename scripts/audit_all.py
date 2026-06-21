"""Audit every -v2 cutout for residual white (fringe + interior/opaque white) and
build a magenta contact sheet. Magenta reveals any non-transparent white pixel."""
import os, glob, sys
from PIL import Image, ImageDraw
import numpy as np

SUF = sys.argv[1] if len(sys.argv) > 1 else "v2"
PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"
OUT = rf"C:\Users\lucid\Desktop\evolve-lifestyle\screenshots\audit_{SUF}.jpg"

def metrics(img):
    arr = np.array(img)
    a = arr[:, :, 3]; rgb = arr[:, :, :3].astype(int)
    mn = rgb.min(axis=2); mx = rgb.max(axis=2)
    nearwhite = (mn > 240) & ((mx - mn) < 16)
    partial = (a >= 12) & (a <= 244)
    opaque = a > 200
    fringe = int((partial & nearwhite).sum())
    opaque_white = int((opaque & nearwhite).sum())
    core = (a > 244) & (~nearwhite)
    coremin = int(np.median(mn[core])) if core.sum() else -1
    return fringe, opaque_white, coremin

files = sorted(glob.glob(os.path.join(PROD, f"p*-0-{SUF}.png")))
print(f"{len(files)} cutouts")
cards = []
for f in files:
    stem = os.path.basename(f)[:-4]
    img = Image.open(f).convert("RGBA")
    fr, ow, cm = metrics(img)
    # flag: dark garment (coremin<120) with notable opaque-white => leftover bg
    flag = "  <== WHITE" if (cm < 130 and ow > 40) or fr > 60 else ""
    print(f"{stem}  fringe={fr:5d}  opaqueWhite={ow:6d}  coreMin={cm:3d}{flag}")
    # card on magenta
    W, H = 230, 280
    c = Image.new("RGBA", (W, H), (255, 0, 255, 255))
    pad = 16; s = min((W - 2 * pad) / img.width, (H - 2 * pad) / img.height)
    im = img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))))
    c.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2))
    c = c.convert("RGB")
    d = ImageDraw.Draw(c)
    d.rectangle([0, 0, W, 13], fill=(0, 0, 0))
    d.text((2, 2), f"{stem[1:10]} w{ow}", fill=(255, 255, 0))
    cards.append(c)

cols = 6
rows = (len(cards) + cols - 1) // cols
cw, ch = cards[0].size
sheet = Image.new("RGB", (cw * cols, ch * rows), (30, 30, 30))
for i, c in enumerate(cards):
    sheet.paste(c, ((i % cols) * cw, (i // cols) * ch))
sheet.save(OUT, quality=88)
print("wrote", OUT)
