import MenuBar from "./MenuBar";
import WindowActionBar from "./WindowActionBar";
import { cn } from "../../utils/cn";

const drag = { WebkitAppRegion: "drag" } as React.CSSProperties;
const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

const TitleBar: React.FC = () => {
  return (
    <div
      className={cn(
        "h-9 w-full flex items-center text-zinc-500 fixed top-0 left-0 right-0 z-500  backdrop-blur-md "
      )}
      style={drag}
    >
      <div className={cn("flex items-center h-full flex-1 md:w-[33vw] ")}>
        <img
          src="./luminescence_icon.png"
          alt=""
          className={cn("h-5 w-auto max-h-full px-2 sm:px-3 object-contain")}
        />
        <div style={noDrag} className="block">
          <MenuBar />
        </div>
      </div>
      <div
        className={cn(
          "h-full flex-1 md:w-[34vw] p-[5px] flex items-center justify-center "
        )}
        style={drag}
      >
        <span
          className={cn(
            "text-xs font-medium select-none truncate max-w-[150px] sm:max-w-full"
          )}
        >
          InitMyRepo
        </span>
      </div>
      <div
        className={cn(
          "h-full flex-1 md:w-[33vw] flex items-center justify-end pl-3 pr-2 sm:pr-4 "
        )}
        style={drag}
      >
        <WindowActionBar />
      </div>
    </div>
  );
};

export default TitleBar;
