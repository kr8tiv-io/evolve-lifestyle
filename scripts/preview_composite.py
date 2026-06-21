"""Composite cutouts onto the real landscape like the site's ProductImage, for visual QA."""
import sys, os
from PIL import Image, ImageFilter

PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"
LAND = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\landscapes"

def card(cut_path, bg_path, out_path, W=640, H=760):
    bg = Image.open(bg_path).convert("RGB")
    # object-cover
    s = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * s), int(bg.height * s)))
    x = (bg.width - W) // 2; y = (bg.height - H) // 2
    bg = bg.crop((x, y, x + W, y + H))
    # subtle grade so the product reads (matches ProductImage gradient)
    grade = Image.new("RGBA", (W, H), (5, 7, 6, 60))
    bg = Image.alpha_composite(bg.convert("RGBA"), grade)

    cut = Image.open(cut_path).convert("RGBA")
    pad = int(W * 0.12)
    bw, bh = W - 2 * pad, H - 2 * pad
    cs = min(bw / cut.width, bh / cut.height)
    cut = cut.resize((int(cut.width * cs), int(cut.height * cs)))
    # drop shadow
    sh = cut.split()[3].filter(ImageFilter.GaussianBlur(18))
    shadow = Image.new("RGBA", cut.size, (0, 0, 0, 0))
    shadow.putalpha(sh)
    px = (W - cut.width) // 2
    py = (H - cut.height) // 2
    bg.alpha_composite(shadow, (px, py + 22))
    bg.alpha_composite(cut, (px, py))
    bg.convert("RGB").save(out_path, quality=92)
    print("wrote", out_path)

if __name__ == "__main__":
    pairs = [
        ("p441087767-0-test.png", "prairies.jpg", "_qa_coldfront.jpg"),
        ("p440612780-0-test.png", "boreal.jpg", "_qa_failed1.jpg"),
    ]
    for cut, bg, out in pairs:
        card(os.path.join(PROD, cut), os.path.join(LAND, bg), os.path.join(PROD, out))
