"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";
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

function SceneBackground({ color }: { color: string }) {
  const { scene } = useThree();
  scene.background = new THREE.Color(color);
  return null;
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 28px",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 0.8,
        cursor: "pointer",
        background: active ? "#fff" : "transparent",
        color: active ? "#1a1a2e" : "rgba(255,255,255,0.6)",
        borderWidth: 0,
        borderBottomWidth: 2,
        borderStyle: "solid",
        borderColor: active ? "#fbbf24" : "transparent",
        transition: "all 0.15s ease",
        borderRadius: 0,
      }}
    >
      {children}
    </button>
  );
}

export default function Viewer({
  modelUrl,
  modelFile,
  autoRotate,
  view = "both",
}: ViewerProps) {
  const [activeTab, setActiveTab] = useState<"3d" | "rti">(
    view === "rti" ? "rti" : "3d"
  );
  const [loadedModel, setLoadedModel] = useState(false);

  const handleModelLoaded = useCallback(() => setLoadedModel(true), []);

  const isSingleView = view === "3d" || view === "rti";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {!isSingleView && (
        <div
          style={{
            display: "flex",
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <TabButton active={activeTab === "3d"} onClick={() => setActiveTab("3d")}>
            3D Model
          </TabButton>
          <TabButton active={activeTab === "rti"} onClick={() => setActiveTab("rti")}>
            RTI Viewer
          </TabButton>
        </div>
      )}

      <div style={{ flex: 1, position: "relative" }}>
        {/* 3D panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: (isSingleView ? view === "3d" : activeTab === "3d") ? "block" : "none",
          }}
        >
          <CopyEmbedButton view="3d" modelFile={modelFile} />
          <Canvas
            shadows
            camera={{ position: [0, 2, 6], fov: 45 }}
            gl={{ antialias: true, alpha: false }}
          >
            <SceneBackground color="#e8e8ec" />
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[3, 5, 2]}
              intensity={1.2}
              castShadow
            />
            <directionalLight position={[-3, 3, -2]} intensity={0.4} />
            <Suspense fallback={null}>
              <Model url={modelUrl} onLoaded={handleModelLoaded} />
              <Environment preset="studio" environmentIntensity={0.2} environmentRotation={[0, 0, 0]} background={false} />
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
          {!loadedModel && <LoadingOverlay label="Loading model..." />}
        </div>

        {/* RTI panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: (isSingleView ? view === "rti" : activeTab === "rti") ? "block" : "none",
          }}
        >
          <CopyEmbedButton view="rti" modelFile={modelFile} />
          <RTIViewer url="/rti/info.json" />
        </div>
      </div>
    </div>
  );
}
