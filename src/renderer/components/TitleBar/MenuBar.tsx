import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import MenuDropdown from "./MenuDropdown";

const drag = { WebkitAppRegion: "drag" } as React.CSSProperties;
const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;
const menus = [
  {
    label: "File",
    items: [
      { label: "New", shortcut: "Ctrl+N", onClick: () => {} },
      { label: "Open", shortcut: "Ctrl+O", onClick: () => {} },
      { label: "Save", shortcut: "Ctrl+S", onClick: () => {} },
      {
        label: "Exit",
        shortcut: "Alt+F4",
        onClick: () => window.electron?.ipcRenderer.send("close"),
      },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", shortcut: "Ctrl+Z", onClick: () => {} },
      { label: "Redo", shortcut: "Ctrl+Y", onClick: () => {} },
      { label: "Cut", shortcut: "Ctrl+X", onClick: () => {} },
      { label: "Copy", shortcut: "Ctrl+C", onClick: () => {} },
      { label: "Paste", shortcut: "Ctrl+V", onClick: () => {} },
    ],
  },
  {
    label: "View",
    items: [
      {
        label: "Reload",
        shortcut: "Ctrl+R",
        onClick: () => window.location.reload(),
      },
      {
        label: "Toggle Fullscreen",
        shortcut: "F11",
        onClick: () => window.electron?.ipcRenderer.send("fullscreen"),
      },
    ],
  },
  {
    label: "Window",
    items: [
      {
        label: "Minimize",
        shortcut: "Ctrl+M",
        onClick: () => window.electron?.ipcRenderer.send("minimize"),
      },
      {
        label: "Maximize",
        shortcut: "Ctrl+Shift+M",
        onClick: () => window.electron?.ipcRenderer.send("maximize"),
      },
    ],
  },
  {
    label: "Help",
    items: [{ label: "About", shortcut: "F1", onClick: () => {} }],
  },
];

const MenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeMenu]);

  // Keyboard navigation (optional)
  // ...

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative flex space-x-2 text-xs font-medium select-none text-zinc-500"
      )}
      style={drag}
    >
      {menus.map((menu) => (
        <div
          key={menu.label}
          className="relative"
          style={noDrag}
          onMouseEnter={() => {
            if (activeMenu) setActiveMenu(menu.label);
          }}
        >
          <button
            className={cn(
              "hover:bg-zinc-800 p-1 rounded-sm focus:outline-none px-2 transition-colors",
              activeMenu === menu.label && "bg-zinc-800 text-white"
            )}
            tabIndex={0}
            onClick={() =>
              setActiveMenu(activeMenu === menu.label ? null : menu.label)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown")
                setActiveMenu(menu.label);
              if (e.key === "Escape") setActiveMenu(null);
            }}
          >
            {menu.label}
          </button>
          <MenuDropdown
            open={activeMenu === menu.label}
            items={menu.items}
            className="top-7 left-0 min-w-[220px]"
          />
        </div>
      ))}
    </nav>
  );
};

export default MenuBar;
