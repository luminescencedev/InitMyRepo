import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import MenuDropdown from "./MenuDropdown";
import { VscMenu } from "react-icons/vsc";

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
      {
        label: "Toggle Developer Tools",
        shortcut: "Ctrl+Shift+I",
        onClick: () => window.electron?.ipcRenderer.send("toggle-devtools"),
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
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setHamburgerOpen(false);
      }
    };

    if (activeMenu || hamburgerOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeMenu, hamburgerOpen]);

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative flex items-center text-xs font-medium select-none text-zinc-500"
      )}
      style={drag}
    >
      {/* Menu classique visible à partir de lg */}
      <div className="hidden lg:flex space-x-2 w-full">
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
                "hover:bg-zinc-800 p-1 rounded-sm px-2 ",
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
      </div>
      {/* Menu hamburger sous lg */}
      <div className="flex lg:hidden w-full">
        <button
          className={cn(
            "flex justify-center items-center w-8 h-6 rounded hover:bg-zinc-800 transition relative overflow-hidden"
          )}
          style={noDrag}
          aria-label={hamburgerOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setHamburgerOpen((v) => !v)}
        >
          <VscMenu className="w-5 h-5 text-zinc-500 transition-all duration-150 bg-zinc-900 " />
        </button>
        {/* Dropdown du menu hamburger */}
        <MenuDropdown
          open={hamburgerOpen}
          items={menus.flatMap((menu) => [
            { label: `--- ${menu.label} ---`, disabled: true },
            ...menu.items,
          ])}
          className="top-7.5 min-w-[220px] max-h-[calc(100vh-80px)] overflow-y-auto"
        />
      </div>
    </nav>
  );
};

export default MenuBar;
