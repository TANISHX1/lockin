import type { SkillItem } from "@/actions/skills";
import type { ProjectItem } from "@/actions/projects";

export type { SkillItem, ProjectItem };

export type SkillLevel = "beginner" | "intermediate" | "mastered";

export function getSkillLevel(progress: number): SkillLevel {
  if (progress >= 90) return "mastered";
  if (progress >= 50) return "intermediate";
  return "beginner";
}

export function getLevelProgress(level: SkillLevel): number {
  switch (level) {
    case "mastered":
      return 100;
    case "intermediate":
      return 70;
    case "beginner":
    default:
      return 30;
  }
}

export function getNextLevel(currentLevel: SkillLevel): SkillLevel {
  switch (currentLevel) {
    case "beginner":
      return "intermediate";
    case "intermediate":
      return "mastered";
    case "mastered":
      return "beginner";
  }
}

export const LEVEL_CONFIG: Record<
  SkillLevel,
  { label: string; badgeClass: string; dotClass: string }
> = {
  beginner: {
    label: "Beginner",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dotClass: "bg-amber-500",
  },
  intermediate: {
    label: "Intermediate",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    dotClass: "bg-sky-500",
  },
  mastered: {
    label: "Mastered",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
  },
};

export interface SkillCategoryOption {
  id: string;
  name: string;
  level: number;
}

export interface ParentSkillOption {
  id: string;
  name: string;
  iconUrl: string | null;
}
