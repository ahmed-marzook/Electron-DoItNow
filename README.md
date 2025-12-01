# Electron + React + TanStack Router + Java Spring Scaffolding Guide (Updated With Comments)

## 1. Create the Java backend

Generate your backend using **Spring Initializr** with the dependencies you need.

---

## 2. Set up the Electron renderer using Vite + React

Create the frontend:

```sh
npm create vite@latest frontend
```

Install TanStack Router, Tailwind, shadcn (optional), Storybook, etc. as required.

---

## 3. Restructure the frontend codebase

- Move React code → `src/renderer`
- Create Electron main process → `src/electron`
- Add a shared folder → `src/shared`

This makes a clean separation between the UI, backend logic, and shared modules.

---

## 4. Update `vite.config.ts`

Ensure:

- TanStack Router is configured to auto-generate route trees.
- Path aliases are set.
- Dev server uses **port 5123**.
- Build output is **`dist-react`**.

---

## 5. Update `index.html`

Ensure the entry point matches your new structure:

```
src/renderer/main.tsx
```

---

## 6. Test the React renderer

```sh
npm run dev
```

Confirm the UI runs on `http://localhost:5123`.

---

## 7. Install Electron + native modules

```bash
npm install -D electron electron-rebuild electron-builder better-sqlite3 cross-env npm-run-all @types/better-sqlite3
```

---

## 8. Create the Electron main process

Inside `src/electron`, create:

- `main.ts`
- `tsconfig.json`

### `src/electron/main.ts` (with explanation comments)

```ts
import { app, BrowserWindow } from "electron";
import path from "node:path";

// Creates the browser window instance where your React UI will load
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // you can add preload scripts here if needed
  });

  // Load the built React UI from dist-react
  // This ensures production builds load the correct HTML
  win.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
}

app.whenReady().then(() => {
  createWindow();

  // macOS-specific behaviour: reopen a window if dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
```

---

## 9. `src/electron/tsconfig.json` (now with comments)

```jsonc
{
  "compilerOptions": {
    // Enables strict type checking, safer TypeScript
    "strict": true,

    // Target modern JS for Electron/Node
    "target": "ESNext",

    // Use NodeNext so Node.js-style imports work
    "module": "NodeNext",

    // Output for compiled Electron JS goes here
    "outDir": "../../dist-electron",

    // Skip type checking for `.d.ts` libs for faster builds
    "skipLibCheck": true,

    // Resolves modules using Node.js resolution rules
    "moduleResolution": "NodeNext"

    // IMPORTANT: If you add aliases, update here (example below)
    // "paths": {
    //   "@shared/*": ["../shared/*"],
    //   "@renderer/*": ["../renderer/*"]
    // }
  }
}
```

---

## 9.1 **IMPORTANT:** Update the _root_ Electron TypeScript config too

Electron uses **two tsconfig layers**:

1. `electron-app/tsconfig.json` (root)
2. `src/electron/tsconfig.json` (local)

You **must** update the root `electron-app/tsconfig.json` to ensure aliases work in both Electron and the renderer.

Example:

```jsonc
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@shared/*": ["shared/*"],
      "@renderer/*": ["renderer/*"],
      "@electron/*": ["electron/*"]
    }
  },
  "exclude": ["node_modules", "dist-react", "dist-electron"]
}
```

This ensures:

- Electron main process can import shared modules cleanly
- Your preload scripts (if added later) also resolve paths
- VSCode and TypeScript understand your aliases globally

---

## 10. Update `package.json` (with explanatory comments)

```jsonc
{
  "name": "do-it-now",
  "version": "0.0.0",
  "private": true,
  "description": "To Do App in electron with server save",

  "author": { "name": "Ahmed Marzook" },

  // Required for Electron to know what file to run after build
  "main": "dist-electron/main.js",

  "type": "module",

  "scripts": {
    // Builds React + Electron TypeScript
    "build": "vite build && npm run transpile:electron",

    // Development command for React UI
    "dev:react": "vite --port 3000",

    // Development command for Electron main process
    "dev:electron": "npm run transpile:electron && electron .",

    // Compiles TS → JS using the electron tsconfig
    "transpile:electron": "tsc --project src/electron/tsconfig.json",

    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",

    "lint": "eslint",
    "format": "prettier",
    "check": "prettier --write . && eslint --fix",
    "serve": "vite preview",
    "test": "vitest run"
  }
}
```

---

## 11. Build + run the Electron app

Build everything:

```sh
npm run build
```

You should now have:

- `dist-react/` → built React UI
- `dist-electron/` → compiled Electron code

Ensure both directories are **gitignored**.

Then run Electron:

```sh
npm run dev
```

---

## 12. Configure TanStack Router for Electron (hash history)

Because Electron doesn't use browser navigation, change to `createHashHistory()`.

```ts
import { createHashHistory, createRouter } from "@tanstack/react-router";

const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,

  // Key part for Electron:
  history: createHashHistory(),
});
```

📘 Docs:
[https://tanstack.com/router/v1/docs/framework/react/guide/history-types](https://tanstack.com/router/v1/docs/framework/react/guide/history-types)

## 13. Add Electron Builder to package application

To package the applciation to install and use on windows, mac or linux using electron builder create a file in `./electron-app/electron-builder.json` and add the following contents

```json
{
  "appId": "com.sabrlabs.circle-sync",
  "icon": "./src/renderer/assets/tanstack-circle-logo.png", // Icon is needed for windows exe to build
  "productName": "Circle Sync",
  "directories": {
    "output": "dist",
    "buildResources": "src/renderer/assets"
  },
  "files": [
    "dist-electron",
    "dist-react",
    "package.json",
    "!node_modules/@esbuild/**/*"
  ],
  "asarUnpack": ["node_modules/better-sqlite3/**/*"], // better-sqlite3 uses C so this needs to be bundled with the code
  "nativeRebuilder": "sequential",
  "npmRebuild": true,
  "buildDependenciesFromSource": true,
  "win": {
    "target": ["nsis", "portable", "msi"]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  },
  "mac": {
    "target": ["dmg", "zip"]
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "category": "Utility"
  }
}
```

## 14. Updated package.json scripts to build the app as well as DX improvement

include the script to build the electron app for windows, mac and linux

```json
"scripts": {
    "postinstall": "electron-builder install-app-deps", // Needed to install the sqlite 3 dependencies
    "rebuild": "electron-rebuild -f -w better-sqlite3",
    "build": "vite build && tsc",
    "build-storybook": "storybook build",
    "check": "prettier --write . && eslint --fix",
    "dev": "npm-run-all --parallel dev:react dev:electron", // combined the command and to run the server and electron in parallel
    "dev:electron": "npm run transpile:electron && cross-env NODE_ENV=development electron .", // this will also use the envroment variable NODE_ENV to know we are in development or production
    "dev:react": "vite",
    "dist:linux": "npm run transpile:electron && npm run build && electron-builder --config electron-builder.json --linux --x64", // linux setip
    "dist:mac": "npm run transpile:electron && npm run build && electron-builder --config electron-builder.json --mac --arm64", // Mac Setup for arm
    "dist:win": "npm run transpile:electron && npm run build && electron-builder --config electron-builder.json --win --x64", // windows setup
    "format": "prettier",
    "lint": "eslint",
    "serve": "vite preview",
    "storybook": "storybook dev -p 6006",
    "test": "vitest run",
    "transpile:electron": "tsc --project src/electron/tsconfig.json"
  },
```

## 15. Update paths for development and production packaged

Create a file `src/electron/util.ts` to fetch what enviroment we are in

```typescript
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}
```

Create a file `src/electron/pathResolver.ts` to resolve the path to either use the react server or the files in the package also included the database path this will be setup in the next set of instructions

```typescript
import { app } from "electron";
import path from "path";
import { isDev } from "./util.js";
import fs from "node:fs";

/**
 * Get the database file path based on environment
 * Development: Store in project root
 * Production: Store in user data directory
 */
export function getDatabasePath(): string {
  if (isDev()) {
    // Dev: Store in project root
    return "dot-it-now.db";
  } else {
    // Production: Store in user data directory
    const userDataPath = app.getPath("userData");

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    return path.join(userDataPath, "dot-it-now.db");
  }
}

export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? "." : "..",
    "/dist-electron/electron/preload.cjs"
  );
}

export function getUIPath() {
  return path.join(app.getAppPath(), "/dist-react/index.html");
}

export function getAssetPath() {
  return path.join(app.getAppPath(), isDev() ? "." : "..", "/src/assets");
}
```

update `src/electron/main.ts` create window function

```typescript
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev()) {
    win.loadURL("http://localhost:5123");
  } else {
    win.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
}
```

now run `npm run dev` and you should see that a react server starts up and the elctron app as well whcih opens a browser windows using the react server and hot reloading works
