"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { CHAPTERS, chapterFocus, explodeAmount, mix3, type Vec3 } from "../explode";

export const HALF_PI = Math.PI / 2;

// A group that flies from its assembled to its exploded transform during its chapter.
export function Part({
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
export function Tag({
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
        className="hidden -translate-y-1/2 items-center gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-primary md:flex"
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

// Cylinder lying along z (the optical axis). `material` may be [side, front, back].
// `spin` rotates it about its own axis (to aim printed text at the viewer).
export function Cyl({
  r,
  r2,
  len,
  material,
  segments = 64,
  position,
  spin = 0,
  open = false,
}: {
  r: number;
  r2?: number;
  len: number;
  material: THREE.Material | THREE.Material[];
  segments?: number;
  position?: Vec3;
  spin?: number;
  open?: boolean;
}) {
  return (
    <group position={position} rotation={[0, 0, spin]}>
      <mesh rotation={[HALF_PI, 0, 0]} material={material}>
        <cylinderGeometry args={[r2 ?? r, r, len, segments, 1, open]} />
      </mesh>
    </group>
  );
}

// Hollow ring/tube along z with small chamfers, built from a lathe profile.
export function Tube({
  rOuter,
  rInner,
  len,
  rOuterFront,
  material,
  position,
  segments = 72,
}: {
  rOuter: number;
  rInner: number;
  len: number;
  rOuterFront?: number;
  material: THREE.Material;
  position?: Vec3;
  segments?: number;
}) {
  const geometry = useMemo(() => {
    const h = len / 2;
    const c = Math.min(0.01, len / 6);
    const front = rOuterFront ?? rOuter;
    const pts = [
      [rInner, -h],
      [rOuter - c, -h],
      [rOuter, -h + c],
      [front, h - c],
      [front - c, h],
      [rInner, h],
      [rInner, -h],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, segments);
  }, [rOuter, rInner, len, rOuterFront, segments]);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  // Lathe revolves around y; turn it so its axis is z.
  return <mesh geometry={geometry} material={material} position={position} rotation={[HALF_PI, 0, 0]} />;
}

// Optical element with curved faces. `front`/`back` are sagitta depths (+ convex, − concave).
export function LensElement({
  r,
  edge = 0.02,
  front = 0.03,
  back = 0.03,
  material,
  position,
}: {
  r: number;
  edge?: number;
  front?: number;
  back?: number;
  material: THREE.Material;
  position?: Vec3;
}) {
  const geometry = useMemo(() => {
    const steps = 18;
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * r;
      pts.push(new THREE.Vector2(x, edge / 2 + front * (1 - (x / r) ** 2)));
    }
    for (let i = steps; i >= 0; i--) {
      const x = (i / steps) * r;
      pts.push(new THREE.Vector2(x, -edge / 2 - back * (1 - (x / r) ** 2)));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, [r, edge, front, back]);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} position={position} rotation={[HALF_PI, 0, 0]} />;
}

// Instanced boxes around a circle in the xy plane (axis z): grip ribs, dial knurling, contacts.
export function RadialInstances({
  count,
  radius,
  size,
  material,
  arc = Math.PI * 2,
  startAngle = 0,
  position,
  rotation,
}: {
  count: number;
  radius: number;
  size: Vec3; // [tangential, radial, along-axis]
  material: THREE.Material;
  arc?: number;
  startAngle?: number;
  position?: Vec3;
  rotation?: Vec3;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const full = Math.abs(arc - Math.PI * 2) < 1e-6;
    for (let i = 0; i < count; i++) {
      const a = startAngle + (full ? (i / count) * arc : (i / Math.max(1, count - 1)) * arc);
      o.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      o.rotation.set(0, 0, a - HALF_PI);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, radius, arc, startAngle]);

  return (
    <group position={position} rotation={rotation}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={material}>
        <boxGeometry args={size} />
      </instancedMesh>
    </group>
  );
}

// Instanced boxes at explicit positions (SMD parts, pads, contacts, fins).
export function BoxInstances({
  items,
  size,
  material,
}: {
  items: Vec3[];
  size: Vec3;
  material: THREE.Material;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    items.forEach((p, i) => {
      o.position.set(...p);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} material={material}>
      <boxGeometry args={size} />
    </instancedMesh>
  );
}

// Slotted screw head facing +z (or -z with `back`).
export function Screw({
  position,
  r = 0.022,
  material,
  slot,
  back = false,
}: {
  position: Vec3;
  r?: number;
  material: THREE.Material;
  slot: THREE.Material;
  back?: boolean;
}) {
  const dir = back ? -1 : 1;
  return (
    <group position={position}>
      <Cyl r={r} len={0.012} material={material} segments={20} />
      <mesh position={[0, 0, dir * 0.007]} rotation={[0, 0, 0.6]} material={slot}>
        <boxGeometry args={[r * 1.7, r * 0.3, 0.004]} />
      </mesh>
    </group>
  );
}

// Coil spring along y.
export function Spring({
  radius,
  length,
  turns,
  wire,
  material,
  position,
}: {
  radius: number;
  length: number;
  turns: number;
  wire: number;
  material: THREE.Material;
  position?: Vec3;
}) {
  const geometry = useMemo(() => {
    class Helix extends THREE.Curve<THREE.Vector3> {
      constructor() {
        super();
      }
      getPoint(t: number, target = new THREE.Vector3()) {
        const a = t * turns * Math.PI * 2;
        return target.set(Math.cos(a) * radius, t * length - length / 2, Math.sin(a) * radius);
      }
    }
    return new THREE.TubeGeometry(new Helix(), turns * 24, wire, 6, false);
  }, [radius, length, turns, wire]);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} position={position} />;
}

// Material slot order for three's BoxGeometry faces: +x, -x, +y, -y, +z, -z.
export function boxFaces(
  base: THREE.Material,
  faces: Partial<Record<"px" | "nx" | "py" | "ny" | "pz" | "nz", THREE.Material>>
) {
  return [faces.px ?? base, faces.nx ?? base, faces.py ?? base, faces.ny ?? base, faces.pz ?? base, faces.nz ?? base];
}
