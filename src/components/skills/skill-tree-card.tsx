"use client";

import * as React from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Info,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type SkillItem,
  type SkillLevel,
  getSkillLevel,
  getLevelProgress,
  getNextLevel,
  LEVEL_CONFIG,
} from "./skill-types";
import { cn } from "@/lib/utils";

interface SkillTreeCardProps {
  skill: SkillItem; // Represents the Field (e.g. Web Development)
  onEdit: (skill: SkillItem) => void;
  onDelete: (id: string, name: string) => void;
  onAddSubSkill: (parentSkill: SkillItem) => void; // Adds a skill to this field
  onUpdateProgress: (id: string, newProgress: number) => void;
}

export function SkillTreeCard({
  skill,
  onEdit,
  onDelete,
  onAddSubSkill,
  onUpdateProgress,
}: SkillTreeCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  const skillsInField = skill.children || [];
  const hasSkills = skillsInField.length > 0;

  // Determine overall Field level based on its skills (or itself if standalone)
  const fieldLevel: SkillLevel = React.useMemo(() => {
    if (hasSkills) {
      const allLevels = skillsInField.map((s) => getSkillLevel(s.progress));
      if (allLevels.every((l) => l === "mastered")) return "mastered";
      if (allLevels.some((l) => l === "mastered" || l === "intermediate")) return "intermediate";
      return "beginner";
    }
    return getSkillLevel(skill.progress);
  }, [hasSkills, skillsInField, skill.progress]);

  const fieldLevelConfig = LEVEL_CONFIG[fieldLevel];

  return (
    <div className="rounded-2xl border-0 bg-transparent hover:bg-surface/20 transition-all duration-200">
      {/* 1. Click-to-Expand Field Header Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Chevron indicator */}
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-secondary group-hover:text-foreground transition-transform">
            <ChevronRight
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isExpanded && "rotate-90 text-accent"
              )}
            />
          </div>

          {/* Field Domain Icon Squircle */}
          <div className="w-9 h-9 rounded-xl bg-surface-secondary border border-border/70 flex items-center justify-center shrink-0 p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
            {skill.iconUrl && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={skill.iconUrl}
                alt={skill.name}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <Award className="w-4 h-4 text-accent" />
            )}
          </div>

          {/* Field Name & Skills Count */}
          <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[14.5px] font-semibold text-foreground tracking-tight group-hover:text-accent transition-colors truncate">
              {skill.name}
            </h3>

            <span className="text-[11px] font-medium text-secondary px-2 py-0.5 rounded-full bg-muted-bg border border-border/40">
              {skillsInField.length} {skillsInField.length === 1 ? "skill" : "skills"}
            </span>

            {/* Field Level Pill */}
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border",
                fieldLevelConfig.badgeClass
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", fieldLevelConfig.dotClass)} />
              <span>{fieldLevelConfig.label}</span>
            </span>
          </div>
        </div>

        {/* Quick Action Toolbar (stopPropagation to prevent toggling collapse) */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 rounded-xl text-xs font-medium text-accent hover:bg-accent-tint/30 flex items-center gap-1 cursor-pointer"
            onClick={() => onAddSubSkill(skill)}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add skill</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl text-secondary hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
            onClick={() => onEdit(skill)}
            title="Edit field"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl text-secondary hover:text-danger hover:bg-danger-tint/20 transition-colors cursor-pointer"
            onClick={() => onDelete(skill.id, skill.name)}
            title="Delete field"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Expanded List Hierarchy of Skills (2 Skills per Row) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 sm:px-6">
          <div className="border-l-2 border-border/50 pl-3 sm:pl-5 ml-2.5 sm:ml-4">
            {skillsInField.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {skillsInField.map((subSkill) => {
                  const subLevel = getSkillLevel(subSkill.progress);
                  const subConfig = LEVEL_CONFIG[subLevel];

                  return (
                    <div
                      key={subSkill.id}
                      className="group/item relative flex items-center justify-between gap-2.5 py-2 px-3 rounded-xl transition-all bg-surface/30 hover:bg-surface border border-border/30 hover:border-border/60 shadow-2xs"
                    >
                      {/* Tech Logo + Skill Name */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 relative">
                        <div className="w-7 h-7 rounded-lg bg-surface border border-border/60 flex items-center justify-center shrink-0 p-1 shadow-2xs">
                          {subSkill.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={subSkill.iconUrl}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-accent">
                              {subSkill.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <span className="text-[13px] font-medium text-foreground truncate cursor-help">
                          {subSkill.name}
                        </span>

                        {/* Description: Shown ONLY on Hover (Solid Opaque Background, High Contrast, Shadow) */}
                        {subSkill.description && (
                          <div className="pointer-events-none absolute left-0 bottom-full mb-2 w-64 sm:w-72 p-3 bg-surface-secondary text-foreground text-[12px] leading-relaxed rounded-xl shadow-2xl border border-border opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
                            <div className="font-semibold text-foreground text-[12px] mb-1 flex items-center gap-1.5 pb-1 border-b border-border/50">
                              <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span>{subSkill.name}</span>
                            </div>
                            <p className="text-secondary text-[11.5px] leading-relaxed mt-1">
                              {subSkill.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Level Pill: Beginner / Intermediate / Mastered (Click to cycle level) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextLevel = getNextLevel(subLevel);
                            onUpdateProgress(subSkill.id, getLevelProgress(nextLevel));
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer hover:opacity-85 active:scale-95 shadow-2xs",
                            subConfig.badgeClass
                          )}
                          title={`Current: ${subConfig.label} (Click to toggle)`}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", subConfig.dotClass)} />
                          <span>{subConfig.label}</span>
                        </button>

                        {/* Delete Skill Action (visible on hover) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(subSkill.id, subSkill.name);
                          }}
                          className="w-6 h-6 rounded-md text-muted hover:text-danger hover:bg-danger-tint/20 flex items-center justify-center transition-colors opacity-0 group-hover/item:opacity-100 cursor-pointer"
                          title={`Delete ${subSkill.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-3 px-3 rounded-xl border border-dashed border-border/70 text-xs text-muted flex items-center justify-between">
                <span>No skills nested in this field yet.</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddSubSkill(skill)}
                  className="h-7 text-xs rounded-lg gap-1 border-border"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add skill</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
