"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface LightControlProps {
  onChange: (x: number, y: number, z: number) => void;
  initialX?: number;
  initialY?: number;
  initialZ?: number;
  intensity: number;
  onIntensityChange: (v: number) => void;
}

export default function LightControl({
  onChange,
  initialX = 3,
  initialY = 5,
  initialZ = 2,
  intensity,
  onIntensityChange,
}: LightControlProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const radius = 5;
  const normX = initialX / radius;
  const normZ = initialZ / radius;
  const [dotPos, setDotPos] = useState({ x: normX, y: -normZ });

  const updateLight = useCallback(
    (clientX: number, clientY: number) => {
      const pad = padRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const halfSize = rect.width / 2;

      let dx = (clientX - cx) / halfSize;
      let dy = (clientY - cy) / halfSize;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        dx /= dist;
        dy /= dist;
      }

      setDotPos({ x: dx, y: dy });

      const lx = dx * radius;
      const lz = -dy * radius;
      const ly = Math.sqrt(
        Math.max(0, radius * radius - lx * lx - lz * lz)
      );
      onChange(lx, ly, lz);
    },
    [onChange, radius]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateLight(e.clientX, e.clientY);
    },
    [updateLight]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      updateLight(e.clientX, e.clientY);
    },
    [dragging, updateLight]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    const handler = () => setDragging(false);
    window.addEventListener("pointerup", handler);
    return () => window.removeEventListener("pointerup", handler);
  }, []);

  return (
    <div style={styles.panel}>
      <div style={styles.label}>Light Direction</div>
      <div
        ref={padRef}
        style={styles.pad}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div style={styles.crossH} />
        <div style={styles.crossV} />
        <div
          style={{
            ...styles.dot,
            left: `${50 + dotPos.x * 50}%`,
            top: `${50 + dotPos.y * 50}%`,
          }}
        />
      </div>
      <div style={styles.label}>Intensity</div>
      <input
        type="range"
        min="0"
        max="5"
        step="0.1"
        value={intensity}
        onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.value}>{intensity.toFixed(1)}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: "absolute",
    bottom: 20,
    right: 20,
    background: "rgba(10, 10, 30, 0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    zIndex: 10,
    userSelect: "none",
    touchAction: "none",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.5)",
  },
  pad: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
  },
  crossH: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    background: "rgba(255,255,255,0.1)",
  },
  crossV: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 1,
    background: "rgba(255,255,255,0.1)",
  },
  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fbbf24",
    boxShadow: "0 0 12px rgba(251,191,36,0.6)",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none" as const,
  },
  slider: {
    width: 120,
    accentColor: "#fbbf24",
  },
  value: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
};
