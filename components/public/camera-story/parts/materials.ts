"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  barrelPrintTexture,
  bezelTexture,
  dialCapTexture,
  knurlTexture,
  labelTexture,
  lcdTexture,
  leatherTexture,
  pcbTexture,
  sensorTexture,
  zoomScaleTexture,
} from "./textures";

const AMBER = "#f5a524";

function std(p: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(p);
}
function phys(p: THREE.MeshPhysicalMaterialParameters) {
  return new THREE.MeshPhysicalMaterial(p);
}

function build() {
  const leather = leatherTexture();
  const knurl = knurlTexture(160);
  const knurlCoarse = knurlTexture(60);

  const textures = {
    leather,
    knurl,
    knurlCoarse,
    lensName: barrelPrintTexture([
      { text: "OPTICAL LAB", at: 0.3, size: 50 },
      { text: "24-70mm  1:2.8", at: 0.5, size: 50, color: "#f5a524" },
      { text: "Ø82", at: 0.66, size: 44 },
    ]),
    rearPrint: barrelPrintTexture(
      [
        { text: "AF", at: 0.38, size: 44 },
        { text: "ED  ASPH  NANO", at: 0.52, size: 40, color: "#9aa0a8" },
        { text: "MADE FOR FULL-FRAME", at: 0.72, size: 32, color: "#6c7078" },
      ],
      "#141416"
    ),
    zoomScale: zoomScaleTexture(),
    bezel: bezelTexture("OPTICAL LAB · 24-70mm 1:2.8 · Ø82mm"),
    modeCap: dialCapTexture(["M", "A", "S", "P", "AUTO", "C1", "C2", "C3", "S&Q", "MR"], 0),
    evCap: dialCapTexture(["0", "+1", "+2", "+3", "−3", "−2", "−1"], 0),
    lcd: lcdTexture(),
    pcb: pcbTexture(),
    sensor: sensorTexture(),
    battery: labelTexture(
      [
        { text: "OPTICAL LAB", size: 38 },
        { text: "NP-OL100  Li-ion", size: 26, color: "#c8c8c8", weight: 600 },
        { text: "7.2V  2280mAh  16.4Wh", size: 24, color: "#f5a524", mono: true },
      ],
      "#1d1d20",
      512,
      256,
      "#f5a524"
    ),
    card: labelTexture(
      [
        { text: "128GB", size: 64 },
        { text: "V90  UHS-II  U3", size: 30, color: "#111", mono: true },
      ],
      "#f5a524",
      256,
      320
    ),
    chip: labelTexture(
      [
        { text: "OL-X1", size: 70 },
        { text: "IMAGE PROC", size: 30, color: "#9aa0a8", mono: true },
        { text: "2542  TW", size: 26, color: "#6c7078", mono: true },
      ],
      "#141416",
      256,
      256
    ),
    memChip: labelTexture(
      [
        { text: "LPDDR5", size: 44 },
        { text: "8Gb 6400", size: 30, color: "#9aa0a8", mono: true },
      ],
      "#141416",
      256,
      160
    ),
    logo: labelTexture([{ text: "OPTICAL LAB", size: 62, weight: 800, color: "#d8d8dc" }], "#1f1f23", 512, 96),
  };

  // Battery label runs along the battery's length.
  textures.battery.center.set(0.5, 0.5);
  textures.battery.rotation = Math.PI / 2;

  const m = {
    shell: std({ color: "#2a2a2f", metalness: 0.45, roughness: 0.42 }),
    shellDark: std({ color: "#18181b", metalness: 0.4, roughness: 0.5 }),
    magnesium: std({ color: "#6f727a", metalness: 0.85, roughness: 0.38 }),
    leather: std({
      color: "#161618",
      metalness: 0.05,
      roughness: 0.85,
      bumpMap: leather,
      bumpScale: 1.6,
      roughnessMap: leather,
    }),
    rubber: std({ color: "#0f0f11", metalness: 0, roughness: 0.95 }),
    rubberRibbed: std({
      color: "#141416",
      metalness: 0.05,
      roughness: 0.8,
      bumpMap: knurl,
      bumpScale: 3,
    }),
    knurled: std({ color: "#3a3b40", metalness: 0.9, roughness: 0.3, bumpMap: knurlCoarse, bumpScale: 2 }),
    metal: std({ color: "#b8bcc4", metalness: 1, roughness: 0.22 }),
    chrome: std({ color: "#e6e8ec", metalness: 1, roughness: 0.08 }),
    blackMetal: std({ color: "#0d0d0f", metalness: 0.7, roughness: 0.3 }),
    matteBlack: std({ color: "#08080a", metalness: 0, roughness: 1 }),
    gold: std({ color: "#e0b050", metalness: 1, roughness: 0.25 }),
    copper: std({ color: "#b8693a", metalness: 1, roughness: 0.3 }),
    amber: std({ color: AMBER, emissive: new THREE.Color(AMBER), emissiveIntensity: 0.9 }),
    amberDim: std({ color: AMBER, emissive: new THREE.Color(AMBER), emissiveIntensity: 0.35, roughness: 0.4 }),
    red: std({ color: "#e0312b", emissive: new THREE.Color("#e0312b"), emissiveIntensity: 0.6 }),
    glass: phys({
      color: "#9cc8ff",
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.22,
      clearcoat: 0.3,
      clearcoatRoughness: 0.02,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 420],
      envMapIntensity: 1.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    glassEd: phys({
      color: "#c9ffd9",
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.34,
      clearcoat: 1,
      iridescence: 1,
      iridescenceIOR: 1.5,
      iridescenceThicknessRange: [200, 500],
      envMapIntensity: 2.2,
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
      map: textures.sensor,
      metalness: 0.6,
      roughness: 0.18,
      iridescence: 1,
      iridescenceIOR: 1.8,
      iridescenceThicknessRange: [200, 800],
      emissive: new THREE.Color(AMBER),
      emissiveIntensity: 0.1,
    }),
    ceramic: std({ color: "#3a3336", metalness: 0.2, roughness: 0.6 }),
    polyimide: std({ color: "#c7771c", metalness: 0.3, roughness: 0.45, transparent: true, opacity: 0.92 }),
    pcb: std({ map: textures.pcb, metalness: 0.25, roughness: 0.55 }),
    pcbEdge: std({ color: "#0e3b2f", roughness: 0.6 }),
    chipBody: std({ color: "#101012", metalness: 0.3, roughness: 0.5 }),
    chipTop: std({ map: textures.chip, metalness: 0.3, roughness: 0.45 }),
    memTop: std({ map: textures.memChip, metalness: 0.3, roughness: 0.45 }),
    smdDark: std({ color: "#1b1b1d", roughness: 0.6 }),
    smdTan: std({ color: "#b89a6a", roughness: 0.5 }),
    connector: std({ color: "#e8e1cf", roughness: 0.6 }),
    capTop: std({ color: "#1c2b44", metalness: 0.4, roughness: 0.4 }),
    lcd: std({
      map: textures.lcd,
      emissiveMap: textures.lcd,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0.85,
      roughness: 0.08,
      metalness: 0,
    }),
    lensName: std({ map: textures.lensName, metalness: 0.4, roughness: 0.35 }),
    rearPrint: std({ map: textures.rearPrint, metalness: 0.4, roughness: 0.4 }),
    zoomScale: std({ map: textures.zoomScale, metalness: 0.4, roughness: 0.35 }),
    bezel: std({ map: textures.bezel, metalness: 0.3, roughness: 0.4 }),
    modeCap: std({ map: textures.modeCap, metalness: 0.5, roughness: 0.35 }),
    evCap: std({ map: textures.evCap, metalness: 0.5, roughness: 0.35 }),
    battery: std({ map: textures.battery, metalness: 0.2, roughness: 0.5 }),
    card: std({ map: textures.card, roughness: 0.45 }),
    logo: std({ map: textures.logo, metalness: 0.6, roughness: 0.3 }),
  };

  return { m, textures };
}

export type CameraMaterials = ReturnType<typeof build>["m"];

export function useCameraMaterials(): CameraMaterials {
  const built = useMemo(() => build(), []);
  useEffect(
    () => () => {
      Object.values(built.m).forEach((mat) => mat.dispose());
      Object.values(built.textures).forEach((tex) => tex.dispose());
    },
    [built]
  );
  return built.m;
}
