"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, GizmoHelper, GizmoViewport } from "@react-three/drei";
import Model from "./Model";
import CopyEmbedButton from "./CopyEmbedButton";
import RTIViewer from "./RTIViewer";

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
        color: "rgba(0,0,0,0.4)",
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

function PanelLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
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
        color: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.35)",
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
  const [loadedLeft, setLoadedLeft] = useState(false);

  const handleLeftLoaded = useCallback(() => setLoadedLeft(true), []);

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
              ? { borderRight: "1px solid rgba(0,0,0,0.1)" }
              : {}),
          }}
        >
          <PanelLabel dark>3D View</PanelLabel>
          <CopyEmbedButton view="3d" modelFile={modelFile} />
          <Canvas
            shadows
            camera={{ position: [0, 2, 6], fov: 45 }}
            gl={{ antialias: true, alpha: false }}
            style={{ background: "#e8e8ec" }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[3, 5, 2]}
              intensity={1.2}
              castShadow
            />
            <directionalLight position={[-3, 3, -2]} intensity={0.4} />
            <Suspense fallback={null}>
              <Model url={modelUrl} onLoaded={handleLeftLoaded} />
              <Environment preset="studio" environmentIntensity={0.2} />
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
            <GizmoHelper alignment="bottom-left" margin={[60, 60]}>
              <GizmoViewport
                axisColors={["#e74c3c", "#2ecc71", "#3498db"]}
                labelColor="black"
              />
            </GizmoHelper>
            <gridHelper args={[10, 10, "#ccc", "#ddd"]} />
          </Canvas>
          {!loadedLeft && <LoadingOverlay label="Loading model..." />}
        </div>
      )}

      {showRti && (
        <div style={{ flex: 1, position: "relative" }}>
          <PanelLabel>RTI View</PanelLabel>
          <CopyEmbedButton view="rti" modelFile={modelFile} />
          <RTIViewer url="/rti/info.json" />
        </div>
      )}
    </div>
  );
}
