import { app } from "electron";
import path from "path";
import { isDev } from "./utils.js";

export function getAssetsPath() {
  if (isDev()) {
    return path.join(app.getAppPath(), "src/assets");
  } else {
    // En production, les assets sont dans resources/assets
    return path.join(process.resourcesPath, "assets");
  }
}

export function getUIPath() {
  return path.join(app.getAppPath(), "dist-react/index.html");
}
