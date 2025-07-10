import React from "react";
import { cn } from "../utils/cn";
import { TbFolder } from "react-icons/tb";

interface PathSelectorProps {
  path: string;
  setPath: (path: string) => void;
}

const PathSelector: React.FC<PathSelectorProps> = ({ path, setPath }) => {
  // For Electron, use a button to open a dialog (handled by main/preload)
  const handleSelect = async () => {
    if (window.electron && window.electron.selectPath) {
      const selected = await window.electron.selectPath();
      if (selected) setPath(selected);
    } else {
      alert("Folder selector not available.");
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-2 w-full")}>
      <button
        className={cn(
          "relative flex items-center justify-center overflow-hidden border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-xl px-7 py-4 text-xl font-semibold text-cyan-100 shadow-lg transition-all duration-200",
          "hover:border-cyan-400 hover:shadow-[0_8px_32px_0_rgba(0,180,255,0.18)] hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
        )}
        style={{
          boxShadow: "inset 0 2px 8px 0 rgba(0,180,255,0.13)",
        }}
        onClick={handleSelect}
        type="button"
      >
        <span className={cn("flex items-center gap-2")}>
          <TbFolder
            size={26}
            className="mr-2 text-cyan-300 group-hover:text-cyan-400 transition-colors duration-200"
          />
          <span className="font-semibold">Select your project folder</span>
        </span>
      </button>
      <span
        className={cn(
          "text-lg text-zinc-400 font-medium mt-1 break-all text-center max-w-full"
        )}
      >
        {path || "No folder selected"}
      </span>
    </div>
  );
};

export default PathSelector;
