"use client";

import { useEffect, useMemo } from "react";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  url: string;
  onLoaded?: () => void;
  flat?: boolean;
}

export default function Model({ url, onLoaded, flat }: ModelProps) {
  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else {
          mesh.material = mesh.material.clone();
        }
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const mat of mats) {
          if (
            mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial
          ) {
            mat.roughness = 0.6;
            mat.metalness = 0.1;
          }
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    onLoaded?.();
  }, [clonedScene, onLoaded]);

  return (
    <Center rotation={flat ? [-Math.PI / 2, 0, 0] : undefined}>
      <primitive object={clonedScene} />
    </Center>
  );
}
