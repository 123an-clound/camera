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
const IRIS_BLADES = 9;

// Nine-blade aperture that stops down and reopens as the lens chapter plays.
function Iris({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  const blades = useRef<(THREE.Group | null)[]>([]);
  const { start, end } = CHAPTERS[C];

  useFrame(() => {
    const close = Math.sin(Math.PI * smoothstep(start, end + 0.08, p.get())) * 0.62;
    blades.current.forEach((b, i) => {
      if (b) b.rotation.z = (i / IRIS_BLADES) * Math.PI * 2 + Math.PI / 2 + 0.25 + close;
    });
  });

  return (
    <group>
      <Tube rOuter={0.5} rInner={0.4} len={0.035} material={m.blackMetal} />
      {Array.from({ length: IRIS_BLADES }, (_, i) => {
        const a = (i / IRIS_BLADES) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.36, Math.sin(a) * 0.36, i * 0.0015 - 0.006]}>
            <group ref={(el) => void (blades.current[i] = el)}>
              <mesh position={[-0.13, 0, 0]} material={i % 2 ? m.matteBlack : m.blackMetal}>
                <boxGeometry args={[0.26, 0.1, 0.003]} />
              </mesh>
            </group>
          </group>
        );
      })}
      {/* actuator lever */}
      <mesh position={[0.44, 0.12, 0.02]} rotation={[0, 0, 0.6]} material={m.metal}>
        <boxGeometry args={[0.1, 0.02, 0.01]} />
      </mesh>
    </group>
  );
}

function RetainingRing({ r, m }: { r: number; m: CameraMaterials }) {
  return <Tube rOuter={r + 0.025} rInner={r - 0.012} len={0.03} material={m.blackMetal} />;
}

export function Lens({ p, m }: { p: MotionValue<number>; m: CameraMaterials }) {
  return (
    <group position={[LENS_X, LENS_Y, 0]}>
      {/* Rear barrel: mount flange, contacts, printed band, zoom scale, AF/MF switches */}
      <Part progress={p} chapter={C} from={[0, 0, 0.7]} to={[0, 0, 1.0]}>
        <Tube rOuter={0.56} rInner={0.5} len={0.45} material={m.shell} />
        <Tube rOuter={0.56} rInner={0.42} len={0.03} material={m.chrome} position={[0, 0, -0.235]} />
        {/* dark interior baffle so the glass reads as deep, not as a flat grey disc */}
        <Cyl r={0.5} len={0.004} material={m.matteBlack} position={[0, 0, -0.2]} />
        <RadialInstances
          count={10}
          radius={0.465}
          arc={1.1}
          startAngle={-Math.PI / 2 - 0.55}
          size={[0.03, 0.045, 0.01]}
          material={m.gold}
          position={[0, 0, -0.255]}
        />
        <Cyl r={0.563} len={0.09} material={m.rearPrint} open spin={2.2} position={[0, 0, -0.08]} />
        <Cyl r={0.566} len={0.07} material={m.zoomScale} open spin={2.2} position={[0, 0, 0.16]} />
        {[0.12, -0.08].map((y, i) => (
          <group key={y} position={[-0.565, y, 0.02]}>
            <RoundedBox args={[0.03, 0.15, 0.09]} radius={0.01} smoothness={2} material={m.shellDark} />
            <mesh position={[-0.02, i ? -0.03 : 0.03, 0]} material={m.metal}>
              <boxGeometry args={[0.02, 0.05, 0.05]} />
            </mesh>
          </group>
        ))}
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 0.72]} to={[0, 0, 1.35]}>
        <LensElement r={0.43} front={0.035} back={0.02} material={m.glass} />
        <RetainingRing r={0.43} m={m} />
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 0.8]} to={[0, 0, 1.65]}>
        <Iris p={p} m={m} />
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 0.9]} to={[0, 0, 1.95]}>
        <LensElement r={0.41} front={-0.025} back={0.045} edge={0.03} material={m.glassEd} />
        <RetainingRing r={0.41} m={m} />
      </Part>

      {/* Zoom ring: ribbed rubber + amber index line */}
      <Part progress={p} chapter={C} from={[0, 0, 1.05]} to={[0, 0, 2.3]}>
        <Tube rOuter={0.6} rInner={0.56} len={0.26} material={m.rubberRibbed} />
        <RadialInstances count={96} radius={0.603} size={[0.011, 0.02, 0.22]} material={m.rubber} />
        <mesh position={[0, 0, 0.135]} material={m.amber}>
          <torusGeometry args={[0.598, 0.008, 8, 96]} />
        </mesh>
      </Part>

      {/* Cemented doublet */}
      <Part progress={p} chapter={C} from={[0, 0, 1.12]} to={[0, 0, 2.65]}>
        <LensElement r={0.46} front={0.05} back={0.02} material={m.glass} position={[0, 0, 0.025]} />
        <LensElement r={0.46} front={-0.02} back={0.015} edge={0.015} material={m.glassEd} position={[0, 0, -0.03]} />
        <RetainingRing r={0.46} m={m} />
      </Part>

      {/* Front barrel: focus ring, name band, filter thread, printed bezel */}
      <Part progress={p} chapter={C} from={[0, 0, 1.32]} to={[0, 0, 3.0]}>
        <Tube rOuter={0.6} rOuterFront={0.645} rInner={0.56} len={0.36} material={m.shell} />
        <Cyl r={0.607} len={0.13} material={m.rubber} position={[0, 0, -0.09]} />
        <RadialInstances count={120} radius={0.612} size={[0.009, 0.018, 0.12]} material={m.rubberRibbed} position={[0, 0, -0.09]} />
        <Cyl r={0.641} len={0.06} material={m.lensName} open spin={2.2} position={[0, 0, 0.09]} />
        <Tube rOuter={0.648} rInner={0.585} len={0.03} material={m.chrome} position={[0, 0, 0.17]} />
        <mesh position={[0, 0, 0.187]} material={m.bezel}>
          <ringGeometry args={[0.52, 0.6, 96]} />
        </mesh>
      </Part>

      <Part progress={p} chapter={C} from={[0, 0, 1.47]} to={[0, 0, 3.4]}>
        <LensElement r={0.53} front={0.075} back={-0.012} edge={0.03} material={m.glass} />
        <RetainingRing r={0.53} m={m} />
      </Part>

      <Tag progress={p} chapter={C} position={[0.55, 0.95, 1.6]}>
        14 thấu kính · 9 lá khẩu · ƒ/2.8
      </Tag>
    </group>
  );
}
