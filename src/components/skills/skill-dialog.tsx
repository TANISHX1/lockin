"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSkillSchema, type CreateSkillInput } from "@/lib/validations/skill";
import { createSkillAction, updateSkillAction } from "@/actions/skills";
import { detectSkillIcon } from "@/lib/skill-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, Award, Sparkles, Layers, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillItem, SkillCategoryOption, ParentSkillOption } from "./skill-types";

interface SkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: SkillCategoryOption[];
  parentSkills: ParentSkillOption[];
  editSkill?: SkillItem | null;
  defaultParentId?: string | null;
}

export function SkillDialog(props: SkillDialogProps) {
  if (!props.isOpen) return null;
  return <SkillDialogForm key={props.editSkill?.id ?? props.defaultParentId ?? "new"} {...props} />;
}

function SkillDialogForm({
  onClose,
  onSuccess,
  categories,
  parentSkills,
  editSkill,
  defaultParentId,
}: SkillDialogProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCustomIconInput, setShowCustomIconInput] = React.useState(Boolean(editSkill?.iconUrl));

  const isEditing = Boolean(editSkill);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateSkillInput>({
    resolver: zodResolver(createSkillSchema),
    defaultValues: {
      name: editSkill?.name || "",
      parentId: editSkill?.parentId || defaultParentId || "",
      categoryId: editSkill?.categoryId || "",
      description: editSkill?.description || "",
      iconUrl: editSkill?.iconUrl || "",
      progress: editSkill?.progress ?? 50,
    },
  });

  const skillName = useWatch({ control, name: "name" }) || "";
  const manualIconUrl = useWatch({ control, name: "iconUrl" }) || "";
  const progressValue = useWatch({ control, name: "progress" }) ?? 50;
  const parentIdValue = useWatch({ control, name: "parentId" }) || "";

  // Auto-detected icon
  const detectedIcon = React.useMemo(() => {
    if (manualIconUrl) return manualIconUrl;
    return detectSkillIcon(skillName);
  }, [skillName, manualIconUrl]);

  const currentLevel = React.useMemo(() => {
    if (progressValue >= 90) return "mastered";
    if (progressValue >= 50) return "intermediate";
    return "beginner";
  }, [progressValue]);

  async function onSubmit(data: CreateSkillInput) {
    setIsSubmitting(true);
    setError(null);

    try {
      const finalIconUrl = data.iconUrl || detectSkillIcon(data.name) || null;

      if (isEditing && editSkill) {
        const res = await updateSkillAction({
          id: editSkill.id,
          name: data.name,
          parentId: data.parentId || null,
          categoryId: data.categoryId || null,
          description: data.description || null,
          iconUrl: finalIconUrl,
          progress: data.progress,
        });

        if (!res.ok) {
          setError(res.error || "Failed to update skill");
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await createSkillAction({
          ...data,
          iconUrl: finalIconUrl,
        });

        if (!res.ok) {
          setError(res.error || "Failed to create skill");
          setIsSubmitting(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-[20px] border border-border/80 bg-surface shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h2 className="text-[18px] font-semibold text-foreground tracking-tight">
              {isEditing
                ? parentIdValue
                  ? "Edit Skill"
                  : "Edit Field"
                : parentIdValue
                ? "Add Skill to Field"
                : "Add Knowledge Field"}
            </h2>
            <p className="text-[13px] text-secondary mt-0.5">
              {isEditing
                ? "Update your competency details and level"
                : parentIdValue
                ? "Add a practical skill (e.g. TypeScript, React) into this field"
                : "Create an umbrella domain (e.g. Web Development, AI & ML)"}
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-danger-tint border border-danger/20 text-danger text-[13px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Skill / Field Name & Auto-Icon Preview */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              {parentIdValue ? "Skill name" : "Field name"}
            </label>
            <div className="flex items-center gap-2.5">
              {/* Live Detected Logo Badge */}
              <div className="w-10 h-10 rounded-[10px] bg-surface-secondary border border-border/80 flex items-center justify-center shrink-0 p-1.5 shadow-xs">
                {detectedIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={detectedIcon}
                    alt="Logo"
                    className="w-full h-full object-contain animate-in fade-in duration-200"
                  />
                ) : (
                  <Sparkles className="w-4 h-4 text-muted" />
                )}
              </div>

              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={
                    parentIdValue
                      ? "e.g. TypeScript, React, Next.js, PyTorch, Docker"
                      : "e.g. Web Development, Machine Learning, Systems Programming"
                  }
                  disabled={isSubmitting}
                  {...register("name")}
                  className="h-[40px]"
                />
              </div>
            </div>
            {errors.name && (
              <p className="text-[12px] text-danger">{errors.name.message}</p>
            )}
            {detectedIcon && !manualIconUrl && (
              <p className="text-[11.5px] text-accent flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" />
                Auto-detected tech logo
              </p>
            )}
          </div>

          {/* Hierarchy: Field / Domain selector */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-secondary" />
              Field / Domain
            </label>
            <select
              className="w-full h-[38px] px-3 rounded-[10px] border border-border bg-surface text-foreground text-[13.5px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              disabled={isSubmitting}
              {...register("parentId")}
            >
              <option value="">None (Top-level Field, e.g. Web Development)</option>
              {parentSkills
                .filter((p) => !editSkill || p.id !== editSkill.id)
                .map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    ↳ In Field &quot;{parent.name}&quot;
                  </option>
                ))}
            </select>
            <p className="text-[11.5px] text-muted">
              {parentIdValue
                ? "This skill will be grouped in a list inside the selected field."
                : "Creates a main field card (e.g. Web Development, AI & ML)."}
            </p>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Academic / Subject Category (optional)
            </label>
            <select
              className="w-full h-[38px] px-3 rounded-[10px] border border-border bg-surface text-foreground text-[13.5px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              disabled={isSubmitting}
              {...register("categoryId")}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.level === 1 ? "📁 " : cat.level === 2 ? "  📂 " : "    📄 "}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Competency Level (Beginner / Intermediate / Mastered) */}
          <div className="space-y-2 pt-1">
            <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-accent" />
              Competency Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  level: "beginner" as const,
                  label: "Beginner",
                  val: 30,
                  dot: "bg-amber-500",
                  activeStyle: "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30",
                },
                {
                  level: "intermediate" as const,
                  label: "Intermediate",
                  val: 70,
                  dot: "bg-sky-500",
                  activeStyle: "bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30",
                },
                {
                  level: "mastered" as const,
                  label: "Mastered",
                  val: 100,
                  dot: "bg-emerald-500",
                  activeStyle: "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30",
                },
              ].map((lvl) => {
                const isSelected = currentLevel === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setValue("progress", lvl.val)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      isSelected
                        ? `${lvl.activeStyle} shadow-xs font-bold`
                        : "border-border/70 bg-surface text-secondary hover:text-foreground hover:bg-surface-secondary"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", lvl.dot)} />
                    <span>{lvl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Icon URL Toggle */}
          <div className="pt-1">
            {!showCustomIconInput ? (
              <button
                type="button"
                className="text-[12px] text-secondary hover:text-foreground flex items-center gap-1.5 transition-colors"
                onClick={() => setShowCustomIconInput(true)}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Override with custom icon URL</span>
              </button>
            ) : (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-[12px] font-medium text-secondary">
                  Custom Icon / Logo URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.svg"
                  disabled={isSubmitting}
                  {...register("iconUrl")}
                  className="h-[36px] text-[13px]"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Description / Notes (optional)
            </label>
            <textarea
              className="w-full min-h-[75px] p-3 rounded-[10px] border border-border bg-surface text-foreground text-[13.5px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
              placeholder="Key concepts, APIs, or libraries mastered under this skill..."
              disabled={isSubmitting}
              {...register("description")}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isEditing ? "Save changes" : "Add skill"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
