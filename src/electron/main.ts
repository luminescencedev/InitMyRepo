import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import { createTray } from "./tray.js";
import { globalShortcut, dialog } from "electron";
import fs from "fs";
import { exec } from "child_process";
import {
  addFavoriteRepo,
  removeFavoriteRepo,
  getFavoriteRepos,
} from "./userStore.js";

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

  // Handlers for favorite repositories
  ipcMain.handle("get-favorite-repos", async () => {
    return getFavoriteRepos();
  });

  ipcMain.handle(
    "add-favorite-repo",
    async (
      _event,
      name: string,
      repoUrl: string,
      iconType: string = "favorite",
      color: string = "zinc-400"
    ) => {
      try {
        addFavoriteRepo(name, repoUrl, iconType, color);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  );

  ipcMain.handle("remove-favorite-repo", async (_event, name: string) => {
    try {
      removeFavoriteRepo(name);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("init-repo", async (_event, targetPath, repoUrl) => {
    return new Promise((resolve, reject) => {
      if (!targetPath || !repoUrl) return reject("Missing path or repoUrl");

      // Check if directory exists and is accessible
      try {
        if (!fs.existsSync(targetPath)) {
          return reject(`Target directory doesn't exist: ${targetPath}`);
        }

        // Check if directory is writable
        fs.accessSync(targetPath, fs.constants.W_OK);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reject(`Cannot access target directory: ${errorMessage}`);
      }

      // Check if directory is empty
      const files = fs.readdirSync(targetPath);
      if (files.length > 0) {
        // Continue anyway, git clone will fail if directory is not empty
      }

      // Clone repo
      exec(`git clone ${repoUrl} .`, { cwd: targetPath }, (err) => {
        if (err) return reject("Erreur lors du clonage: " + err);

        try {
          // Remove .git directory if it exists
          const gitDir = path.join(targetPath, ".git");
          if (fs.existsSync(gitDir)) {
            fs.rmSync(gitDir, {
              recursive: true,
              force: true,
            });
          }

          // Re-init git
          exec(`git init`, { cwd: targetPath }, (err2) => {
            if (err2) return reject("Erreur git init: " + err2);

            // First check if this is a JavaScript/Node project
            const pkgJsonPath = path.join(targetPath, "package.json");
            const hasPackageJson = fs.existsSync(pkgJsonPath);

            // Function to finalize with git commit
            const finalizeWithCommit = () => {
              exec(
                `git add . && git commit -m "Initial commit"`,
                { cwd: targetPath },
                (errCommit) => {
                  if (errCommit) {
                    console.warn(
                      "Avertissement: commit initial échoué: " + errCommit
                    );
                    // Not critical, we continue
                  }
                  // Always resolve successfully at this point
                  resolve("OK");
                }
              );
            };

            // Always finalize with git commit, regardless of npm install success
            const doFinalCommit = () => {
              finalizeWithCommit();
            };

            // Skip npm install completely if no package.json
            if (!hasPackageJson) {
              doFinalCommit();
            } else {
              // Triple-check if package.json exists to avoid errors
              fs.access(pkgJsonPath, fs.constants.F_OK, (err) => {
                if (err) {
                  // File doesn't exist or can't be accessed despite our previous check
                  console.warn(
                    "package.json couldn't be accessed, skipping npm install:",
                    err
                  );
                  doFinalCommit();
                } else {
                  // Read file content to make sure it's valid
                  fs.readFile(pkgJsonPath, "utf8", (readErr, data) => {
                    if (readErr) {
                      console.warn(
                        "Couldn't read package.json content, skipping npm install:",
                        readErr
                      );
                      doFinalCommit();
                      return;
                    }

                    try {
                      // Validate JSON
                      JSON.parse(data);

                      // Use exec with timeout handling
                      let npmCompleted = false;

                      // Add timeout to prevent hanging
                      const npmTimeout = setTimeout(() => {
                        if (!npmCompleted) {
                          console.warn(
                            "npm install took too long, proceeding anyway"
                          );
                          npmCompleted = true;
                          doFinalCommit();
                        }
                      }, 60000); // 1 minute timeout

                      exec(
                        `npm install`,
                        { cwd: targetPath },
                        (err3, stdout, stderr) => {
                          clearTimeout(npmTimeout);

                          // Only proceed if we haven't already due to timeout
                          if (!npmCompleted) {
                            npmCompleted = true;

                            if (err3) {
                              console.warn(
                                "npm install failed, but continuing:",
                                err3
                              );
                              console.warn("stderr:", stderr);
                            }

                            doFinalCommit();
                          }
                        }
                      );
                    } catch (jsonError) {
                      console.warn(
                        "Invalid package.json content, skipping npm install:",
                        jsonError
                      );
                      doFinalCommit();
                    }
                  });
                }
              });
            }
          });
        } catch (error) {
          console.error("Error during repository initialization:", error);
          reject(`Error during repository setup: ${error}`);
        }
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
