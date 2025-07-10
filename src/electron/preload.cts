import { contextBridge, ipcRenderer } from "electron";
import { dialog } from "electron";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

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
        console.log(`Sending IPC message: ${channel}`, args);
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
  initRepo: async (targetPath: string, repoUrl: string) => {
    return await ipcRenderer.invoke("init-repo", targetPath, repoUrl);
  },
  openVSCode: async (targetPath: string) => {
    return await ipcRenderer.invoke("open-vscode", targetPath);
  },
});

// Export type for renderer process usage
export type { ElectronAPI };
