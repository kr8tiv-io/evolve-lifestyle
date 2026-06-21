"""Reprocess Printful mockups into clean transparent cutouts.
- BiRefNet matte with post_process_mask=False so interior holes (arm gaps, bottom
  gaps, under hoods) are NOT filled.
- Alpha matting for natural edges, then a 1px alpha erode + near-white edge
  de-fringe to kill the white halo. Logos/light garments are preserved because we
  never threshold the interior — only refine the matte edge.
Usage: python reprocess.py <out-suffix> <orig-stem> [<orig-stem> ...]
  orig-stem like p440610853-0  (the original mockup, no suffix)
"""
import sys, os
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
from rembg import remove, new_session

PROD = r"C:\Users\lucid\Desktop\evolve-lifestyle\public\products"
_sess = {}
def sess(n):
    if n not in _sess:
        _sess[n] = new_session(n)
    return _sess[n]

def remove_border_white(cut, orig):
    """Drop STRICT pure-white (#fff mockup background) regions that are connected to
    the image border — exterior bg + background holes that open to it (e.g. the V at
    an open hoodie bottom). Never touches on-garment logos (not border-connected) and
    breaks at a garment's anti-aliased edge, so white garments survive."""
    arr = np.array(cut)
    o = np.array(orig.convert("RGB")).astype(int)
    mn = o.min(axis=2); mx = o.max(axis=2)
    pure_white = (mn >= 250) & ((mx - mn) <= 6)
    lbl, n = ndimage.label(pure_white)
    border = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
    border.discard(0)
    if border:
        bg = np.isin(lbl, list(border))
        a = arr[:, :, 3]; a[bg] = 0; arr[:, :, 3] = a
    return Image.fromarray(arr, "RGBA")

def refine(img):
    arr = np.array(img.convert("RGBA"))
    a = arr[:, :, 3]
    # 1px erode of the matte (min filter) to pull the edge in past any white halo
    aero = np.array(Image.fromarray(a).filter(ImageFilter.MinFilter(3))).astype(np.float32)
    rgb = arr[:, :, :3].astype(np.float32)
    mn = rgb.min(axis=2); mx = rgb.max(axis=2)
    nearwhite = (mn > 214) & ((mx - mn) < 24)
    edge = (aero > 6) & (aero < 250)
    # any remaining near-white partial edge pixel: drop its alpha hard (de-fringe)
    aero[nearwhite & edge] *= 0.2
    # also nuke fully-opaque near-white pixels that sit ON the matte edge (thin
    # white rim that stayed opaque): if near-white AND has a transparent neighbour
    trans_neighbour = np.array(
        Image.fromarray((a < 8).astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))
    ) > 0
    rim = nearwhite & trans_neighbour
    aero[rim] = 0
    arr[:, :, 3] = np.clip(aero, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")

def proc(stem, suffix, model="birefnet-general"):
    src = os.path.join(PROD, stem + ".png")
    im = Image.open(src).convert("RGBA")
    cut = remove(
        im, session=sess(model), alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=18,
        alpha_matting_erode_size=10,
        post_process_mask=False,
    )
    cut = remove_border_white(cut, im)
    cut = refine(cut)
    out = os.path.join(PROD, stem + suffix + ".png")
    cut.save(out)
    a = np.array(cut)[:, :, 3]
    print(f"  {os.path.basename(out)}  transparent={round(float((a<12).mean())*100,1)}%")
    return out

if __name__ == "__main__":
    import glob, re
    suffix = sys.argv[1]
    stems = sys.argv[2:]
    if stems == ["ALL"]:
        files = glob.glob(os.path.join(PROD, "p*-0.png"))
        stems = sorted(
            os.path.basename(f)[:-4] for f in files
            if re.fullmatch(r"p\d+-0\.png", os.path.basename(f))
        )
        print(f"ALL -> {len(stems)} originals")
    for i, stem in enumerate(stems, 1):
        print(f"[{i}/{len(stems)}] {stem}")
        proc(stem, suffix)
