"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  barrelPrintTexture,
  bezelTexture,
  brushedTexture,
  dialCapTexture,
  knurlTexture,
  labelTexture,
  lcdTexture,
  leatherTexture,
  pcbTexture,
  sensorTexture,
  textTexture,
} from "./textures";

const AMBER = "#f5a524";
const RED = "#d8322b";

function std(p: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(p);
}
function phys(p: THREE.MeshPhysicalMaterialParameters) {
  return new THREE.MeshPhysicalMaterial(p);
}
// Transparent lettering laid a hair above a surface.
function decal(map: THREE.Texture, metal = 0.2) {
  return std({
    map,
    transparent: true,
    metalness: metal,
    roughness: 0.5,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
}

// Silver-body Fujifilm X-T5 with the XF18-55mmF2.8-4 R LM OIS kit lens.
function build() {
  const leather = leatherTexture();
  const brushed = brushedTexture();
  const knurl = knurlTexture(180);
  const knurlCoarse = knurlTexture(72);

  const t = {
    leather,
    brushed,
    knurl,
    knurlCoarse,
    ssCap: dialCapTexture(
      ["B", "T", "1", "2", "4", "8", "15", "30", "60", "125", "250", "500", "1000", "2000", "4000", "8000", "A"].map(
        (text) => ({ text, color: text === "A" ? RED : undefined })
      ),
      { startDeg: -90, spanDeg: 300 }
    ),
    isoCap: dialCapTexture(
      ["A", "C", "L", "125", "200", "400", "800", "1600", "3200", "6400", "12800", "H"].map((text) => ({
        text,
        color: text === "A" ? RED : undefined,
      })),
      { startDeg: -90, spanDeg: 300, title: "ISO" }
    ),
    evCap: dialCapTexture(
      ["0", "+⅓", "+⅔", "+1", "+2", "+3", "C", "−3", "−2", "−1", "−⅔", "−⅓"].map((text) => ({
        text,
        color: text === "C" ? RED : undefined,
      })),
      { startDeg: -90, spanDeg: 360 }
    ),
    fujifilm: textTexture("FUJIFILM", "#16161a", { w: 1024, h: 180, size: 132 }),
    model: textTexture("X-T5", "#16161a", { w: 512, h: 160, size: 120, font: "Arial, sans-serif", weight: 700 }),
    lensSide: barrelPrintTexture([
      { text: "FUJINON ASPHERICAL LENS", at: 0.36, size: 46 },
      { text: "SUPER EBC  XF18-55mm  1:2.8-4  R LM OIS", at: 0.6, size: 46 },
    ]),
    zoomScale: barrelPrintTexture([
      { text: "18", at: 0.44, size: 50 },
      { text: "23", at: 0.48, size: 50 },
      { text: "35", at: 0.52, size: 50 },
      { text: "55", at: 0.56, size: 50 },
    ]),
    bezel: bezelTexture("FUJINON ASPHERICAL LENS SUPER EBC XF 18-55mm 1:2.8-4 R LM OIS  Ø58"),
    lcd: lcdTexture(),
    pcb: pcbTexture(),
    sensor: sensorTexture(),
    battery: labelTexture(
      [
        { text: "FUJIFILM", size: 40, weight: 800 },
        { text: "NP-W235  Li-ion", size: 28, color: "#c8c8c8", weight: 600 },
        { text: "7.2V  2200mAh  16Wh", size: 24, color: "#c8c8c8", mono: true },
      ],
      "#1b1b1e",
      512,
      256,
      "#8f9197"
    ),
    card: labelTexture(
      [
        { text: "SD  128GB", size: 56 },
        { text: "V90  UHS-II  U3", size: 26, color: "#111", mono: true },
      ],
      AMBER,
      400,
      300
    ),
    chip: labelTexture(
      [
        { text: "X-Processor 5", size: 34 },
        { text: "FUJIFILM", size: 26, color: "#9aa0a8", mono: true },
        { text: "2242  JP", size: 22, color: "#6c7078", mono: true },
      ],
      "#141416",
      256,
      256
    ),
    memChip: labelTexture(
      [
        { text: "LPDDR4X", size: 40 },
        { text: "8Gb 4266", size: 28, color: "#9aa0a8", mono: true },
      ],
      "#141416",
      256,
      160
    ),
    sensorLabel: textTexture("X-Trans CMOS 5 HR", "#e0b050", {
      w: 1024,
      h: 128,
      size: 72,
      font: "Arial, sans-serif",
      weight: 700,
    }),
  };
  // Battery label runs along the battery's length.
  t.battery.center.set(0.5, 0.5);
  t.battery.rotation = Math.PI / 2;

  const m = {
    silver: std({ color: "#d6d9de", metalness: 0.85, roughness: 0.46, roughnessMap: brushed }),
    silverDark: std({ color: "#9ea2aa", metalness: 1, roughness: 0.3 }),
    silverKnurl: std({ color: "#c2c5cc", metalness: 1, roughness: 0.32, bumpMap: knurlCoarse, bumpScale: 2.2 }),
    shell: std({ color: "#1e1e22", metalness: 0.45, roughness: 0.45 }),
    shellDark: std({ color: "#141417", metalness: 0.4, roughness: 0.5 }),
    anodized: std({ color: "#121215", metalness: 0.75, roughness: 0.38 }),
    magnesium: std({ color: "#6f727a", metalness: 0.85, roughness: 0.38 }),
    leather: std({
      color: "#151517",
      metalness: 0.05,
      roughness: 0.88,
      bumpMap: leather,
      bumpScale: 1.8,
      roughnessMap: leather,
    }),
    rubber: std({ color: "#0f0f11", metalness: 0, roughness: 0.95 }),
    rubberRibbed: std({ color: "#141416", metalness: 0.05, roughness: 0.8, bumpMap: knurl, bumpScale: 3 }),
    metalRibbed: std({ color: "#1a1a1d", metalness: 0.8, roughness: 0.35, bumpMap: knurl, bumpScale: 2.5 }),
    knurled: std({ color: "#2a2b30", metalness: 0.9, roughness: 0.3, bumpMap: knurlCoarse, bumpScale: 2 }),
    metal: std({ color: "#b8bcc4", metalness: 1, roughness: 0.22 }),
    chrome: std({ color: "#e6e8ec", metalness: 1, roughness: 0.1 }),
    blackMetal: std({ color: "#0d0d0f", metalness: 0.7, roughness: 0.3 }),
    matteBlack: std({ color: "#08080a", metalness: 0, roughness: 1 }),
    gold: std({ color: "#e0b050", metalness: 1, roughness: 0.25 }),
    copper: std({ color: "#b8693a", metalness: 1, roughness: 0.3 }),
    amber: std({ color: AMBER, emissive: new THREE.Color(AMBER), emissiveIntensity: 0.9 }),
    amberDim: std({ color: AMBER, emissive: new THREE.Color(AMBER), emissiveIntensity: 0.35, roughness: 0.4 }),
    red: std({ color: RED, emissive: new THREE.Color(RED), emissiveIntensity: 0.5, roughness: 0.4 }),
    white: std({ color: "#f2f2f2", roughness: 0.5 }),
    glass: phys({
      color: "#5d86b8",
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.18,
      clearcoat: 0.3,
      clearcoatRoughness: 0.02,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 420],
      envMapIntensity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    glassEd: phys({
      color: "#c9ffd9",
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.3,
      clearcoat: 0.6,
      iridescence: 1,
      iridescenceIOR: 1.5,
      iridescenceThicknessRange: [200, 500],
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    coverGlass: phys({
      color: "#ffffff",
      roughness: 0,
      transparent: true,
      opacity: 0.18,
      clearcoat: 1,
      envMapIntensity: 2,
      depthWrite: false,
    }),
    sensor: phys({
      map: t.sensor,
      metalness: 0.6,
      roughness: 0.18,
      iridescence: 1,
      iridescenceIOR: 1.8,
      iridescenceThicknessRange: [200, 800],
      emissive: new THREE.Color(AMBER),
      emissiveIntensity: 0.05,
    }),
    ceramic: std({ color: "#3a3336", metalness: 0.2, roughness: 0.6 }),
    polyimide: std({ color: "#c7771c", metalness: 0.3, roughness: 0.45, transparent: true, opacity: 0.92 }),
    pcb: std({ map: t.pcb, metalness: 0.25, roughness: 0.55 }),
    pcbEdge: std({ color: "#0e3b2f", roughness: 0.6 }),
    chipBody: std({ color: "#101012", metalness: 0.3, roughness: 0.5 }),
    chipTop: std({ map: t.chip, metalness: 0.3, roughness: 0.45 }),
    memTop: std({ map: t.memChip, metalness: 0.3, roughness: 0.45 }),
    smdDark: std({ color: "#1b1b1d", roughness: 0.6 }),
    smdTan: std({ color: "#b89a6a", roughness: 0.5 }),
    connector: std({ color: "#e8e1cf", roughness: 0.6 }),
    capTop: std({ color: "#1c2b44", metalness: 0.4, roughness: 0.4 }),
    lcd: std({
      map: t.lcd,
      emissiveMap: t.lcd,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0.85,
      roughness: 0.08,
    }),
    lensSide: std({ map: t.lensSide, metalness: 0.6, roughness: 0.35 }),
    zoomScale: std({ map: t.zoomScale, metalness: 0.6, roughness: 0.35, bumpMap: knurl, bumpScale: 1.2 }),
    bezel: std({ map: t.bezel, metalness: 0.3, roughness: 0.4 }),
    ssCap: std({ map: t.ssCap, metalness: 0.9, roughness: 0.3 }),
    isoCap: std({ map: t.isoCap, metalness: 0.9, roughness: 0.3 }),
    evCap: std({ map: t.evCap, metalness: 0.9, roughness: 0.3 }),
    battery: std({ map: t.battery, metalness: 0.2, roughness: 0.5 }),
    card: std({ map: t.card, roughness: 0.45 }),
    fujifilm: decal(t.fujifilm, 0.6),
    model: decal(t.model, 0.6),
    sensorLabel: decal(t.sensorLabel, 0.8),
  };

  return { m, t };
}

export type CameraMaterials = ReturnType<typeof build>["m"];

export function useCameraMaterials(): CameraMaterials {
  const built = useMemo(() => build(), []);
  useEffect(
    () => () => {
      Object.values(built.m).forEach((mat) => mat.dispose());
      Object.values(built.t).forEach((tex) => tex.dispose());
    },
    [built]
  );
  return built.m;
}
