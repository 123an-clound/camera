"use client";

import type { MotionValue } from "framer-motion";
import { Body, FrontPlate } from "./parts/body";
import { Internals } from "./parts/internals";
import { Lens } from "./parts/lens";
import { useCameraMaterials } from "./parts/materials";
import { Sensor } from "./parts/sensor";
import { Shutter } from "./parts/shutter";

// A detailed mirrorless camera built from primitives + runtime canvas textures.
// Front faces +z, the lens axis is z, the grip sits on -x. Each assembly in ./parts
// flies from its assembled to its exploded transform during its chapter's scroll window.
export function CameraModel({ progress }: { progress: MotionValue<number> }) {
  const m = useCameraMaterials();
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
