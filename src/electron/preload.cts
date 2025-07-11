import { contextBridge, ipcRenderer } from "electron";

// Define valid channels for TypeScript
type ValidSendChannels =
  | "minimize"
  | "maximize"
  | "close"
  | "fullscreen"
  | "get-fullscreen-state";

// Create type-safe IPC interface
interface ElectronAPI {
  ipcRenderer: {
    send: (channel: ValidSendChannels, ...args: any[]) => void;
    on: (channel: string, listener: (...args: any[]) => void) => void;
    removeListener: (
      channel: string,
      listener: (...args: any[]) => void
    ) => void;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      // Whitelist channels
      const validChannels: ValidSendChannels[] = [
        "minimize",
        "maximize",
        "close",
        "fullscreen",
        "get-fullscreen-state",
      ];
      if (validChannels.includes(channel as ValidSendChannels)) {
        ipcRenderer.send(channel, ...args);
      } else {
        console.warn(`Invalid channel: ${channel}`);
      }
    },
    on: (channel: string, listener: (...args: any[]) => void) => {
      ipcRenderer.on(channel, listener);
    },
    removeListener: (channel: string, listener: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, listener);
    },
  },
  selectPath: async () => {
    // Use IPC to main process for dialog
    return await ipcRenderer.invoke("select-path");
  },
  initRepo: async (
    targetPath: string,
    repoUrl: string,
    packageManager?: string
  ) => {
    return await ipcRenderer.invoke(
      "init-repo",
      targetPath,
      repoUrl,
      packageManager
    );
  },
  openVSCode: async (targetPath: string) => {
    return await ipcRenderer.invoke("open-vscode", targetPath);
  },
  // Functions for managing favorite repos
  getFavoriteRepos: async () => {
    return await ipcRenderer.invoke("get-favorite-repos");
  },
  addFavoriteRepo: async (
    name: string,
    repoUrl: string,
    iconType: string = "favorite",
    color: string = "zinc-400"
  ) => {
    return await ipcRenderer.invoke(
      "add-favorite-repo",
      name,
      repoUrl,
      iconType,
      color
    );
  },
  removeFavoriteRepo: async (name: string) => {
    return await ipcRenderer.invoke("remove-favorite-repo", name);
  },
});

// Extended interface for user-added repo favorites
interface UserFavorite {
  name: string;
  repo: string;
  userAdded: true;
  iconType: string; // Icon type identifier
  color: string; // Color hex code or Tailwind color class
}

// Export types for renderer process usage
export type { ElectronAPI, UserFavorite };
