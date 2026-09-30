import * as THREE from "three";

// All camera surface detail (leather grain, brushed metal, engraved dials, printed lens
// markings, LCD UI, PCB traces, labels) is painted on canvases at runtime: no image
// downloads, nothing for the CSP to block. Lettering uses system fonts, not logo artwork.

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "ui-sans-serif, system-ui, Segoe UI, Arial, sans-serif";
const WIDE = "Arial Black, Helvetica Neue, Arial, sans-serif";

// Deterministic PRNG so the generated textures look the same on every load.
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function toTexture(c: HTMLCanvasElement, color = true) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

// Pebbled leatherette: grey blobs used as bump + roughness map.
export function leatherTexture() {
  const { c, g } = canvas(512, 512);
  const r = rng(7);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 11000; i++) {
    const v = 80 + Math.floor(r() * 100);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 1.2 + r() * 3, 1.2 + r() * 2.6, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const t = toTexture(c, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  return t;
}

// Fine directional streaks: brushed / bead-blasted aluminium roughness.
export function brushedTexture() {
  const { c, g } = canvas(512, 512);
  const r = rng(5);
  g.fillStyle = "#6a6a6a";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2400; i++) {
    const v = 70 + Math.floor(r() * 80);
    g.strokeStyle = `rgba(${v},${v},${v},0.5)`;
    g.lineWidth = 0.6 + r();
    const y = r() * 512;
    const x = r() * 512;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 40 + r() * 160, y + (r() - 0.5) * 2);
    g.stroke();
  }
  const t = toTexture(c, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

// Fine parallel grooves (knurling / rubber ribs) for dials and rings.
export function knurlTexture(lines = 128) {
  const { c, g } = canvas(1024, 64);
  g.fillStyle = "#777";
  g.fillRect(0, 0, 1024, 64);
  const step = 1024 / lines;
  for (let i = 0; i < lines; i++) {
    g.fillStyle = "#222";
    g.fillRect(i * step, 0, step * 0.45, 64);
    g.fillStyle = "#bbb";
    g.fillRect(i * step + step * 0.5, 0, step * 0.15, 64);
  }
  const t = toTexture(c, false);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

// Printed band that wraps a lens barrel.
export function barrelPrintTexture(items: { text: string; color?: string; size?: number; at: number }[], bg = "#0d0d0f") {
  const { c, g } = canvas(4096, 128);
  g.fillStyle = bg;
  g.fillRect(0, 0, 4096, 128);
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const it of items) {
    g.fillStyle = it.color ?? "#e8e8e8";
    g.font = `600 ${it.size ?? 54}px ${SANS}`;
    g.fillText(it.text, it.at * 4096, 66);
  }
  return toTexture(c);
}

// Engraved dial top: silver machined disc with numerals round the rim.
export function dialCapTexture(
  labels: { text: string; color?: string }[],
  opts: { title?: string; startDeg?: number; spanDeg?: number } = {}
) {
  const { c, g } = canvas(512, 512);
  const grad = g.createRadialGradient(256, 256, 10, 256, 256, 256);
  grad.addColorStop(0, "#d9dbe0");
  grad.addColorStop(1, "#b9bcc3");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  // spun-metal concentric rings
  const r = rng(9);
  for (let rad = 20; rad < 256; rad += 2) {
    const v = 150 + Math.floor(r() * 60);
    g.strokeStyle = `rgba(${v},${v},${v},0.35)`;
    g.beginPath();
    g.arc(256, 256, rad, 0, Math.PI * 2);
    g.stroke();
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  const start = ((opts.startDeg ?? -90) * Math.PI) / 180;
  const span = ((opts.spanDeg ?? 360) * Math.PI) / 180;
  const full = Math.abs(span - Math.PI * 2) < 1e-6;
  labels.forEach((l, i) => {
    const a = start + (full ? i / labels.length : i / Math.max(1, labels.length - 1)) * span;
    g.save();
    g.translate(256 + Math.cos(a) * 196, 256 + Math.sin(a) * 196);
    g.rotate(a + Math.PI / 2);
    g.fillStyle = l.color ?? "#141414";
    g.font = `700 ${l.text.length > 3 ? 30 : l.text.length > 2 ? 36 : 44}px ${SANS}`;
    g.fillText(l.text, 0, 0);
    g.restore();
  });
  if (opts.title) {
    g.fillStyle = "#141414";
    g.font = `700 34px ${SANS}`;
    g.fillText(opts.title, 256, 150);
  }
  return toTexture(c);
}

// Lettering on a transparent background, for decals laid over painted/metal surfaces.
export function textTexture(text: string, color: string, opts: { w?: number; h?: number; size?: number; font?: string; weight?: number; spacing?: number } = {}) {
  const w = opts.w ?? 1024;
  const h = opts.h ?? 192;
  const { c, g } = canvas(w, h);
  g.clearRect(0, 0, w, h);
  g.fillStyle = color;
  g.font = `${opts.weight ?? 800} ${opts.size ?? 120}px ${opts.font ?? WIDE}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  if (opts.spacing) g.letterSpacing = `${opts.spacing}px`;
  g.fillText(text, w / 2, h / 2 + 4);
  return toTexture(c);
}

// Annulus text on the lens front bezel.
export function bezelTexture(text: string) {
  const { c, g } = canvas(1024, 1024);
  g.fillStyle = "#0b0b0d";
  g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = "#e6e6e6";
  g.font = `600 30px ${SANS}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const chars = text.split("");
  const span = Math.PI * 1.65;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 - span / 2 + (i / (chars.length - 1)) * span;
    g.save();
    g.translate(512 + Math.cos(a) * 440, 512 + Math.sin(a) * 440);
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  return toTexture(c);
}

// Rear LCD: live view with a Fujifilm-style shooting display.
export function lcdTexture() {
  const { c, g } = canvas(1024, 768);
  const sky = g.createLinearGradient(0, 0, 0, 768);
  sky.addColorStop(0, "#1b2a4a");
  sky.addColorStop(0.55, "#d9773a");
  sky.addColorStop(1, "#2a1a1a");
  g.fillStyle = sky;
  g.fillRect(0, 0, 1024, 768);
  g.fillStyle = "#ffd28a";
  g.beginPath();
  g.arc(640, 430, 64, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1a1418";
  g.beginPath();
  g.moveTo(0, 530);
  g.bezierCurveTo(200, 440, 380, 580, 560, 510);
  g.bezierCurveTo(740, 430, 880, 530, 1024, 470);
  g.lineTo(1024, 768);
  g.lineTo(0, 768);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.18)";
  g.lineWidth = 2;
  for (const x of [341, 683]) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 768);
    g.stroke();
  }
  for (const y of [256, 512]) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
  g.strokeStyle = "#7CFC7C";
  g.lineWidth = 5;
  g.strokeRect(575, 365, 130, 130);
  g.fillStyle = "rgba(0,0,0,0.5)";
  g.fillRect(0, 0, 1024, 70);
  g.fillRect(0, 690, 1024, 78);
  g.fillStyle = "#ffffff";
  g.font = `700 34px ${MONO}`;
  g.textBaseline = "middle";
  g.fillText("P", 24, 36);
  g.fillText("RAW+F", 80, 36);
  g.fillText("PROVIA/STD", 260, 36);
  g.fillText("3:2", 540, 36);
  g.fillText("[ 1250 ]", 820, 36);
  g.fillText("1/250", 40, 730);
  g.fillText("F2.8", 230, 730);
  g.fillText("ISO125", 380, 730);
  g.fillStyle = "#f5a524";
  g.fillText("±0", 600, 730);
  g.strokeStyle = "#fff";
  g.lineWidth = 3;
  g.strokeRect(930, 712, 64, 32);
  g.fillStyle = "#7CFC7C";
  g.fillRect(934, 716, 44, 24);
  const r = rng(3);
  g.fillStyle = "rgba(0,0,0,0.45)";
  g.fillRect(40, 100, 220, 110);
  g.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 100; i++) {
    const h = 30 + Math.sin(i / 12) * 30 + Math.sin(i / 5) * 12 + r() * 30;
    g.fillRect(50 + i * 2, 200 - Math.max(4, h), 2, Math.max(4, h));
  }
  // level gauge
  g.strokeStyle = "rgba(255,255,255,0.8)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(380, 384);
  g.lineTo(480, 384);
  g.moveTo(544, 384);
  g.lineTo(644, 384);
  g.stroke();
  return toTexture(c);
}

// PCB: green solder mask, gold traces, pads and silkscreen.
export function pcbTexture() {
  const { c, g } = canvas(1024, 600);
  const r = rng(11);
  g.fillStyle = "#0e3b2f";
  g.fillRect(0, 0, 1024, 600);
  g.strokeStyle = "rgba(214,170,80,0.55)";
  g.lineCap = "round";
  for (let i = 0; i < 260; i++) {
    let x = r() * 1024;
    let y = r() * 600;
    g.lineWidth = 1 + r() * 2.5;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      if (r() > 0.5) x += (r() - 0.5) * 260;
      else y += (r() - 0.5) * 200;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.fillStyle = "#d6aa50";
  for (let i = 0; i < 600; i++) {
    g.beginPath();
    g.arc(r() * 1024, r() * 600, 1.5 + r() * 2.5, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,0.8)";
  g.font = `600 22px ${MONO}`;
  g.fillText("X-T5 MAIN PCB  REV.C", 40, 570);
  g.fillText("U1", 470, 250);
  g.fillText("C12  C13  C14", 700, 90);
  g.fillText("J3", 900, 520);
  return toTexture(c);
}

// X-Trans colour filter array (6×6 pattern) with a coating sheen.
export function sensorTexture() {
  const { c, g } = canvas(600, 400);
  const P = ["GBGGRG", "RGRBGB", "GBGGRG", "GRGGBG", "BGBRGR", "GRGGBG"];
  const col: Record<string, string> = { R: "#6b1f2a", G: "#1f5a2a", B: "#1c2a6b" };
  const s = 4;
  for (let y = 0; y < 400; y += s)
    for (let x = 0; x < 600; x += s) {
      g.fillStyle = col[P[(y / s) % 6][(x / s) % 6]];
      g.fillRect(x, y, s, s);
    }
  const sheen = g.createLinearGradient(0, 0, 600, 400);
  sheen.addColorStop(0, "rgba(120,60,200,0.35)");
  sheen.addColorStop(0.5, "rgba(20,160,160,0.25)");
  sheen.addColorStop(1, "rgba(200,120,40,0.35)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, 600, 400);
  return toTexture(c);
}

// Generic printed label (battery, memory card, chips).
export function labelTexture(
  lines: { text: string; size: number; color?: string; weight?: number; mono?: boolean }[],
  bg: string,
  w = 512,
  h = 256,
  stripe?: string
) {
  const { c, g } = canvas(w, h);
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (stripe) {
    g.fillStyle = stripe;
    g.fillRect(0, h * 0.74, w, h * 0.09);
  }
  let y = h * 0.2;
  for (const l of lines) {
    g.fillStyle = l.color ?? "#f2f2f2";
    g.font = `${l.weight ?? 700} ${l.size}px ${l.mono ? MONO : SANS}`;
    g.textBaseline = "middle";
    g.fillText(l.text, w * 0.07, y);
    y += l.size * 1.35;
  }
  return toTexture(c);
}
