import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import { createTray } from "./tray.js";
import { globalShortcut, dialog } from "electron";
import fs from "fs";
import { exec } from "child_process";

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

  globalShortcut.register("CommandOrControl+Shift+M", () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const win = windows[0];
      if (!win.isMaximized()) {
        win.maximize();
      } else {
        win.unmaximize();
      }
    }
  });

  ipcMain.on("minimize", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on("close", () => {
    if (mainWindow) {
      mainWindow.close();
    }
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

  ipcMain.on("fullscreen", () => {
    if (mainWindow) {
      if (!mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
      } else {
        mainWindow.setFullScreen(false);
      }
    }
  });

  // Ajout : répondre à la requête d'état fullscreen
  ipcMain.on("get-fullscreen-state", () => {
    if (mainWindow) {
      mainWindow.webContents.send(
        "fullscreen-state",
        mainWindow.isFullScreen()
      );
    }
  });

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("fullscreen-state", true);
  });
  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("fullscreen-state", false);
  });

  ipcMain.handle("select-path", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle("open-vscode", async (_event, targetPath) => {
    return new Promise((resolve, reject) => {
      if (!targetPath) return reject("Missing path");
      exec("code .", { cwd: targetPath }, (err) => {
        if (err) return reject("Erreur ouverture VSCode: " + err);
        resolve("VSCode opened successfully");
      });
    });
  });

  ipcMain.handle("init-repo", async (_event, targetPath, repoUrl) => {
    return new Promise((resolve, reject) => {
      if (!targetPath || !repoUrl) return reject("Missing path or repoUrl");
      // Clone repo
      exec(`git clone ${repoUrl} .`, { cwd: targetPath }, (err) => {
        if (err) return reject("Erreur lors du clonage: " + err);
        // Remove .git
        fs.rmSync(path.join(targetPath, ".git"), {
          recursive: true,
          force: true,
        });
        // Re-init git
        exec(`git init`, { cwd: targetPath }, (err2) => {
          if (err2) return reject("Erreur git init: " + err2);
          // Install deps first
          exec(`npm install`, { cwd: targetPath }, (err3) => {
            if (err3) return reject("Erreur npm install: " + err3);
            // Add all files and commit after install
            exec(
              `git add . && git commit -m "Initial commit"`,
              { cwd: targetPath },
              (errCommit) => {
                if (errCommit)
                  return reject("Erreur commit initial: " + errCommit);
                // Ne plus ouvrir VSCode automatiquement
                resolve("OK");
              }
            );
          });
        });
      });
    });
  });

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

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
}
