import React, { useEffect, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

const WindowActionBar: React.FC = React.memo(() => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMinimize = useCallback(() => {
    window.electron.ipcRenderer.send("minimize");
  }, []);

  const handleMaximize = useCallback(() => {
    if (isFullscreen) {
      window.electron.ipcRenderer.send("fullscreen"); // Quitter le fullscreen
    } else {
      window.electron.ipcRenderer.send("maximize"); // Maximize/unmaximize
    }
  }, [isFullscreen]);

  const handleClose = useCallback(() => {
    window.electron.ipcRenderer.send("close");
  }, []);

  const handleFullscreenState = useCallback(
    (_event: unknown, state: boolean) => {
      setIsFullscreen(state);
    },
    []
  );

  useEffect(() => {
    window.electron.ipcRenderer.send("get-fullscreen-state");
    window.electron.ipcRenderer.on("fullscreen-state", handleFullscreenState);
    return () => {
      window.electron.ipcRenderer.removeListener(
        "fullscreen-state",
        handleFullscreenState
      );
    };
  }, [handleFullscreenState]);

  return (
    <>
      <div className={cn("h-5 flex space-x-2 items-center")} style={noDrag}>
        <button
          onClick={handleMinimize}
          className={cn(
            "w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5"
          )}
          aria-label="Minimize"
        ></button>
        <button
          onClick={handleMaximize}
          className={cn(
            "w-3 h-3 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5",
            isFullscreen ? "bg-blue-500" : "bg-green-500"
          )}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Maximize"}
        ></button>
        <button
          onClick={handleClose}
          className={cn(
            "w-3 h-3 bg-red-500 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5"
          )}
          aria-label="Close"
        ></button>
      </div>
    </>
  );
});

WindowActionBar.displayName = "WindowActionBar";

export default WindowActionBar;
