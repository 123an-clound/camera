import * as THREE from "three";

// All camera surface detail (leather grain, printed scales, LCD UI, PCB traces, labels)
// is painted on canvases at runtime: no image downloads, nothing for the CSP to block.

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "ui-sans-serif, system-ui, Segoe UI, Arial, sans-serif";

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
  for (let i = 0; i < 9000; i++) {
    const v = 90 + Math.floor(r() * 90);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 1.5 + r() * 3.5, 1.5 + r() * 3, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const t = toTexture(c, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
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

// Printed band that wraps a lens barrel: text centred on one side of the cylinder.
export function barrelPrintTexture(items: { text: string; color?: string; size?: number; at: number }[], bg = "#101012") {
  const { c, g } = canvas(2048, 128);
  g.fillStyle = bg;
  g.fillRect(0, 0, 2048, 128);
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const it of items) {
    g.fillStyle = it.color ?? "#e8e8e8";
    g.font = `600 ${it.size ?? 54}px ${SANS}`;
    g.fillText(it.text, it.at * 2048, 66);
  }
  return toTexture(c);
}

// Focal-length scale with tick marks, for the zoom ring.
export function zoomScaleTexture() {
  const { c, g } = canvas(2048, 128);
  g.fillStyle = "#121214";
  g.fillRect(0, 0, 2048, 128);
  const marks = ["24", "28", "35", "50", "70"];
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `600 50px ${SANS}`;
  marks.forEach((m, i) => {
    const x = 760 + i * 130;
    g.fillStyle = "#e8e8e8";
    g.fillText(m, x, 58);
    g.fillRect(x - 2, 96, 4, 22);
  });
  g.fillStyle = "#f5a524";
  g.fillRect(620, 40, 70, 8);
  return toTexture(c);
}

// Mode / exposure dial caps: labels around the rim of a disc.
export function dialCapTexture(labels: string[], accentIndex = 0) {
  const { c, g } = canvas(512, 512);
  g.fillStyle = "#16161a";
  g.fillRect(0, 0, 512, 512);
  const grad = g.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, "#2a2a30");
  grad.addColorStop(1, "#141417");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(256, 256, 256, 0, Math.PI * 2);
  g.fill();
  // concentric machining rings
  for (let r = 40; r < 250; r += 6) {
    g.strokeStyle = r % 12 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.25)";
    g.beginPath();
    g.arc(256, 256, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  labels.forEach((label, i) => {
    const a = -Math.PI / 2 + (i / labels.length) * Math.PI * 2;
    g.save();
    g.translate(256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190);
    g.rotate(a + Math.PI / 2);
    g.fillStyle = i === accentIndex ? "#f5a524" : "#f2f2f2";
    g.font = `700 ${label.length > 2 ? 34 : 46}px ${SANS}`;
    g.fillText(label, 0, 0);
    g.restore();
  });
  g.fillStyle = "#0b0b0d";
  g.beginPath();
  g.arc(256, 256, 70, 0, Math.PI * 2);
  g.fill();
  return toTexture(c);
}

// Annulus text on the lens front bezel ("OPTICAL LAB 24-70mm 1:2.8 Ø82").
export function bezelTexture(text: string) {
  const { c, g } = canvas(1024, 1024);
  g.fillStyle = "#0c0c0e";
  g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = "#e6e6e6";
  g.font = `600 40px ${SANS}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const chars = text.split("");
  const span = Math.PI * 1.1;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 - span / 2 + (i / (chars.length - 1)) * span;
    g.save();
    g.translate(512 + Math.cos(a) * 430, 512 + Math.sin(a) * 430);
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  return toTexture(c);
}

// Rear LCD: a live-view frame with exposure readout, histogram and AF box.
export function lcdTexture() {
  const { c, g } = canvas(1024, 680);
  // "scene": dusk sky, sun, hills
  const sky = g.createLinearGradient(0, 0, 0, 680);
  sky.addColorStop(0, "#1b2a4a");
  sky.addColorStop(0.55, "#d9773a");
  sky.addColorStop(1, "#2a1a1a");
  g.fillStyle = sky;
  g.fillRect(0, 0, 1024, 680);
  g.fillStyle = "#ffd28a";
  g.beginPath();
  g.arc(640, 380, 60, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1a1418";
  g.beginPath();
  g.moveTo(0, 470);
  g.bezierCurveTo(200, 390, 380, 520, 560, 450);
  g.bezierCurveTo(740, 380, 880, 470, 1024, 420);
  g.lineTo(1024, 680);
  g.lineTo(0, 680);
  g.fill();
  // rule-of-thirds grid
  g.strokeStyle = "rgba(255,255,255,0.18)";
  g.lineWidth = 2;
  for (const x of [341, 683]) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 680);
    g.stroke();
  }
  for (const y of [227, 453]) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
  // AF box
  g.strokeStyle = "#7CFC7C";
  g.lineWidth = 5;
  const bx = 580, by = 320, bw = 120, bh = 120, k = 28;
  for (const [x, y, dx, dy] of [
    [bx, by, 1, 1],
    [bx + bw, by, -1, 1],
    [bx, by + bh, 1, -1],
    [bx + bw, by + bh, -1, -1],
  ]) {
    g.beginPath();
    g.moveTo(x + dx * k, y);
    g.lineTo(x, y);
    g.lineTo(x, y + dy * k);
    g.stroke();
  }
  // top + bottom bars
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillRect(0, 0, 1024, 64);
  g.fillRect(0, 616, 1024, 64);
  g.fillStyle = "#ffffff";
  g.font = `700 36px ${MONO}`;
  g.textBaseline = "middle";
  g.fillText("M", 24, 32);
  g.fillText("RAW+J", 90, 32);
  g.fillText("4K 60p", 300, 32);
  g.fillText("[1250]", 820, 32);
  g.fillText("1/250", 40, 648);
  g.fillText("F2.8", 240, 648);
  g.fillText("ISO 100", 400, 648);
  g.fillStyle = "#f5a524";
  g.fillText("±0.0", 640, 648);
  // battery
  g.strokeStyle = "#fff";
  g.lineWidth = 3;
  g.strokeRect(930, 628, 64, 30);
  g.fillStyle = "#7CFC7C";
  g.fillRect(934, 632, 44, 22);
  // histogram
  const r = rng(3);
  g.fillStyle = "rgba(0,0,0,0.45)";
  g.fillRect(40, 90, 220, 110);
  g.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 100; i++) {
    const h = 10 + Math.sin(i / 12) * 30 + Math.sin(i / 5) * 12 + r() * 30;
    g.fillRect(50 + i * 2, 190 - Math.max(4, h + 30), 2, Math.max(4, h + 30));
  }
  // REC dot
  g.fillStyle = "#ff3b30";
  g.beginPath();
  g.arc(990, 100, 14, 0, Math.PI * 2);
  g.fill();
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
  for (let i = 0; i < 220; i++) {
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
  for (let i = 0; i < 500; i++) {
    g.beginPath();
    g.arc(r() * 1024, r() * 600, 1.5 + r() * 2.5, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,0.8)";
  g.font = `600 22px ${MONO}`;
  g.fillText("OL-MAIN  REV.C", 40, 570);
  g.fillText("U1", 470, 250);
  g.fillText("C12  C13  C14", 700, 90);
  g.fillText("J3", 900, 520);
  return toTexture(c);
}

// Colour filter array shimmer for the image sensor.
export function sensorTexture() {
  const { c, g } = canvas(512, 384);
  const colors = ["#6b1f2a", "#1f5a2a", "#1f5a2a", "#1c2a6b"];
  const s = 4;
  for (let y = 0; y < 384; y += s)
    for (let x = 0; x < 512; x += s) {
      g.fillStyle = colors[((y / s) % 2) * 2 + ((x / s) % 2)];
      g.fillRect(x, y, s, s);
    }
  const sheen = g.createLinearGradient(0, 0, 512, 384);
  sheen.addColorStop(0, "rgba(120,60,200,0.35)");
  sheen.addColorStop(0.5, "rgba(20,160,160,0.25)");
  sheen.addColorStop(1, "rgba(200,120,40,0.35)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, 512, 384);
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
    g.fillRect(0, h * 0.72, w, h * 0.1);
  }
  let y = h * 0.22;
  for (const l of lines) {
    g.fillStyle = l.color ?? "#f2f2f2";
    g.font = `${l.weight ?? 700} ${l.size}px ${l.mono ? MONO : SANS}`;
    g.textBaseline = "middle";
    g.fillText(l.text, w * 0.07, y);
    y += l.size * 1.35;
  }
  return toTexture(c);
}
