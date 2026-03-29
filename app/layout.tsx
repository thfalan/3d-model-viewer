import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Light Viewer",
  description: "Interactive 3D model viewer with adjustable lighting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
