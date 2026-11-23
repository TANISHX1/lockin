"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Topography from "@/components/ui/topography";

export function TopographyBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 3D WebGL Topography Canvas */}
      <Topography
        color={isLight ? "#0066cc" : "#4f7cff"}
        lineCount={26}
        lineWidth={1.2}
        elevation={1.2}
        foreground={0.15}
        tilt={34}
        speed={0.22}
        direction="forward"
        glow={isLight ? 0.35 : 0.75}
        brightness={1.15}
        depthOfField={0.35}
        fog={0.35}
        hoverEffect="lift"
        clickEffect="pulse"
        lightMode={isLight}
        opacity={isLight ? 0.65 : 0.92}
        className="w-full h-full"
      />

      {/* Ambient Gradient Overlays for Readability & Cinematic Apple Aesthetic */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_top] from-transparent via-background/25 to-background/85 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </div>
  );
}

export default TopographyBackground;
