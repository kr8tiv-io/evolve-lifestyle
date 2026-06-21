"""
High-quality cutout reprocessor using BiRefNet (state-of-the-art) via rembg.
Falls back to isnet-general-use if BiRefNet OOMs on a given image.
Post-processes the alpha to kill residual halos and fill nothing it shouldn't.
Usage:
  python rembg_birefnet.py test   -> process just the two probe images to *-test.png
  python rembg_birefnet.py all     -> process every p*-0.png source to *-rb.png
"""
import sys, os, glob, traceback
from PIL import Image, ImageFilter
import numpy as np
from rembg import remove, new_session

PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"

# Build sessions lazily
_sessions = {}
def sess(name):
    if name not in _sessions:
        _sessions[name] = new_session(name)
    return _sessions[name]

def refine_alpha(img):
    """Clean the alpha channel: light feather + a tiny erode to remove white fringe."""
    arr = np.array(img.convert("RGBA"))
    a = arr[:, :, 3].astype(np.float32) / 255.0
    # de-fringe: where alpha is partial AND pixel is near-white, pull alpha down a touch
    rgb = arr[:, :, :3].astype(np.float32)
    nearwhite = (rgb.min(axis=2) > 205)
    edge = (a > 0.03) & (a < 0.97)
    a[nearwhite & edge] *= 0.55
    arr[:, :, 3] = np.clip(a * 255.0, 0, 255).astype(np.uint8)
    out = Image.fromarray(arr, "RGBA")
    return out

def process(src, dst, model):
    with Image.open(src) as im:
        im = im.convert("RGBA")
        try:
            s = sess(model)
            cut = remove(
                im, session=s,
                alpha_matting=True,
                alpha_matting_foreground_threshold=270,
                alpha_matting_background_threshold=12,
                alpha_matting_erode_size=4,
                post_process_mask=True,
            )
            used = model
        except Exception as e:
            print(f"   [{model} failed: {e}; falling back to isnet-general-use]")
            s = sess("isnet-general-use")
            cut = remove(im, session=s, alpha_matting=True,
                         alpha_matting_erode_size=6, post_process_mask=True)
            used = "isnet-general-use(fallback)"
        cut = refine_alpha(cut)
        cut.save(dst)
        # report transparency + non-empty
        a = np.array(cut)[:, :, 3]
        frac = (a < 16).mean()
        print(f"   saved {os.path.basename(dst)}  model={used}  transparent={frac*100:.1f}%  bytes={os.path.getsize(dst)}")

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    model = os.environ.get("REMBG_MODEL", "birefnet-general")
    print(f"mode={mode} model={model}")
    if mode == "test":
        probes = ["p441087767-0", "p440612780-0"]  # Coldfront (gap) + a 0-byte failure
        for p in probes:
            src = os.path.join(PROD, p + ".png")
            dst = os.path.join(PROD, p + "-test.png")
            print(f" -> {p}")
            process(src, dst, model)
    else:
        srcs = sorted(glob.glob(os.path.join(PROD, "p*-0.png")))
        srcs = [s for s in srcs if "-rb" not in s and "-cut" not in s and "-test" not in s]
        print(f"processing {len(srcs)} source images")
        for i, src in enumerate(srcs, 1):
            base = os.path.basename(src)[:-4]
            dst = os.path.join(PROD, base + "-rb.png")
            print(f"[{i}/{len(srcs)}] {base}")
            try:
                process(src, dst, model)
            except Exception:
                traceback.print_exc()

if __name__ == "__main__":
    main()
