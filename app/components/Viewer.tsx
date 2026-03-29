"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./Model";
import LightControl from "./LightControl";

interface ViewerProps {
  modelUrl: string;
  autoRotate: boolean;
  initialLight: [number, number, number];
}

function LoadingIndicator() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: 2,
        textTransform: "uppercase",
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      Loading model...
    </div>
  );
}

function ModelWithCallback({
  url,
  onLoaded,
}: {
  url: string;
  onLoaded: () => void;
}) {
  return <Model url={url} onLoaded={onLoaded} />;
}

export default function Viewer({
  modelUrl,
  autoRotate,
  initialLight,
}: ViewerProps) {
  const [light, setLight] =
    useState<[number, number, number]>(initialLight);
  const [intensity, setIntensity] = useState(2.0);
  const [loaded, setLoaded] = useState(false);

  const handleLightChange = useCallback((x: number, y: number, z: number) => {
    setLight([x, y, z]);
  }, []);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#1a1a2e" }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight
          position={light}
          intensity={intensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Suspense fallback={null}>
          <ModelWithCallback url={modelUrl} onLoaded={handleLoaded} />
          <Environment preset="studio" environmentIntensity={0.1} />
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.1}
          minDistance={1}
          maxDistance={30}
        />
      </Canvas>

      <Suspense fallback={null}>
        <LightControl
          onChange={handleLightChange}
          initialX={initialLight[0]}
          initialY={initialLight[1]}
          initialZ={initialLight[2]}
          intensity={intensity}
          onIntensityChange={setIntensity}
        />
      </Suspense>

      {!loaded && <LoadingIndicator />}
    </>
  );
}
