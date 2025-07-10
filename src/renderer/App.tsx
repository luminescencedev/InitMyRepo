import { useState } from "react";
import TitleBar from "./components/TitleBar/TitleBar";
import PathSelector from "./components/PathSelector";
import StackSelector from "./components/StackSelector";
import CustomRepoInput from "./components/CustomRepoInput";
import data from "./data.json";
import { VscArrowRight } from "react-icons/vsc";
import { cn } from "./utils/cn";

function App() {
  const [path, setPath] = useState("");
  const [selectedStack, setSelectedStack] = useState<string>("");
  const [customRepo, setCustomRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInit = async () => {
    setLoading(true);
    setMessage("");
    let repoUrl = "";
    if (selectedStack && selectedStack !== "Custom Repo") {
      const template = data.templates.find((t) => t.name === selectedStack);
      repoUrl = template?.repo || "";
    } else if (selectedStack === "Custom Repo") {
      repoUrl = customRepo;
    }
    if (!path || !repoUrl) {
      setMessage("Please select a folder and a template or repo.");
      setLoading(false);
      return;
    }
    try {
      await window.electron.initRepo(path, repoUrl);
      setMessage("Project initialized successfully!");
    } catch (e) {
      setMessage("Error during initialization: " + e);
    }
    setLoading(false);
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
                "rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-6 py-3 font-semibold text-cyan-100 shadow-lg transition-all duration-200 text-base flex items-center justify-center gap-2",
                "hover:border-cyan-400 hover:shadow-[0_8px_32px_0_rgba(0,180,255,0.18)] hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
                selectedStack === "Custom Repo" &&
                  "ring-2 ring-cyan-400/40 border-cyan-400 text-cyan-200"
              )}
              onClick={() => setSelectedStack("Custom Repo")}
              type="button"
              style={{
                boxShadow:
                  selectedStack === "Custom Repo"
                    ? "inset 0 2px 8px 0 rgba(0,180,255,0.15)"
                    : "inset 0 2px 8px 0 rgba(0,180,255,0.13)",
              }}
            >
              Custom repository
            </button>
            {selectedStack === "Custom Repo" && (
              <CustomRepoInput value={customRepo} onChange={setCustomRepo} />
            )}
          </div>
        </div>
        <button
          className={cn(
            "mt-8 rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-10 py-4 text-lg font-bold text-cyan-100 shadow-lg transition-all duration-200 flex items-center gap-3",
            "hover:border-cyan-400 hover:shadow-[0_8px_32px_0_rgba(0,180,255,0.18)] hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
            loading && "opacity-60 cursor-not-allowed"
          )}
          onClick={handleInit}
          disabled={loading}
          type="button"
          style={{
            boxShadow: loading
              ? "inset 0 2px 8px 0 rgba(0,180,255,0.08)"
              : "inset 0 2px 8px 0 rgba(0,180,255,0.13)",
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
        {message && (
          <div className="mt-4 text-center text-red-400 font-medium">
            {message}
          </div>
        )}
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
    </>
  );
}

export default App;
