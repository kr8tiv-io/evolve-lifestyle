// Remove the white background from each Printful mockup -> transparent garment.
// Flood-fills from the corners so white INSIDE a garment is preserved.
// Repoints catalog.generated.ts at the -cut.png versions.
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const DIR = resolve("public/products");
const files = readdirSync(DIR).filter((f) => /^p\d+-\d+\.png$/.test(f));
console.log(`Cutting ${files.length} mockups…`);

const BG = 251; // a pixel is background only if R,G,B all >= BG (near-pure-white),
// so near-white *garments* (cream tees, white long-sleeves) are preserved.

for (const file of files) {
  const png = PNG.sync.read(readFileSync(resolve(DIR, file)));
  const { width: w, height: h, data } = png;
  const isBg = new Uint8Array(w * h); // 1 = background
  const idx = (x, y) => (y * w + x) * 4;
  const nearWhite = (i) => data[i] >= BG && data[i + 1] >= BG && data[i + 2] >= BG;

  // flood fill from all 4 corners
  const stack = [];
  const seeds = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
  for (const [sx, sy] of seeds) {
    const p = sy * w + sx;
    if (!isBg[p] && nearWhite(idx(sx, sy))) {
      isBg[p] = 1;
      stack.push(sx, sy);
    }
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
    for (const [nx, ny] of nb) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const p = ny * w + nx;
      if (isBg[p]) continue;
      if (nearWhite(idx(nx, ny))) {
        isBg[p] = 1;
        stack.push(nx, ny);
      }
    }
  }

  // apply: bg -> transparent; feather light edge pixels touching bg to kill halo
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const i = idx(x, y);
      if (isBg[p]) {
        data[i + 3] = 0;
        continue;
      }
      // edge feather: a kept, very-light pixel adjacent to background fades out
      const minc = Math.min(data[i], data[i + 1], data[i + 2]);
      if (minc >= 232) {
        let touchesBg = false;
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && isBg[ny * w + nx]) {
            touchesBg = true;
            break;
          }
        }
        if (touchesBg) data[i + 3] = Math.max(0, Math.min(255, (255 - minc) * 8));
      }
    }
  }

  const out = file.replace(/\.png$/, "-cut.png");
  writeFileSync(resolve(DIR, out), PNG.sync.write(png));
  process.stdout.write(".");
}
console.log(`\nWrote ${files.length} cutouts.`);

// repoint the catalogue at the -cut versions
const catPath = resolve("src/lib/catalog.generated.ts");
let cat = readFileSync(catPath, "utf8");
cat = cat.replace(/\/products\/(p\d+-\d+)\.png/g, "/products/$1-cut.png");
writeFileSync(catPath, cat, "utf8");
console.log("Catalogue repointed to -cut.png images.");
