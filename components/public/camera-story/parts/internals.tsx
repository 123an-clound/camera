"use client";

import { useLayoutEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import type { Vec3 } from "../explode";
import { LENS_X, TOP } from "./body";
import type { CameraMaterials } from "./materials";
import { BoxInstances, Button, Cyl, Decal, Dial, HALF_PI, Part, RadialInstances, Screw, Tag, Tube, boxFaces } from "./primitives";
import { rng } from "./textures";

const C = 3; // internals chapter

// EVF "pentaprism" hump: side profile (z, y) extruded across x, with bevelled edges.
const HUMP_W = 0.62;
const HUMP_PROFILE: [number, number][] = [
  [-0.3, 0],
  [-0.3, 0.3],
  [-0.24, 0.36],
  [0.08, 0.36],
  [0.24, 0.1],
  [0.27, 0],
];
// Slanted front face (between the 4th and 5th profile points) for the FUJIFILM lettering.
const SLOPE_MID: [number, number] = [0.16, 0.23];
const SLOPE_TILT = -Math.atan2(0.24 - 0.08, 0.36 - 0.1);

function Hump({ m }: { m: CameraMaterials }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(HUMP_PROFILE.map(([z, y]) => new THREE.Vector2(z, y)));
    return new THREE.ExtrudeGeometry(shape, {
      depth: HUMP_W - 0.04,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 4,
    });
  }, []);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  // Shape x → world z, extrusion (+z) → world -x.
  return (
    <mesh
      geometry={geometry}
      material={m.silver}
      rotation={[0, -HALF_PI, 0]}
      position={[LENS_X + (HUMP_W - 0.04) / 2, TOP, 0]}
    />
  );
}

// Dial with a lower ring and lever (STILL/MOVIE under shutter speed, DRIVE under ISO).
function StackedDial({
  x,
  z,
  cap,
  leverAngle,
  m,
}: {
  x: number;
  z: number;
  cap: THREE.Material;
  leverAngle: number;
  m: CameraMaterials;
}) {
  return (
    <group position={[x, TOP, z]}>
      <group rotation={[-HALF_PI, 0, 0]}>
        <Tube rOuter={0.225} rInner={0.19} len={0.035} material={m.shellDark} position={[0, 0, 0.018]} />
      </group>
      <group rotation={[0, leverAngle, 0]}>
        <mesh position={[0, 0.02, 0.26]} material={m.shellDark}>
          <boxGeometry args={[0.05, 0.03, 0.1]} />
        </mesh>
      </group>
      <Dial r={0.2} h={0.13} body={m.silverKnurl} ridge={m.silverDark} cap={cap} ridges={72} position={[0, 0.035, 0]} />
      {/* dial lock release */}
      <group rotation={[-HALF_PI, 0, 0]}>
        <Tube rOuter={0.07} rInner={0.055} len={0.02} material={m.silverDark} position={[0, 0, 0.175]} />
        <Cyl r={0.055} len={0.03} material={m.silver} segments={32} position={[0, 0, 0.18]} />
      </group>
    </group>
  );
}

function TopPlate({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const slopeZ = SLOPE_MID[0] + 0.022;
  const slopeY = TOP + SLOPE_MID[1] + 0.012;
  const micHoles = useMemo<Vec3[]>(() => {
    const out: Vec3[] = [];
    for (const side of [-1, 1])
      for (let i = 0; i < 4; i++) out.push([LENS_X + side * (0.22 - i * 0.02), TOP + 0.3, 0.1 - i * 0.02]);
    return out;
  }, []);
  const shoeContacts = useMemo<Vec3[]>(() => [-0.08, -0.04, 0, 0.04, 0.08].map((x) => [LENS_X + x, TOP + 0.385, -0.05]), []);

  return (
    <Part progress={p} chapter={C} from={[0, 0, 0]} to={[0, 1.18, 0]}>
      {/* Silver top cover band + prism hump */}
      <RoundedBox args={[2.42, 0.2, 0.68]} radius={0.04} smoothness={4} position={[0, TOP - 0.1, 0]} material={m.silver} />
      <Hump m={m} />
      <Decal material={m.fujifilm} size={[0.5, 0.088]} position={[LENS_X, slopeY, slopeZ]} rotation={[SLOPE_TILT, 0, 0]} />
      <BoxInstances items={micHoles} size={[0.012, 0.012, 0.012]} material={m.matteBlack} />
      <Decal material={m.model} size={[0.2, 0.062]} position={[0.9, TOP - 0.1, 0.342]} />

      {/* Hot shoe */}
      <mesh position={[LENS_X, TOP + 0.376, -0.05]} material={m.silverDark}>
        <boxGeometry args={[0.34, 0.014, 0.3]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[LENS_X, TOP + 0.395, -0.05 + s * 0.15]} material={m.chrome}>
            <boxGeometry args={[0.34, 0.03, 0.02]} />
          </mesh>
          <mesh position={[LENS_X, TOP + 0.41, -0.05 + s * 0.13]} material={m.chrome}>
            <boxGeometry args={[0.34, 0.006, 0.05]} />
          </mesh>
        </group>
      ))}
      <BoxInstances items={shoeContacts} size={[0.016, 0.006, 0.05]} material={m.gold} />

      {/* EVF eyecup, eyepiece, eye sensor, diopter knob */}
      <RoundedBox args={[0.5, 0.34, 0.16]} radius={0.07} smoothness={4} position={[LENS_X, TOP + 0.18, -0.38]} material={m.rubber} />
      <mesh position={[LENS_X, TOP + 0.18, -0.462]} material={m.matteBlack}>
        <boxGeometry args={[0.32, 0.2, 0.01]} />
      </mesh>
      <mesh position={[LENS_X, TOP + 0.18, -0.468]} material={m.coverGlass}>
        <boxGeometry args={[0.32, 0.2, 0.004]} />
      </mesh>
      <mesh position={[LENS_X + 0.22, TOP + 0.02, -0.345]} material={m.matteBlack}>
        <boxGeometry args={[0.06, 0.03, 0.01]} />
      </mesh>
      <Dial r={0.055} h={0.09} body={m.silverKnurl} ridge={m.silverDark} ridges={24} position={[LENS_X + 0.38, TOP, -0.24]} />

      {/* Exposure compensation, shutter speed (+STILL/MOVIE), ISO (+DRIVE) */}
      <Dial r={0.19} h={0.14} body={m.silverKnurl} ridge={m.silverDark} cap={m.evCap} ridges={72} position={[-0.98, TOP, -0.06]} />
      <StackedDial x={-0.43} z={-0.02} cap={m.ssCap} leverAngle={-0.5} m={m} />
      <StackedDial x={0.67} z={-0.02} cap={m.isoCap} leverAngle={0.5} m={m} />

      {/* Shutter release with ON/OFF collar, cable-release thread; Fn1 */}
      <group position={[-0.68, TOP, 0.22]}>
        <group rotation={[-HALF_PI, 0, 0]}>
          <Tube rOuter={0.1} rInner={0.06} len={0.03} material={m.silver} position={[0, 0, 0.015]} />
          <Cyl r={0.055} len={0.06} material={m.chrome} segments={40} position={[0, 0, 0.04]} />
          <Cyl r={0.016} len={0.004} material={m.matteBlack} segments={16} position={[0, 0, 0.071]} />
        </group>
        <mesh position={[0, 0.015, 0.12]} material={m.silver}>
          <boxGeometry args={[0.035, 0.025, 0.08]} />
        </mesh>
      </group>
      <group position={[-0.95, TOP, 0.25]} rotation={[-HALF_PI, 0, 0]}>
        <Button r={0.035} h={0.025} material={m.silver} position={[0, 0, 0]} />
      </group>

      {/* Back of the top cover: delete, playback, VIEW MODE, AF-ON, Q, rear command dial */}
      <Button r={0.04} h={0.022} material={m.shellDark} position={[0.98, TOP - 0.1, -0.342]} back />
      <Button r={0.04} h={0.022} material={m.shellDark} position={[0.76, TOP - 0.1, -0.342]} back />
      <Button r={0.04} h={0.022} material={m.shellDark} position={[-0.3, TOP - 0.1, -0.342]} back />
      <Button r={0.055} h={0.026} material={m.shellDark} collar={m.silverDark} position={[-0.55, TOP - 0.1, -0.342]} back />
      <Button r={0.035} h={0.022} material={m.shellDark} position={[-1.08, TOP - 0.08, -0.342]} back />
      <Dial r={0.1} h={0.05} body={m.knurled} ridge={m.blackMetal} ridges={36} position={[-0.84, TOP - 0.13, -0.32]} />

      {(
        [
          [-1.12, TOP + 0.001, 0.28],
          [1.12, TOP + 0.001, 0.28],
          [1.12, TOP + 0.001, -0.28],
          [-1.12, TOP + 0.001, -0.28],
        ] as Vec3[]
      ).map((s) => (
        <group key={s.join()} position={s} rotation={[-HALF_PI, 0, 0]}>
          <Screw position={[0, 0, 0]} r={0.012} material={m.silverDark} slot={m.matteBlack} />
        </group>
      ))}
    </Part>
  );
}

function BackPlate({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  return (
    <Part progress={p} chapter={C} from={[0, 0, 0]} to={[0, -0.7, -1.7]} rotTo={[0.45, 0, 0]}>
      <RoundedBox args={[2.4, 1.07, 0.06]} radius={0.03} smoothness={3} position={[0, -0.115, -0.3]} material={m.leather} />

      {/* 3.0" three-way tilting LCD: frame, screen (faces -z), hinge */}
      <RoundedBox args={[1.26, 0.9, 0.05]} radius={0.025} smoothness={3} position={[0.36, -0.14, -0.355]} material={m.shellDark} />
      <mesh position={[0.36, -0.14, -0.382]} rotation={[0, Math.PI, 0]} material={m.lcd}>
        <planeGeometry args={[1.12, 0.84]} />
      </mesh>
      <group position={[0.36, -0.6, -0.36]} rotation={[0, HALF_PI, 0]}>
        <Cyl r={0.022} len={1.1} material={m.silverDark} segments={16} />
      </group>

      {/* Thumb rest, indicator lamp, AEL, focus stick, selector + MENU/OK, DISP/BACK */}
      <RoundedBox args={[0.34, 0.36, 0.06]} radius={0.03} smoothness={3} position={[-0.97, 0.16, -0.345]} material={m.leather} />
      <Cyl r={0.014} len={0.01} material={m.amberDim} segments={12} position={[-0.95, 0.38, -0.336]} />
      <Button r={0.045} h={0.024} material={m.shellDark} position={[-0.72, 0.25, -0.33]} back />
      <group position={[-0.72, 0.03, -0.33]}>
        <Cyl r={0.05} len={0.02} material={m.shellDark} segments={24} position={[0, 0, -0.01]} />
        <mesh position={[0, 0, -0.04]} material={m.rubber}>
          <sphereGeometry args={[0.035, 16, 16]} />
        </mesh>
      </group>
      <group position={[-0.74, -0.25, -0.335]}>
        <mesh material={m.shellDark}>
          <torusGeometry args={[0.12, 0.022, 12, 48]} />
        </mesh>
        <RadialInstances count={4} radius={0.12} size={[0.03, 0.02, 0.05]} material={m.shellDark} startAngle={0} />
        <Button r={0.058} h={0.026} material={m.silver} position={[0, 0, 0]} back />
      </group>
      <Button r={0.04} h={0.022} material={m.shellDark} position={[-0.6, -0.53, -0.33]} back />

      {(
        [
          [1.12, -0.6],
          [-1.12, -0.6],
        ] as const
      ).map(([x, y]) => (
        <Screw key={x} position={[x, y, -0.332]} r={0.012} material={m.silverDark} slot={m.matteBlack} back />
      ))}
    </Part>
  );
}

function MainBoard({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const boardMats = useMemo(() => boxFaces(m.pcbEdge, { pz: m.pcb, nz: m.pcb }), [m]);
  const cpuMats = useMemo(() => boxFaces(m.chipBody, { nz: m.chipTop }), [m]);
  const memMats = useMemo(() => boxFaces(m.chipBody, { nz: m.memTop }), [m]);
  // Components sit on the back (-z) face, which faces the viewer in this chapter.
  const { dark, tan, caps } = useMemo(() => {
    const r = rng(21);
    const avoid = (x: number, y: number) => Math.abs(x + 0.2) < 0.22 && Math.abs(y - 0.1) < 0.22;
    const dark: Vec3[] = [];
    const tan: Vec3[] = [];
    while (dark.length < 80) {
      const x = -0.88 + r() * 1.76;
      const y = -0.44 + r() * 0.88;
      if (!avoid(x, y)) dark.push([x, y, -0.022]);
    }
    while (tan.length < 60) {
      const x = -0.88 + r() * 1.76;
      const y = -0.44 + r() * 0.88;
      if (!avoid(x, y)) tan.push([x, y, -0.02]);
    }
    const caps: Vec3[] = [
      [-0.7, 0.32, -0.045],
      [-0.62, 0.32, -0.045],
      [-0.54, 0.32, -0.045],
      [0.55, -0.35, -0.045],
      [0.63, -0.35, -0.045],
      [-0.72, -0.28, -0.045],
      [0.1, -0.37, -0.045],
      [0.18, -0.37, -0.045],
    ];
    return { dark, tan, caps };
  }, []);

  return (
    <Part progress={p} chapter={C} from={[0.1, -0.08, -0.2]} to={[0.15, 0.85, -1.15]} rotTo={[-0.35, 0, 0]}>
      <mesh material={boardMats}>
        <boxGeometry args={[1.9, 0.95, 0.03]} />
      </mesh>
      {/* X-Processor 5 with heat-spreader frame, LPDDR memory */}
      <mesh position={[-0.2, 0.1, -0.03]} material={cpuMats}>
        <boxGeometry args={[0.34, 0.34, 0.03]} />
      </mesh>
      <mesh position={[-0.2, 0.1, -0.017]} material={m.metal}>
        <boxGeometry args={[0.4, 0.4, 0.006]} />
      </mesh>
      {[0.26, 0.02].map((y) => (
        <mesh key={y} position={[0.3, y, -0.028]} material={memMats}>
          <boxGeometry args={[0.26, 0.17, 0.025]} />
        </mesh>
      ))}
      <BoxInstances items={dark} size={[0.03, 0.018, 0.012]} material={m.smdDark} />
      <BoxInstances items={tan} size={[0.018, 0.01, 0.008]} material={m.smdTan} />
      {caps.map((c) => (
        <group key={c.join()} position={c}>
          <Cyl r={0.028} len={0.06} material={m.metal} segments={20} />
          <Cyl r={0.027} len={0.004} material={m.capTop} segments={20} position={[0, 0, -0.031]} />
        </group>
      ))}
      {(
        [
          [-0.84, -0.05, 0.05, 0.3],
          [0.1, 0.42, 0.34, 0.05],
          [0.6, 0.28, 0.05, 0.22],
        ] as const
      ).map(([x, y, w, h]) => (
        <mesh key={`${x},${y}`} position={[x, y, -0.03]} material={m.connector}>
          <boxGeometry args={[w, h, 0.03]} />
        </mesh>
      ))}
      <mesh position={[0.1, 0.58, -0.05]} rotation={[0.5, 0, 0]} material={m.polyimide}>
        <boxGeometry args={[0.3, 0.24, 0.004]} />
      </mesh>
      <mesh position={[-0.98, -0.05, -0.05]} rotation={[0, 0.5, 0]} material={m.polyimide}>
        <boxGeometry args={[0.18, 0.24, 0.004]} />
      </mesh>
    </Part>
  );
}

// NP-W235, dropping out of the grip.
function Battery({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const mats = useMemo(
    () => boxFaces(m.shellDark, { px: m.battery, nx: m.battery, pz: m.battery, nz: m.battery }),
    [m]
  );
  return (
    <Part progress={p} chapter={C} from={[-0.8, -0.24, 0.02]} to={[-0.8, -1.95, 0.02]}>
      <mesh material={mats}>
        <boxGeometry args={[0.34, 0.86, 0.36]} />
      </mesh>
      {[-0.06, 0, 0.06].map((x) => (
        <mesh key={x} position={[x, 0.432, -0.08]} material={m.gold}>
          <boxGeometry args={[0.025, 0.01, 0.08]} />
        </mesh>
      ))}
      <mesh position={[0, 0.433, 0.09]} material={m.matteBlack}>
        <boxGeometry args={[0.2, 0.01, 0.1]} />
      </mesh>
    </Part>
  );
}

// Two SD cards sliding out of the grip-side slots.
function MemoryCard({ p, m, y, to }: { p: MotionValue<number>; m: CameraMaterials; y: number; to: Vec3 }) {
  const mats = useMemo(() => boxFaces(m.shellDark, { py: m.card }), [m]);
  const contacts = useMemo<Vec3[]>(() => Array.from({ length: 9 }, (_, i) => [0.26, -0.019, -0.18 + i * 0.045]), []);
  return (
    <Part progress={p} chapter={C} from={[-0.88, y, -0.03]} to={to} rotTo={[0, 0.25, 0.15]}>
      <mesh material={mats}>
        <boxGeometry args={[0.59, 0.035, 0.44]} />
      </mesh>
      <BoxInstances items={contacts} size={[0.05, 0.004, 0.025]} material={m.gold} />
    </Part>
  );
}

export function Internals({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  return (
    <group>
      <TopPlate p={p} m={m} />
      <BackPlate p={p} m={m} />
      <MainBoard p={p} m={m} />
      <Battery p={p} m={m} />
      <MemoryCard p={p} m={m} y={-0.05} to={[-2.0, 0.05, -0.03]} />
      <MemoryCard p={p} m={m} y={-0.22} to={[-2.3, -0.35, 0.05]} />
      <Tag progress={p} chapter={C} position={[-0.8, -1.9, 0.4]}>
        NP-W235 · 2× khe SD UHS-II
      </Tag>
      <Tag progress={p} chapter={C} position={[0.95, 1.45, -1.2]}>
        X-Processor 5
      </Tag>
    </group>
  );
}
