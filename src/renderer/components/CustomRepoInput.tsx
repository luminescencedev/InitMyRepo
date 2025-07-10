import React from "react";
import { cn } from "../utils/cn";

interface CustomRepoInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomRepoInput: React.FC<CustomRepoInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className={cn("flex flex-col items-center w-full max-w-md gap-2")}>
      <input
        type="text"
        placeholder="Git repo URL..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-4 py-3 text-zinc-100 placeholder-zinc-500 shadow-lg transition-all duration-200 text-base font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
          "hover:border-cyan-400 hover:shadow-[0_8px_32px_0_rgba(0,180,255,0.18)]"
        )}
        style={{
          boxShadow: "inset 0 2px 8px 0 rgba(0,180,255,0.13)",
        }}
      />
    </div>
  );
};

export default CustomRepoInput;
