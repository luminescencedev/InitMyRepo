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
    <div className={cn("flex flex-col items-center")}>
      <label className="">Or custom repo:</label>
      <input
        type="text"
        placeholder="Git repo URL..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("")}
      />
    </div>
  );
};

export default CustomRepoInput;
