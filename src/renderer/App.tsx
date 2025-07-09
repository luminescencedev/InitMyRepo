import React, { useState } from "react";
import TitleBar from "./components/TitleBar/TitleBar";
import PathSelector from "./components/PathSelector";
import StackSelector from "./components/StackSelector";
import CustomRepoInput from "./components/CustomRepoInput";
import data from "./data.json";
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
          "h-[calc(100vh-36px)] w-screen flex flex-col justify-center items-center border"
        )}
      >
        <PathSelector path={path} setPath={setPath} />
        <div className={cn("border")}>
          <div className={cn("border")}>
            <span>Choose a stack:</span>
            <StackSelector
              selected={selectedStack}
              setSelected={setSelectedStack}
            />
          </div>
          <div className={cn("border")}>
            <span>Or custom repo:</span>
            <button
              className={cn("")}
              onClick={() => setSelectedStack("Custom Repo")}
            >
              Custom Repo
            </button>
            {selectedStack === "Custom Repo" && (
              <CustomRepoInput value={customRepo} onChange={setCustomRepo} />
            )}
          </div>
        </div>
        <button className={cn("")} onClick={handleInit} disabled={loading}>
          {loading ? "Initializing..." : "Initialize Project"}
        </button>
        {message && <div className={cn("")}>{message}</div>}
      </div>
    </>
  );
}

export default App;
