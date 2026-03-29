"use client";

import { useState, useCallback } from "react";

interface CopyEmbedButtonProps {
  view: "3d" | "rti";
  modelFile: string;
}

export default function CopyEmbedButton({
  view,
  modelFile,
}: CopyEmbedButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      view,
      model: modelFile,
    });
    const src = `${origin}/?${params.toString()}`;
    const iframe = `<iframe src="${src}" width="800" height="600" frameborder="0" allowfullscreen style="border:none;"></iframe>`;

    navigator.clipboard.writeText(iframe).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [view, modelFile]);

  return (
    <button onClick={handleCopy} style={styles.btn}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      {copied ? "Copied!" : "Embed"}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: "rgba(255,255,255,0.6)",
    background: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};
