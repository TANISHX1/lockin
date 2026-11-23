"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Topography from "@/components/ui/topography";
import { Compass, Sparkles, Layers, Sliders } from "lucide-react";

export function TopographyShowcase() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeEffect, setActiveEffect] = useState<"lift" | "trace" | "light">("lift");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  return (
    <section className="w-full my-12 sm:my-16">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/50 text-[12px] font-medium text-secondary">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>Interactive Terrain Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Explore your knowledge landscape
          </h2>
          <p className="text-sm text-secondary max-w-lg leading-relaxed">
            Move your cursor across the terrain to lift ridges, trigger light pulses with clicks, and map your learning topography.
          </p>
        </div>

        {/* Hover Effect Quick Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-surface border border-border/80 text-xs shrink-0 shadow-2xs">
          {(["lift", "trace", "light"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setActiveEffect(mode)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                activeEffect === mode
                  ? "bg-accent text-white shadow-xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              {mode} mode
            </button>
          ))}
        </div>
      </div>

      {/* Main Topography Container (600px height as specified) */}
      <div
        className="w-full h-[450px] sm:h-[550px] md:h-[600px] relative rounded-3xl overflow-hidden border border-border/70 bg-surface/30 shadow-2xl backdrop-blur-xs group"
        style={{ width: "100%", height: "600px", position: "relative" }}
      >
        <Topography
          color={isLight ? "#0066cc" : "#4f7cff"}
          lineCount={22}
          lineWidth={1.2}
          elevation={1}
          foreground={0.2}
          tilt={32}
          speed={0.25}
          direction="forward"
          glow={isLight ? 0.25 : 0.6}
          depthOfField={0.4}
          fog={0.35}
          hoverEffect={activeEffect}
          clickEffect="pulse"
          lightMode={isLight}
        />

        {/* Top-Right Ambient HUD */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 pointer-events-none z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border text-[11.5px] font-medium text-secondary shadow-xs">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span>22 Contour Levels · WebGL2</span>
        </div>

        {/* Bottom Floating Interactive Hint */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 pointer-events-none z-10 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-[12px] font-medium text-secondary shadow-xs">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Click to trigger seismic pulses · Hover to sculpt terrain</span>
        </div>
      </div>
    </section>
  );
}

export default TopographyShowcase;
