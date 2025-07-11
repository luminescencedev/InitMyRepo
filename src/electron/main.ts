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
import type { TemplateData } from "./preload.cts";

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

  createTray(mainWindow);
  handleCloseEvents(mainWindow);

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

  ipcMain.handle(
    "init-repo",
    async (
      _event,
      targetPath: string,
      repoUrl: string,
      packageManager: string,
      templateData: TemplateData
    ) => {
      return new Promise((resolve, reject) => {
        if (!targetPath || (!repoUrl && !templateData)) {
          return reject("Missing path or repoUrl/templateData");
        }

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
          // Continue anyway, commands will handle non-empty directories
        }

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

        // Function to install dependencies after project creation
        const installDependencies = (additionalDeps?: string[]) => {
          const pkgJsonPath = path.join(targetPath, "package.json");

          if (!fs.existsSync(pkgJsonPath)) {
            finalizeWithCommit();
            return;
          }

          // Determine which package manager to use
          let installCommand = "npm install"; // default
          let addCommand = "npm install"; // for additional deps

          if (packageManager) {
            switch (packageManager.toLowerCase()) {
              case "yarn":
                installCommand = "yarn install";
                addCommand = "yarn add";
                break;
              case "pnpm":
                installCommand = "pnpm install";
                addCommand = "pnpm add";
                break;
              case "bun":
                installCommand = "bun install";
                addCommand = "bun add";
                break;
              default:
                installCommand = "npm install";
                addCommand = "npm install";
            }
          }

          // Install additional dependencies first if needed
          const installAdditional = () => {
            if (additionalDeps && additionalDeps.length > 0) {
              const additionalInstallCmd = `${addCommand} ${additionalDeps.join(
                " "
              )}`;
              console.log(
                "Installing additional dependencies:",
                additionalInstallCmd
              );

              exec(additionalInstallCmd, { cwd: targetPath }, (errAdd) => {
                if (errAdd) {
                  console.warn(
                    "Additional dependencies install failed:",
                    errAdd
                  );
                }
                // Continue with main install regardless
                mainInstall();
              });
            } else {
              mainInstall();
            }
          };

          // Main dependency installation
          const mainInstall = () => {
            let installCompleted = false;

            const installTimeout = setTimeout(() => {
              if (!installCompleted) {
                console.warn(
                  `${
                    packageManager || "npm"
                  } install took too long, proceeding anyway`
                );
                installCompleted = true;
                finalizeWithCommit();
              }
            }, 60000); // 1 minute timeout

            exec(
              installCommand,
              { cwd: targetPath },
              (err3, stdout, stderr) => {
                clearTimeout(installTimeout);

                if (!installCompleted) {
                  installCompleted = true;

                  if (err3) {
                    console.warn(
                      `${
                        packageManager || "npm"
                      } install failed, but continuing:`,
                      err3
                    );
                    console.warn("stderr:", stderr);
                  }

                  finalizeWithCommit();
                }
              }
            );
          };

          installAdditional();
        };

        // Check if this is a Vite template
        if (
          templateData &&
          "isViteTemplate" in templateData &&
          templateData.isViteTemplate
        ) {
          // Use create vite for built-in Vite templates
          const projectName = path.basename(targetPath);
          const parentDir = path.dirname(targetPath);

          // Determine create command based on package manager
          let createCommand = `npm create vite@latest ${projectName} -- --template ${templateData.viteTemplate}`;

          if (packageManager) {
            switch (packageManager.toLowerCase()) {
              case "yarn":
                createCommand = `yarn create vite ${projectName} --template ${templateData.viteTemplate}`;
                break;
              case "pnpm":
                createCommand = `pnpm create vite ${projectName} --template ${templateData.viteTemplate}`;
                break;
              case "bun":
                createCommand = `bun create vite ${projectName} --template ${templateData.viteTemplate}`;
                break;
            }
          }

          console.log("Creating Vite project with command:", createCommand);

          // Create the Vite project in parent directory
          exec(createCommand, { cwd: parentDir }, (err, stdout, stderr) => {
            if (err) {
              console.error("Vite creation error:", err);
              console.error("stderr:", stderr);
              return reject("Erreur lors de la création Vite: " + err);
            }

            console.log("Vite project created successfully");

            try {
              // Initialize git
              exec(`git init`, { cwd: targetPath }, (err2) => {
                if (err2) {
                  console.warn("Git init failed:", err2);
                }

                // Install additional dependencies if needed (like Tailwind)
                if (templateData.installTailwind) {
                  console.log("Installing TailwindCSS with Vite plugin...");

                  // Determine install command for TailwindCSS v4 with Vite plugin
                  let tailwindInstallCommand =
                    "npm install tailwindcss @tailwindcss/vite";
                  if (packageManager) {
                    switch (packageManager.toLowerCase()) {
                      case "yarn":
                        tailwindInstallCommand =
                          "yarn add tailwindcss @tailwindcss/vite";
                        break;
                      case "pnpm":
                        tailwindInstallCommand =
                          "pnpm add tailwindcss @tailwindcss/vite";
                        break;
                      case "bun":
                        tailwindInstallCommand =
                          "bun add tailwindcss @tailwindcss/vite";
                        break;
                    }
                  }

                  exec(
                    tailwindInstallCommand,
                    { cwd: targetPath },
                    (tailwindErr) => {
                      if (tailwindErr) {
                        console.warn(
                          "TailwindCSS installation failed:",
                          tailwindErr
                        );
                        finalizeWithCommit();
                      } else {
                        console.log("TailwindCSS installed successfully");

                        // Update vite.config.ts to include TailwindCSS plugin
                        const viteConfigPath = path.join(
                          targetPath,
                          "vite.config.ts"
                        );
                        fs.readFile(viteConfigPath, "utf8", (readErr, data) => {
                          if (readErr) {
                            console.warn(
                              "Could not read vite.config.ts:",
                              readErr
                            );
                            finalizeWithCommit();
                            return;
                          }

                          // Add TailwindCSS import and plugin
                          let updatedConfig = data;

                          // Add import if not present
                          if (!updatedConfig.includes("@tailwindcss/vite")) {
                            updatedConfig = updatedConfig.replace(
                              "import { defineConfig } from 'vite'",
                              "import { defineConfig } from 'vite'\nimport tailwindcss from '@tailwindcss/vite'"
                            );
                          }

                          // Add plugin to plugins array
                          if (updatedConfig.includes("plugins: [")) {
                            // Add to existing plugins array
                            updatedConfig = updatedConfig.replace(
                              /plugins:\s*\[(.*?)\]/s,
                              (match, plugins) => {
                                const trimmedPlugins = plugins.trim();
                                if (
                                  trimmedPlugins &&
                                  !trimmedPlugins.endsWith(",")
                                ) {
                                  return `plugins: [${trimmedPlugins}, tailwindcss()]`;
                                } else {
                                  return `plugins: [${trimmedPlugins}tailwindcss()]`;
                                }
                              }
                            );
                          } else {
                            // Add plugins array
                            updatedConfig = updatedConfig.replace(
                              "export default defineConfig({",
                              "export default defineConfig({\n  plugins: [tailwindcss()],"
                            );
                          }

                          fs.writeFile(
                            viteConfigPath,
                            updatedConfig,
                            (writeErr) => {
                              if (writeErr) {
                                console.warn(
                                  "Failed to update vite.config.ts:",
                                  writeErr
                                );
                              } else {
                                console.log(
                                  "Vite config updated with TailwindCSS plugin"
                                );
                              }

                              // Update CSS file to use new @import syntax
                              const cssPath = path.join(
                                targetPath,
                                "src",
                                "index.css"
                              );
                              const tailwindCSS = `@import "tailwindcss";\n`;

                              fs.writeFile(
                                cssPath,
                                tailwindCSS,
                                (cssWriteErr) => {
                                  if (cssWriteErr) {
                                    console.warn(
                                      "Failed to create Tailwind CSS file:",
                                      cssWriteErr
                                    );
                                  } else {
                                    console.log(
                                      "TailwindCSS setup completed with @import"
                                    );
                                  }
                                  finalizeWithCommit();
                                }
                              );
                            }
                          );
                        });
                      }
                    }
                  );
                } else {
                  finalizeWithCommit();
                }
              });
            } catch (error) {
              console.error("Error during Vite project setup:", error);
              reject(`Error during Vite project setup: ${error}`);
            }
          });
        } else if (
          templateData &&
          "isExpressTemplate" in templateData &&
          templateData.isExpressTemplate
        ) {
          // Use express-generator for Express templates
          const projectName = path.basename(targetPath);
          const parentDir = path.dirname(targetPath);

          // Determine express-generator command based on package manager
          let createCommand = `npx express-generator${
            templateData.expressOptions ? ` ${templateData.expressOptions}` : ""
          } ${projectName}`;

          if (packageManager) {
            switch (packageManager.toLowerCase()) {
              case "yarn":
                createCommand = `yarn create express-generator${
                  templateData.expressOptions
                    ? ` ${templateData.expressOptions}`
                    : ""
                } ${projectName}`;
                break;
              case "pnpm":
                createCommand = `pnpm dlx express-generator${
                  templateData.expressOptions
                    ? ` ${templateData.expressOptions}`
                    : ""
                } ${projectName}`;
                break;
              case "bun":
                createCommand = `bunx express-generator${
                  templateData.expressOptions
                    ? ` ${templateData.expressOptions}`
                    : ""
                } ${projectName}`;
                break;
            }
          }

          console.log("Creating Express project with command:", createCommand);

          // Create the Express project in parent directory
          exec(createCommand, { cwd: parentDir }, (err, stdout, stderr) => {
            if (err) {
              console.error("Express creation error:", err);
              console.error("stderr:", stderr);
              return reject("Erreur lors de la création Express: " + err);
            }

            console.log("Express project created successfully");

            try {
              // Initialize git
              exec(`git init`, { cwd: targetPath }, (err2) => {
                if (err2) {
                  console.warn("Git init failed:", err2);
                }

                // Install TypeScript support if needed
                if (templateData.useTypeScript) {
                  console.log("Setting up TypeScript for Express...");

                  // Determine install command for TypeScript
                  let typescriptInstallCommand =
                    "npm install -D typescript @types/node @types/express ts-node nodemon";
                  if (packageManager) {
                    switch (packageManager.toLowerCase()) {
                      case "yarn":
                        typescriptInstallCommand =
                          "yarn add -D typescript @types/node @types/express ts-node nodemon";
                        break;
                      case "pnpm":
                        typescriptInstallCommand =
                          "pnpm add -D typescript @types/node @types/express ts-node nodemon";
                        break;
                      case "bun":
                        typescriptInstallCommand =
                          "bun add -D typescript @types/node @types/express ts-node nodemon";
                        break;
                    }
                  }

                  exec(
                    typescriptInstallCommand,
                    { cwd: targetPath },
                    (tsErr) => {
                      if (tsErr) {
                        console.warn("TypeScript installation failed:", tsErr);
                        finalizeWithCommit();
                      } else {
                        console.log("TypeScript installed successfully");

                        // Create tsconfig.json
                        const tsConfig = {
                          compilerOptions: {
                            target: "ES2020",
                            module: "commonjs",
                            lib: ["ES2020"],
                            outDir: "./dist",
                            rootDir: "./src",
                            strict: true,
                            moduleResolution: "node",
                            esModuleInterop: true,
                            skipLibCheck: true,
                            forceConsistentCasingInFileNames: true,
                            resolveJsonModule: true,
                          },
                          include: ["src/**/*"],
                          exclude: ["node_modules", "dist"],
                        };

                        fs.writeFile(
                          path.join(targetPath, "tsconfig.json"),
                          JSON.stringify(tsConfig, null, 2),
                          (writeErr) => {
                            if (writeErr) {
                              console.warn(
                                "Failed to create tsconfig.json:",
                                writeErr
                              );
                            } else {
                              console.log("TypeScript configuration created");
                            }
                            finalizeWithCommit();
                          }
                        );
                      }
                    }
                  );
                } else {
                  // Just install dependencies and finalize
                  installDependencies();
                }
              });
            } catch (error) {
              console.error("Error during Express project setup:", error);
              reject(`Error during Express project setup: ${error}`);
            }
          });
        } else {
          // Use git clone for custom repos and non-Vite templates
          if (!repoUrl) {
            return reject("Repository URL required for non-Vite templates");
          }

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

                installDependencies();
              });
            } catch (error) {
              console.error("Error during repository initialization:", error);
              reject(`Error during repository setup: ${error}`);
            }
          });
        }
      });
    }
  );
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
