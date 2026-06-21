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
    """Remove the white/gray background halo so the garment melts into the dark card,
    WITHOUT eating legit product features or logos. Three steps:
    1) THIN-RIM kill: a boundary pixel that is bright AND has dark garment within ~3px
       inward is background contamination -> drop its alpha. A wide bright gradient
       (glossy mug lip, a white garment, an on-garment logo) stays because the
       neighbourhood isn't dark, and interior logos are excluded (not near the edge).
    2) EDGE COLOUR DECONTAMINATION: every non-interior pixel takes its nearest
       garment-interior colour, so the anti-aliased band reads as garment colour.
    3) 1px erode + 0.7px feather for a smooth, soft transition."""
    arr = np.array(img.convert("RGBA"))
    a = arr[:, :, 3].copy()
    rgb = arr[:, :, :3]
    lum = rgb.astype(np.float32).mean(axis=2)
    solid = a > 235
    if solid.sum() > 50:
        core_lum = float(np.median(lum[ndimage.binary_erosion(solid, iterations=4)]
                                   if ndimage.binary_erosion(solid, iterations=4).sum()
                                   else lum[solid]))
        trans = a < 10
        near_boundary = ndimage.binary_dilation(trans, iterations=2) & (a > 40)
        bright = lum > max(core_lum + 45, 120)
        inward_min = ndimage.minimum_filter(lum, size=7)
        thin_rim = near_boundary & bright & (inward_min < core_lum + 25)
        a[thin_rim] = 0
    interior = a > 200
    if interior.sum() > 50:
        idx = ndimage.distance_transform_edt(
            ~interior, return_distances=False, return_indices=True
        )
        nearest = rgb[idx[0], idx[1]]
        m = ~interior
        out = rgb.copy(); out[m] = nearest[m]; arr[:, :, :3] = out
    a2 = np.array(Image.fromarray(a).filter(ImageFilter.MinFilter(3)))
    a2 = np.array(Image.fromarray(a2).filter(ImageFilter.GaussianBlur(0.7)))
    arr[:, :, 3] = a2
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
