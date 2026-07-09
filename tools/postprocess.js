// Post-process generated game assets:
// - sprites (caveman-*, fruit, crystal): ensure real alpha; if the model baked in a
//   solid/checkerboard background, remove it via edge flood-fill; then trim + resize.
// - backgrounds (jungle-bg, cave-home-bg): just recompress at target size.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const SPRITES = ["caveman-idle", "caveman-happy", "caveman-confused", "fruit", "crystal"];
const BACKGROUNDS = ["jungle-bg", "cave-home-bg"];

async function alphaStats(buf, info) {
  let transparent = 0;
  for (let i = 3; i < buf.length; i += 4) if (buf[i] < 128) transparent++;
  return transparent / (buf.length / 4);
}

// Flood-fill from all four edges, clearing pixels whose color is within
// `tol` of the local edge seed color. Handles solid backgrounds.
function removeBackground(data, w, h, tol = 28) {
  const idx = (x, y) => (y * w + x) * 4;
  const visited = new Uint8Array(w * h);
  const stack = [];
  const seed = (x, y) => {
    const i = idx(x, y);
    if (data[i + 3] === 0) return; // already transparent
    stack.push([x, y, data[i], data[i + 1], data[i + 2]]);
  };
  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }
  while (stack.length) {
    const [x, y, r, g, b] = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    const dr = data[i] - r, dg = data[i + 1] - g, db = data[i + 2] - b;
    if (Math.sqrt(dr * dr + dg * dg + db * db) > tol) continue;
    data[i + 3] = 0;
    stack.push([x + 1, y, data[i], data[i + 1], data[i + 2]]);
    stack.push([x - 1, y, data[i], data[i + 1], data[i + 2]]);
    stack.push([x, y + 1, data[i], data[i + 1], data[i + 2]]);
    stack.push([x, y - 1, data[i], data[i + 1], data[i + 2]]);
  }
}

async function processSprite(name) {
  const file = path.join(ASSETS, `${name}.png`);
  if (!fs.existsSync(file)) { console.log(`MISSING ${name}`); return; }
  const { data, info } = await sharp(file).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const ratio = await alphaStats(data, info);
  if (ratio < 0.05) {
    console.log(`${name}: no alpha (${(ratio * 100).toFixed(1)}% transparent) -> flood-fill removal`);
    removeBackground(data, info.width, info.height);
  } else {
    console.log(`${name}: alpha OK (${(ratio * 100).toFixed(1)}% transparent)`);
  }
  const out = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 10 })
    .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(file, out);
  const meta = await sharp(file).metadata();
  console.log(`${name}: saved ${meta.width}x${meta.height}, ${(out.length / 1024).toFixed(0)} KB`);
}

async function processBackground(name) {
  const file = path.join(ASSETS, `${name}.png`);
  if (!fs.existsSync(file)) { console.log(`MISSING ${name}`); return; }
  const out = await sharp(file)
    .resize({ width: 1024, height: 1536, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  fs.writeFileSync(path.join(ASSETS, `${name}.jpg`), out);
  fs.unlinkSync(file);
  console.log(`${name}: saved as jpg, ${(out.length / 1024).toFixed(0)} KB`);
}

(async () => {
  for (const s of SPRITES) await processSprite(s);
  for (const b of BACKGROUNDS) await processBackground(b);
  console.log("POSTPROCESS_COMPLETE");
})().catch(e => { console.error(e); process.exit(1); });
