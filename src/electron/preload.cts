import { contextBridge, ipcRenderer } from "electron";

// Define valid channels for TypeScript
type ValidSendChannels = "minimize" | "maximize" | "close";

// Create type-safe IPC interface
interface ElectronAPI {
  ipcRenderer: {
    send: (channel: ValidSendChannels, ...args: any[]) => void;
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
      ];
      if (validChannels.includes(channel as ValidSendChannels)) {
        console.log(`Sending IPC message: ${channel}`, args);
        ipcRenderer.send(channel, ...args);
      } else {
        console.warn(`Invalid channel: ${channel}`);
      }
    },
  },
});

// Export type for renderer process usage
export type { ElectronAPI };
