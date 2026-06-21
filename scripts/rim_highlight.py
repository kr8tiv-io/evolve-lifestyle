"""Composite on the dark card bg and paint the detected bright-rim pixels RED, so I
can see whether a flag is a real white halo or legit garment detail (cuff ribbing,
mesh, glossy edge). Usage: python rim_highlight.py <out.jpg> <stem> [<stem> ...]"""
import sys, os
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage

PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"
OUTDIR = r"C:\Users\lucid\Desktop\evolve-lifestyle\screenshots"
CARD_BG = (12, 13, 12)

def rim_mask(arr):
    a = arr[:, :, 3]
    lum = arr[:, :, :3].astype(np.float32).mean(axis=2)
    solid = a > 235
    core = ndimage.binary_erosion(solid, iterations=4)
    core_lum = float(np.median(lum[core])) if core.sum() else float(np.median(lum[solid]))
    trans = a < 10
    near_bg = ndimage.binary_dilation(trans, iterations=2) & (a > 60)
    partial = (a > 10) & (a < 235)
    edge = near_bg | partial
    rim = edge & (lum > core_lum + 45) & (lum > 120)
    return rim, core_lum

def make(stem):
    img = Image.open(os.path.join(PROD, stem + ".png")).convert("RGBA")
    arr = np.array(img)
    rim, cl = rim_mask(arr)
    # composite on dark bg
    comp = Image.new("RGBA", img.size, CARD_BG + (255,))
    comp.alpha_composite(img)
    comp = np.array(comp.convert("RGB"))
    comp[rim] = (255, 0, 0)
    out = Image.fromarray(comp)
    # crop to garment bbox + margin, upscale to 560 wide
    ys, xs = np.where(arr[:, :, 3] > 20)
    if len(xs):
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        m = 10
        out = out.crop((max(0, x0 - m), max(0, y0 - m), x1 + m, y1 + m))
    w = 560; h = int(out.height * w / out.width)
    out = out.resize((w, h), Image.NEAREST)
    d = ImageDraw.Draw(out); d.rectangle([0, 0, w, 16], fill=(0, 0, 0))
    d.text((3, 3), f"{stem}  rim(red)={int(rim.sum())} core={cl:.0f}", fill=(255, 255, 0))
    return out

stems = sys.argv[2:]
cards = [make(s) for s in stems]
maxh = max(c.height for c in cards); W = sum(c.width for c in cards)
sheet = Image.new("RGB", (W, maxh), (25, 25, 25))
x = 0
for c in cards:
    sheet.paste(c, (x, 0)); x += c.width
sheet.save(os.path.join(OUTDIR, sys.argv[1]), quality=92)
print("wrote", os.path.join(OUTDIR, sys.argv[1]))
