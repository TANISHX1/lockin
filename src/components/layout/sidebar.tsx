"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  CalendarCheck,
  Award,
  BarChart3,
  Settings,
} from "lucide-react";
import Dock, { DockItemData } from "@/components/ui/dock";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const themeMode = mounted && resolvedTheme === "light" ? "light" : "dark";

  const items: DockItemData[] = React.useMemo(
    () => [
      {
        icon: (
          <div className="w-full h-full flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xs">
            <LayoutDashboard className="w-[52%] h-[52%] stroke-[2.2]" />
          </div>
        ),
        label: "Dashboard",
        active: pathname === "/dashboard",
        onClick: () => router.push("/dashboard"),
        menu: [
          { label: "Dashboard Overview", onClick: () => router.push("/dashboard") },
          { separator: true },
          { label: "Search Knowledge", onClick: () => router.push("/search") },
        ],
      },
      {
        icon: (
          <div className="w-full h-full flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs">
            <BookOpen className="w-[52%] h-[52%] stroke-[2.2]" />
          </div>
        ),
        label: "Resources & Notes",
        active: pathname === "/resources" || pathname.startsWith("/resources"),
        onClick: () => router.push("/resources"),
        menu: [
          { label: "Resources Hub", onClick: () => router.push("/resources") },
          { separator: true },
          { label: "Category Taxonomy", onClick: () => router.push("/settings/categories") },
        ],
      },
      {
        icon: (
          <div className="w-full h-full flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xs">
            <Brain className="w-[52%] h-[52%] stroke-[2.2]" />
          </div>
        ),
        label: "Knowledge Graph",
        active: pathname === "/concepts" || pathname.startsWith("/concepts"),
        onClick: () => router.push("/concepts"),
        menu: [
          { label: "Concepts Graph", onClick: () => router.push("/concepts") },
          { label: "Flashcards Review", onClick: () => router.push("/review") },
        ],
      },
      {
        icon: (
          <div className="w-full h-full flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xs">
            <CalendarCheck className="w-[52%] h-[52%] stroke-[2.2]" />
          </div>
        ),
        label: "Study Planner",
        active: pathname === "/planner" || pathname.startsWith("/planner"),
        onClick: () => router.push("/planner"),
        menu: [
          { label: "Study Schedule", onClick: () => router.push("/planner") },
        ],
      },
      {
        icon: (
          <div className="w-full h-full flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-xs">
            <Award className="w-[52%] h-[52%] stroke-[2.2]" />
          </div>
        ),
        label: "Skills & Projects",
        active: pathname === "/skills" || pathname.startsWith("/skills"),
        onClick: () => router.push("/skills"),
        menu: [
          { label: "Skills Matrix", onClick: () => router.push("/skills") },
        ],
      },
      {
        icon: (
          <div className="w-full h-full flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-xs">
            <BarChart3 className="w-[52%] h-[52%] stroke-[2.2]" />
          </div>
        ),
        label: "Analytics",
        active: pathname === "/analytics" || pathname.startsWith("/analytics"),
        onClick: () => router.push("/analytics"),
      },
      { separator: true },
      {
        icon: (
          <div className="w-full h-full flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-xs">
            <Settings className="w-[52%] h-[52%] stroke-[2.2]" />
          </div>
        ),
        label: "Settings",
        active: pathname === "/settings" || pathname.startsWith("/settings"),
        onClick: () => router.push("/settings"),
        menu: [
          { label: "Preferences", onClick: () => router.push("/settings") },
          { label: "Categories", onClick: () => router.push("/settings/categories") },
        ],
      },
    ],
    [pathname, router]
  );

  return (
    <aside className="hidden md:flex flex-col w-[70px] shrink-0 bg-transparent border-0 border-none h-screen sticky top-0 z-30 select-none items-center justify-center">
      {/* Centered Apple Dock Navigation Engine without boundaries or extra space */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Dock
          items={items}
          position="left"
          theme={themeMode}
          baseItemSize={44}
          magnification={58}
          panelHeight={58}
          distance={150}
          gap={8}
          roundness={0.45}
          bounce={true}
          tiles={true}
          showLabels={true}
          showIndicators={true}
          accentColor="#007AFF"
          badgeColor="#FF3B30"
        />
      </div>
    </aside>
  );
}

export default Sidebar;
