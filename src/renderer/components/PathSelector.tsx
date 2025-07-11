import React, { useCallback } from "react";
import { cn } from "../utils/cn";
import { TbFolder } from "react-icons/tb";

interface PathSelectorProps {
  path: string;
  setPath: (path: string) => void;
}

const PathSelector: React.FC<PathSelectorProps> = React.memo(
  ({ path, setPath }) => {
    // For Electron, use a button to open a dialog (handled by main/preload)
    const handleSelect = useCallback(async () => {
      if (window.electron && window.electron.selectPath) {
        const selected = await window.electron.selectPath();
        if (selected) setPath(selected);
      } else {
        alert("Folder selector not available.");
      }
    }, [setPath]);

    return (
      <div className={cn("flex flex-col items-center gap-2 w-full")}>
        <button
          className={cn(
            "relative flex items-center justify-center overflow-hidden border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-xl px-4 sm:px-7 py-3 sm:py-4 text-base sm:text-xl font-semibold text-zinc-100 shadow-lg transition-all duration-200 w-auto",
            "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)] hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40"
          )}
          style={{
            boxShadow: "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
          }}
          onClick={handleSelect}
          type="button"
        >
          <span className={cn("flex items-center gap-2")}>
            <TbFolder
              size={26}
              className="mr-2 text-zinc-300 group-hover:text-zinc-400 transition-colors duration-200"
            />
            <span className="font-semibold text-sm sm:text-base md:text-xl">
              Select your project folder
            </span>
          </span>
        </button>
        <span
          className={cn(
            "text-sm sm:text-base md:text-lg text-zinc-400 font-medium mt-1 break-all text-center max-w-full px-2"
          )}
        >
          {path || "No folder selected"}
        </span>
      </div>
    );
  }
);

PathSelector.displayName = "PathSelector";

export default PathSelector;
