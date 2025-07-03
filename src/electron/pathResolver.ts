import { app } from "electron";
import path from "path";
import { isDev } from "./utils.js";

export function getAssetsPath() {
  return path.join(app.getAppPath(), isDev() ? "." : "..", "src/assets");
}

export function getUIPath() {
  return path.join(app.getAppPath(), "/dist-react/index.html");
}
