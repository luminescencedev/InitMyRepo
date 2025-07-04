import MenuBar from "./MenuBar";
import WindowActionBar from "./WindowActionBar";
import { cn } from "../../utils/cn";

const drag = { WebkitAppRegion: "drag" } as React.CSSProperties;
const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

const TitleBar: React.FC = () => {
  return (
    <div
      className={cn(
        "h-8 w-screen flex items-center justify-between text-zinc-00"
      )}
      style={drag}
    >
      <div className={cn("flex items-center h-full")}>
        <img
          src="/luminescence_icon.png"
          alt=""
          className={cn("h-5 w-auto max-h-full mx-3")}
          style={{ objectFit: "contain" }}
        />
        <div style={noDrag}>
          <MenuBar />
        </div>
      </div>
      <div
        className={cn("flex items-center pl-3 space-x-2 mr-4")}
        style={noDrag}
      >
        <WindowActionBar />
      </div>
    </div>
  );
};

export default TitleBar;
