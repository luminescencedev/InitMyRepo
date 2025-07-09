import React from "react";
import { cn } from "../../utils/cn";

export interface MenuDropdownProps {
  open: boolean;
  items: {
    label: string;
    shortcut?: string;
    onClick?: () => void;
    disabled?: boolean;
  }[];
  className?: string;
  style?: React.CSSProperties;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  open,
  items,
  className,
  style,
}) => {
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute left-0 mt-1 min-w-[220px] w-auto bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-50 animate-fade-in flex flex-col",
        className
      )}
      style={style}
    >
      {items.map((item, i) => (
        <button
          key={item.label + i}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-zinc-800 focus:bg-zinc-800 transition-colors whitespace-nowrap",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={item.onClick}
          disabled={item.disabled}
          tabIndex={0}
        >
          <span>{item.label}</span>
          {item.shortcut && (
            <span className="ml-6 text-xs font-mono text-zinc-400 bg-zinc-800 rounded px-2 py-0.5">
              {item.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MenuDropdown;
