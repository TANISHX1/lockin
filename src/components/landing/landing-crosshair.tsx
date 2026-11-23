"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Crosshair from "@/components/ui/crosshair";

export function LandingCrosshair() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isLight = resolvedTheme === "light";

  return (
    <Crosshair
      color={isLight ? "#007AFF" : "#60a5fa"}
      targetEffect="lock"
      thickness={1}
      opacity={isLight ? 0.65 : 0.75}
      smoothing={0.35}
      showCoordinates={true}
      clickPulse={true}
      targetSelector="a, button, [data-crosshair-target]"
      className="z-[9999]"
    />
  );
}

export default LandingCrosshair;
