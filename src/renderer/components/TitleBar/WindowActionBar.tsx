import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

const WindowActionBar: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Handler for fullscreen state event
    function handler(_event: unknown, state: boolean) {
      setIsFullscreen(state);
    }
    window.electron.ipcRenderer.send("get-fullscreen-state");
    window.electron.ipcRenderer.on("fullscreen-state", handler);
    return () => {
      window.electron.ipcRenderer.removeListener("fullscreen-state", handler);
    };
  }, []);

  return (
    <>
      <div className={cn("h-5 flex space-x-2 items-center")} style={noDrag}>
        <button
          onClick={() => window.electron.ipcRenderer.send("minimize")}
          className={cn(
            "w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5"
          )}
          aria-label="Minimize"
        ></button>
        <button
          onClick={() => {
            if (isFullscreen) {
              window.electron.ipcRenderer.send("fullscreen"); // Quitter le fullscreen
            } else {
              window.electron.ipcRenderer.send("maximize"); // Maximize/unmaximize
            }
          }}
          className={cn(
            "w-3 h-3 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5",
            isFullscreen ? "bg-blue-500" : "bg-green-500"
          )}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Maximize"}
        ></button>
        <button
          onClick={() => window.electron.ipcRenderer.send("close")}
          className={cn(
            "w-3 h-3 bg-red-500 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5"
          )}
          aria-label="Close"
        ></button>
      </div>
    </>
  );
};

export default WindowActionBar;
