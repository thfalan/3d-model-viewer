"use client";

import { useEffect, useMemo } from "react";
import { Center } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { MeshoptDecoder } from "meshoptimizer";


interface ModelProps {
  url: string;
  onLoaded?: () => void;
  flat?: boolean;
}

export default function Model({ url, onLoaded, flat }: ModelProps) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    const dracoLoader = new (
      require("three-stdlib").DRACOLoader
    )() as InstanceType<typeof import("three-stdlib").DRACOLoader>;
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
    );
    loader.setDRACOLoader(dracoLoader);
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

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
