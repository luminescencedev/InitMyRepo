import React from "react";
import data from "../data.json";
import { cn } from "../utils/cn";

interface StackSelectorProps {
  selected: string;
  setSelected: (name: string) => void;
}

const StackSelector: React.FC<StackSelectorProps> = ({
  selected,
  setSelected,
}) => {
  return (
    <div className="flex flex-col justify-center">
      {data.templates
        .filter((t) => t.name !== "Custom Repo")
        .map((template) => (
          <button
            key={template.name}
            className={cn("", selected === template.name ? "" : "")}
            onClick={() => setSelected(template.name)}
          >
            {template.name}
          </button>
        ))}
    </div>
  );
};

export default StackSelector;
