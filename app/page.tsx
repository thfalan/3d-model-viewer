"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Viewer = dynamic(() => import("./components/Viewer"), { ssr: false });

const MODEL_FILE = "/model-full.glb";

function ViewerPage() {
  const params = useSearchParams();
  const autoRotate = params.get("autoRotate") === "true";
  const externalModel = params.get("model");
  const viewParam = params.get("view") as "3d" | "rti" | null;

  const modelUrl = externalModel || MODEL_FILE;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Viewer
        modelUrl={modelUrl}
        modelFile={MODEL_FILE}
        autoRotate={autoRotate}
        initialLight={[3, 5, 2]}
        view={viewParam || "both"}
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
