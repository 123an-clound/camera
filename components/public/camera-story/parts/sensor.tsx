"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { CHAPTERS, explodeAmount, type Vec3 } from "../explode";
import { LENS_X, LENS_Y } from "./body";
import type { CameraMaterials } from "./materials";
import { BoxInstances, Decal, Part, Screw, Tag } from "./primitives";

const C = 2; // sensor chapter

// X-Trans CMOS 5 HR (APS-C 23.5 × 15.7 mm) on the 7-stop IBIS unit: aluminium plate,
// voice-coil magnets, ceramic package with gold bond pads, the colour-filtered die under
// cover glass, flex cable and heat-sink fins behind.
export function Sensor({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const { start, end, hold } = CHAPTERS[C];
  const die = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>>(null);

  // The die glows amber while it is pulled out.
  useFrame(() => {
    if (die.current) die.current.material.emissiveIntensity = 0.05 + 0.45 * explodeAmount(p.get(), start, end, hold);
  });

  const pads = useMemo(() => {
    const out: Vec3[] = [];
    for (let i = 0; i < 20; i++) {
      const x = -0.28 + (i / 19) * 0.56;
      out.push([x, 0.215, 0.032], [x, -0.215, 0.032]);
    }
    for (let i = 0; i < 12; i++) {
      const y = -0.15 + (i / 11) * 0.3;
      out.push([0.31, y, 0.032], [-0.31, y, 0.032]);
    }
    return out;
  }, []);
  const fins = useMemo<Vec3[]>(() => Array.from({ length: 9 }, (_, i) => [0, -0.28 + i * 0.07, -0.09]), []);

  return (
    <group>
      <Part progress={p} chapter={C} from={[LENS_X, LENS_Y, 0.1]} to={[LENS_X, -1.35, 0.95]} rotTo={[0.5, 0, 0]}>
        {/* IBIS plate + voice coils and magnets in the corners */}
        <RoundedBox args={[0.9, 0.68, 0.03]} radius={0.02} smoothness={2} position={[0, 0, -0.03]} material={m.magnesium} />
        {(
          [
            [-0.39, 0.28],
            [0.39, 0.28],
            [0.39, -0.28],
            [-0.39, -0.28],
          ] as const
        ).map(([x, y]) => (
          <group key={`${x},${y}`} position={[x, y, 0]}>
            <mesh material={m.copper}>
              <torusGeometry args={[0.045, 0.016, 10, 24]} />
            </mesh>
            <mesh position={[0, 0, -0.01]} material={m.blackMetal}>
              <boxGeometry args={[0.07, 0.07, 0.02]} />
            </mesh>
            <Screw position={[0, 0, 0.015]} r={0.012} material={m.chrome} slot={m.matteBlack} />
          </group>
        ))}

        {/* Ceramic package, gold bond ring and pads */}
        <RoundedBox args={[0.68, 0.5, 0.04]} radius={0.015} smoothness={2} position={[0, 0, 0.01]} material={m.ceramic} />
        <mesh position={[0, 0, 0.031]} material={m.gold}>
          <boxGeometry args={[0.54, 0.39, 0.002]} />
        </mesh>
        <BoxInstances items={pads} size={[0.018, 0.018, 0.004]} material={m.gold} />

        {/* Die + cover glass */}
        <mesh ref={die} position={[0, 0, 0.04]} material={m.sensor}>
          <boxGeometry args={[0.44, 0.29, 0.012]} />
        </mesh>
        <mesh position={[0, 0, 0.058]} material={m.coverGlass}>
          <boxGeometry args={[0.5, 0.35, 0.012]} />
        </mesh>

        <Decal material={m.sensorLabel} size={[0.4, 0.05]} position={[0, -0.3, -0.013]} />

        {/* Flex cable dropping out of the bottom */}
        <mesh position={[0.08, -0.42, -0.02]} rotation={[-0.35, 0, 0]} material={m.polyimide}>
          <boxGeometry args={[0.28, 0.3, 0.004]} />
        </mesh>
        <mesh position={[0.08, -0.57, -0.07]} material={m.connector}>
          <boxGeometry args={[0.34, 0.05, 0.03]} />
        </mesh>

        {/* Heat-sink fins behind the plate */}
        <BoxInstances items={fins} size={[0.72, 0.018, 0.1]} material={m.metal} />
      </Part>
      <Tag progress={p} chapter={C} position={[-0.25, -1.95, 1.2]}>
        X-Trans CMOS 5 HR · 40.2MP · IBIS 7 stop
      </Tag>
    </group>
  );
}
