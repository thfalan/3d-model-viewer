"use client";

import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  url: string;
  onLoaded?: () => void;
}

export default function Model({ url, onLoaded }: ModelProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    onLoaded?.();
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;

    scene.position.sub(center);
    scene.scale.setScalar(scale);
    scene.position.multiplyScalar(scale);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (
          mesh.material instanceof THREE.MeshStandardMaterial ||
          mesh.material instanceof THREE.MeshPhysicalMaterial
        ) {
          mesh.material.roughness = 0.6;
          mesh.material.metalness = 0.1;
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}
