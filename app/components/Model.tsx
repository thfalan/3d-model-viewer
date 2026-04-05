"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-stdlib";

interface ModelProps {
  url: string;
  mtlUrl?: string;
  onLoaded?: () => void;
  flat?: boolean;
}

export default function Model({ url, mtlUrl, onLoaded, flat }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const materials = useLoader(MTLLoader, mtlUrl || "");
  const obj = useLoader(OBJLoader, url, (loader) => {
    if (materials) {
      materials.preload();
      loader.setMaterials(materials);
    }
  });

  const scene = useMemo(() => obj.clone(true), [obj]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    scene.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 4;
    const scale = targetSize / maxDim;
    scene.scale.setScalar(scale);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const dist = targetSize * 1.8;
    camera.position.set(dist * 0.6, dist * 0.4, dist);
    camera.lookAt(0, 0, 0);

    onLoaded?.();
  }, [scene, camera, onLoaded]);

  return (
    <group ref={groupRef} rotation={flat ? [-Math.PI / 2, 0, 0] : undefined}>
      <primitive object={scene} />
    </group>
  );
}
