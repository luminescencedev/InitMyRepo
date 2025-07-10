import { ElectronAPI } from "./electron/preload.cts";

declare global {
  interface Window {
    electron: ElectronAPI & {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void;
        on: (channel: string, listener: (...args: unknown[]) => void) => void;
        removeListener: (
          channel: string,
          listener: (...args: unknown[]) => void
        ) => void;
      };
      selectPath: () => Promise<string | null>;
      initRepo: (targetPath: string, repoUrl: string) => Promise<void>;
      openVSCode: (targetPath: string) => Promise<void>;
    };
  }
}
