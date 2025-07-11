import { ElectronAPI, UserFavorite } from "./electron/preload.cts";

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
      initRepo: (
        targetPath: string,
        repoUrl: string,
        packageManager?: string
      ) => Promise<void>;
      openVSCode: (targetPath: string) => Promise<void>;
      // Favorite repos functions
      getFavoriteRepos: () => Promise<UserFavorite[]>;
      addFavoriteRepo: (
        name: string,
        repoUrl: string,
        iconType?: string,
        color?: string
      ) => Promise<{ success: boolean; error?: string }>;
      removeFavoriteRepo: (
        name: string
      ) => Promise<{ success: boolean; error?: string }>;
    };
  }
}
