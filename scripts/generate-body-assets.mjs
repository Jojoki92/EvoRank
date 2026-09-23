import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/rankforge/assets/body");
const OUT = path.join(ROOT, "masks-v9.2.0");
const VERSION = "9.2.0";
const MUSCLES = {
  front: ["shoulders", "chest", "biceps", "triceps", "forearms", "core", "adductors", "quads", "calves"],
  back: ["shoulders", "upperBack", "lats", "triceps", "forearms", "lowerBack", "glutes", "hamstrings", "calves"]
};

function colorInfo(red, green, blue) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const saturation = max ? delta / max : 0;
  let hue = 0;
  if (delta) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
    if (hue < 0) hue += 360;
  }
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { hue, saturation, value: max, luminance };
}

function hueDistance(a, b) {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

function connectedComponents(binary, width, height, data) {
  const visited = new Uint8Array(binary.length);
  const queue = new Int32Array(binary.length);
  const components = [];
  const offsets = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

  for (let start = 0; start < binary.length; start += 1) {
    if (!binary[start] || visited[start]) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    visited[start] = 1;
    const pixels = [];
    let sumX = 0;
    let sumY = 0;
    let sumSin = 0;
    let sumCos = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      pixels.push(index);
      sumX += x;
      sumY += y;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      const offset = index * 4;
      const { hue } = colorInfo(data[offset], data[offset + 1], data[offset + 2]);
      sumSin += Math.sin(hue * Math.PI / 180);
      sumCos += Math.cos(hue * Math.PI / 180);
      for (const [dx, dy] of offsets) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!binary[next] || visited[next]) continue;
        visited[next] = 1;
        queue[tail++] = next;
      }
    }
    if (pixels.length < 18) continue;
    let hue = Math.atan2(sumSin, sumCos) * 180 / Math.PI;
    if (hue < 0) hue += 360;
    components.push({
      pixels,
      area: pixels.length,
      cx: sumX / pixels.length,
      cy: sumY / pixels.length,
      hue,
      minX,
      minY,
      maxX,
      maxY
    });
  }
  return components;
}

function classify(view, component) {
  const { area, cx, cy, hue } = component;
  if (area < 45) return "";
  if (hue >= 225 && hue <= 290 && cy < 650) return "shoulders";

  if (view === "front") {
    if (cy < 650 && (hue >= 345 || hue <= 16) && cx > 300 && cx < 700) return "chest";
    if (cy < 990 && hue >= 25 && hue < 75 && cx > 350 && cx < 650) return "core";
    if (cy < 820 && hue > 15 && hue < 42 && (cx < 360 || cx > 650)) return "biceps";
    if (cy < 820 && hue >= 305 && hue < 355 && (cx < 430 || cx > 570)) return "triceps";
    if (cy < 1120 && hue >= 145 && hue < 220 && (cx < 420 || cx > 580)) return "forearms";
    if (cy > 1120 && hue >= 145 && hue < 220) return "calves";
    if (cy > 820 && cy < 1260 && (hue >= 350 || hue < 33) && cx > 330 && cx < 670) return "adductors";
    if (cy > 990 && hue >= 25 && hue < 75 && cx > 250 && cx < 750) return "quads";
    return "";
  }

  if (cy < 850 && hue >= 180 && hue < 230 && cx > 260 && cx < 740) return "lats";
  if (cy < 820 && hue >= 300 && hue < 355 && (cx < 430 || cx > 570)) return "triceps";
  if (cy < 1150 && hue >= 145 && hue < 195 && (cx < 420 || cx > 580)) return "forearms";
  if (cy > 1170 && hue >= 145 && hue < 230) return "calves";
  if (cy > 620 && cy < 960 && hue >= 30 && hue < 70 && cx > 300 && cx < 700) return "lowerBack";
  if (cy > 760 && cy < 1110 && hue >= 295 && hue < 350 && cx > 250 && cx < 750) return "glutes";
  if (cy > 900 && cy < 1450 && hue >= 8 && hue < 45 && cx > 250 && cx < 750) return "hamstrings";
  return "";
}

function growMask(mask, allowed, width, height) {
  const grown = new Uint8Array(mask);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (!mask[index]) continue;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const next = (y + dy) * width + x + dx;
          if (allowed[next]) grown[next] = 255;
        }
      }
    }
  }
  return grown;
}

async function saveMask(mask, width, height, output) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let index = 0; index < mask.length; index += 1) {
    const offset = index * 4;
    rgba[offset] = 255;
    rgba[offset + 1] = 255;
    rgba[offset + 2] = 255;
    rgba[offset + 3] = mask[index];
  }
  await sharp(rgba, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(output);
}

async function saveNeutral(data, width, height, view, mode) {
  const targetEdge = mode === "light" ? 247 : 10;
  const output = Buffer.alloc(data.length);
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] / 255;
    const { luminance } = colorInfo(data[index], data[index + 1], data[index + 2]);
    let gray = Math.round((0.12 + luminance * 0.88) * 255);
    if (alpha < 0.92) {
      const edgeMix = Math.min(1, (0.92 - alpha) / 0.82);
      gray = Math.round(gray * (1 - edgeMix) + targetEdge * edgeMix);
    }
    output[index] = gray;
    output[index + 1] = gray;
    output[index + 2] = gray;
    output[index + 3] = data[index + 3] < 12 ? 0 : data[index + 3];
  }
  await sharp(output, { raw: { width, height, channels: 4 } })
    .webp({ quality: 94, alphaQuality: 100, smartSubsample: true })
    .toFile(path.join(ROOT, `male-${view}-neutral-${mode}-v${VERSION}.webp`));
}

async function build(view) {
  const input = path.join(ROOT, `male-${view}-clean-v9.1.2.webp`);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const colored = new Uint8Array(width * height);
  const coloredAllowance = new Uint8Array(width * height);
  for (let index = 0; index < colored.length; index += 1) {
    const offset = index * 4;
    const alpha = data[offset + 3] / 255;
    if (alpha < 0.12) continue;
    const { saturation, value } = colorInfo(data[offset], data[offset + 1], data[offset + 2]);
    if (saturation > 0.26 && value > 0.22) colored[index] = 1;
    if (saturation > 0.10 && value > 0.18) coloredAllowance[index] = 1;
  }

  const masks = Object.fromEntries(MUSCLES[view].map(key => [key, new Uint8Array(width * height)]));
  const components = connectedComponents(colored, width, height, data).sort((a, b) => b.area - a.area);
  const report = [];
  for (const component of components) {
    const key = classify(view, component);
    if (!key || !masks[key]) continue;
    for (const pixel of component.pixels) masks[key][pixel] = 255;
    report.push({ key, area: component.area, hue: Math.round(component.hue), cx: Math.round(component.cx), cy: Math.round(component.cy), box: [component.minX, component.minY, component.maxX, component.maxY] });
  }

  if (view === "back") {
    const upperBack = masks.upperBack;
    for (let y = 318; y < 690; y += 1) {
      for (let x = 255; x < 745; x += 1) {
        const index = y * width + x;
        const offset = index * 4;
        const alpha = data[offset + 3] / 255;
        const { saturation, luminance, value } = colorInfo(data[offset], data[offset + 1], data[offset + 2]);
        if (alpha > 0.20 && saturation < 0.31 && luminance < 0.61 && value > 0.17) upperBack[index] = 255;
      }
    }
  }

  const debug = Buffer.alloc(width * height * 4);
  const debugColors = {
    shoulders: [124, 90, 255], chest: [255, 89, 85], biceps: [255, 145, 31], triceps: [255, 49, 132], forearms: [22, 190, 174],
    core: [231, 170, 35], adductors: [204, 86, 38], quads: [220, 165, 38], calves: [36, 175, 205], upperBack: [77, 91, 114],
    lats: [35, 165, 205], lowerBack: [203, 157, 45], glutes: [211, 67, 156], hamstrings: [225, 102, 40]
  };
  for (const [key, rawMask] of Object.entries(masks)) {
    const mask = key === "upperBack" ? rawMask : growMask(rawMask, coloredAllowance, width, height);
    masks[key] = mask;
    await saveMask(mask, width, height, path.join(OUT, `male-${view}-${key}-v${VERSION}.png`));
    const color = debugColors[key] || [255, 255, 255];
    for (let index = 0; index < mask.length; index += 1) {
      if (!mask[index]) continue;
      const offset = index * 4;
      debug[offset] = color[0];
      debug[offset + 1] = color[1];
      debug[offset + 2] = color[2];
      debug[offset + 3] = 235;
    }
  }
  await sharp(debug, { raw: { width, height, channels: 4 } }).png().toFile(path.join(OUT, `male-${view}-debug-v${VERSION}.png`));
  await saveNeutral(data, width, height, view, "light");
  await saveNeutral(data, width, height, view, "dark");
  await fs.writeFile(path.join(OUT, `male-${view}-components-v${VERSION}.json`), `${JSON.stringify(report, null, 2)}\n`);
  return { view, width, height, components: report.length };
}

await fs.mkdir(OUT, { recursive: true });
const results = [];
for (const view of ["front", "back"]) results.push(await build(view));
console.log(JSON.stringify(results, null, 2));
