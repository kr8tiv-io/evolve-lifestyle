"""Composite cutouts on a revealing background so white fringe/holes are visible.
Usage: python qa_cutouts.py <bgname> <file-stem> [<file-stem> ...]
  bgname: magenta | dark | both
  file-stem: e.g. p440708831-0-v2  (without .png)
Outputs screenshots/qa_cut.jpg
"""
import sys, os
from PIL import Image, ImageDraw
import numpy as np

PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"
OUT = r"C:\Users\lucid\Desktop\evolve-lifestyle\screenshots\qa_cut.jpg"

BGS = {"magenta": (255, 0, 255), "dark": (10, 12, 11), "gray": (130, 130, 130)}

def stats(img):
    a = np.array(img)[:, :, 3]
    rgb = np.array(img)[:, :, :3].astype(int)
    mn = rgb.min(axis=2); mx = rgb.max(axis=2)
    nearwhite = (mn > 228) & ((mx - mn) < 20)
    partial = (a >= 12) & (a <= 244)
    opaque = a > 244
    fringe = int((partial & nearwhite).sum())
    interior_white = int((opaque & nearwhite).sum())
    core = opaque & (~nearwhite)
    coremed = [int(np.median(rgb[:, :, c][core])) if core.sum() else -1 for c in range(3)]
    return dict(fringe=fringe, interior_white=interior_white, coreRGB=coremed,
                transparent_pct=round(float((a < 12).mean()) * 100, 1))

def card(img, bg, W=560, H=680):
    canvas = Image.new("RGBA", (W, H), bg + (255,))
    pad = int(W * 0.07); bw, bh = W - 2 * pad, H - 2 * pad
    s = min(bw / img.width, bh / img.height)
    im = img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))))
    canvas.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2))
    return canvas.convert("RGB")

def main():
    bgname = sys.argv[1]
    stems = sys.argv[2:]
    bgs = [BGS["magenta"], BGS["dark"]] if bgname == "both" else [BGS[bgname]]
    rows = []
    labels = []
    for stem in stems:
        img = Image.open(os.path.join(PROD, stem + ".png")).convert("RGBA")
        s = stats(img)
        labels.append(f"{stem}  fringe={s['fringe']} inWhite={s['interior_white']} core={s['coreRGB']}")
        rows.append([card(img, bg) for bg in bgs])
    cw, ch = rows[0][0].size
    cols = len(bgs)
    sheet = Image.new("RGB", (cw * cols, (ch + 26) * len(rows)), (35, 35, 35))
    d = ImageDraw.Draw(sheet)
    for r, cards in enumerate(rows):
        y = r * (ch + 26)
        d.text((6, y + 6), labels[r], fill=(255, 255, 0))
        for c, cd in enumerate(cards):
            sheet.paste(cd, (c * cw, y + 26))
    sheet.save(OUT, quality=92)
    print("wrote", OUT)
    for lb in labels:
        print(lb)

if __name__ == "__main__":
    main()
