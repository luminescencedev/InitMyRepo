import { useState } from "react";
import TitleBar from "./components/TitleBar/TitleBar";
import PathSelector from "./components/PathSelector";
import StackSelector from "./components/StackSelector";
import CustomRepoInput from "./components/CustomRepoInput";
import Notification from "./components/Notification";
import data from "./data.json";
import { VscArrowRight, VscCode } from "react-icons/vsc";
import { TbReload } from "react-icons/tb";
import { cn } from "./utils/cn";

function App() {
  const [path, setPath] = useState("");
  const [selectedStack, setSelectedStack] = useState<string>("");
  const [customRepo, setCustomRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );
  const [initialized, setInitialized] = useState(false);

  const handleInit = async () => {
    setLoading(true);
    setMessage("");
    setShowNotification(false);
    setInitialized(false);
    let repoUrl = "";
    if (selectedStack && selectedStack !== "Custom Repo") {
      const template = data.templates.find((t) => t.name === selectedStack);
      repoUrl = template?.repo || "";
    } else if (selectedStack === "Custom Repo") {
      repoUrl = customRepo;
    }
    if (!path || !repoUrl) {
      setMessage("Please select a folder and a template or repo.");
      setNotificationType("error");
      setShowNotification(true);
      setLoading(false);
      return;
    }
    try {
      await window.electron.initRepo(path, repoUrl);
      setMessage("Project initialized successfully!");
      setNotificationType("success");
      setShowNotification(true);
      setInitialized(true);
    } catch (e) {
      setMessage("Error during initialization: " + e);
      setNotificationType("error");
      setShowNotification(true);
    }
    setLoading(false);
  };

  const handleOpenVSCode = async () => {
    try {
      await window.electron.openVSCode(path);
      setMessage("VSCode opened successfully!");
      setNotificationType("success");
      setShowNotification(true);
    } catch (e) {
      setMessage("Error opening VSCode: " + e);
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  const handleReload = () => {
    setPath("");
    setSelectedStack("");
    setCustomRepo("");
    setMessage("");
    setShowNotification(false);
    setInitialized(false);
  };

  return (
    <>
      <TitleBar />
      <div
        className={cn(
          "h-[calc(100vh-36px)] w-screen flex flex-col justify-center items-center "
        )}
      >
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          <PathSelector path={path} setPath={setPath} />
          {/* Séparateur harmonieux entre select folder et stack */}
          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
            <span className="mx-4 text-zinc-400 font-semibold select-none text-base tracking-wide  px-3 py-1 shadow-sm  border-zinc-800">
              Choose stack
            </span>
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
          </div>
          <StackSelector
            selected={selectedStack}
            setSelected={setSelectedStack}
          />
          {/* Séparateur "or" */}
          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
            <span className="mx-4 text-zinc-400 font-semibold select-none text-base tracking-wide  px-3 py-1 shadow-sm border-zinc-800">
              or
            </span>
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
          </div>
          {/* Custom repo input */}
          <div className="w-full flex flex-col items-center gap-2">
            <button
              className={cn(
                "rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-6 py-3 font-semibold text-zinc-100 shadow-lg transition-all duration-200 text-base flex items-center justify-center gap-2",
                "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)] hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                selectedStack === "Custom Repo" &&
                  "ring-2 ring-zinc-400/40 border-zinc-400 text-zinc-200"
              )}
              onClick={() => setSelectedStack("Custom Repo")}
              type="button"
              style={{
                boxShadow:
                  selectedStack === "Custom Repo"
                    ? "inset 0 2px 8px 0 rgba(113,113,122,0.15)"
                    : "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
              }}
            >
              Custom repository
            </button>
            {selectedStack === "Custom Repo" && (
              <CustomRepoInput value={customRepo} onChange={setCustomRepo} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className={cn(
              "mt-8 rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-10 py-4 text-lg font-bold text-zinc-100 shadow-lg transition-all duration-200 flex items-center gap-3",
              "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)] hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
              loading && "opacity-60 cursor-not-allowed"
            )}
            onClick={handleInit}
            disabled={loading}
            type="button"
            style={{
              boxShadow: loading
                ? "inset 0 2px 8px 0 rgba(113,113,122,0.08)"
                : "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
            }}
          >
            {loading ? (
              <span>Initializing...</span>
            ) : (
              <span className="flex items-center gap-3">
                Init <VscArrowRight />
              </span>
            )}
          </button>

          {initialized && (
            <button
              className={cn(
                "mt-8 rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-10 py-4 text-lg font-bold text-zinc-100 shadow-lg transition-all duration-200 flex items-center gap-3",
                "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)] hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40"
              )}
              onClick={handleOpenVSCode}
              type="button"
              style={{
                boxShadow: "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
              }}
            >
              <span className="flex items-center gap-3">
                Open VSCode <VscCode />
              </span>
            </button>
          )}

          <button
            className={cn(
              "mt-8 rounded-full border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-2 text-zinc-500 shadow-lg transition-all duration-200 flex items-center justify-center",
              "hover:border-zinc-600 hover:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
              "ml-4"
            )}
            onClick={handleReload}
            type="button"
            aria-label="Reset all selections"
            style={{
              boxShadow: "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
            }}
          >
            <TbReload size={18} />
          </button>
        </div>
      </div>
      <div
        className={cn(
          "absolute left-0 top-0 h-screen w-screen flex justify-center items-center -z-1"
        )}
      >
        <img
          src="/luminescence_dark.png"
          alt=""
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Notification component */}
      <Notification
        message={message}
        type={notificationType}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
}

export default App;
