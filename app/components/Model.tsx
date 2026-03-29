"use client";

import { useEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  url: string;
  onLoaded?: () => void;
  flat?: boolean;
}

export default function Model({ url, onLoaded, flat }: ModelProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;

    clonedScene.position.sub(center);
    clonedScene.scale.setScalar(scale);
    clonedScene.position.multiplyScalar(scale);

    if (flat) {
      clonedScene.rotation.x = -Math.PI / 2;
    }

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
  }, [clonedScene, flat, onLoaded]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}
