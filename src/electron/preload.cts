import { contextBridge, ipcRenderer } from "electron";

type ValidSendChannels = "minimize" | "maximize" | "close";

interface ElectronAPI {
  ipcRenderer: {
    send: (channel: ValidSendChannels, ...args: any[]) => void;
  };
}

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
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

export type { ElectronAPI };
