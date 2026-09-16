"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls, useGLTF } from "@react-three/drei";

// No <Stage>/<Environment> here on purpose: their default presets fetch an
// HDRI from a third-party CDN, which our CSP connect-src correctly blocks.
// Plain lights keep the viewer fully self-contained (no external network calls).
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ProductViewer3D({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-3, -2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <Model url={modelUrl} />
          </Bounds>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1.2} enableZoom enablePan={false} />
      </Canvas>
    </div>
  );
}
