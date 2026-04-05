"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Viewer = dynamic(() => import("./components/Viewer"), { ssr: false });

const MODEL_OBJ = "/model/model.obj";
const MODEL_MTL = "/model/model.mtl";

function ViewerPage() {
  const params = useSearchParams();
  const autoRotate = params.get("autoRotate") === "true";
  const viewParam = params.get("view") as "3d" | "rti" | null;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Viewer
        modelUrl={MODEL_OBJ}
        mtlUrl={MODEL_MTL}
        modelFile={MODEL_OBJ}
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
