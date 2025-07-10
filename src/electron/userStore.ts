import { app } from "electron";
import fs from "fs";
import path from "path";

// Interface for user favorites
interface UserFavorite {
  name: string;
  repo: string;
  userAdded: true; // Flag to distinguish user-added favorites from built-in templates
  iconType: string; // Icon type identifier
  color: string; // Color hex code or Tailwind color class
}

// Interface for user settings
interface UserSettings {
  favorites: UserFavorite[];
}

// Default settings
const defaultSettings: UserSettings = {
  favorites: [],
};

// Get the path for the user data
const getUserDataPath = (): string => {
  const userDataPath = path.join(app.getPath("userData"), "userSettings.json");
  return userDataPath;
};

// Load user settings from disk
export const loadUserSettings = (): UserSettings => {
  const userDataPath = getUserDataPath();

  try {
    if (fs.existsSync(userDataPath)) {
      const data = fs.readFileSync(userDataPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading user settings:", error);
  }

  // Return default settings if file doesn't exist or there was an error
  return defaultSettings;
};

// Save user settings to disk
export const saveUserSettings = (settings: UserSettings): void => {
  const userDataPath = getUserDataPath();

  try {
    fs.writeFileSync(userDataPath, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving user settings:", error);
  }
};

// Add a favorite repository
export const addFavoriteRepo = (
  name: string,
  repoUrl: string,
  iconType: string = "favorite",
  color: string = "zinc-400"
): void => {
  const settings = loadUserSettings();

  // Check if repo with same name already exists
  const existingIndex = settings.favorites.findIndex((f) => f.name === name);

  if (existingIndex >= 0) {
    // Update existing favorite
    settings.favorites[existingIndex].repo = repoUrl;
    // Update icon and color if provided
    if (iconType) settings.favorites[existingIndex].iconType = iconType;
    if (color) settings.favorites[existingIndex].color = color;
  } else {
    // Add new favorite
    settings.favorites.push({
      name,
      repo: repoUrl,
      userAdded: true,
      iconType,
      color,
    });
  }

  saveUserSettings(settings);
};

// Remove a favorite repository
export const removeFavoriteRepo = (name: string): void => {
  const settings = loadUserSettings();
  settings.favorites = settings.favorites.filter((f) => f.name !== name);
  saveUserSettings(settings);
};

// Get all favorite repositories
export const getFavoriteRepos = (): UserFavorite[] => {
  return loadUserSettings().favorites;
};
