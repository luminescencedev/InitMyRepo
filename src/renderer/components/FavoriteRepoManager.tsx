import React, { useState } from "react";
import { cn } from "../utils/cn";
import type { UserFavorite } from "../../electron/preload.cts";
import {
  VscClose,
  VscCode,
  VscRepo,
  VscGithub,
  VscSymbolClass,
} from "react-icons/vsc";
import { MdFavorite, MdStar, MdBookmark, MdCode } from "react-icons/md";

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
    bgClass: string;
    label: string;
  }
> = {
  "red-400": { class: "text-red-400", bgClass: "bg-red-400/10", label: "Red" },
  "blue-400": {
    class: "text-blue-400",
    bgClass: "bg-blue-400/10",
    label: "Blue",
  },
  "green-400": {
    class: "text-green-400",
    bgClass: "bg-green-400/10",
    label: "Green",
  },
  "amber-400": {
    class: "text-amber-400",
    bgClass: "bg-amber-400/10",
    label: "Amber",
  },
  "purple-400": {
    class: "text-purple-400",
    bgClass: "bg-purple-400/10",
    label: "Purple",
  },
  "pink-400": {
    class: "text-pink-400",
    bgClass: "bg-pink-400/10",
    label: "Pink",
  },
  "teal-400": {
    class: "text-teal-400",
    bgClass: "bg-teal-400/10",
    label: "Teal",
  },
  "zinc-400": {
    class: "text-zinc-400",
    bgClass: "bg-zinc-400/10",
    label: "Zinc",
  },
};

interface FavoriteRepoManagerProps {
  onAddFavorite: (
    name: string,
    repoUrl: string,
    iconType?: string,
    color?: string
  ) => Promise<void>;
  onRemoveFavorite: (name: string) => Promise<void>;
  userFavorites: UserFavorite[];
}

const FavoriteRepoManager: React.FC<FavoriteRepoManagerProps> = ({
  onAddFavorite,
  onRemoveFavorite,
  userFavorites,
}) => {
  const [newFavoriteName, setNewFavoriteName] = useState("");
  const [newFavoriteUrl, setNewFavoriteUrl] = useState("");
  const [selectedIconType, setSelectedIconType] = useState("favorite");
  const [selectedColor, setSelectedColor] = useState("zinc-400");
  const [error, setError] = useState("");

  const handleAddNewFavorite = async () => {
    if (!newFavoriteName.trim() || !newFavoriteUrl.trim()) {
      setError("Both name and URL are required");
      return;
    }

    // Check if URL is valid
    if (
      !newFavoriteUrl.startsWith("http://") &&
      !newFavoriteUrl.startsWith("https://") &&
      !newFavoriteUrl.startsWith("git@")
    ) {
      setError("Please enter a valid repository URL");
      return;
    }

    // Check if name already exists
    if (userFavorites.some((fav) => fav.name === newFavoriteName)) {
      setError("A favorite with this name already exists");
      return;
    }

    try {
      await onAddFavorite(
        newFavoriteName,
        newFavoriteUrl,
        selectedIconType,
        selectedColor
      );
      setNewFavoriteName("");
      setNewFavoriteUrl("");
      setSelectedIconType("favorite");
      setSelectedColor("zinc-400");
      setError("");
    } catch (e) {
      setError(`Error adding favorite: ${e}`);
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-4")}>
      {/* Add new favorite form */}
      <div className="flex flex-col gap-3">
        {error && (
          <div className="text-red-400 text-sm py-2 px-3 bg-red-400/10 border border-red-400/30 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="favName" className="text-zinc-400 text-sm">
            Template name:
          </label>
          <input
            id="favName"
            type="text"
            value={newFavoriteName}
            onChange={(e) => setNewFavoriteName(e.target.value)}
            placeholder="My favorite template"
            className={cn(
              "w-full rounded-lg border-2 border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 placeholder-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-400/40 focus:border-zinc-600"
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="favUrl" className="text-zinc-400 text-sm">
            Repository URL:
          </label>
          <input
            id="favUrl"
            type="text"
            value={newFavoriteUrl}
            onChange={(e) => setNewFavoriteUrl(e.target.value)}
            placeholder="https://github.com/user/repo.git"
            className={cn(
              "w-full rounded-lg border-2 border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 placeholder-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-400/40 focus:border-zinc-600"
            )}
          />
        </div>

        {/* Icon Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-400 text-sm">Icon:</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(iconOptions).map(
              ([key, { component: Icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedIconType(key)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg border-2",
                    selectedIconType === key
                      ? cn(
                          "border-zinc-500 bg-zinc-800",
                          colorOptions[selectedColor].bgClass
                        )
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  )}
                >
                  <Icon
                    className={cn(
                      selectedIconType === key
                        ? colorOptions[selectedColor].class
                        : "text-zinc-400"
                    )}
                    size={20}
                  />
                  <span className="text-xs mt-1 text-zinc-400">{label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Color Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-400 text-sm">Color:</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(colorOptions).map(([key, { class: label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedColor(key)}
                className={cn(
                  "flex items-center justify-center py-2 rounded-lg border-2",
                  selectedColor === key
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-600",
                  colorOptions[key].bgClass
                )}
              >
                <span className="text-xs text-zinc-400">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddNewFavorite}
          className={cn(
            "w-full mt-2 rounded-lg border-2 border-zinc-700 bg-zinc-900 py-2 text-zinc-200",
            "hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-zinc-400/40"
          )}
        >
          Save Favorite
        </button>
      </div>

      {/* List of current favorites */}
      {userFavorites.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-zinc-300 mb-3">
            Current Favorites
          </h3>
          <div className="grid grid-cols-1 gap-2 max-h-[30vh] overflow-y-auto pr-1">
            {userFavorites.map((favorite) => (
              <div
                key={favorite.name}
                className="flex items-center justify-between p-2 border border-zinc-700 rounded-lg bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  {/* Display the favorite's icon */}
                  <div
                    className={cn(
                      "flex-shrink-0",
                      colorOptions[favorite.color]?.class || "text-zinc-400"
                    )}
                  >
                    {(() => {
                      const IconComponent =
                        iconOptions[favorite.iconType]?.component || MdFavorite;
                      return (
                        <IconComponent
                          className={
                            colorOptions[favorite.color]?.class ||
                            "text-zinc-400"
                          }
                          size={20}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-medium">
                      {favorite.name}
                    </span>
                    <span className="text-zinc-500 text-xs truncate max-w-64">
                      {favorite.repo}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFavorite(favorite.name)}
                  className={cn(
                    "p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-full",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-400/40"
                  )}
                  aria-label={`Remove ${favorite.name}`}
                >
                  <VscClose size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteRepoManager;
