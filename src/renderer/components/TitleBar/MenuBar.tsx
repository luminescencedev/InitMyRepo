import { cn } from "../../utils/cn";

const menus = ["File", "Edit", "View", "Window", "Help"];

const MenuBar: React.FC = () => {
  // const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className={cn("flex space-x-2 text-xs font-medium select-none")}>
      {menus.map((menu) => (
        <button
          key={menu}
          className={cn(
            "hover:bg-zinc-800 p-1 rounded-sm focus:outline-none text-zinc-500"
          )}
          tabIndex={-1}
        >
          {menu}
        </button>
      ))}
    </nav>
  );
};

export default MenuBar;
