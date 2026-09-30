"use client";

import { RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import type { Vec3 } from "../explode";
import type { CameraMaterials } from "./materials";
import { Cyl, Part, RadialInstances, Screw, Tube } from "./primitives";

export const LENS_X = 0.1;
export const LENS_Y = -0.02;

// Static chassis: magnesium frame, grip, strap lugs, side doors, tripod socket.
export function Body({ m }: { m: CameraMaterials }) {
  const bottomScrews: Vec3[] = [
    [-0.55, -0.71, 0.18],
    [0.75, -0.71, 0.18],
    [0.75, -0.71, -0.18],
    [-0.55, -0.71, -0.18],
  ];
  return (
    <group>
      <RoundedBox args={[2.4, 1.4, 0.6]} radius={0.08} smoothness={4} material={m.magnesium} />

      {/* Grip: leatherette wrap with a finger ridge and front command dial */}
      <RoundedBox args={[0.55, 1.5, 0.5]} radius={0.2} smoothness={5} position={[-1.05, -0.02, 0.42]} material={m.leather} />
      <RoundedBox args={[0.5, 0.08, 0.46]} radius={0.03} smoothness={3} position={[-1.05, 0.28, 0.45]} material={m.rubber} />
      <group position={[-1.0, 0.64, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <Cyl r={0.15} len={0.05} material={m.knurled} />
        <RadialInstances count={40} radius={0.152} size={[0.008, 0.01, 0.05]} material={m.blackMetal} />
      </group>

      {/* Strap lugs */}
      {[-1.24, 1.24].map((x) => (
        <group key={x} position={[x, 0.52, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={m.metal}>
            <torusGeometry args={[0.065, 0.018, 12, 32]} />
          </mesh>
        </group>
      ))}

      {/* Right side: port door (upper) and card door (lower), rubber with ridges */}
      <RoundedBox args={[0.03, 0.46, 0.34]} radius={0.012} smoothness={2} position={[1.215, 0.22, 0.04]} material={m.rubber} />
      {[0.34, 0.22, 0.1].map((y) => (
        <mesh key={y} position={[1.232, y, 0.04]} material={m.shellDark}>
          <boxGeometry args={[0.006, 0.012, 0.24]} />
        </mesh>
      ))}
      <RoundedBox args={[0.03, 0.44, 0.34]} radius={0.012} smoothness={2} position={[1.215, -0.28, -0.04]} material={m.shell} />
      <mesh position={[1.233, -0.28, 0.1]} material={m.metal}>
        <boxGeometry args={[0.006, 0.1, 0.03]} />
      </mesh>

      {/* Bottom: tripod socket, battery door with latch, screws */}
      <group position={[LENS_X, -0.705, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Tube rOuter={0.09} rInner={0.035} len={0.02} material={m.metal} />
        <Cyl r={0.035} len={0.018} material={m.matteBlack} segments={24} />
      </group>
      <RoundedBox args={[0.46, 0.02, 0.44]} radius={0.008} smoothness={2} position={[-1.05, -0.772, 0.42]} material={m.shell} />
      <mesh position={[-1.05, -0.785, 0.58]} material={m.metal}>
        <boxGeometry args={[0.12, 0.012, 0.05]} />
      </mesh>
      {bottomScrews.map((p) => (
        <group key={p.join()} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <Screw position={[0, 0, 0]} material={m.metal} slot={m.matteBlack} />
        </group>
      ))}
    </group>
  );
}

// Front plate carrying the lens mount; swings open during the shutter chapter.
export function FrontPlate({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const screws: Vec3[] = [
    [-0.72, 0.62, 0.052],
    [1.12, 0.62, 0.052],
    [1.12, -0.64, 0.052],
    [-0.72, -0.64, 0.052],
  ];
  return (
    <Part progress={p} chapter={1} from={[0, 0, 0.36]} to={[-1.7, 0.1, 1.5]} rotTo={[0, 0.9, 0]}>
      <RoundedBox args={[2.46, 1.46, 0.1]} radius={0.04} smoothness={3} material={m.shell} />
      {/* Leatherette inlay right of the mount */}
      <RoundedBox args={[0.4, 1.22, 0.014]} radius={0.01} smoothness={2} position={[0.97, -0.06, 0.054]} material={m.leather} />

      {/* Bayonet mount: chrome flange, black throat, three tabs, gold contacts, index dot */}
      <group position={[LENS_X, LENS_Y, 0.07]}>
        <Tube rOuter={0.68} rInner={0.56} len={0.05} material={m.metal} />
        <Tube rOuter={0.57} rInner={0.54} len={0.12} material={m.matteBlack} position={[0, 0, -0.04]} />
        <RadialInstances count={3} radius={0.575} size={[0.28, 0.035, 0.02]} material={m.metal} position={[0, 0, 0.012]} />
        <RadialInstances
          count={10}
          radius={0.5}
          arc={1.1}
          startAngle={-Math.PI / 2 - 0.55}
          size={[0.035, 0.05, 0.012]}
          material={m.gold}
          position={[0, 0, -0.02]}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 + 0.3;
          return (
            <Screw
              key={i}
              position={[Math.cos(a) * 0.625, Math.sin(a) * 0.625, 0.03]}
              r={0.014}
              material={m.chrome}
              slot={m.matteBlack}
            />
          );
        })}
        <mesh position={[0.5, 0.5, 0.03]} material={m.amber}>
          <sphereGeometry args={[0.025, 16, 16]} />
        </mesh>
      </group>

      {/* Lens release button, AF-assist lamp, two custom buttons */}
      <group position={[0.86, -0.4, 0.07]}>
        <Cyl r={0.075} len={0.035} material={m.metal} />
        <Cyl r={0.06} len={0.02} material={m.shellDark} position={[0, 0, 0.022]} />
      </group>
      <group position={[-0.62, 0.5, 0.06]}>
        <Cyl r={0.05} len={0.02} material={m.blackMetal} segments={24} />
        <Cyl r={0.038} len={0.012} material={m.amberDim} segments={24} position={[0, 0, 0.012]} />
      </group>
      {[-0.28, -0.46].map((y) => (
        <Cyl key={y} r={0.035} len={0.03} material={m.shellDark} segments={24} position={[-0.6, y, 0.065]} />
      ))}
      {screws.map((s) => (
        <Screw key={s.join()} position={s} r={0.016} material={m.metal} slot={m.matteBlack} />
      ))}
    </Part>
  );
}
