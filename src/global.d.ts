import { ElectronAPI } from "./electron/preload.cts";

declare global {
  interface Window {
    electron: ElectronAPI;
  }

  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void;
      };
    };
  }
}
