import React, { useMemo, useCallback } from "react";
import { cn } from "../utils/cn";
import data from "../data.json";
import { FaReact, FaNodeJs, FaVuejs } from "react-icons/fa";
import { SiTypescript, SiExpress } from "react-icons/si";
import { TbBrandVite } from "react-icons/tb";
import { RiTailwindCssFill } from "react-icons/ri";
import { MdFavorite, MdStar, MdBookmark, MdCode } from "react-icons/md";
import {
  VscAdd,
  VscClose,
  VscCode,
  VscRepo,
  VscGithub,
  VscSymbolClass,
} from "react-icons/vsc";
import type { UserFavorite } from "../../electron/preload.cts";

// Available icons for favorites
const iconOptions: Record<
  string,
  {
    component: React.FC<{ className: string; size: number }>;
    label: string;
  }
> = {
  favorite: { component: MdFavorite, label: "Favorite" },
  star: { component: MdStar, label: "Star" },
  bookmark: { component: MdBookmark, label: "Bookmark" },
  code: { component: MdCode, label: "Code" },
  repo: { component: VscRepo, label: "Repository" },
  github: { component: VscGithub, label: "GitHub" },
  class: { component: VscSymbolClass, label: "Class" },
  vscode: { component: VscCode, label: "VSCode" },
};

// Available colors for favorites
const colorOptions: Record<
  string,
  {
    class: string;
    borderClass: string;
    label: string;
  }
> = {
  "red-400": {
    class: "text-red-400",
    borderClass: "border-red-900/30",
    label: "Red",
  },
  "blue-400": {
    class: "text-blue-400",
    borderClass: "border-blue-900/30",
    label: "Blue",
  },
  "green-400": {
    class: "text-green-400",
    borderClass: "border-green-900/30",
    label: "Green",
  },
  "amber-400": {
    class: "text-amber-400",
    borderClass: "border-amber-900/30",
    label: "Amber",
  },
  "purple-400": {
    class: "text-purple-400",
    borderClass: "border-purple-900/30",
    label: "Purple",
  },
  "pink-400": {
    class: "text-pink-400",
    borderClass: "border-pink-900/30",
    label: "Pink",
  },
  "teal-400": {
    class: "text-teal-400",
    borderClass: "border-teal-900/30",
    label: "Teal",
  },
  "zinc-400": {
    class: "text-zinc-400",
    borderClass: "border-zinc-700",
    label: "Zinc",
  },
};

const iconMap: Record<string, React.ReactNode> = {
  React: <FaReact className="text-blue-400" size={40} />, // React
  TypeScript: <SiTypescript className="text-blue-400" size={40} />, // TypeScript
  Vue: <FaVuejs className="text-green-400" size={40} />, // Vue
  Express: <SiExpress className="text-yellow-400" size={40} />, // Express
  Vite: <TbBrandVite className="text-zinc-400" size={40} />, // Vite
  Tailwind: <RiTailwindCssFill className="text-zinc-300" size={40} />, // Tailwind
  Node: <FaNodeJs className="text-zinc-400" size={40} />, // Node.js
};

const getIcon = (template: { name: string; iconType?: string }) => {
  // Use iconType if available for built-in templates
  if (template.iconType) {
    switch (template.iconType) {
      case "typescript":
        return iconMap.TypeScript;
      case "vue":
        return iconMap.Vue;
      case "react":
        return iconMap.React;
      case "express":
        return iconMap.Express;
      default:
        return iconMap.TypeScript;
    }
  }

  // Fallback to name-based detection for legacy templates
  const name = template.name.toLowerCase();
  if (name.includes("react")) return iconMap.React;
  if (name.includes("vue")) return iconMap.Vue;
  if (name.includes("express")) return iconMap.Express;
  if (name.includes("typescript")) return iconMap.TypeScript;
  if (name.includes("vite")) return iconMap.Vite;
  if (name.includes("tailwind")) return iconMap.Tailwind;
  if (name.includes("node")) return iconMap.Node;
  return iconMap.TypeScript; // Default fallback
};

// Get icon component for a favorite based on iconType
const getFavoriteIcon = (
  iconType: string = "favorite",
  color: string = "zinc-400",
  size: number = 40
) => {
  const Icon =
    iconOptions[iconType]?.component || iconOptions.favorite.component;
  const colorClass =
    colorOptions[color]?.class || colorOptions["zinc-400"].class;

  return <Icon className={colorClass} size={size} />;
};

interface StackSelectorProps {
  selected: string;
  setSelected: (name: string) => void;
  userFavorites?: UserFavorite[];
  onAddFavorite?: () => void;
  onRemoveFavorite?: (name: string) => void;
}

const StackSelector: React.FC<StackSelectorProps> = React.memo(
  ({
    selected,
    setSelected,
    userFavorites = [],
    onAddFavorite,
    onRemoveFavorite,
  }) => {
    // Combine built-in templates with user favorites - memoized for performance
    const allTemplates = useMemo(
      () => [
        ...data.templates.filter((t) => t.name !== "Custom Repo"),
        ...userFavorites,
      ],
      [userFavorites]
    );

    // Memoize click handler to prevent unnecessary re-renders
    const handleTemplateClick = useCallback(
      (templateName: string) => {
        // Toggle selection on/off when clicking the same template
        if (selected === templateName) {
          setSelected("");
        } else {
          setSelected(templateName);
        }
      },
      [selected, setSelected]
    );

    return (
      <div
        className={cn(
          "flex flex-col items-center w-full max-w-2xl gap-3 sm:gap-4"
        )}
      >
        <div className="flex justify-between w-full items-center mb-2">
          <h3 className="text-zinc-300 font-medium flex items-center gap-2 text-sm sm:text-base">
            <span>Templates & Favorites</span>
          </h3>
          {onAddFavorite && (
            <button
              onClick={onAddFavorite}
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 text-xs",
                "focus:outline-none focus:ring-2 focus:ring-zinc-400/40"
              )}
            >
              <VscAdd size={14} />
              <span>Add Favorite</span>
            </button>
          )}
        </div>

        <div className="w-full flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
          {allTemplates.map((template) => {
            const isFavorite = "userAdded" in template;
            return (
              <div key={template.name} className="relative group">
                {" "}
                <button
                  type="button"
                  onClick={() => handleTemplateClick(template.name)}
                  className={cn(
                    "flex flex-col items-center group",
                    "transition-all duration-200"
                  )}
                  tabIndex={-1} // Make button itself not focusable
                >
                  <div
                    className={cn(
                      "w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center rounded-xl border-2 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 shadow-lg outline-none",
                      selected === template.name
                        ? "border-zinc-400 ring-2 ring-zinc-400/40"
                        : "border-zinc-700",
                      "group-hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)] group-hover:border-zinc-400",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                      isFavorite &&
                        (colorOptions[(template as UserFavorite).color]
                          ?.borderClass ||
                          "border-zinc-700")
                    )}
                    tabIndex={0}
                    style={{
                      boxShadow: "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
                    }}
                  >
                    {isFavorite
                      ? getFavoriteIcon(
                          (template as UserFavorite).iconType,
                          (template as UserFavorite).color,
                          window.innerWidth < 640 ? 30 : 40
                        )
                      : getIcon(template)}
                  </div>
                  {/* Tooltip on hover */}
                  <span
                    className={cn(
                      "mt-2 text-xs sm:text-sm font-semibold text-zinc-300 text-center max-w-[5rem] sm:max-w-[6rem] truncate transition-all duration-200",
                      selected === template.name && "text-zinc-300",
                      isFavorite &&
                        (colorOptions[(template as UserFavorite).color]
                          ?.class ||
                          "text-zinc-400")
                    )}
                    title={template.name}
                  >
                    {template.name}
                  </span>
                  <span
                    className={cn(
                      "pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 z-20 px-2 sm:px-3 py-1 rounded bg-zinc-900/95 text-zinc-200 text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-zinc-700",
                      "select-none"
                    )}
                  >
                    {template.name}
                  </span>
                </button>
                {/* Remove button for favorites */}
                {isFavorite && onRemoveFavorite && (
                  <button
                    onClick={() => onRemoveFavorite(template.name)}
                    className={cn(
                      "absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                      "text-zinc-400 hover:text-red-400 hover:bg-zinc-900",
                      "focus:outline-none focus:ring-2 focus:ring-zinc-400/40"
                    )}
                    aria-label={`Remove ${template.name}`}
                  >
                    <VscClose size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

StackSelector.displayName = "StackSelector";

export default StackSelector;
