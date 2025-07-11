import React, { useCallback } from "react";
import { cn } from "../utils/cn";

interface CustomRepoInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomRepoInput: React.FC<CustomRepoInputProps> = React.memo(
  ({ value, onChange }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    return (
      <div className={cn("flex flex-col items-center w-full max-w-md gap-2")}>
        <input
          type="text"
          placeholder="Git repo URL..."
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-3 sm:px-4 py-2 sm:py-3 text-zinc-100 placeholder-zinc-500 shadow-lg transition-all duration-200 text-sm sm:text-base font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
            "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)]"
          )}
          style={{
            boxShadow: "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
          }}
        />
      </div>
    );
  }
);

CustomRepoInput.displayName = "CustomRepoInput";

export default CustomRepoInput;
