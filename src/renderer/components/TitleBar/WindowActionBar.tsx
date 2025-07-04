import { cn } from "../../utils/cn";

const windowActionBar: React.FC = () => {
  return (
    <>
      <div className={cn("flex space-x-2 items-center ")}>
        <button
          onClick={() => window.electron.ipcRenderer.send("minimize")}
          className={cn(
            "w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5"
          )}
          aria-label="Minimize"
        ></button>
        <button
          onClick={() => window.electron.ipcRenderer.send("maximize")}
          className={cn(
            "w-3 h-3 bg-green-500 rounded-full flex items-center justify-center hover:brightness-90 transition-all hover:h-5"
          )}
          aria-label="Maximize"
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

export default windowActionBar;
