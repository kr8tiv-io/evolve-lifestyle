"""High-magnification crops on magenta to inspect fringe/holes.
Usage: python zoom.py <out.jpg> <stem:cx:cy:frac:label> ...
  cx,cy,frac are fractions of width/height (frac = crop size as fraction of min dim)
"""
import sys, os
from PIL import Image, ImageDraw

PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"
OUTDIR = r"C:\Users\lucid\Desktop\evolve-lifestyle\screenshots"

def crop(spec, target=460):
    stem, cx, cy, frac, label = spec.split(":")
    cx, cy, frac = float(cx), float(cy), float(frac)
    img = Image.open(os.path.join(PROD, stem + ".png")).convert("RGBA")
    W, H = img.size
    d = int(min(W, H) * frac)
    x = int(W * cx - d / 2); y = int(H * cy - d / 2)
    box = img.crop((x, y, x + d, y + d))
    box = box.resize((target, target), Image.NEAREST)
    canvas = Image.new("RGBA", (target, target + 22), (255, 0, 255, 255))
    canvas.alpha_composite(box, (0, 22))
    canvas = canvas.convert("RGB")
    dr = ImageDraw.Draw(canvas); dr.rectangle([0, 0, target, 20], fill=(0, 0, 0))
    dr.text((3, 4), label, fill=(255, 255, 0))
    return canvas

def main():
    out = sys.argv[1]
    specs = sys.argv[2:]
    cards = [crop(s) for s in specs]
    cw, ch = cards[0].size
    cols = min(len(cards), 4)
    rows = (len(cards) + cols - 1) // cols
    sheet = Image.new("RGB", (cw * cols, ch * rows), (30, 30, 30))
    for i, c in enumerate(cards):
        sheet.paste(c, ((i % cols) * cw, (i // cols) * ch))
    sheet.save(os.path.join(OUTDIR, out), quality=92)
    print("wrote", os.path.join(OUTDIR, out))

if __name__ == "__main__":
    main()
