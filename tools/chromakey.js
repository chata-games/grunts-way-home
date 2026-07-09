// Chroma-key magenta backgrounds and defringe magenta halos.
// Usage: node chromakey.js <input.png> <output.png>
// - Any magenta-dominant pixel (R and B clearly above G) becomes transparent.
// - Remaining pixels get magenta cast removed: R and B clamped toward G level.
// - Then trim transparent borders and cap size at 512px.
const sharp = require("sharp");
const fs = require("fs");

const [, , input, output] = process.argv;
if (!input || !output) { console.error("usage: node chromakey.js in.png out.png"); process.exit(1); }

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let keyed = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const m = Math.min(r, b) - g; // magenta-ness
    if (m > 90) { data[i + 3] = 0; keyed++; continue; }   // hard key
    if (m > 30) {                                          // soft edge: fade + defringe
      data[i + 3] = Math.min(data[i + 3], Math.round(255 * (1 - (m - 30) / 60)));
    }
    if (m > 0) { // defringe: pull R/B down toward G to kill pink halo
      data[i] = r - m; data[i + 2] = b - m;
    }
  }
  console.log(`${input}: keyed ${(keyed / (w * h) * 100).toFixed(1)}% of pixels`);
  const out = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 10 })
    .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(output, out);
  const meta = await sharp(output).metadata();
  console.log(`${output}: ${meta.width}x${meta.height}, ${(out.length / 1024).toFixed(0)} KB`);
})().catch(e => { console.error(e); process.exit(1); });
