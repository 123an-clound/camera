"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { CHAPTERS, chapterFocus, explodeAmount, mix3, type Vec3 } from "./explode";

// A stylised mirrorless camera built from primitives. Front of the camera faces +z,
// the lens axis is z, the grip sits on -x. Every movable part flies from its
// assembled transform to an exploded one during its chapter's scroll window.

const LENS_X = 0.1;
const HALF_PI = Math.PI / 2;

function useMaterials() {
  const materials = useMemo(
    () => ({
      shell: new THREE.MeshStandardMaterial({ color: "#2a2a2f", metalness: 0.5, roughness: 0.4 }),
      shellLight: new THREE.MeshStandardMaterial({ color: "#3a3a40", metalness: 0.7, roughness: 0.35 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#101012", metalness: 0.1, roughness: 0.9 }),
      metal: new THREE.MeshStandardMaterial({ color: "#9aa0a8", metalness: 1, roughness: 0.28 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#8fc3ff",
        metalness: 0.2,
        roughness: 0.05,
        transparent: true,
        opacity: 0.42,
        emissive: new THREE.Color("#2b5a99"),
        emissiveIntensity: 0.9,
      }),
      amber: new THREE.MeshStandardMaterial({
        color: "#f5a524",
        emissive: new THREE.Color("#f5a524"),
        emissiveIntensity: 0.9,
      }),
      sensor: new THREE.MeshStandardMaterial({
        color: "#3a2a55",
        metalness: 0.9,
        roughness: 0.15,
        emissive: new THREE.Color("#f5a524"),
        emissiveIntensity: 0.1,
      }),
      pcb: new THREE.MeshStandardMaterial({ color: "#0f3d33", metalness: 0.3, roughness: 0.6 }),
      chip: new THREE.MeshStandardMaterial({ color: "#0b0b0c", metalness: 0.4, roughness: 0.5 }),
      lcd: new THREE.MeshStandardMaterial({
        color: "#05070a",
        emissive: new THREE.Color("#12324a"),
        emissiveIntensity: 0.6,
        roughness: 0.1,
      }),
    }),
    []
  );
  useEffect(() => () => Object.values(materials).forEach((mat) => mat.dispose()), [materials]);
  return materials;
}

type Materials = ReturnType<typeof useMaterials>;

// Cylinder lying along the z (optical) axis.
function Cyl({ r, len, material, segments = 48 }: { r: number; len: number; material: THREE.Material; segments?: number }) {
  return (
    <mesh rotation={[HALF_PI, 0, 0]} material={material}>
      <cylinderGeometry args={[r, r, len, segments]} />
    </mesh>
  );
}

function Part({
  progress,
  chapter,
  from,
  to,
  rot = [0, 0, 0],
  rotTo,
  children,
}: {
  progress: MotionValue<number>;
  chapter: number;
  from: Vec3;
  to: Vec3;
  rot?: Vec3;
  rotTo?: Vec3;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const { start, end, hold } = CHAPTERS[chapter];

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = explodeAmount(progress.get(), start, end, hold);
    g.position.set(...mix3(from, to, t));
    if (rotTo) g.rotation.set(...mix3(rot, rotTo, t));
  });

  return (
    <group ref={ref} position={from} rotation={rot}>
      {children}
    </group>
  );
}

// Mono spec tag pinned to a part; visible only during its chapter. Decorative only.
function Tag({
  progress,
  chapter,
  position,
  children,
}: {
  progress: MotionValue<number>;
  chapter: number;
  position: Vec3;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { start, end } = CHAPTERS[chapter];

  useFrame(() => {
    if (!ref.current) return;
    ref.current.style.opacity = String(chapterFocus(progress.get(), start, end));
  });

  return (
    <Html position={position} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div
        ref={ref}
        aria-hidden
        style={{ opacity: 0 }}
        className="hidden -translate-y-1/2 items-center gap-2 whitespace-nowrap md:flex font-mono text-[10px] uppercase tracking-widest text-primary"
      >
        <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
        <span className="h-px w-8 bg-primary/60" />
        <span className="rounded-sm border border-primary/30 bg-background/70 px-1.5 py-0.5 backdrop-blur-sm">
          {children}
        </span>
      </div>
    </Html>
  );
}

function Body({ m }: { m: Materials }) {
  return (
    <group>
      {/* Chassis */}
      <RoundedBox args={[2.4, 1.4, 0.6]} radius={0.08} smoothness={4} material={m.shell} />
      {/* Grip */}
      <RoundedBox args={[0.55, 1.5, 0.5]} radius={0.2} smoothness={4} position={[-1.05, -0.02, 0.42]} material={m.rubber} />
    </group>
  );
}

function Lens({ p, m }: { p: MotionValue<number>; m: Materials }) {
  const c = 0;
  // [z assembled, z exploded]
  return (
    <group position={[LENS_X, -0.02, 0]}>
      <Part progress={p} chapter={c} from={[0, 0, 0.7]} to={[0, 0, 1.0]}>
        <Cyl r={0.56} len={0.45} material={m.shellLight} />
      </Part>
      <Part progress={p} chapter={c} from={[0, 0, 0.72]} to={[0, 0, 1.4]}>
        <Cyl r={0.45} len={0.05} material={m.glass} />
      </Part>
      <Part progress={p} chapter={c} from={[0, 0, 0.86]} to={[0, 0, 1.75]}>
        <Cyl r={0.42} len={0.07} material={m.glass} />
      </Part>
      <Part progress={p} chapter={c} from={[0, 0, 1.05]} to={[0, 0, 2.15]}>
        <Cyl r={0.6} len={0.25} material={m.rubber} segments={24} />
        <group position={[0, 0, 0.14]}>
          <mesh material={m.amber}>
            <torusGeometry args={[0.6, 0.012, 8, 64]} />
          </mesh>
        </group>
      </Part>
      <Part progress={p} chapter={c} from={[0, 0, 1.12]} to={[0, 0, 2.55]}>
        <Cyl r={0.48} len={0.08} material={m.glass} />
      </Part>
      <Part progress={p} chapter={c} from={[0, 0, 1.32]} to={[0, 0, 2.95]}>
        <Cyl r={0.62} len={0.35} material={m.shell} />
        <group position={[0, 0, 0.18]}>
          <mesh material={m.metal}>
            <torusGeometry args={[0.6, 0.02, 12, 64]} />
          </mesh>
        </group>
      </Part>
      <Part progress={p} chapter={c} from={[0, 0, 1.47]} to={[0, 0, 3.35]}>
        <Cyl r={0.54} len={0.04} material={m.glass} />
      </Part>
      <Tag progress={p} chapter={c} position={[0.7, 0.55, 2.2]}>
        7 thấu kính · ƒ/1.8
      </Tag>
    </group>
  );
}

function FrontPlate({ p, m }: { p: MotionValue<number>; m: Materials }) {
  // Swings off to the left during the shutter chapter to reveal the mechanism.
  return (
    <Part progress={p} chapter={1} from={[0, 0, 0.36]} to={[-1.7, 0.1, 1.5]} rotTo={[0, 0.9, 0]}>
      <RoundedBox args={[2.46, 1.46, 0.1]} radius={0.04} smoothness={3} material={m.shell} />
      <group position={[LENS_X, -0.02, 0.07]}>
        <Cyl r={0.64} len={0.06} material={m.metal} />
      </group>
      <mesh position={[0.95, 0.5, 0.06]} material={m.amber}>
        <sphereGeometry args={[0.035, 16, 16]} />
      </mesh>
    </Part>
  );
}

function Shutter({ p, m }: { p: MotionValue<number>; m: Materials }) {
  const c = 1;
  const blades = [0, 1, 2, 3, 4, 5];
  return (
    <group>
      <Part progress={p} chapter={c} from={[LENS_X, 0, 0.24]} to={[1.2, 1.75, 0.5]}>
        <RoundedBox args={[1.1, 0.86, 0.05]} radius={0.02} smoothness={2} material={m.shellLight} />
      </Part>
      {blades.map((i) => (
        <Part
          key={i}
          progress={p}
          chapter={c}
          from={[LENS_X, (i - 2.5) * 0.12, 0.28]}
          to={[1.2, (i - 2.5) * 0.24 + 1.75, 0.56 + i * 0.05]}
          rotTo={[0, 0, (i - 2.5) * 0.14]}
        >
          <mesh material={i % 2 ? m.metal : m.shellLight}>
            <boxGeometry args={[0.95, 0.11, 0.01]} />
          </mesh>
        </Part>
      ))}
      <Tag progress={p} chapter={c} position={[1.8, 2.45, 0.5]}>
        Màn trập 1/8000s
      </Tag>
    </group>
  );
}

function Sensor({ p, m }: { p: MotionValue<number>; m: Materials }) {
  const c = 2;
  const { start, end } = CHAPTERS[c];
  const chip = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  // The sensor glows amber while it is pulled out.
  useFrame(() => {
    if (chip.current) chip.current.material.emissiveIntensity = 0.1 + 1.6 * explodeAmount(p.get(), start, end);
  });
  return (
    <group>
      <Part progress={p} chapter={c} from={[LENS_X, 0, 0.12]} to={[LENS_X, -1.3, 0.95]} rotTo={[0.5, 0, 0]}>
        <RoundedBox args={[0.9, 0.7, 0.05]} radius={0.015} smoothness={2} material={m.pcb} />
        <mesh ref={chip} position={[0, 0, 0.04]} material={m.sensor}>
          <boxGeometry args={[0.62, 0.44, 0.03]} />
        </mesh>
      </Part>
      <Tag progress={p} chapter={c} position={[0.6, -1.2, 1.1]}>
        Full-frame 24MP
      </Tag>
    </group>
  );
}

function Internals({ p, m }: { p: MotionValue<number>; m: Materials }) {
  const c = 3;
  const chips: Vec3[] = [
    [-0.5, 0.2, 0.04],
    [0.3, 0.25, 0.04],
    [0.55, -0.25, 0.04],
    [-0.2, -0.3, 0.04],
  ];
  return (
    <group>
      {/* Top plate: dials, hot shoe, viewfinder hump */}
      <Part progress={p} chapter={c} from={[0, 0.77, 0]} to={[0, 1.95, 0]}>
        <RoundedBox args={[2.4, 0.14, 0.62]} radius={0.05} smoothness={3} material={m.shell} />
        <RoundedBox args={[0.72, 0.42, 0.7]} radius={0.08} smoothness={3} position={[LENS_X, 0.24, -0.02]} material={m.shell} />
        <mesh position={[LENS_X, 0.47, -0.02]} material={m.metal}>
          <boxGeometry args={[0.36, 0.03, 0.3]} />
        </mesh>
        {[-0.72, 0.78].map((x) => (
          <mesh key={x} position={[x, 0.13, 0]} material={m.metal}>
            <cylinderGeometry args={[0.2, 0.2, 0.12, 40]} />
          </mesh>
        ))}
        <mesh position={[-1.02, 0.12, 0.22]} material={m.amber}>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 32]} />
        </mesh>
      </Part>
      {/* Back plate + LCD */}
      <Part progress={p} chapter={c} from={[0, 0, -0.36]} to={[0, -0.75, -2.0]} rotTo={[0.45, 0, 0]}>
        <RoundedBox args={[2.4, 1.4, 0.1]} radius={0.04} smoothness={3} material={m.shell} />
        <mesh position={[0.15, -0.05, -0.06]} material={m.lcd}>
          <boxGeometry args={[1.5, 0.98, 0.02]} />
        </mesh>
      </Part>
      {/* Main board */}
      <Part progress={p} chapter={c} from={[0.15, 0, -0.2]} to={[0.2, 0.85, -1.15]} rotTo={[-0.35, 0, 0]}>
        <mesh material={m.pcb}>
          <boxGeometry args={[1.8, 1.05, 0.04]} />
        </mesh>
        {chips.map((pos) => (
          <mesh key={pos.join()} position={pos} material={m.chip}>
            <boxGeometry args={[0.28, 0.22, 0.04]} />
          </mesh>
        ))}
        <mesh position={[-0.5, 0.2, 0.065]} material={m.amber}>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
        </mesh>
      </Part>
      {/* Battery drops out of the grip */}
      <Part progress={p} chapter={c} from={[-1.05, -0.15, 0.1]} to={[-1.05, -1.85, 0.1]}>
        <RoundedBox args={[0.34, 0.95, 0.46]} radius={0.04} smoothness={2} material={m.shellLight} />
        <mesh position={[0, 0.49, 0]} material={m.amber}>
          <boxGeometry args={[0.2, 0.03, 0.3]} />
        </mesh>
      </Part>
      {/* Memory card slides out the side */}
      <Part progress={p} chapter={c} from={[1.18, -0.25, -0.05]} to={[2.05, -0.3, -0.05]} rotTo={[0, 0, -0.3]}>
        <mesh material={m.amber}>
          <boxGeometry args={[0.03, 0.34, 0.25]} />
        </mesh>
      </Part>
      <Tag progress={p} chapter={c} position={[-0.8, -1.9, 0.4]}>
        2× pin · 128GB
      </Tag>
    </group>
  );
}

export function CameraModel({ progress }: { progress: MotionValue<number> }) {
  const m = useMaterials();
  return (
    <group>
      <Body m={m} />
      <FrontPlate p={progress} m={m} />
      <Lens p={progress} m={m} />
      <Shutter p={progress} m={m} />
      <Sensor p={progress} m={m} />
      <Internals p={progress} m={m} />
    </group>
  );
}
