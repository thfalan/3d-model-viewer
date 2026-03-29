"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Viewer = dynamic(() => import("./components/Viewer"), { ssr: false });

function ViewerPage() {
  const params = useSearchParams();
  const modelUrl = params.get("model") || "/model.glb";
  const autoRotate = params.get("autoRotate") === "true";
  const initialLightX = parseFloat(params.get("lightX") || "3");
  const initialLightY = parseFloat(params.get("lightY") || "5");
  const initialLightZ = parseFloat(params.get("lightZ") || "2");

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Viewer
        modelUrl={modelUrl}
        autoRotate={autoRotate}
        initialLight={[initialLightX, initialLightY, initialLightZ]}
      />
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
