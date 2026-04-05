"use client";

import { useEffect, useMemo } from "react";
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
  const { camera, controls } = useThree();
  const materials = useLoader(MTLLoader, mtlUrl || "");
  const obj = useLoader(OBJLoader, url, (loader) => {
    if (materials) {
      materials.preload();
      loader.setMaterials(materials);
    }
  });

  const centered = useMemo(() => {
    const scene = obj.clone(true);

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;

    const wrapper = new THREE.Group();
    wrapper.add(scene);

    scene.position.set(-center.x, -center.y, -center.z);
    wrapper.scale.setScalar(scale);

    return wrapper;
  }, [obj]);

  useEffect(() => {
    const backMat = new THREE.MeshStandardMaterial({
      color: "#b5a48a",
      side: THREE.BackSide,
      roughness: 0.9,
      metalness: 0,
    });

    const toAdd: { parent: THREE.Object3D; mesh: THREE.Mesh }[] = [];
    centered.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const back = new THREE.Mesh(mesh.geometry, backMat);
        back.position.copy(mesh.position);
        back.rotation.copy(mesh.rotation);
        back.scale.copy(mesh.scale);
        toAdd.push({ parent: mesh.parent || centered, mesh: back });
      }
    });
    for (const { parent, mesh } of toAdd) {
      parent.add(mesh);
    }

    centered.updateMatrixWorld(true);
    const worldBox = new THREE.Box3().setFromObject(centered);
    const worldCenter = worldBox.getCenter(new THREE.Vector3());
    const worldSize = worldBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(worldSize.x, worldSize.y, worldSize.z);

    // Point OrbitControls at the model center so zoom targets it
    const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void };
    if (orbitControls?.target) {
      orbitControls.target.copy(worldCenter);
      orbitControls.update();
    }

    const dist = maxDim * 1.8;
    camera.position.set(
      worldCenter.x + dist * 0.5,
      worldCenter.y + dist * 0.8,
      worldCenter.z + dist
    );
    camera.lookAt(worldCenter);

    onLoaded?.();
  }, [centered, camera, controls, onLoaded]);

  return (
    <group rotation={flat ? [-Math.PI / 2, 0, 0] : [-Math.PI / 2 - Math.PI / 6 + Math.PI / 3, 0, 0]}>
      <primitive object={centered} />
    </group>
  );
}
