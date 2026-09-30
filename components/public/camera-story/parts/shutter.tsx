"use client";

import type { MotionValue } from "framer-motion";
import type { Vec3 } from "../explode";
import { LENS_X, LENS_Y } from "./body";
import type { CameraMaterials } from "./materials";
import { Cyl, Part, RadialInstances, Screw, Spring, Tag } from "./primitives";

const C = 1; // shutter chapter
const OUT: Vec3 = [1.2, 1.75, 0.5];

// Focal-plane shutter unit (APS-C opening): frame, actuator motor, gear train, springs;
// the two curtains' blades fan apart as separate parts.
const S = 0.8; // unit scale relative to the full-frame layout
export function Shutter({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const blades = [0, 1, 2, 3, 4, 5, 6, 7];
  const screws: Vec3[] = [
    [-0.5, 0.38, 0.03],
    [0.5, 0.38, 0.03],
    [0.5, -0.38, 0.03],
    [-0.5, -0.38, 0.03],
  ];
  return (
    <group>
      <Part progress={p} chapter={C} from={[LENS_X, LENS_Y, 0.22]} to={OUT}>
        <group scale={S}>
        {/* frame around the 36×24 opening */}
        {(
          [
            [0, 0.34, 1.1, 0.18],
            [0, -0.34, 1.1, 0.18],
            [-0.47, 0, 0.16, 0.5],
            [0.47, 0, 0.16, 0.5],
          ] as const
        ).map(([x, y, w, h]) => (
          <mesh key={`${x},${y}`} position={[x, y, 0]} material={m.shellDark}>
            <boxGeometry args={[w, h, 0.05]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.026]} material={m.metal}>
          <boxGeometry args={[0.8, 0.54, 0.002]} />
        </mesh>
        <mesh position={[0, 0, 0.028]} material={m.matteBlack}>
          <boxGeometry args={[0.74, 0.48, 0.003]} />
        </mesh>
        {/* actuator motor */}
        <group position={[0.46, 0.2, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <Cyl r={0.07} len={0.16} material={m.copper} />
          <Cyl r={0.072} len={0.03} material={m.metal} position={[0, 0, 0.08]} />
          <Cyl r={0.072} len={0.03} material={m.metal} position={[0, 0, -0.08]} />
        </group>
        {/* gear train */}
        {(
          [
            [0.46, -0.2, 0.09, 24],
            [0.36, -0.3, 0.055, 16],
          ] as const
        ).map(([x, y, r, teeth]) => (
          <group key={x} position={[x, y, 0.045]}>
            <Cyl r={r} len={0.02} material={m.metal} segments={32} />
            <RadialInstances count={teeth} radius={r + 0.008} size={[0.012, 0.018, 0.02]} material={m.metal} />
            <Cyl r={0.015} len={0.03} material={m.chrome} segments={12} />
          </group>
        ))}
        <Spring radius={0.022} length={0.26} turns={9} wire={0.005} material={m.chrome} position={[-0.48, 0.02, 0.06]} />
        <Spring radius={0.018} length={0.2} turns={8} wire={0.004} material={m.chrome} position={[-0.4, -0.05, 0.06]} />
        {screws.map((s) => (
          <Screw key={s.join()} position={s} r={0.018} material={m.chrome} slot={m.matteBlack} />
        ))}
        </group>
      </Part>

      {blades.map((i) => {
        const upper = i < 4;
        const k = upper ? i : i - 4;
        const y0 = LENS_Y + (upper ? 0.04 + k * 0.04 : -0.04 - k * 0.04);
        const y1 = upper ? 0.3 + k * 0.14 : -0.3 - k * 0.14;
        return (
          <Part
            key={i}
            progress={p}
            chapter={C}
            from={[LENS_X, y0, 0.25 + i * 0.002]}
            to={[OUT[0] + 0.05, OUT[1] + y1, OUT[2] + 0.08 + i * 0.03]}
            rotTo={[0, 0, (upper ? 1 : -1) * (0.06 + k * 0.05)]}
          >
            <mesh material={k % 2 ? m.metal : m.blackMetal}>
              <boxGeometry args={[0.62, 0.1, 0.004]} />
            </mesh>
            {/* linkage arm + rivet */}
            <mesh position={[-0.34, upper ? 0.04 : -0.04, 0]} rotation={[0, 0, upper ? 0.5 : -0.5]} material={m.metal}>
              <boxGeometry args={[0.16, 0.025, 0.004]} />
            </mesh>
            <Cyl r={0.012} len={0.01} material={m.chrome} segments={12} position={[-0.29, 0, 0.004]} />
          </Part>
        );
      })}

      <Tag progress={p} chapter={C} position={[0.75, 2.55, 0.5]}>
        Màn trập 1/8000s · 1/180000s
      </Tag>
    </group>
  );
}
