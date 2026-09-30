"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import type { Vec3 } from "../explode";
import { LENS_X } from "./body";
import type { CameraMaterials } from "./materials";
import { BoxInstances, Cyl, Part, RadialInstances, Screw, Tag, Tube, boxFaces, HALF_PI } from "./primitives";
import { rng } from "./textures";

const C = 3; // internals chapter

// Knurled top dial with a printed cap, standing on the top plate (axis y).
function Dial({ position, cap, m }: { position: Vec3; cap: THREE.Material; m: CameraMaterials }) {
  const mats = useMemo(() => [m.knurled, cap, m.shell], [m, cap]);
  return (
    <group position={position} rotation={[-HALF_PI, 0, 0]}>
      <Cyl r={0.2} len={0.12} material={mats} />
      <RadialInstances count={60} radius={0.2} size={[0.012, 0.012, 0.1]} material={m.blackMetal} />
      <Cyl r={0.05} len={0.03} material={m.chrome} segments={24} position={[0, 0, 0.07]} />
      <Tube rOuter={0.215} rInner={0.2} len={0.02} material={m.metal} position={[0, 0, -0.05]} />
    </group>
  );
}

function TopPlate({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const micHoles = useMemo<Vec3[]>(() => {
    const out: Vec3[] = [];
    for (const side of [-1, 1])
      for (let i = 0; i < 6; i++) out.push([LENS_X + side * 0.26, 0.452, 0.08 + i * 0.03]);
    return out;
  }, []);
  const shoeContacts = useMemo<Vec3[]>(() => [-0.08, -0.04, 0, 0.04, 0.08].map((x) => [LENS_X + x, 0.474, 0]), []);

  return (
    <Part progress={p} chapter={C} from={[0, 0.77, 0]} to={[0, 1.95, 0]}>
      <RoundedBox args={[2.4, 0.14, 0.62]} radius={0.05} smoothness={3} material={m.shell} />
      {/* EVF hump with logo, microphone holes, hot shoe */}
      <RoundedBox args={[0.72, 0.42, 0.66]} radius={0.08} smoothness={4} position={[LENS_X, 0.24, -0.02]} material={m.shell} />
      <mesh position={[LENS_X, 0.28, 0.312]} material={m.logo}>
        <planeGeometry args={[0.5, 0.09]} />
      </mesh>
      <BoxInstances items={micHoles} size={[0.014, 0.004, 0.014]} material={m.matteBlack} />
      <mesh position={[LENS_X, 0.46, 0]} material={m.metal}>
        <boxGeometry args={[0.38, 0.02, 0.32]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[LENS_X, 0.482, s * 0.15]} material={m.chrome}>
            <boxGeometry args={[0.38, 0.03, 0.02]} />
          </mesh>
          <mesh position={[LENS_X, 0.498, s * 0.13]} material={m.chrome}>
            <boxGeometry args={[0.38, 0.006, 0.05]} />
          </mesh>
        </group>
      ))}
      <BoxInstances items={shoeContacts} size={[0.018, 0.006, 0.05]} material={m.gold} />

      {/* EVF eyecup + eyepiece on the back of the hump */}
      <RoundedBox args={[0.6, 0.4, 0.12]} radius={0.06} smoothness={4} position={[LENS_X, 0.24, -0.4]} material={m.rubber} />
      <mesh position={[LENS_X, 0.24, -0.462]} material={m.matteBlack}>
        <boxGeometry args={[0.4, 0.26, 0.01]} />
      </mesh>
      <mesh position={[LENS_X, 0.24, -0.468]} material={m.coverGlass}>
        <boxGeometry args={[0.4, 0.26, 0.004]} />
      </mesh>
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[LENS_X + x, 0.42, -0.36]} material={m.blackMetal}>
          <sphereGeometry args={[0.012, 10, 10]} />
        </mesh>
      ))}

      <Dial position={[-0.72, 0.13, 0]} cap={m.modeCap} m={m} />
      <Dial position={[0.78, 0.13, 0]} cap={m.evCap} m={m} />

      {/* Shutter release with power collar and lever, C1/C2, record */}
      <group position={[-1.02, 0.1, 0.22]} rotation={[-HALF_PI, 0, 0]}>
        <Tube rOuter={0.12} rInner={0.075} len={0.03} material={m.metal} />
        <mesh position={[0.13, 0, 0]} material={m.metal}>
          <boxGeometry args={[0.08, 0.025, 0.025]} />
        </mesh>
        <Cyl r={0.068} len={0.05} material={m.chrome} position={[0, 0, 0.02]} />
        <Cyl r={0.05} len={0.01} material={m.amberDim} position={[0, 0, 0.047]} />
      </group>
      {[-0.45, -0.3].map((x) => (
        <Cyl key={x} r={0.045} len={0.03} material={m.shellDark} segments={24} position={[x, 0.085, 0.2]} />
      ))}
      <group position={[-0.6, 0.075, 0.05]} rotation={[-HALF_PI, 0, 0]}>
        <Cyl r={0.035} len={0.03} material={m.red} segments={24} />
      </group>
      {(
        [
          [-1.12, 0.071, 0.26],
          [1.12, 0.071, 0.26],
          [1.12, 0.071, -0.26],
          [-1.12, 0.071, -0.26],
        ] as Vec3[]
      ).map((s) => (
        <group key={s.join()} position={s} rotation={[-HALF_PI, 0, 0]}>
          <Screw position={[0, 0, 0]} r={0.014} material={m.metal} slot={m.matteBlack} />
        </group>
      ))}
    </Part>
  );
}

function BackPlate({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const speaker = useMemo<Vec3[]>(() => {
    const out: Vec3[] = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) out.push([-1.08 + c * 0.03, -0.5 + r * 0.03, -0.052]);
    return out;
  }, []);
  const leftButtons = [0.42, 0.22, 0.02, -0.18];
  return (
    <Part progress={p} chapter={C} from={[0, 0, -0.36]} to={[0, -0.75, -2.0]} rotTo={[0.45, 0, 0]}>
      <RoundedBox args={[2.4, 1.4, 0.1]} radius={0.04} smoothness={3} material={m.shell} />

      {/* Tilting LCD: bracket, screen (faces -z), hinge */}
      <RoundedBox args={[1.6, 1.06, 0.05]} radius={0.02} smoothness={2} position={[-0.1, -0.06, -0.07]} material={m.shellDark} />
      <mesh position={[-0.1, -0.06, -0.097]} rotation={[0, Math.PI, 0]} material={m.lcd}>
        <planeGeometry args={[1.48, 0.96]} />
      </mesh>
      <group position={[-0.1, -0.6, -0.08]} rotation={[0, HALF_PI, 0]}>
        <Cyl r={0.028} len={1.3} material={m.metal} segments={20} />
      </group>

      {/* Right-hand controls: AF-ON, AEL, joystick, rear wheel, two buttons, thumb rest */}
      <RoundedBox args={[0.36, 0.14, 0.02]} radius={0.01} smoothness={2} position={[0.98, 0.62, -0.055]} material={m.leather} />
      <Cyl r={0.06} len={0.04} material={m.shellDark} segments={32} position={[0.9, 0.44, -0.07]} />
      <mesh position={[0.9, 0.44, -0.07]} material={m.amberDim}>
        <torusGeometry args={[0.06, 0.006, 8, 32]} />
      </mesh>
      <Cyl r={0.045} len={0.03} material={m.shellDark} segments={24} position={[1.08, 0.44, -0.065]} />
      <Cyl r={0.05} len={0.03} material={m.shellDark} segments={24} position={[0.98, 0.2, -0.065]} />
      <mesh position={[0.98, 0.2, -0.1]} material={m.rubber}>
        <sphereGeometry args={[0.035, 16, 16]} />
      </mesh>
      <group position={[0.98, -0.16, -0.075]}>
        <mesh material={m.knurled}>
          <torusGeometry args={[0.14, 0.03, 12, 48]} />
        </mesh>
        <RadialInstances count={48} radius={0.168} size={[0.01, 0.012, 0.05]} material={m.blackMetal} />
        <Cyl r={0.07} len={0.04} material={m.metal} segments={32} />
        <RadialInstances count={4} radius={0.14} size={[0.012, 0.012, 0.07]} material={m.chrome} startAngle={Math.PI / 4} />
      </group>
      {[0.88, 1.06].map((x) => (
        <Cyl key={x} r={0.04} len={0.03} material={m.shellDark} segments={24} position={[x, -0.48, -0.065]} />
      ))}

      {/* Left column: MENU / play / fn / delete, speaker grille */}
      {leftButtons.map((y, i) => (
        <Cyl key={y} r={0.045} len={0.03} material={i === 3 ? m.red : m.shellDark} segments={24} position={[-1.02, y, -0.065]} />
      ))}
      <BoxInstances items={speaker} size={[0.012, 0.012, 0.006]} material={m.matteBlack} />
      {(
        [
          [-1.12, 0.62],
          [1.12, -0.62],
          [-1.12, -0.62],
        ] as const
      ).map(([x, y]) => (
        <Screw key={`${x},${y}`} position={[x, y, -0.052]} r={0.014} material={m.metal} slot={m.matteBlack} back />
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
    while (dark.length < 70) {
      const x = -0.85 + r() * 1.7;
      const y = -0.48 + r() * 0.96;
      if (!avoid(x, y)) dark.push([x, y, -0.022]);
    }
    while (tan.length < 50) {
      const x = -0.85 + r() * 1.7;
      const y = -0.48 + r() * 0.96;
      if (!avoid(x, y)) tan.push([x, y, -0.02]);
    }
    const caps: Vec3[] = [
      [-0.7, 0.35, -0.045],
      [-0.62, 0.35, -0.045],
      [-0.54, 0.35, -0.045],
      [0.55, -0.38, -0.045],
      [0.63, -0.38, -0.045],
      [-0.72, -0.3, -0.045],
      [0.1, -0.4, -0.045],
      [0.18, -0.4, -0.045],
    ];
    return { dark, tan, caps };
  }, []);

  return (
    <Part progress={p} chapter={C} from={[0.15, 0, -0.2]} to={[0.2, 0.85, -1.15]} rotTo={[-0.35, 0, 0]}>
      <mesh material={boardMats}>
        <boxGeometry args={[1.8, 1.05, 0.03]} />
      </mesh>
      {/* image processor with heat-spreader frame */}
      <mesh position={[-0.2, 0.1, -0.03]} material={cpuMats}>
        <boxGeometry args={[0.34, 0.34, 0.03]} />
      </mesh>
      <mesh position={[-0.2, 0.1, -0.017]} material={m.metal}>
        <boxGeometry args={[0.4, 0.4, 0.006]} />
      </mesh>
      {[0.28, 0.02].map((y) => (
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
      {/* FPC connectors, card slot, ribbon cables */}
      {(
        [
          [-0.8, -0.05, 0.05, 0.3],
          [0.1, 0.46, 0.34, 0.05],
          [0.6, 0.3, 0.05, 0.22],
        ] as const
      ).map(([x, y, w, h]) => (
        <mesh key={`${x},${y}`} position={[x, y, -0.03]} material={m.connector}>
          <boxGeometry args={[w, h, 0.03]} />
        </mesh>
      ))}
      <mesh position={[0.78, -0.24, -0.035]} material={m.metal}>
        <boxGeometry args={[0.22, 0.38, 0.04]} />
      </mesh>
      <mesh position={[0.1, 0.62, -0.05]} rotation={[0.5, 0, 0]} material={m.polyimide}>
        <boxGeometry args={[0.3, 0.26, 0.004]} />
      </mesh>
      <mesh position={[-0.96, -0.05, -0.05]} rotation={[0, 0.5, 0]} material={m.polyimide}>
        <boxGeometry args={[0.2, 0.26, 0.004]} />
      </mesh>
    </Part>
  );
}

function Battery({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const mats = useMemo(
    () => boxFaces(m.shellDark, { px: m.battery, nx: m.battery, pz: m.battery, nz: m.battery }),
    [m]
  );
  return (
    <Part progress={p} chapter={C} from={[-1.0, -0.15, 0.05]} to={[-1.0, -1.85, 0.05]}>
      <mesh material={mats}>
        <boxGeometry args={[0.28, 0.9, 0.44]} />
      </mesh>
      <mesh position={[0, 0.455, 0.1]} material={m.amber}>
        <boxGeometry args={[0.2, 0.015, 0.14]} />
      </mesh>
      {[-0.05, 0, 0.05].map((x) => (
        <mesh key={x} position={[x, 0.457, -0.08]} material={m.gold}>
          <boxGeometry args={[0.025, 0.012, 0.08]} />
        </mesh>
      ))}
      <mesh position={[0.142, 0.3, 0.1]} material={m.metal}>
        <boxGeometry args={[0.006, 0.08, 0.14]} />
      </mesh>
    </Part>
  );
}

function MemoryCard({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const mats = useMemo(() => boxFaces(m.shellDark, { px: m.card, nx: m.card }), [m]);
  const contacts = useMemo<Vec3[]>(() => Array.from({ length: 9 }, (_, i) => [-0.014, 0.15, -0.1 + i * 0.025]), []);
  return (
    <Part progress={p} chapter={C} from={[1.18, -0.25, -0.05]} to={[2.05, -0.3, -0.05]} rotTo={[0, 0, -0.3]}>
      <mesh material={mats}>
        <boxGeometry args={[0.024, 0.34, 0.25]} />
      </mesh>
      <BoxInstances items={contacts} size={[0.004, 0.04, 0.016]} material={m.gold} />
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
      <MemoryCard p={p} m={m} />
      <Tag progress={p} chapter={C} position={[-0.8, -1.9, 0.4]}>
        2× pin · 128GB V90
      </Tag>
      <Tag progress={p} chapter={C} position={[0.95, 1.45, -1.2]}>
        Bộ xử lý OL-X1
      </Tag>
    </group>
  );
}
