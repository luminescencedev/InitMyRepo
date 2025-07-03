import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import { createTray } from "./tray.js";

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    frame: false,
    resizable: true,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), "/luminescence_icon.png"),
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist-electron/preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },

    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:8080");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  ipcMain.on("minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("close", () => {
    mainWindow.close();
  });

  ipcMain.on("maximize", () => {
    if (mainWindow) {
      if (!mainWindow.isMaximized()) {
        mainWindow.maximize();
      } else {
        mainWindow.unmaximize();
      }
    }
  });

  // Add handler for showing menus

  createTray(mainWindow);

  handleCloseEvents(mainWindow);
});

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on("close", (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on("before-quit", () => {
    willClose = true;
  });

  mainWindow.on("show", () => {
    willClose = false;
  });
}
