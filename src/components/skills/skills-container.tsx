"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Award,
  TrendingUp,
  FolderGit2,
  Layers,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkillTreeCard } from "./skill-tree-card";
import { SkillDialog } from "./skill-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { ProjectPreviewModal } from "@/components/projects/project-preview-modal";
import {
  deleteSkillAction,
  updateSkillProgressAction,
} from "@/actions/skills";
import { deleteProjectAction } from "@/actions/projects";
import {
  type SkillItem,
  type ProjectItem,
  type SkillCategoryOption,
  type ParentSkillOption,
  getSkillLevel,
} from "./skill-types";
import { cn } from "@/lib/utils";

interface SkillsContainerProps {
  initialSkills: SkillItem[];
  initialProjects: ProjectItem[];
  categories: SkillCategoryOption[];
}

export function SkillsContainer({
  initialSkills,
  initialProjects,
  categories,
}: SkillsContainerProps) {
  const [activeTab, setActiveTab] = React.useState<"skills" | "projects">("skills");
  const [skills, setSkills] = React.useState<SkillItem[]>(initialSkills);
  const [projects, setProjects] = React.useState<ProjectItem[]>(initialProjects);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Skill dialog states
  const [isSkillDialogOpen, setIsSkillDialogOpen] = React.useState(false);
  const [editingSkill, setEditingSkill] = React.useState<SkillItem | null>(null);
  const [defaultParentId, setDefaultParentId] = React.useState<string | null>(null);

  // Project dialog states
  const [isProjectDialogOpen, setIsProjectDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<ProjectItem | null>(null);

  // Live preview modal state
  const [previewProject, setPreviewProject] = React.useState<ProjectItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    isOpen: boolean;
    type: "skill" | "project";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "skill",
    id: "",
    name: "",
  });

  const [prevSkills, setPrevSkills] = React.useState(initialSkills);
  if (prevSkills !== initialSkills) {
    setPrevSkills(initialSkills);
    setSkills(initialSkills);
  }

  const [prevProjects, setPrevProjects] = React.useState(initialProjects);
  if (prevProjects !== initialProjects) {
    setPrevProjects(initialProjects);
    setProjects(initialProjects);
  }

  // Derived parent options for sub-skill creation
  const parentOptions: ParentSkillOption[] = React.useMemo(() => {
    return skills.map((s) => ({
      id: s.id,
      name: s.name,
      iconUrl: s.iconUrl,
    }));
  }, [skills]);

  // Count Beginner, Intermediate, and Mastered across all skills
  const { beginnerCount, intermediateCount, masteredCount, totalSkillsCount } = React.useMemo(() => {
    let beginner = 0;
    let intermediate = 0;
    let mastered = 0;
    let total = 0;

    for (const field of skills) {
      if (field.children && field.children.length > 0) {
        for (const child of field.children) {
          total++;
          const level = getSkillLevel(child.progress);
          if (level === "mastered") mastered++;
          else if (level === "intermediate") intermediate++;
          else beginner++;
        }
      } else {
        total++;
        const level = getSkillLevel(field.progress);
        if (level === "mastered") mastered++;
        else if (level === "intermediate") intermediate++;
        else beginner++;
      }
    }

    return {
      beginnerCount: beginner,
      intermediateCount: intermediate,
      masteredCount: mastered,
      totalSkillsCount: total,
    };
  }, [skills]);

  // Filter skills
  const filteredSkills = React.useMemo(() => {
    return skills.filter((skill) => {
      const matchQuery =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (skill.description &&
          skill.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (skill.children &&
          skill.children.some(
            (c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
          ));

      const matchCat =
        selectedCategory === "all" ||
        (selectedCategory === "uncategorized"
          ? !skill.categoryId
          : skill.categoryId === selectedCategory);

      return matchQuery && matchCat;
    });
  }, [skills, searchQuery, selectedCategory]);

  // Filter projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const matchQuery =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        project.skills.some((s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchQuery;
    });
  }, [projects, searchQuery]);

  // Skill actions
  const handleAddParentSkill = () => {
    setEditingSkill(null);
    setDefaultParentId(null);
    setIsSkillDialogOpen(true);
  };

  const handleAddSubSkill = (parent: SkillItem) => {
    setEditingSkill(null);
    setDefaultParentId(parent.id);
    setIsSkillDialogOpen(true);
  };

  const handleEditSkill = (skill: SkillItem) => {
    setEditingSkill(skill);
    setDefaultParentId(skill.parentId || null);
    setIsSkillDialogOpen(true);
  };

  const triggerDeleteSkill = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: "skill",
      id,
      name,
    });
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    // Optimistic UI update for top-level or sub-skills
    setSkills((prev) =>
      prev.map((parent) => {
        if (parent.id === id) {
          return { ...parent, progress: newProgress };
        }
        if (parent.children) {
          const updatedChildren = parent.children.map((child) =>
            child.id === id ? { ...child, progress: newProgress } : child
          );
          // Recalculate parent average
          const avg =
            updatedChildren.length > 0
              ? Math.round(
                  updatedChildren.reduce((a, b) => a + b.progress, 0) /
                    updatedChildren.length
                )
              : parent.progress;
          return { ...parent, progress: avg, children: updatedChildren };
        }
        return parent;
      })
    );
    await updateSkillProgressAction({ id, progress: newProgress });
  };

  // Project actions
  const handleAddProject = () => {
    setEditingProject(null);
    setIsProjectDialogOpen(true);
  };

  const handleEditProject = (project: ProjectItem) => {
    setEditingProject(project);
    setIsProjectDialogOpen(true);
  };

  const triggerDeleteProject = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: "project",
      id,
      name,
    });
  };

  const handlePreviewProject = (project: ProjectItem) => {
    setPreviewProject(project);
    setIsPreviewOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirm.type === "skill") {
      setSkills((prev) =>
        prev
          .filter((s) => s.id !== deleteConfirm.id)
          .map((parent) => ({
            ...parent,
            children: (parent.children || []).filter((c) => c.id !== deleteConfirm.id),
          }))
      );
      await deleteSkillAction({ id: deleteConfirm.id });
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      await deleteProjectAction({ id: deleteConfirm.id });
    }
    setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Competency Metric Bar (Synchronized with Background & Single Box Breakdown) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1 bg-transparent border-0">
        {/* Fields & Skills Overview */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-tint text-accent">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              Skills Matrix
            </div>
            <div className="text-lg font-bold text-foreground">
              {totalSkillsCount} {totalSkillsCount === 1 ? "Skill" : "Skills"}{" "}
              <span className="text-xs font-normal text-secondary">
                in {skills.length} {skills.length === 1 ? "field" : "fields"}
              </span>
            </div>
          </div>
        </div>

        {/* Single Box: Beginner, Intermediate, Mastered Counts */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 rounded-2xl bg-surface/50 border border-border/50">
          {/* Beginner Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium">Beginner:</span>
            <span className="text-xs font-bold">{beginnerCount}</span>
          </div>

          {/* Intermediate Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-xs font-medium">Intermediate:</span>
            <span className="text-xs font-bold">{intermediateCount}</span>
          </div>

          {/* Mastered Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium">Mastered:</span>
            <span className="text-xs font-bold">{masteredCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Synchronized with Background */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 py-1 bg-transparent border-0">
        {/* Apple Segmented Control Tab Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-surface/50 border border-border/50 shrink-0">
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer",
              activeTab === "skills"
                ? "bg-surface text-accent font-semibold shadow-xs border border-border/50"
                : "text-secondary hover:text-foreground"
            )}
            onClick={() => setActiveTab("skills")}
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Skills Matrix</span>
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer",
              activeTab === "projects"
                ? "bg-surface text-purple font-semibold shadow-xs border border-border/50"
                : "text-secondary hover:text-foreground"
            )}
            onClick={() => setActiveTab("projects")}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-purple" />
            <span>Projects & Demos</span>
          </button>
        </div>

        {/* Search, Filter & Actions */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              type="text"
              placeholder={
                activeTab === "skills"
                  ? "Search fields & skills..."
                  : "Search projects, repos..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-[38px] rounded-xl text-xs bg-surface border-border"
            />
          </div>

          {activeTab === "skills" && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-[38px] px-3 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent shrink-0 hidden sm:block"
            >
              <option value="all">All Domains / Categories</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === "skills" ? (
            <Button
              onClick={handleAddParentSkill}
              className="h-[38px] rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field</span>
            </Button>
          ) : (
            <Button
              onClick={handleAddProject}
              className="h-[38px] rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area: Click-to-Expand List Hierarchy */}
      {activeTab === "skills" ? (
        filteredSkills.length > 0 ? (
          <div className="space-y-3">
            {filteredSkills.map((skill) => (
              <SkillTreeCard
                key={skill.id}
                skill={skill}
                onEdit={handleEditSkill}
                onDelete={triggerDeleteSkill}
                onAddSubSkill={handleAddSubSkill}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-surface p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-tint text-accent flex items-center justify-center mx-auto border border-accent/20">
              <Award className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
                {searchQuery ? "No matching fields or skills" : "No knowledge fields tracked yet"}
              </h3>
              <p className="text-[13px] text-secondary leading-relaxed">
                {searchQuery
                  ? "Try searching for a different keyword or domain."
                  : "Add your fields (e.g. Web Development, AI & ML) and organize practical skills under each field."}
              </p>
            </div>
            {!searchQuery && (
              <Button onClick={handleAddParentSkill} className="rounded-xl mt-2">
                <Plus className="w-4 h-4 mr-1.5" />
                Add your first field
              </Button>
            )}
          </div>
        )
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPreview={handlePreviewProject}
              onEdit={handleEditProject}
              onDelete={triggerDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-border/80 bg-surface p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-tint text-purple flex items-center justify-center mx-auto border border-purple/20">
            <FolderGit2 className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
              {searchQuery ? "No matching projects" : "No projects showcased yet"}
            </h3>
            <p className="text-[13px] text-secondary leading-relaxed">
              {searchQuery
                ? "Try searching for a different keyword or repository name."
                : "Add your GitHub repositories and live deployed applications to enable interactive live in-app preview."}
            </p>
          </div>
          {!searchQuery && (
            <Button onClick={handleAddProject} className="rounded-xl mt-2">
              <Plus className="w-4 h-4 mr-1.5" />
              Add your first project
            </Button>
          )}
        </div>
      )}

      {/* Modals & Dialogs */}
      <SkillDialog
        isOpen={isSkillDialogOpen}
        onClose={() => setIsSkillDialogOpen(false)}
        onSuccess={() => window.location.reload()}
        categories={categories}
        parentSkills={parentOptions}
        editSkill={editingSkill}
        defaultParentId={defaultParentId}
      />

      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        onSuccess={() => window.location.reload()}
        availableSkills={skills}
        editProject={editingProject}
      />

      <ProjectPreviewModal
        project={previewProject}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative w-full max-w-sm rounded-[18px] border border-border bg-surface p-6 shadow-2xl z-10 space-y-4 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-danger-tint text-danger flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[16px] font-semibold text-foreground">
                Delete {deleteConfirm.type === "skill" ? "skill" : "project"}?
              </h4>
              <p className="text-[13px] text-secondary leading-relaxed">
                Are you sure you want to delete &quot;{deleteConfirm.name}&quot;?
                {deleteConfirm.type === "skill" &&
                  " Any nested sub-skills will also be removed."}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
