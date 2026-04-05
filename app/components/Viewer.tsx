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
  mtlUrl?: string;
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
  mtlUrl,
  modelFile,
  autoRotate,
  view = "both",
}: ViewerProps) {
  const [activeTab, setActiveTab] = useState<"3d" | "rti">(
    view === "rti" ? "rti" : "3d"
  );
  const [loadedModel, setLoadedModel] = useState(false);
  const [ambientIntensity, setAmbientIntensity] = useState(0.3);

  const handleModelLoaded = useCallback(() => setLoadedModel(true), []);

  const isSingleView = view === "3d" || view === "rti";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {!isSingleView && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
          <div style={{ marginLeft: "auto", paddingRight: 12 }}>
            <CopyEmbedButton view={activeTab} modelFile={modelFile} />
          </div>
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
          <Canvas
            shadows
            camera={{ fov: 45 }}
            gl={{ antialias: true, alpha: false }}
          >
            <SceneBackground color="#000000" />
            <ambientLight intensity={ambientIntensity} />
            <directionalLight
              position={[3, 5, 2]}
              intensity={0.6}
              castShadow
            />
            <directionalLight position={[-3, 3, -2]} intensity={0.2} />
            <Suspense fallback={null}>
              <Model url={modelUrl} mtlUrl={mtlUrl} onLoaded={handleModelLoaded} />
              <Environment preset="studio" environmentIntensity={0.1} environmentRotation={[0, 0, 0]} background={false} />
            </Suspense>
            <OrbitControls
              makeDefault
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              enableDamping
              dampingFactor={0.1}
              minDistance={0.5}
              maxDistance={30}
            />
            <GizmoHelper alignment="bottom-left" margin={[60, 60]}>
              <GizmoViewport
                axisColors={["#e74c3c", "#2ecc71", "#3498db"]}
                labelColor="black"
              />
            </GizmoHelper>
            <gridHelper args={[10, 10, "#444", "#333"]} />
          </Canvas>
          {!loadedModel && <LoadingOverlay label="Loading model..." />}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.8)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            <span>Light</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={ambientIntensity}
              onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
              style={{ width: 100, cursor: "pointer", accentColor: "#fbbf24" }}
            />
            <span style={{ minWidth: 28, textAlign: "right" }}>{ambientIntensity.toFixed(1)}</span>
          </div>
        </div>

        {/* RTI panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: (isSingleView ? view === "rti" : activeTab === "rti") ? "block" : "none",
          }}
        >
          <RTIViewer url="/rti/info.json" />
        </div>
      </div>
    </div>
  );
}
