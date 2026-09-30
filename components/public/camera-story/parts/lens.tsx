"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { CHAPTERS, smoothstep } from "../explode";
import { LENS_X, LENS_Y } from "./body";
import type { CameraMaterials } from "./materials";
import { Cyl, LensElement, Part, RadialInstances, Tag, Tube } from "./primitives";

const C = 0; // lens chapter
const IRIS_BLADES = 7; // XF18-55mm: 7 rounded aperture blades

// Seven-blade aperture that stops down and reopens as the lens chapter plays.
function Iris({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const blades = useRef<(THREE.Group | null)[]>([]);
  const { start, end } = CHAPTERS[C];

  useFrame(() => {
    const close = Math.sin(Math.PI * smoothstep(start, end + 0.08, p.get())) * 0.7;
    blades.current.forEach((b, i) => {
      if (b) b.rotation.z = (i / IRIS_BLADES) * Math.PI * 2 + Math.PI / 2 + 0.25 + close;
    });
  });

  return (
    <group>
      <Tube rOuter={0.46} rInner={0.36} len={0.035} material={m.blackMetal} />
      {Array.from({ length: IRIS_BLADES }, (_, i) => {
        const a = (i / IRIS_BLADES) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.33, Math.sin(a) * 0.33, i * 0.0015 - 0.005]}>
            <group ref={(el) => void (blades.current[i] = el)}>
              <mesh position={[-0.13, 0, 0]} material={i % 2 ? m.matteBlack : m.blackMetal}>
                <boxGeometry args={[0.26, 0.1, 0.003]} />
              </mesh>
            </group>
          </group>
        );
      })}
      <mesh position={[0.4, 0.12, 0.02]} rotation={[0, 0, 0.6]} material={m.metal}>
        <boxGeometry args={[0.1, 0.02, 0.01]} />
      </mesh>
    </group>
  );
}

function RetainingRing({ r, m }: { r: number; m: CameraMaterials }) {
  return <Tube rOuter={r + 0.025} rInner={r - 0.012} len={0.03} material={m.blackMetal} />;
}

// Slide switch on the barrel's -x flank (aperture "A" / OIS).
function SlideSwitch({ z, m }: { z: number; m: CameraMaterials }) {
  return (
    <group position={[-0.6, 0, z]}>
      <RoundedBox args={[0.03, 0.14, 0.08]} radius={0.01} smoothness={2} material={m.shellDark} />
      <mesh position={[-0.02, 0.03, 0]} material={m.silverDark}>
        <boxGeometry args={[0.02, 0.05, 0.05]} />
      </mesh>
      <mesh position={[-0.017, -0.045, 0]} material={m.white}>
        <boxGeometry args={[0.004, 0.02, 0.05]} />
      </mesh>
    </group>
  );
}

// FUJINON XF18-55mmF2.8-4 R LM OIS: 14 elements in 10 groups (3 aspherical, 1 ED).
export function Lens({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  return (
    <group position={[LENS_X, LENS_Y, 0]}>
      {/* Rear barrel: chrome bayonet, contacts, index dot, ribbed aperture ring, switches */}
      <Part progress={p} chapter={C} from={[0, 0, 0.52]} to={[0, 0, 0.85]}>
        <Tube rOuter={0.5} rInner={0.42} len={0.3} material={m.anodized} />
        <Tube rOuter={0.44} rInner={0.34} len={0.03} material={m.chrome} position={[0, 0, -0.16]} />
        <Cyl r={0.42} len={0.004} material={m.matteBlack} position={[0, 0, -0.12]} />
        <RadialInstances
          count={10}
          radius={0.37}
          arc={1.2}
          startAngle={-Math.PI / 2 - 0.6}
          size={[0.026, 0.04, 0.01]}
          material={m.gold}
          position={[0, 0, -0.178]}
        />
        <mesh position={[0.3, 0.3, -0.14]} material={m.red}>
          <sphereGeometry args={[0.018, 12, 12]} />
        </mesh>
        <Tube rOuter={0.6} rInner={0.5} len={0.1} material={m.metalRibbed} position={[0, 0, 0.06]} />
        <RadialInstances count={90} radius={0.602} size={[0.01, 0.014, 0.085]} material={m.anodized} position={[0, 0, 0.06]} />
        <SlideSwitch z={-0.03} m={m} />
        <SlideSwitch z={0.1} m={m} />
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 0.55]} to={[0, 0, 1.2]}>
        <LensElement r={0.34} front={0.03} back={0.02} material={m.glass} />
        <RetainingRing r={0.34} m={m} />
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 0.66]} to={[0, 0, 1.5]}>
        <Iris p={p} m={m} />
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 0.78]} to={[0, 0, 1.8]}>
        <LensElement r={0.38} front={-0.02} back={0.04} edge={0.03} material={m.glassEd} />
        <RetainingRing r={0.38} m={m} />
      </Part>

      {/* Zoom ring: fine metal ribs + 18/23/35/55 scale, white index on the fixed collar */}
      <Part progress={p} chapter={C} from={[0, 0, 0.95]} to={[0, 0, 2.15]}>
        <Tube rOuter={0.6} rInner={0.55} len={0.3} material={m.metalRibbed} position={[0, 0, -0.03]} />
        <RadialInstances count={150} radius={0.602} size={[0.008, 0.012, 0.24]} material={m.anodized} position={[0, 0, -0.04]} />
        <Cyl r={0.603} len={0.06} material={m.zoomScale} open spin={2.2} position={[0, 0, 0.14]} />
        <Tube rOuter={0.6} rInner={0.55} len={0.04} material={m.anodized} position={[0, 0, 0.19]} />
        <mesh position={[0, 0.603, 0.19]} material={m.white}>
          <boxGeometry args={[0.012, 0.004, 0.035]} />
        </mesh>
      </Part>

      {/* Cemented doublet */}
      <Part progress={p} chapter={C} from={[0, 0, 1.08]} to={[0, 0, 2.5]}>
        <LensElement r={0.44} front={0.05} back={0.02} material={m.glass} position={[0, 0, 0.025]} />
        <LensElement r={0.44} front={-0.02} back={0.015} edge={0.015} material={m.glassEd} position={[0, 0, -0.03]} />
        <RetainingRing r={0.44} m={m} />
      </Part>

      {/* Front barrel: ribbed focus ring, printed name band, filter thread, hood bayonet, bezel */}
      <Part progress={p} chapter={C} from={[0, 0, 1.4]} to={[0, 0, 2.9]}>
        <Tube rOuter={0.59} rOuterFront={0.6} rInner={0.53} len={0.42} material={m.anodized} />
        <Tube rOuter={0.595} rInner={0.55} len={0.16} material={m.metalRibbed} position={[0, 0, -0.08]} />
        <RadialInstances count={140} radius={0.598} size={[0.008, 0.012, 0.14]} material={m.anodized} position={[0, 0, -0.08]} />
        <Cyl r={0.596} len={0.07} material={m.lensSide} open spin={2.2} position={[0, 0, 0.08]} />
        <RadialInstances count={3} radius={0.605} size={[0.12, 0.02, 0.03]} material={m.anodized} position={[0, 0, 0.19]} />
        <Tube rOuter={0.6} rInner={0.52} len={0.025} material={m.blackMetal} position={[0, 0, 0.2]} />
        <mesh position={[0, 0, 0.214]} material={m.bezel}>
          <ringGeometry args={[0.47, 0.52, 96]} />
        </mesh>
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 1.55]} to={[0, 0, 3.3]}>
        <LensElement r={0.47} front={0.07} back={-0.012} edge={0.03} material={m.glass} />
        <RetainingRing r={0.47} m={m} />
      </Part>

      <Tag progress={p} chapter={C} position={[0.1, 1.0, 1.3]}>
        14 thấu kính / 10 nhóm · 7 lá khẩu
      </Tag>
    </group>
  );
}
