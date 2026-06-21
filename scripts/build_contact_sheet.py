"""Composite ALL products onto their collection landscape and tile into contact sheets for visual QA."""
import os, re
from PIL import Image, ImageFilter, ImageDraw, ImageFont

ROOT = r"C:\Users\lucid\Desktop\evolve-lifestyle"
PROD = os.path.join(ROOT, "public", "products")
LAND = os.path.join(ROOT, "public", "landscapes")
CAT = os.path.join(ROOT, "src", "lib", "catalog.generated.ts")

SCENES = {"boreal": "boreal.jpg", "peaks": "peaks.jpg", "prairies": "prairies.jpg", "coast": "coast.jpg"}

txt = open(CAT, encoding="utf-8").read()
names = re.findall(r'"name":\s*"([^"]+)"', txt)
colls = re.findall(r'"collection":\s*"(\w+)"', txt)
imgs = re.findall(r'/products/(p\d+-0)-rb\.png', txt)
print(f"products: names={len(names)} colls={len(colls)} imgs={len(imgs)}")
items = list(zip(names, colls, imgs))

def make_card(cut_path, bg_path, W=420, H=500):
    bg = Image.open(bg_path).convert("RGB")
    s = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * s), int(bg.height * s)))
    x = (bg.width - W) // 2; y = (bg.height - H) // 2
    bg = bg.crop((x, y, x + W, y + H)).convert("RGBA")
    bg = Image.alpha_composite(bg, Image.new("RGBA", (W, H), (5, 7, 6, 55)))
    if os.path.exists(cut_path) and os.path.getsize(cut_path) > 1000:
        cut = Image.open(cut_path).convert("RGBA")
        pad = int(W * 0.12); bw, bh = W - 2 * pad, H - 2 * pad
        cs = min(bw / cut.width, bh / cut.height)
        cut = cut.resize((max(1, int(cut.width * cs)), max(1, int(cut.height * cs))))
        sh = cut.split()[3].filter(ImageFilter.GaussianBlur(14))
        shadow = Image.new("RGBA", cut.size, (0, 0, 0, 0)); shadow.putalpha(sh)
        px = (W - cut.width) // 2; py = (H - cut.height) // 2
        bg.alpha_composite(shadow, (px, py + 16)); bg.alpha_composite(cut, (px, py))
    else:
        d = ImageDraw.Draw(bg); d.text((W//2-40, H//2), "MISSING", fill=(255,80,80,255))
    return bg.convert("RGB")

# tile 4 cols
COLS = 4
cards = []
for name, coll, img in items:
    cut = os.path.join(PROD, img + "-rb.png")
    bg = os.path.join(LAND, SCENES.get(coll, "boreal.jpg"))
    c = make_card(cut, bg)
    d = ImageDraw.Draw(c)
    d.rectangle([0, c.height-26, c.width, c.height], fill=(0,0,0))
    d.text((6, c.height-22), f"{name[:34]}", fill=(220,255,200))
    cards.append(c)

cw, ch = cards[0].size
rows = (len(cards) + COLS - 1) // COLS
# split into 2 sheets of 16 for readability
per = 16
sheet_idx = 0
for start in range(0, len(cards), per):
    chunk = cards[start:start+per]
    r = (len(chunk) + COLS - 1) // COLS
    sheet = Image.new("RGB", (cw*COLS, ch*r), (10,10,10))
    for i, c in enumerate(chunk):
        sheet.paste(c, ((i % COLS)*cw, (i // COLS)*ch))
    out = os.path.join(ROOT, "screenshots", f"qa_sheet_{sheet_idx}.jpg")
    sheet.save(out, quality=86)
    print("wrote", out, sheet.size)
    sheet_idx += 1
