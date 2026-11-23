"use client";

import * as React from "react";
import type { ResourceItem } from "@/actions/resources";
import type { CategoryNode } from "@/actions/categories";
import type { ResourceStatus, ResourceType } from "@/lib/validations/resource";
import { ResourceCard } from "./resource-card";
import { ResourceTable } from "./resource-table";
import { ResourceDialog, type ResourceFormData } from "./resource-dialog";
import { ResourceViewModal } from "./resource-view-modal";
import { RESOURCE_TYPES, RESOURCE_STATUSES } from "./resource-types";
import {
  createResourceAction,
  updateResourceAction,
  deleteResourceAction,
  updateResourceStatusAction,
  toggleFavoriteAction,
  toggleResourceVisibilityAction,
} from "@/actions/resources";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Lock,
  Globe,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  FolderTree,
  ChevronRight,
  Star,
  SlidersHorizontal,
  Bookmark,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SectionScope = "private" | "public" | "all";
export type ViewMode = "hierarchy" | "grid" | "table";

interface ResourcesContainerProps {
  initialMyResources: ResourceItem[];
  initialPublicResources: ResourceItem[];
  categories: CategoryNode[];
  currentUserId: string;
}

export function ResourcesContainer({
  initialMyResources,
  initialPublicResources,
  categories,
  currentUserId,
}: ResourcesContainerProps) {
  const router = useRouter();

  // Primary Scope Section: Private (My Vault) vs Public (Community) vs All My Items
  const [activeScope, setActiveScope] = React.useState<SectionScope>("private");
  const [viewMode, setViewMode] = React.useState<ViewMode>("hierarchy");

  // State collections
  const [myResources, setMyResources] = React.useState<ResourceItem[]>(initialMyResources);
  const [publicResources, setPublicResources] = React.useState<ResourceItem[]>(initialPublicResources);

  // Sync state if server props change
  React.useEffect(() => {
    setMyResources(initialMyResources);
  }, [initialMyResources]);

  React.useEffect(() => {
    setPublicResources(initialPublicResources);
  }, [initialPublicResources]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<ResourceType | "ALL">("ALL");
  const [onlyFavorites, setOnlyFavorites] = React.useState(false);

  // Category visual hierarchy selection
  const [selectedFieldId, setSelectedFieldId] = React.useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null);

  // Modals state
  const [isResourceDialogOpen, setIsResourceDialogOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<ResourceItem | null>(null);
  const [defaultCategoryForNew, setDefaultCategoryForNew] = React.useState<string | null>(null);
  const [defaultIsPublicForNew, setDefaultIsPublicForNew] = React.useState(false);
  const [viewingResource, setViewingResource] = React.useState<ResourceItem | null>(null);

  // Computed counts for the section tabs
  const privateCount = React.useMemo(
    () => myResources.filter((r) => !r.isPublic).length,
    [myResources]
  );
  const publicCount = React.useMemo(
    () => publicResources.length,
    [publicResources]
  );
  const myTotalCount = React.useMemo(
    () => myResources.length,
    [myResources]
  );

  // Active pool of resources based on section scope
  const scopedResources = React.useMemo(() => {
    if (activeScope === "private") {
      return myResources.filter((r) => !r.isPublic);
    }
    if (activeScope === "public") {
      return publicResources;
    }
    // "all" - All items created by user
    return myResources;
  }, [activeScope, myResources, publicResources]);

  // Secondary sub-categories (Subjects) under selected Field
  const activeField = React.useMemo(
    () => categories.find((c) => c.id === selectedFieldId) || null,
    [categories, selectedFieldId]
  );

  const availableSubjects = React.useMemo(
    () => activeField?.children || [],
    [activeField]
  );

  // Filtered resources based on search, category hierarchy, type, status, and favorites
  const filteredResources = React.useMemo(() => {
    return scopedResources.filter((r) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesAuthor = r.author?.toLowerCase().includes(q) || false;
        const matchesNotes = r.notes?.toLowerCase().includes(q) || false;
        const matchesSummary = r.summary?.toLowerCase().includes(q) || false;
        const matchesTags = r.tags.some((t) => t.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthor && !matchesNotes && !matchesSummary && !matchesTags) {
          return false;
        }
      }

      // 2. Category Hierarchy Filter
      if (selectedSubjectId) {
        if (r.category?.id !== selectedSubjectId && r.category?.parent?.id !== selectedSubjectId) {
          return false;
        }
      } else if (selectedFieldId) {
        const catId = r.category?.id;
        const parentId = r.category?.parent?.id;
        const grandParentId = r.category?.parent?.parent?.id;
        if (
          catId !== selectedFieldId &&
          parentId !== selectedFieldId &&
          grandParentId !== selectedFieldId
        ) {
          return false;
        }
      }

      // 3. Type Filter
      if (selectedType !== "ALL" && r.type !== selectedType) {
        return false;
      }

      // 4. Favorites Filter
      if (onlyFavorites && !r.isFavorite) {
        return false;
      }

      return true;
    });
  }, [
    scopedResources,
    searchQuery,
    selectedFieldId,
    selectedSubjectId,
    selectedType,
    onlyFavorites,
  ]);

  // Grouped by Category Hierarchy for the "hierarchy" ViewMode
  const hierarchyGroups = React.useMemo(() => {
    interface CategoryGroup {
      id: string;
      title: string;
      levelName: string;
      level: number;
      resources: ResourceItem[];
    }

    const groupsMap = new Map<string, CategoryGroup>();
    const unfiled: ResourceItem[] = [];

    // Initialize groups for current categories to preserve hierarchy
    for (const cat of categories) {
      groupsMap.set(cat.id, {
        id: cat.id,
        title: cat.name,
        levelName: "Field",
        level: cat.level,
        resources: [],
      });
      if (cat.children) {
        for (const sub of cat.children) {
          groupsMap.set(sub.id, {
            id: sub.id,
            title: `${cat.name} › ${sub.name}`,
            levelName: "Subject",
            level: sub.level,
            resources: [],
          });
        }
      }
    }

    for (const item of filteredResources) {
      if (!item.category) {
        unfiled.push(item);
      } else {
        // Find best matching group
        const targetId = item.category.id;
        if (groupsMap.has(targetId)) {
          groupsMap.get(targetId)!.resources.push(item);
        } else if (item.category.parent && groupsMap.has(item.category.parent.id)) {
          groupsMap.get(item.category.parent.id)!.resources.push(item);
        } else {
          // Dynamic category group fallback
          const key = item.category.name;
          if (!groupsMap.has(key)) {
            groupsMap.set(key, {
              id: key,
              title: item.category.name,
              levelName: "Category",
              level: item.category.level,
              resources: [],
            });
          }
          groupsMap.get(key)!.resources.push(item);
        }
      }
    }

    // Only return groups with items
    const populated = Array.from(groupsMap.values()).filter((g) => g.resources.length > 0);

    if (unfiled.length > 0) {
      populated.push({
        id: "unfiled",
        title: "Uncategorized Resources",
        levelName: "General",
        level: 0,
        resources: unfiled,
      });
    }

    return populated;
  }, [categories, filteredResources]);

  // Action: Open Add Resource
  const handleOpenAddResource = (defaultCatId?: string | null) => {
    setEditingResource(null);
    setDefaultCategoryForNew(defaultCatId ?? selectedSubjectId ?? selectedFieldId ?? null);
    setDefaultIsPublicForNew(activeScope === "public");
    setIsResourceDialogOpen(true);
  };

  // Action: Open Edit Resource
  const handleOpenEditResource = (resource: ResourceItem) => {
    setEditingResource(resource);
    setIsResourceDialogOpen(true);
  };

  // Action: Save (Create or Update)
  const handleSaveResource = async (formData: ResourceFormData) => {
    if (formData.id) {
      // Update
      const res = await updateResourceAction({
        id: formData.id,
        title: formData.title,
        url: formData.url,
        type: formData.type,
        status: formData.status,
        categoryId: formData.categoryId,
        author: formData.author,
        estimatedMinutes: formData.estimatedMinutes,
        actualMinutes: formData.actualMinutes,
        isFavorite: formData.isFavorite,
        isPublic: formData.isPublic,
        notes: formData.notes,
        summary: formData.summary,
      });

      if (res.ok) {
        const updater = (prev: ResourceItem[]) =>
          prev.map((r) => {
            if (r.id === formData.id) {
              const matchedCat = categories.find((c) => c.id === formData.categoryId);
              return {
                ...r,
                title: formData.title,
                url: formData.url || null,
                type: formData.type,
                status: formData.status,
                author: formData.author || null,
                estimatedMinutes: formData.estimatedMinutes || null,
                isFavorite: formData.isFavorite || false,
                isPublic: formData.isPublic || false,
                notes: formData.notes || null,
                category: matchedCat
                  ? { id: matchedCat.id, name: matchedCat.name, level: matchedCat.level, parent: null }
                  : r.category,
                updatedAt: new Date(),
              };
            }
            return r;
          });

        setMyResources(updater);
        setPublicResources((prev) => {
          const exists = prev.some((r) => r.id === formData.id);
          if (formData.isPublic) {
            return exists ? updater(prev) : [...updater(myResources.filter((r) => r.id === formData.id)), ...prev];
          }
          return prev.filter((r) => r.id !== formData.id);
        });

        router.refresh();
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } else {
      // Create
      const res = await createResourceAction({
        title: formData.title,
        url: formData.url,
        type: formData.type,
        status: formData.status,
        categoryId: formData.categoryId,
        author: formData.author,
        estimatedMinutes: formData.estimatedMinutes,
        actualMinutes: formData.actualMinutes || 0,
        isFavorite: formData.isFavorite || false,
        isPublic: formData.isPublic || false,
        notes: formData.notes,
        summary: formData.summary,
      });

      if (res.ok && res.data) {
        const newId = res.data.id;
        const matchedCat = categories.find((c) => c.id === formData.categoryId);
        const newItem: ResourceItem = {
          id: newId,
          userId: currentUserId,
          title: formData.title,
          url: formData.url || null,
          type: formData.type,
          status: formData.status,
          author: formData.author || null,
          estimatedMinutes: formData.estimatedMinutes || null,
          actualMinutes: formData.actualMinutes || 0,
          isFavorite: formData.isFavorite || false,
          isPublic: formData.isPublic || false,
          notes: formData.notes || null,
          summary: formData.summary || null,
          rating: null,
          completedAt: formData.status === "COMPLETED" ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: matchedCat
            ? { id: matchedCat.id, name: matchedCat.name, level: matchedCat.level, parent: null }
            : null,
          tags: [],
        };

        setMyResources((prev) => [newItem, ...prev]);
        if (newItem.isPublic) {
          setPublicResources((prev) => [newItem, ...prev]);
        }
        router.refresh();
        return { ok: true };
      }
      return { ok: false, error: res.error };
    }
  };

  // Action: Delete Resource
  const handleDeleteResource = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      setMyResources((prev) => prev.filter((r) => r.id !== id));
      setPublicResources((prev) => prev.filter((r) => r.id !== id));
      if (viewingResource?.id === id) {
        setViewingResource(null);
      }
      await deleteResourceAction({ id });
      router.refresh();
    }
  };

  // Action: Toggle Visibility (Public vs Private)
  const handleTogglePublic = async (id: string) => {
    const target = myResources.find((r) => r.id === id);
    if (!target) return;

    const nextPublic = !target.isPublic;

    // Optimistic local state update
    const updater = (prev: ResourceItem[]) =>
      prev.map((r) => (r.id === id ? { ...r, isPublic: nextPublic } : r));

    setMyResources(updater);

    if (nextPublic) {
      setPublicResources((prev) => [{ ...target, isPublic: true }, ...prev]);
    } else {
      setPublicResources((prev) => prev.filter((r) => r.id !== id));
    }

    if (viewingResource?.id === id) {
      setViewingResource((prev) => (prev ? { ...prev, isPublic: nextPublic } : null));
    }

    const res = await toggleResourceVisibilityAction({ id });
    if (!res.ok) {
      router.refresh();
    }
  };

  // Action: Status Change
  const handleStatusChange = async (id: string, status: ResourceStatus) => {
    const updater = (prev: ResourceItem[]) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r));
    setMyResources(updater);
    setPublicResources(updater);
    if (viewingResource?.id === id) {
      setViewingResource((prev) => (prev ? { ...prev, status } : null));
    }
    await updateResourceStatusAction({ id, status });
    router.refresh();
  };

  // Action: Favorite Toggle
  const handleToggleFavorite = async (id: string) => {
    const updater = (prev: ResourceItem[]) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
    setMyResources(updater);
    setPublicResources(updater);
    if (viewingResource?.id === id) {
      setViewingResource((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    await toggleFavoriteAction({ id });
    router.refresh();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 animate-in fade-in duration-300">
      {/* 1. Header & Segmented Section Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Resources & Notes
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent-tint text-accent border border-accent/20">
              {filteredResources.length} items
            </span>
          </div>
          <p className="text-[13.5px] text-secondary mt-1">
            Curate articles, documentation, books, and study notes organized by visual hierarchy.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleOpenAddResource()}
            className="rounded-xl px-4 h-10 text-[13px] font-semibold gap-2 shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_12px_rgba(0,122,255,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Resource</span>
          </Button>
        </div>
      </div>

      {/* 2. Public vs Private Sections Segmented Controller (Minimal, Icon-only, Background Synchronized, Borderless) */}
      <div className="flex items-center justify-between gap-4 py-1 bg-transparent border-0">
        {/* Scope Tabs - Icons Only with Name on Hover */}
        <div className="flex items-center gap-2">
          {/* Private Vault Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveScope("private");
            }}
            className={cn(
              "relative group p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center",
              activeScope === "private"
                ? "bg-surface text-accent shadow-xs border border-border"
                : "text-secondary hover:text-foreground hover:bg-surface/50"
            )}
            title={`Private Vault (${privateCount})`}
            aria-label="Private Vault"
          >
            <Lock className="w-4 h-4 text-accent" />
            <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-popover text-popover-foreground text-[11px] font-medium rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity z-30">
              Private Vault ({privateCount})
            </span>
          </button>

          {/* Public Library Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveScope("public");
            }}
            className={cn(
              "relative group p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center",
              activeScope === "public"
                ? "bg-surface text-emerald-500 shadow-xs border border-border"
                : "text-secondary hover:text-foreground hover:bg-surface/50"
            )}
            title={`Public Library (${publicCount})`}
            aria-label="Public Library"
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-popover text-popover-foreground text-[11px] font-medium rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity z-30">
              Public Library ({publicCount})
            </span>
          </button>

          {/* All My Items Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveScope("all");
            }}
            className={cn(
              "relative group p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center",
              activeScope === "all"
                ? "bg-surface text-purple shadow-xs border border-border"
                : "text-secondary hover:text-foreground hover:bg-surface/50"
            )}
            title={`All My Items / My Saves (${myTotalCount})`}
            aria-label="All My Items"
          >
            <Bookmark className="w-4 h-4 text-purple" />
            <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-popover text-popover-foreground text-[11px] font-medium rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity z-30">
              My Saves & Items ({myTotalCount})
            </span>
          </button>
        </div>

        {/* View Mode Switcher: Hierarchy vs Grid vs Table */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("hierarchy")}
            className={cn(
              "relative group p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center",
              viewMode === "hierarchy"
                ? "bg-surface text-accent font-semibold shadow-xs border border-border"
                : "text-secondary hover:text-foreground hover:bg-surface/50"
            )}
            title="Visual Hierarchy"
            aria-label="Hierarchy View"
          >
            <FolderTree className="w-4 h-4" />
            <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-popover text-popover-foreground text-[11px] font-medium rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity z-30">
              Visual Hierarchy
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "relative group p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center",
              viewMode === "grid"
                ? "bg-surface text-foreground font-semibold shadow-xs border border-border"
                : "text-secondary hover:text-foreground hover:bg-surface/50"
            )}
            title="Cards Grid"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-popover text-popover-foreground text-[11px] font-medium rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity z-30">
              Cards Grid
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "relative group p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center",
              viewMode === "table"
                ? "bg-surface text-foreground font-semibold shadow-xs border border-border"
                : "text-secondary hover:text-foreground hover:bg-surface/50"
            )}
            title="Table View"
            aria-label="Table View"
          >
            <List className="w-4 h-4" />
            <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-popover text-popover-foreground text-[11px] font-medium rounded-lg shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity z-30">
              Table View
            </span>
          </button>
        </div>
      </div>

      {/* 3. Visual Hierarchy Taxonomy Filter (Field › Subject) - Synchronized with Background */}
      <div className="space-y-2.5 py-1 bg-transparent border-0 shadow-none">
        <div className="flex items-center justify-between text-xs font-semibold text-secondary px-0.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Category Hierarchy</span>
          </div>
          {(selectedFieldId || selectedSubjectId) && (
            <button
              onClick={() => {
                setSelectedFieldId(null);
                setSelectedSubjectId(null);
              }}
              className="text-accent hover:underline cursor-pointer"
            >
              Reset Hierarchy Filter
            </button>
          )}
        </div>

        {/* Level 1: Fields */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedFieldId(null);
              setSelectedSubjectId(null);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
              selectedFieldId === null
                ? "bg-accent text-white border-accent font-semibold shadow-xs"
                : "bg-surface text-secondary border-border/60 hover:text-foreground hover:bg-surface-secondary"
            )}
          >
            All Fields & Categories
          </button>

          {categories.map((field) => {
            const isSelected = selectedFieldId === field.id;
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => {
                  setSelectedFieldId(isSelected ? null : field.id);
                  setSelectedSubjectId(null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5",
                  isSelected
                    ? "bg-accent text-white border-accent font-semibold shadow-xs"
                    : "bg-surface text-secondary border-border/60 hover:text-foreground hover:bg-surface-secondary"
                )}
              >
                <span>{field.name}</span>
                {field.children && field.children.length > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    isSelected ? "bg-white/20 text-white" : "bg-muted-bg text-muted"
                  )}>
                    {field.children.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Level 2: Subjects (Sub-levels under selected Field) */}
        {availableSubjects.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/30 overflow-x-auto scrollbar-none animate-in fade-in duration-200">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider shrink-0 pl-1">
              Subjects:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSubjectId(null)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap border cursor-pointer transition-colors",
                selectedSubjectId === null
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-surface text-secondary border-border/50 hover:text-foreground"
              )}
            >
              All in {activeField?.name}
            </button>
            {availableSubjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(isSelected ? null : sub.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap border cursor-pointer transition-colors flex items-center gap-1",
                    isSelected
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-surface text-secondary border-border/50 hover:text-foreground"
                  )}
                >
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Search and Secondary Filters (Type, Starred) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            type="text"
            placeholder={`Search ${activeScope === "public" ? "public library" : "resources"} by title, author, or notes...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 rounded-xl h-10 text-xs border-border bg-surface"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ResourceType | "ALL")}
            className="h-9 px-3 rounded-xl bg-surface border border-border text-xs text-secondary font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="ALL">All Types</option>
            {Object.entries(RESOURCE_TYPES).map(([typeKey, cfg]) => (
              <option key={typeKey} value={typeKey}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Starred Favorite Toggle */}
          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={cn(
              "h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap",
              onlyFavorites
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold"
                : "bg-surface border-border text-secondary hover:text-foreground"
            )}
          >
            <Star className={cn("w-3.5 h-3.5", onlyFavorites && "fill-amber-500")} />
            <span>Starred</span>
          </button>
        </div>
      </div>

      {/* 5. Main Content Area */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-[24px] border border-dashed border-border bg-surface/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-tint text-accent flex items-center justify-center mx-auto">
            {activeScope === "public" ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {activeScope === "public"
                ? "No public community resources found"
                : "No resources found"}
            </h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              {activeScope === "public"
                ? "When you or team members add resources marked Public, they will be visible to everyone here."
                : "Add your first article, video, paper, or book to start building your personal study repository."}
            </p>
          </div>
          <Button
            onClick={() => handleOpenAddResource()}
            className="rounded-xl px-4 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </Button>
        </div>
      ) : viewMode === "hierarchy" ? (
        /* Visual Hierarchy Group View */
        <div className="space-y-8 animate-in fade-in duration-200">
          {hierarchyGroups.map((group) => (
            <div key={group.id} className="space-y-4">
              {/* Group Header with Hierarchy Path & Metadata */}
              <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-7 h-7 rounded-lg bg-accent-tint text-accent flex items-center justify-center font-bold text-xs">
                    {group.level === 1 ? "F" : group.level === 2 ? "S" : "T"}
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                      <span>{group.title}</span>
                    </h2>
                    <span className="text-[11px] text-secondary font-medium">
                      Level {group.level || 0} • {group.levelName}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-secondary text-secondary border border-border/50">
                    {group.resources.length} items
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAddResource(group.id === "unfiled" ? null : group.id)}
                  className="rounded-xl h-8 px-2.5 text-xs font-medium gap-1 text-secondary hover:text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to group</span>
                </Button>
              </div>

              {/* Cards in this Category Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    currentUserId={currentUserId}
                    onView={(r) => setViewingResource(r)}
                    onEdit={handleOpenEditResource}
                    onDelete={handleDeleteResource}
                    onStatusChange={handleStatusChange}
                    onToggleFavorite={handleToggleFavorite}
                    onTogglePublic={handleTogglePublic}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        /* Flat Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              currentUserId={currentUserId}
              onView={(r) => setViewingResource(r)}
              onEdit={handleOpenEditResource}
              onDelete={handleDeleteResource}
              onStatusChange={handleStatusChange}
              onToggleFavorite={handleToggleFavorite}
              onTogglePublic={handleTogglePublic}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="animate-in fade-in duration-200">
          <ResourceTable
            resources={filteredResources}
            currentUserId={currentUserId}
            onView={(r) => setViewingResource(r)}
            onEdit={handleOpenEditResource}
            onDelete={handleDeleteResource}
            onStatusChange={handleStatusChange}
            onToggleFavorite={handleToggleFavorite}
            onTogglePublic={handleTogglePublic}
          />
        </div>
      )}

      {/* Unified Add / Edit Resource Modal */}
      <ResourceDialog
        isOpen={isResourceDialogOpen}
        onClose={() => setIsResourceDialogOpen(false)}
        categories={categories}
        initialResource={editingResource}
        defaultCategoryId={defaultCategoryForNew}
        defaultIsPublic={defaultIsPublicForNew}
        onSubmit={handleSaveResource}
      />

      {/* Resource Quick View Modal */}
      <ResourceViewModal
        isOpen={!!viewingResource}
        onClose={() => setViewingResource(null)}
        resource={viewingResource}
        currentUserId={currentUserId}
        onEdit={handleOpenEditResource}
        onDelete={handleDeleteResource}
        onStatusChange={handleStatusChange}
        onToggleFavorite={handleToggleFavorite}
        onTogglePublic={handleTogglePublic}
      />
    </div>
  );
}
