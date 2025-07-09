import React from "react";
import { cn } from "../utils/cn";

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
    <div className={cn("flex flex-col items-center border")}>
      <button className={cn("")} onClick={handleSelect} type="button">
        Select your project folder
      </button>
      <span className={cn("")}>{path || "No folder selected"}</span>
    </div>
  );
};

export default PathSelector;
