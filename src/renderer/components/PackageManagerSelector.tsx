import React, { useCallback } from "react";
import { cn } from "../utils/cn";
import { TbBrandNpm, TbBrandYarn } from "react-icons/tb";
import { SiPnpm, SiBun } from "react-icons/si";

interface PackageManagerSelectorProps {
  selected: string;
  setSelected: (manager: string) => void;
}

const packageManagers = [
  {
    name: "npm",
    icon: TbBrandNpm,
    color: "text-red-400",
    description: "Node Package Manager",
  },
  {
    name: "yarn",
    icon: TbBrandYarn,
    color: "text-blue-400",
    description: "Fast, reliable package manager",
  },
  {
    name: "pnpm",
    icon: SiPnpm,
    color: "text-orange-400",
    description: "Fast, disk space efficient",
  },
  {
    name: "bun",
    icon: SiBun,
    color: "text-yellow-400",
    description: "All-in-one toolkit",
  },
];

const PackageManagerSelector: React.FC<PackageManagerSelectorProps> =
  React.memo(({ selected, setSelected }) => {
    const handleManagerClick = useCallback(
      (managerName: string) => {
        // Toggle selection on/off when clicking the same manager
        if (selected === managerName) {
          setSelected("");
        } else {
          setSelected(managerName);
        }
      },
      [selected, setSelected]
    );

    return (
      <div className="w-full flex flex-col items-center gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-2xl">
          {packageManagers.map((manager) => {
            const IconComponent = manager.icon;
            const isSelected = selected === manager.name;

            return (
              <button
                key={manager.name}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-center group min-h-[80px] sm:min-h-[100px]",
                  "bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 shadow-lg",
                  "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                  isSelected
                    ? "border-zinc-400 ring-2 ring-zinc-400/40"
                    : "border-zinc-700"
                )}
                onClick={() => handleManagerClick(manager.name)}
                type="button"
                style={{
                  boxShadow: isSelected
                    ? "inset 0 2px 8px 0 rgba(113,113,122,0.15)"
                    : "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
                }}
              >
                <IconComponent
                  size={24}
                  className={cn(
                    "transition-colors duration-200",
                    isSelected ? manager.color : "text-zinc-400",
                    "group-hover:" + manager.color.replace("text-", "text-")
                  )}
                />
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "font-semibold text-xs sm:text-sm transition-colors duration-200",
                      isSelected ? "text-zinc-200" : "text-zinc-300",
                      "group-hover:text-zinc-200"
                    )}
                  >
                    {manager.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs text-zinc-500 leading-tight hidden sm:block",
                      "group-hover:text-zinc-400"
                    )}
                  >
                    {manager.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  });

PackageManagerSelector.displayName = "PackageManagerSelector";

export default PackageManagerSelector;
