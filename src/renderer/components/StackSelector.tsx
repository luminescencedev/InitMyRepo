import React from "react";
import { cn } from "../utils/cn";
import data from "../data.json";
import { FaReact } from "react-icons/fa";
import { SiTypescript } from "react-icons/si";
import { TbBrandVite } from "react-icons/tb";
import { RiTailwindCssFill } from "react-icons/ri";
import { FaNodeJs } from "react-icons/fa";

interface StackSelectorProps {
  selected: string;
  setSelected: (name: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  React: <FaReact className="text-cyan-400" size={40} />, // React
  TypeScript: <SiTypescript className="text-cyan-400" size={40} />, // TypeScript
  Vite: <TbBrandVite className="text-cyan-400" size={40} />, // Vite
  Tailwind: <RiTailwindCssFill className="text-cyan-300" size={40} />, // Tailwind
  Node: <FaNodeJs className="text-cyan-400" size={40} />, // Node.js
};

const getIcon = (name: string) => {
  if (name.toLowerCase().includes("react")) return iconMap.React;
  if (name.toLowerCase().includes("typescript")) return iconMap.TypeScript;
  if (name.toLowerCase().includes("vite")) return iconMap.Vite;
  if (name.toLowerCase().includes("tailwind")) return iconMap.Tailwind;
  if (name.toLowerCase().includes("node")) return iconMap.Node;
  return null;
};

const StackSelector: React.FC<StackSelectorProps> = ({
  selected,
  setSelected,
}) => {
  return (
    <div className={cn("flex flex-col items-center w-full max-w-2xl gap-4")}>
      <div className="w-full flex flex-row justify-center gap-6">
        {data.templates
          .filter((t) => t.name !== "Custom Repo")
          .map((template) => (
            <button
              key={template.name}
              type="button"
              onClick={() => setSelected(template.name)}
              className={cn(
                "flex flex-col items-center group relative",
                "transition-all duration-200"
              )}
              tabIndex={-1} // Make button itself not focusable
            >
              <div
                className={cn(
                  "w-20 h-20 flex items-center justify-center rounded-xl border-2 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 shadow-lg outline-none",
                  selected === template.name
                    ? "border-cyan-400 ring-2 ring-cyan-400/40"
                    : "border-zinc-700",
                  "group-hover:shadow-[0_8px_32px_0_rgba(0,180,255,0.18)] group-hover:border-cyan-400",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                )}
                tabIndex={0} // Only the logo box is focusable
              >
                {getIcon(template.name)}
              </div>
              {/* Tooltip on hover */}
              <span
                className={cn(
                  "mt-2 text-sm font-semibold text-zinc-300 text-center max-w-[6rem] truncate transition-all duration-200",
                  selected === template.name && "text-cyan-300"
                )}
                title={template.name}
              >
                {template.name}
              </span>
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 z-20 px-3 py-1 rounded bg-zinc-900/95 text-cyan-200 text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-zinc-700",
                  "select-none"
                )}
              >
                {template.name}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default StackSelector;
