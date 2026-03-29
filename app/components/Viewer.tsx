"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./Model";
import LightControl from "./LightControl";
import CopyEmbedButton from "./CopyEmbedButton";

interface ViewerProps {
  modelUrl: string;
  modelFile: string;
  autoRotate: boolean;
  initialLight: [number, number, number];
  view?: "3d" | "rti" | "both";
}

function LoadingOverlay({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        letterSpacing: 2,
        textTransform: "uppercase",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {label}
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 16,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)",
        zIndex: 6,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

export default function Viewer({
  modelUrl,
  modelFile,
  autoRotate,
  initialLight,
  view = "both",
}: ViewerProps) {
  const [rtiLight, setRtiLight] =
    useState<[number, number, number]>(initialLight);
  const [rtiIntensity, setRtiIntensity] = useState(2.0);
  const [loadedLeft, setLoadedLeft] = useState(false);
  const [loadedRight, setLoadedRight] = useState(false);

  const handleRtiLightChange = useCallback(
    (x: number, y: number, z: number) => {
      setRtiLight([x, y, z]);
    },
    []
  );

  const handleLeftLoaded = useCallback(() => setLoadedLeft(true), []);
  const handleRightLoaded = useCallback(() => setLoadedRight(true), []);

  const show3d = view === "both" || view === "3d";
  const showRti = view === "both" || view === "rti";

  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {show3d && (
        <div
          style={{
            flex: 1,
            position: "relative",
            ...(showRti
              ? { borderRight: "1px solid rgba(255,255,255,0.08)" }
              : {}),
          }}
        >
          <PanelLabel>3D View</PanelLabel>
          <CopyEmbedButton view="3d" modelFile={modelFile} />
          <Canvas
            shadows
            camera={{ position: [0, 2, 6], fov: 45 }}
            gl={{ antialias: true, alpha: false }}
            style={{ background: "#1a1a2e" }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[3, 5, 2]}
              intensity={1.5}
              castShadow
            />
            <Suspense fallback={null}>
              <Model url={modelUrl} onLoaded={handleLeftLoaded} />
              <Environment preset="studio" environmentIntensity={0.15} />
            </Suspense>
            <OrbitControls
              target={[0, 0, 0]}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              enableDamping
              dampingFactor={0.1}
              minDistance={1}
              maxDistance={30}
            />
          </Canvas>
          {!loadedLeft && <LoadingOverlay label="Loading model..." />}
        </div>
      )}

      {showRti && (
        <div style={{ flex: 1, position: "relative" }}>
          <PanelLabel>RTI Light View</PanelLabel>
          <CopyEmbedButton view="rti" modelFile={modelFile} />
          <Canvas
            shadows
            camera={{ position: [0, 6, 0.01], fov: 45 }}
            gl={{ antialias: true, alpha: false }}
            style={{ background: "#12121e" }}
          >
            <ambientLight intensity={0.08} />
            <directionalLight
              position={rtiLight}
              intensity={rtiIntensity}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <Suspense fallback={null}>
              <Model url={modelUrl} flat onLoaded={handleRightLoaded} />
            </Suspense>
            <OrbitControls
              target={[0, 0, 0]}
              enableRotate={false}
              enablePan
              enableZoom
              minDistance={2}
              maxDistance={15}
            />
          </Canvas>

          <LightControl
            onChange={handleRtiLightChange}
            initialX={initialLight[0]}
            initialY={initialLight[1]}
            initialZ={initialLight[2]}
            intensity={rtiIntensity}
            onIntensityChange={setRtiIntensity}
          />

          {!loadedRight && <LoadingOverlay label="Loading model..." />}
        </div>
      )}
    </div>
  );
}
