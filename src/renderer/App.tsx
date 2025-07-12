import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import TitleBar from "./components/TitleBar/TitleBar";
import PathSelector from "./components/PathSelector";
import StackSelector from "./components/StackSelector";
import CustomRepoInput from "./components/CustomRepoInput";
import PackageManagerSelector from "./components/PackageManagerSelector";
import Notification from "./components/Notification";

// Lazy load FavoriteRepoManager since it's only used in modal
const FavoriteRepoManager = lazy(
  () => import("./components/FavoriteRepoManager")
);
import data from "./data.json";
import { VscArrowRight, VscCode, VscClose } from "react-icons/vsc";
import { TbReload } from "react-icons/tb";
import backgroundImage from "/luminescence_dark.png";

import { cn } from "./utils/cn";
import type {
  UserFavorite,
  ViteTemplateData,
  ExpressTemplateData,
  TemplateData,
} from "../electron/preload.cts";

function App() {
  const [path, setPath] = useState("");
  const [selectedStack, setSelectedStack] = useState<string>("");
  const [selectedPackageManager, setSelectedPackageManager] =
    useState<string>("");
  const [customRepo, setCustomRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );
  const [initialized, setInitialized] = useState(false);
  const [userFavorites, setUserFavorites] = useState<UserFavorite[]>([]);
  const [showFavoriteManager, setShowFavoriteManager] = useState(false);

  // Load user favorites from electron main process
  const loadUserFavorites = useCallback(async () => {
    try {
      const favorites = await window.electron.getFavoriteRepos();
      setUserFavorites(favorites);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setMessage("Failed to load favorites: " + error);
      setNotificationType("error");
      setShowNotification(true);
    }
  }, []);

  // Load user favorites when component mounts
  useEffect(() => {
    loadUserFavorites();
  }, [loadUserFavorites]);

  const handleInit = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setShowNotification(false);
    setInitialized(false);
    let repoUrl = "";
    let templateData: TemplateData | undefined = undefined;

    if (selectedStack && selectedStack !== "Custom Repo") {
      // Check if it's a user favorite first
      const userFavorite = userFavorites.find((f) => f.name === selectedStack);
      if (userFavorite) {
        repoUrl = userFavorite.repo;
      } else {
        // Check built-in templates
        const template = data.templates.find((t) => t.name === selectedStack);
        if (template) {
          if (template.isViteTemplate) {
            // For Vite templates, pass template data instead of repo URL
            templateData = template as ViteTemplateData;
            repoUrl = ""; // Not needed for Vite templates
          } else if (template.isExpressTemplate) {
            // For Express templates, pass template data instead of repo URL
            templateData = template as ExpressTemplateData;
            repoUrl = ""; // Not needed for Express templates
          } else {
            repoUrl = template.repo || "";
          }
        }
      }
    } else if (selectedStack === "Custom Repo") {
      repoUrl = customRepo;
    }

    // For Vite and Express templates, we don't need repoUrl, only templateData
    if (!path || (!repoUrl && !templateData)) {
      setMessage("Please select a folder and a template or repo.");
      setNotificationType("error");
      setShowNotification(true);
      setLoading(false);
      return;
    }
    try {
      await window.electron.initRepo(
        path,
        repoUrl,
        selectedPackageManager || undefined,
        templateData
      );
      setMessage(
        `Project initialized successfully${
          selectedPackageManager ? ` with ${selectedPackageManager}` : ""
        }!`
      );
      setNotificationType("success");
      setShowNotification(true);
      setInitialized(true);
    } catch (e) {
      setMessage("Error during initialization: " + e);
      setNotificationType("error");
      setShowNotification(true);
    }
    setLoading(false);
  }, [path, selectedStack, selectedPackageManager, customRepo, userFavorites]);

  const handleOpenVSCode = useCallback(async () => {
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
  }, [path]);

  const handleReload = useCallback(() => {
    setPath("");
    setSelectedStack("");
    setSelectedPackageManager("");
    setCustomRepo("");
    setMessage("");
    setShowNotification(false);
    setInitialized(false);
  }, []);

  // Handle adding a favorite repository
  const handleAddFavorite = useCallback(
    async (
      name: string,
      repoUrl: string,
      iconType: string = "favorite",
      color: string = "zinc-400"
    ) => {
      try {
        const result = await window.electron.addFavoriteRepo(
          name,
          repoUrl,
          iconType,
          color
        );
        if (result.success) {
          setMessage(`Added ${name} to favorites!`);
          setNotificationType("success");
          setShowNotification(true);
          loadUserFavorites(); // Reload favorites
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        setMessage(`Failed to add favorite: ${error}`);
        setNotificationType("error");
        setShowNotification(true);
      }
    },
    [loadUserFavorites]
  );

  // Handle removing a favorite repository
  const handleRemoveFavorite = useCallback(
    async (name: string) => {
      try {
        const result = await window.electron.removeFavoriteRepo(name);
        if (result.success) {
          setMessage(`Removed ${name} from favorites`);
          setNotificationType("success");
          setShowNotification(true);
          loadUserFavorites(); // Reload favorites
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        setMessage(`Failed to remove favorite: ${error}`);
        setNotificationType("error");
        setShowNotification(true);
      }
    },
    [loadUserFavorites]
  );

  return (
    <>
      <TitleBar />
      <div
        className={cn(
          "w-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 overflow-y-auto py-4 pt-10 sm:pt-12 flex-1 min-h-0 z-1"
        )}
      >
        <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-5 content-container mt-0 sm:mt-2">
          <PathSelector path={path} setPath={setPath} />
          {/* Séparateur harmonieux entre select folder et stack */}
          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
            <span className="mx-2 sm:mx-4 text-zinc-400 font-semibold select-none text-xs sm:text-base tracking-wide px-2 sm:px-3 py-1 shadow-sm border-zinc-800">
              Choose stack
            </span>
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
          </div>
          <StackSelector
            selected={selectedStack}
            setSelected={setSelectedStack}
            userFavorites={userFavorites}
            onAddFavorite={() => setShowFavoriteManager(true)}
            onRemoveFavorite={handleRemoveFavorite}
          />

          {/* Séparateur "or" */}
          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
            <span className="mx-2 sm:mx-4 text-zinc-400 font-semibold select-none text-xs sm:text-base tracking-wide px-2 sm:px-3 py-1 shadow-sm border-zinc-800">
              or
            </span>
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
          </div>
          {/* Custom repo input */}
          <div className="w-full flex flex-col items-center gap-2">
            <button
              className={cn(
                "rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-4 sm:px-6 py-2 sm:py-3 font-semibold text-zinc-100 shadow-lg transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2",
                "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)] hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
                selectedStack === "Custom Repo" &&
                  "ring-2 ring-zinc-400/40 border-zinc-400 text-zinc-200"
              )}
              onClick={() => {
                // Toggle selection on/off when clicking the same option
                if (selectedStack === "Custom Repo") {
                  setSelectedStack("");
                  setCustomRepo(""); // Clear custom repo input when deselecting
                } else {
                  setSelectedStack("Custom Repo");
                }
              }}
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

          {/* Séparateur pour package manager */}
          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
            <span className="mx-2 sm:mx-4 text-zinc-400 font-semibold select-none text-xs sm:text-base tracking-wide px-2 sm:px-3 py-1 shadow-sm border-zinc-800">
              Package Manager
            </span>
            <div className="flex-grow border-t-2 border-zinc-800 rounded-full"></div>
          </div>
          <PackageManagerSelector
            selected={selectedPackageManager}
            setSelected={setSelectedPackageManager}
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center mt-6 sm:mt-8">
          <button
            className={cn(
              "rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-zinc-100 shadow-lg transition-all duration-200 flex items-center gap-2 sm:gap-3",
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
              <span className="flex items-center gap-2 sm:gap-3">
                Init <VscArrowRight />
              </span>
            )}
          </button>

          {initialized && (
            <button
              className={cn(
                "rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-zinc-100 shadow-lg transition-all duration-200 flex items-center gap-2 sm:gap-3",
                "hover:border-zinc-400 hover:shadow-[0_8px_32px_0_rgba(113,113,122,0.18)] hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40"
              )}
              onClick={handleOpenVSCode}
              type="button"
              style={{
                boxShadow: "inset 0 2px 8px 0 rgba(113,113,122,0.13)",
              }}
            >
              <span className="flex items-center gap-2 sm:gap-3">
                Open VSCode <VscCode />
              </span>
            </button>
          )}

          <button
            className={cn(
              "rounded-full border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-2 text-zinc-500 shadow-lg transition-all duration-200 flex items-center justify-center",
              "hover:border-zinc-600 hover:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40"
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
          "fixed left-0 top-0 h-full w-full flex justify-center items-center z-0 pointer-events-none"
        )}
      >
        {useMemo(
          () => (
            <img
              src={backgroundImage}
              alt="Background"
              className="max-w-full max-h-full object-contain opacity-90"
            />
          ),
          []
        )}
      </div>

      {/* Notification component */}
      <Notification
        message={message}
        type={notificationType}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      {/* Favorite manager modal */}
      {showFavoriteManager && (
        <div className="fixed inset-0 bg-zinc-900/80 flex items-start sm:items-center justify-center z-50 p-4 pt-11">
          <div className="bg-zinc-900 border-2 border-zinc-700 rounded-xl p-4 sm:p-6 max-w-lg w-full my-2 max-h-[calc(100vh-60px)] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-300 flex items-center gap-2">
                <span>Add a Favorite Repository</span>
              </h2>
              <button
                onClick={() => setShowFavoriteManager(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-full hover:bg-zinc-800"
              >
                <VscClose size={20} />
              </button>
            </div>
            <Suspense
              fallback={
                <div className="text-zinc-400 text-center py-4">Loading...</div>
              }
            >
              <FavoriteRepoManager
                userFavorites={userFavorites}
                onAddFavorite={handleAddFavorite}
                onRemoveFavorite={handleRemoveFavorite}
              />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
