"use client";

import { useEffect, useRef, useState } from "react";

interface RTIViewerProps {
  url: string;
}

export default function RTIViewer({ url }: RTIViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.href = "https://unpkg.com/openlime@1.2.6/dist/css/skin.css";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "https://unpkg.com/openlime@1.2.6/dist/css/light.css";
    document.head.appendChild(link2);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/openlime@1.2.6/dist/js/openlime.min.js";
    script.onload = () => {
      const OL = (window as unknown as Record<string, unknown>)
        .OpenLIME as Record<string, new (...args: unknown[]) => unknown>;

      const lime = new OL.Viewer(containerRef.current!, {
        background: "#12121e",
      });
      viewerRef.current = lime;

      const layer = new (OL.Layer as new (opts: object) => { setLight: (l: number[], t: number) => void })({
        type: "rti",
        layout: "image",
        url,
        normals: false,
      });

      (lime as { addLayer: (id: string, l: unknown) => void }).addLayer(
        "rti",
        layer
      );

      (OL as unknown as { Skin: { setUrl: (u: string) => void } }).Skin.setUrl(
        "https://unpkg.com/openlime@1.2.6/dist/skin/skin.svg"
      );

      const ui = new (OL.UIBasic as new (...a: unknown[]) => {
        actions: Record<string, { display: boolean; active: boolean }>;
      })(lime, { showLightDirections: true });

      ui.actions.light.active = true;
      ui.actions.zoomin.display = true;
      ui.actions.zoomout.display = true;

      setLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      link1.remove();
      link2.remove();
      script.remove();
    };
  }, [url]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#12121e",
      }}
    >
      <div
        ref={containerRef}
        className="openlime"
        style={{ width: "100%", height: "100%" }}
      />
      {!loaded && (
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
          }}
        >
          Loading RTI...
        </div>
      )}
    </div>
  );
}
