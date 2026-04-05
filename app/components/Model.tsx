"use client";

import { useEffect, useMemo } from "react";
import { Center } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-stdlib";

interface ModelProps {
  url: string;
  mtlUrl?: string;
  onLoaded?: () => void;
  flat?: boolean;
}

export default function Model({ url, mtlUrl, onLoaded, flat }: ModelProps) {
  const materials = useLoader(MTLLoader, mtlUrl || "");
  const obj = useLoader(OBJLoader, url, (loader) => {
    if (materials) {
      materials.preload();
      loader.setMaterials(materials);
    }
  });

  const scene = useMemo(() => obj.clone(true), [obj]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    onLoaded?.();
  }, [scene, onLoaded]);

  return (
    <Center rotation={flat ? [-Math.PI / 2, 0, 0] : undefined}>
      <primitive object={scene} />
    </Center>
  );
}
