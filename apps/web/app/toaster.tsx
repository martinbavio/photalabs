"use client";

import dynamic from "next/dynamic";

// Lazy load Toaster to reduce initial bundle size (~15-20KB)
// This component must be a Client Component to use ssr: false
const ToasterComponent = dynamic(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export function Toaster() {
  return (
    <ToasterComponent
      position="bottom-right"
      toastOptions={{
        className: "!bg-bg-panel !text-text-primary !border-border",
        style: {
          background: "#16161A",
          color: "#FAFAF9",
          border: "1px solid #2A2A2E",
          borderRadius: "12px",
        },
      }}
    />
  );
}
