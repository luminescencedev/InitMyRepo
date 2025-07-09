import { BrowserWindow, Menu, Tray, app } from "electron";
import { getAssetsPath } from "./pathResolver.js";
import path from "path";

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow) {
  if (tray) {
    return tray;
  }

  tray = new Tray(path.join(getAssetsPath(), "luminescence_icon@5x.png"));
  tray.setToolTip("InitMyRepo");

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show",
        click: () => {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          if (app.dock) {
            app.dock.show();
          }
        },
      },
      {
        label: "Hide",
        click: () => {
          mainWindow.hide();
          if (app.dock) {
            app.dock.hide();
          }
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => app.quit(),
      },
    ])
  );

  tray.on("double-click", () => {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    if (app.dock) {
      app.dock.show();
    }
  });

  tray.on("right-click", () => {
    tray?.popUpContextMenu();
  });

  return tray;
}
