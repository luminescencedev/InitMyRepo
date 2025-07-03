// import { ipcMain, WebFrameMain } from "electron";
// import { getUIPath } from "./pathResolver.js";
// import { EventPayloadMapping } from "../../types.js";
// import { pathToFileURL } from "url";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

// export function ipcMainOn<Key extends keyof EventPayloadMapping>(
//   key: Key,
//   handler: (payload: EventPayloadMapping[Key]) => void
// ) {
//   ipcMain.on(key, (event, payload) => {
//     validateEventFrame(event.senderFrame);
//     return handler(payload);
//   });
// }

// export function validateEventFrame(frame: WebFrameMain) {
//   if (isDev() && new URL(frame.url).host === "localhost:5123") {
//     return;
//   }
//   if (frame.url !== pathToFileURL(getUIPath()).toString()) {
//     throw new Error("Malicious event");
//   }
// }
