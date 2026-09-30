"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { CameraModel } from "./camera-model";
import { sampleKeyframes, type Vec3 } from "./explode";

type Frames = readonly { at: number; value: Vec3 }[];

// Whole-camera orientation per chapter so each group of parts is seen from its best angle.
const ROTATION: Frames = [
  { at: 0.0, value: [0.12, 0.5, 0] },
  { at: 0.08, value: [0.12, 0.5, 0] },
  { at: 0.24, value: [0.15, 1.0, 0] }, // lens: side view, elements spread to the right
  { at: 0.3, value: [0.15, 1.0, 0] },
  { at: 0.42, value: [0.22, 0.35, 0] }, // shutter slides out the side
  { at: 0.48, value: [0.22, 0.35, 0] },
  { at: 0.6, value: [-0.2, 0.3, 0] }, // sensor drops below, look slightly up
  { at: 0.66, value: [-0.2, 0.3, 0] },
  { at: 0.78, value: [0.25, 2.55, 0] }, // internals: three-quarter back view
  { at: 0.86, value: [0.25, 2.55, 0] },
  { at: 0.97, value: [0.05, 0, 0] }, // outro: lens faces the viewer
];

// Desktop keeps the camera right of the HUD copy; narrow screens centre it above the copy.
const POSITION_WIDE: Frames = [
  { at: 0.0, value: [1.3, -0.1, 0] },
  { at: 0.08, value: [1.3, -0.1, 0] },
  { at: 0.24, value: [0.2, 0, 0] },
  { at: 0.3, value: [0.2, 0, 0] },
  { at: 0.42, value: [1.0, -0.55, 0] },
  { at: 0.48, value: [1.0, -0.55, 0] },
  { at: 0.6, value: [1.3, 0.25, 0] },
  { at: 0.78, value: [1.3, -0.05, 0] },
  { at: 0.86, value: [1.3, -0.05, 0] },
  { at: 0.97, value: [1.4, -0.1, 0] },
];
const POSITION_NARROW: Frames = [
  { at: 0.0, value: [0, 0.7, 0] },
  { at: 0.24, value: [-0.6, 0.8, 0] },
  { at: 0.3, value: [-0.6, 0.8, 0] },
  { at: 0.42, value: [-0.3, 0.8, 0] },
  { at: 0.6, value: [0, 1.0, 0] },
  { at: 0.86, value: [0, 0.9, 0] },
  { at: 0.97, value: [0, 0.8, 0] },
];

// Uniform scale (x only is used): shrink while exploded so parts stay on screen.
const SCALE: Frames = [
  { at: 0.0, value: [1, 0, 0] },
  { at: 0.08, value: [1, 0, 0] },
  { at: 0.24, value: [0.72, 0, 0] },
  { at: 0.3, value: [0.72, 0, 0] },
  { at: 0.42, value: [0.8, 0, 0] },
  { at: 0.78, value: [0.7, 0, 0] },
  { at: 0.86, value: [0.7, 0, 0] },
  { at: 0.97, value: [0.95, 0, 0] },
];

function Rig({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.Group>(null);
  const narrow = useThree((s) => s.viewport.aspect < 0.9);
  const tilt = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const p = progress.get();
    const [rx, ry] = sampleKeyframes(p, ROTATION);
    // Damped pointer parallax on top of the scripted orientation.
    const k = 1 - Math.exp(-delta * 4);
    tilt.current.x += (-state.pointer.y * 0.12 - tilt.current.x) * k;
    tilt.current.y += (state.pointer.x * 0.2 - tilt.current.y) * k;
    g.rotation.set(rx + tilt.current.x, ry + tilt.current.y, 0);

    const pos = sampleKeyframes(p, narrow ? POSITION_NARROW : POSITION_WIDE);
    g.position.set(pos[0], pos[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.04, pos[2]);
    g.scale.setScalar(sampleKeyframes(p, SCALE)[0] * (narrow ? 0.55 : 1));
  });

  return (
    <group ref={ref}>
      <CameraModel progress={progress} />
    </group>
  );
}

export default function CameraScene({ progress, active }: { progress: MotionValue<number>; active: boolean }) {
  return (
    <Canvas
      aria-hidden
      camera={{ position: [0, 0, 7.5], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      frameloop={active ? "always" : "never"}
    >
      {/* Plain lights only: <Environment> presets fetch HDRIs from a CDN the CSP blocks. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 6]} intensity={2.8} />
      <directionalLight position={[0, 0.5, 8]} intensity={0.8} />
      <directionalLight position={[-5, 1, 3]} intensity={0.5} color="#9cc4ff" />
      <directionalLight position={[-3, 2, -5]} intensity={2.4} color="#f5a524" />
      <pointLight position={[2, -2, 3]} intensity={6} color="#f5a524" distance={8} />
      <Rig progress={progress} />
      <Sparkles count={40} scale={[8, 5, 4]} size={2} speed={0.25} opacity={0.35} color="#f5a524" />
    </Canvas>
  );
}
