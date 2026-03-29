"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Viewer = dynamic(() => import("./components/Viewer"), { ssr: false });

const MODEL_VARIANTS = [
  {
    id: "full",
    label: "Full Quality",
    file: "/model-full.glb",
    size: "41 MB",
    desc: "100% geometry with vertex colors, meshopt compressed",
  },
  {
    id: "s50",
    label: "50% Quality",
    file: "/model-s50.glb",
    size: "22 MB",
    desc: "50% simplified with vertex colors, meshopt compressed",
  },
  {
    id: "s25",
    label: "25% Quality",
    file: "/model-s25.glb",
    size: "12 MB",
    desc: "25% simplified with vertex colors, meshopt compressed",
  },
  {
    id: "s10",
    label: "10% Quality",
    file: "/model-s10.glb",
    size: "5.3 MB",
    desc: "10% simplified with vertex colors, meshopt compressed",
  },
];

function ViewerPage() {
  const params = useSearchParams();
  const autoRotate = params.get("autoRotate") === "true";
  const externalModel = params.get("model");

  const [activeVariant, setActiveVariant] = useState(MODEL_VARIANTS[0].id);
  const current = MODEL_VARIANTS.find((v) => v.id === activeVariant)!;
  const modelUrl = externalModel || current.file;

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      {!externalModel && (
        <div style={styles.tabBar}>
          <div style={styles.tabScroll}>
            {MODEL_VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVariant(v.id)}
                style={{
                  ...styles.tab,
                  ...(v.id === activeVariant ? styles.tabActive : {}),
                }}
              >
                <span style={styles.tabLabel}>{v.label}</span>
                <span style={styles.tabSize}>{v.size}</span>
              </button>
            ))}
          </div>
          <div style={styles.tabDesc}>{current.desc}</div>
        </div>
      )}
      <div style={{ flex: 1, position: "relative" }}>
        <Viewer
          key={modelUrl}
          modelUrl={modelUrl}
          autoRotate={autoRotate}
          initialLight={[3, 5, 2]}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ViewerPage />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tabBar: {
    background: "rgba(10, 10, 30, 0.95)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "8px 12px 4px",
    zIndex: 20,
    flexShrink: 0,
  },
  tabScroll: {
    display: "flex",
    gap: 6,
    overflowX: "auto",
    paddingBottom: 4,
  },
  tab: {
    background: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "6px 14px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 2,
    whiteSpace: "nowrap" as const,
    transition: "all 0.15s ease",
    flexShrink: 0,
  },
  tabActive: {
    background: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.5)",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.85)",
  },
  tabSize: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
  },
  tabDesc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    paddingTop: 4,
    paddingBottom: 2,
    paddingLeft: 4,
  },
};
