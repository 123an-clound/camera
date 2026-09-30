"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import type { Vec3 } from "../explode";
import type { CameraMaterials } from "./materials";
import { BoxInstances, Button, Cyl, Dial, Part, RadialInstances, Screw, Tube } from "./primitives";

// Fujifilm X-T5 proportions (129.5 × 91 × 63.8 mm), 1 unit ≈ 54 mm. Front faces +z,
// the grip is on -x (viewer's left when looking at the front).
export const LENS_X = 0.12;
export const LENS_Y = -0.12;
export const TOP = 0.62; // top of the silver top cover, where the dials stand

// Static chassis: magnesium frame, grip, front command dial, strap clips, side doors,
// silver base plate with tripod socket and battery door.
export function Body({ m }: { m: CameraMaterials }) {
  const speaker = useMemo<Vec3[]>(() => {
    const out: Vec3[] = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) out.push([1.207, -0.5 + r * 0.03, -0.12 + c * 0.03]);
    return out;
  }, []);
  return (
    <group>
      <RoundedBox args={[2.3, 1.26, 0.5]} radius={0.06} smoothness={4} position={[0, -0.08, 0]} material={m.magnesium} />

      {/* Grip + front command dial peeking out of its top */}
      <RoundedBox args={[0.4, 1.0, 0.2]} radius={0.09} smoothness={5} position={[-0.95, -0.14, 0.38]} material={m.leather} />
      <Dial r={0.1} h={0.05} body={m.knurled} ridge={m.blackMetal} ridges={36} position={[-0.92, 0.33, 0.33]} />

      {/* Strap clips */}
      {[-1.215, 1.215].map((x) => (
        <group key={x} position={[x, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={m.silver}>
            <torusGeometry args={[0.06, 0.016, 12, 32]} />
          </mesh>
        </group>
      ))}

      {/* +x side: two connector covers (mic/remote, USB-C/HDMI), speaker */}
      {[0.16, -0.22].map((y) => (
        <group key={y}>
          <RoundedBox args={[0.03, 0.32, 0.4]} radius={0.012} smoothness={2} position={[1.19, y, 0.02]} material={m.rubber} />
          <mesh position={[1.207, y + 0.12, 0.02]} material={m.shellDark}>
            <boxGeometry args={[0.006, 0.012, 0.3]} />
          </mesh>
        </group>
      ))}
      <BoxInstances items={speaker} size={[0.006, 0.012, 0.012]} material={m.matteBlack} />

      {/* -x side: dual SD card-slot cover with latch */}
      <RoundedBox args={[0.03, 0.62, 0.42]} radius={0.012} smoothness={2} position={[-1.19, -0.14, -0.02]} material={m.shellDark} />
      <mesh position={[-1.2, -0.14, -0.235]} material={m.silverDark}>
        <boxGeometry args={[0.02, 0.12, 0.02]} />
      </mesh>

      {/* Base plate: tripod socket on the lens axis, battery door under the grip */}
      <RoundedBox args={[2.4, 0.08, 0.62]} radius={0.03} smoothness={3} position={[0, -0.69, 0]} material={m.silver} />
      <group position={[LENS_X, -0.73, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Tube rOuter={0.08} rInner={0.03} len={0.012} material={m.silverDark} />
        <Cyl r={0.03} len={0.01} material={m.matteBlack} segments={24} />
      </group>
      <mesh position={[-0.8, -0.733, 0.02]} material={m.shellDark}>
        <boxGeometry args={[0.46, 0.008, 0.4]} />
      </mesh>
      <mesh position={[-0.8, -0.738, -0.2]} material={m.silverDark}>
        <boxGeometry args={[0.14, 0.01, 0.04]} />
      </mesh>
      {(
        [
          [0.7, -0.735, 0.2],
          [0.7, -0.735, -0.2],
          [-0.35, -0.735, 0.2],
        ] as Vec3[]
      ).map((p) => (
        <group key={p.join()} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <Screw position={[0, 0, 0]} r={0.014} material={m.silverDark} slot={m.matteBlack} />
        </group>
      ))}
    </group>
  );
}

// Leatherette front plate carrying the X mount; swings open during the shutter chapter.
export function FrontPlate({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  return (
    <Part progress={p} chapter={1} from={[0, 0, 0.3]} to={[-1.7, 0.1, 1.5]} rotTo={[0, 0.9, 0]}>
      <RoundedBox args={[2.4, 1.08, 0.07]} radius={0.03} smoothness={3} position={[0, -0.11, 0]} material={m.leather} />

      {/* X mount: silver ring, chrome bayonet flange, black throat, tabs, 10 contacts, screws */}
      <group position={[LENS_X, LENS_Y, 0.04]}>
        <Tube rOuter={0.53} rInner={0.49} len={0.05} material={m.silver} position={[0, 0, -0.005]} />
        <Tube rOuter={0.49} rInner={0.4} len={0.04} material={m.chrome} />
        <Tube rOuter={0.41} rInner={0.38} len={0.16} material={m.matteBlack} position={[0, 0, -0.08]} />
        <RadialInstances
          count={3}
          radius={0.405}
          size={[0.22, 0.03, 0.014]}
          material={m.metal}
          position={[0, 0, 0.004]}
          rotation={[0, 0, 0.5]}
        />
        <RadialInstances
          count={10}
          radius={0.355}
          arc={1.2}
          startAngle={-Math.PI / 2 - 0.6}
          size={[0.028, 0.045, 0.012]}
          material={m.gold}
          position={[0, 0, -0.03]}
        />
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <Screw
              key={i}
              position={[Math.cos(a) * 0.445, Math.sin(a) * 0.445, 0.022]}
              r={0.013}
              material={m.chrome}
              slot={m.matteBlack}
            />
          );
        })}
        <mesh position={[0.36, 0.36, 0.025]} material={m.white}>
          <sphereGeometry args={[0.018, 12, 12]} />
        </mesh>
      </group>

      {/* Fn2, AF-assist/tally lamp, lens release, sync terminal, focus-mode selector */}
      <Button r={0.042} h={0.025} material={m.shellDark} collar={m.silverDark} position={[-0.5, 0.14, 0.035]} />
      <Cyl r={0.036} len={0.012} material={m.amberDim} segments={24} position={[-0.5, 0.31, 0.04]} />
      <Button r={0.058} h={0.03} material={m.silver} position={[-0.47, -0.52, 0.035]} />
      <group position={[0.84, 0.22, 0.035]}>
        <Tube rOuter={0.06} rInner={0.035} len={0.03} material={m.silverDark} position={[0, 0, 0.015]} />
        <Cyl r={0.045} len={0.045} material={m.rubber} segments={24} position={[0, 0, 0.025]} />
      </group>
      <group position={[0.84, -0.5, 0.035]}>
        <Cyl r={0.07} len={0.02} material={m.shellDark} segments={32} position={[0, 0, 0.01]} />
        <mesh position={[0.05, 0, 0.03]} rotation={[0, 0, -0.3]} material={m.shellDark}>
          <boxGeometry args={[0.12, 0.035, 0.03]} />
        </mesh>
        <RadialInstances
          count={3}
          radius={0.1}
          arc={1.2}
          startAngle={-0.6}
          size={[0.012, 0.012, 0.004]}
          material={m.white}
          position={[0, 0, 0.004]}
        />
      </group>
    </Part>
  );
}
