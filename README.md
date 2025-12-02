# Electron + React + TanStack Router Application Setup Guide

A comprehensive guide for scaffolding a modern desktop application using Electron, React, TanStack Router, and optionally Java Spring Boot for backend services.

---

## 1. Create the Java Backend (Optional)

If you need a Java backend, generate one using [Spring Initializr](https://start.spring.io/) with your required dependencies.

---

## 2. Set Up the Electron Renderer using Vite + React

Create the frontend application:

```bash
npm create vite@latest frontend
```

Select React and TypeScript when prompted.

Install TanStack Router, Tailwind CSS, shadcn/ui, Storybook, and other dependencies as needed.

---

## 3. Restructure the Frontend Codebase

- Move React code → `src/renderer`
- Create Electron main process → `src/electron`
- Add a shared folder → `src/shared`

```
electron-app/
├── src/
│   ├── renderer/          # React UI code
│   │   ├── components/
│   │   ├── routes/
│   │   └── main.tsx
│   ├── electron/          # Electron main process
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   ├── database.ts
│   │   ├── pathResolver.ts
│   │   ├── util.ts
│   │   └── tsconfig.json
│   └── shared/            # Shared utilities and types
├── dist-react/            # Built React application (gitignore)
├── dist-electron/         # Compiled Electron code (gitignore)
├── electron-builder.json
└── package.json
```

This creates a clean separation between the UI, desktop logic, and shared modules.

---

## 4. Update `vite.config.ts`

- TanStack Router is configured to auto-generate route trees
- Path aliases are set
- Dev server uses port 5123
- Build output is `dist-react`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  server: {
    port: 5123,
  },
  build: {
    outDir: "dist-react",
  },
  resolve: {
    alias: {
      "@shared": "/src/shared",
      "@renderer": "/src/renderer",
    },
  },
});
```

---

## 5. Update `index.html`

Ensure the entry point matches your new structure:

```html
<script type="module" src="/src/renderer/main.tsx"></script>
```

---

## 6. Test the React Renderer

```bash
npm run dev
```

Confirm the UI runs on `http://localhost:5123`.

---

## 7. Install Electron and Native Modules

```bash
npm install electron electron-builder better-sqlite3 cross-env npm-run-all @types/better-sqlite3 electron-rebuild
```

---

## 8. Create the Electron Main Process

Inside `src/electron`, create:

- `main.ts`
- `tsconfig.json`

### `src/electron/main.ts` (with explanation comments)

```typescript
import { app, BrowserWindow } from "electron";
import path from "node:path";
import { isDev } from "./util.js";

// Creates the browser window instance where your React UI will load
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load from dev server in development, from built files in production
  if (isDev()) {
    win.loadURL("http://localhost:5123");
  } else {
    win.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  // macOS-specific behavior: reopen a window if dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
```

---

## 9. Create `src/electron/tsconfig.json` (with comments)

```json
{
  "compilerOptions": {
    // Enables strict type checking for safer TypeScript
    "strict": true,

    // Target modern JavaScript for Electron/Node
    "target": "ESNext",

    // Use NodeNext so Node.js-style imports work
    "module": "NodeNext",

    // Output for compiled Electron JS goes here
    "outDir": "../../dist-electron",

    // Skip type checking for .d.ts libs for faster builds
    "skipLibCheck": true,

    // Resolves modules using Node.js resolution rules
    "moduleResolution": "NodeNext"
  }
}
```

---

## 10. **IMPORTANT:** Update the Root TypeScript Configuration

Electron uses **two tsconfig layers**:

1. `electron-app/tsconfig.json` (root)
2. `src/electron/tsconfig.json` (local)

You **must** update the root `tsconfig.json` to ensure aliases work in both Electron and the renderer.

Example:

```json
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

## 11. Update `package.json` (with explanatory comments)

```json
{
  "name": "your-app-name",
  "version": "0.0.0",
  "private": true,
  "description": "Your app description",
  "author": {
    "name": "Your Name"
  },

  // Required for Electron to know what file to run after build
  "main": "dist-electron/main.js",

  "type": "module",

  "scripts": {
    // Install native dependencies after npm install
    "postinstall": "electron-builder install-app-deps && npm run rebuild",

    // Rebuild native modules for Electron
    "rebuild": "electron-rebuild -f -w better-sqlite3",

    // Builds React + Electron TypeScript
    "build": "vite build && tsc --project src/electron/tsconfig.json",

    // Development: runs React server and Electron in parallel
    "dev": "npm-run-all --parallel dev:react dev:electron",

    // Development command for React UI
    "dev:react": "vite",

    // Development command for Electron main process
    "dev:electron": "npm run transpile:electron && cross-env NODE_ENV=development electron .",

    // Compiles TypeScript → JavaScript using the electron tsconfig
    "transpile:electron": "tsc --project src/electron/tsconfig.json",

    // Build distribution packages for each platform
    "dist:win": "npm run transpile:electron && npm run build && electron-builder --config electron-builder.json --win --x64",
    "dist:mac": "npm run transpile:electron && npm run build && electron-builder --config electron-builder.json --mac --arm64",
    "dist:linux": "npm run transpile:electron && npm run build && electron-builder --config electron-builder.json --linux --x64",

    "lint": "eslint",
    "test": "vitest run"
  }
}
```

---

## 12. Build and Run the Electron App

Build everything:

```bash
npm run build
```

You should now have:

- `dist-react/` → built React UI
- `dist-electron/` → compiled Electron code

Ensure both directories are **gitignored**.

Then run Electron in development mode:

```bash
npm run dev
```

This will start the React server and launch Electron with hot-reload support.

---

## 13. Configure TanStack Router for Electron (Hash History)

Because Electron doesn't use browser navigation, change to `createHashHistory()`:

```typescript
import { createHashHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,

  // Key part for Electron: use hash-based history
  history: createHashHistory(),
});
```

📘 [TanStack Router History Types Documentation](https://tanstack.com/router/v1/docs/framework/react/guide/history-types)

---

## 14. Add Electron Builder to Package Application

To package the application for installation on Windows, Mac, or Linux, create `electron-builder.json`:

```json
{
  "appId": "com.yourcompany.yourapp",
  "icon": "./src/renderer/assets/app-icon.png",
  "productName": "Your App Name",
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

  // better-sqlite3 uses native C bindings, so it needs to be unpacked
  "asarUnpack": ["node_modules/better-sqlite3/**/*"],

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

Run `npm run dist:win` and it should package your application for windows.

---

## 15. Create Path Resolvers for Development and Production

### Create `src/electron/util.ts`

Determine what environment we are in:

```typescript
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}
```

### Create `src/electron/pathResolver.ts`

Resolve paths for both development and production environments:

```typescript
import { app } from "electron";
import path from "path";
import fs from "node:fs";
import { isDev } from "./util.js";

/**
 * Get the database file path based on environment
 * Development: Store in project root
 * Production: Store in user data directory
 */
export function getDatabasePath(): string {
  if (isDev()) {
    // Dev: Store in project root
    return "app-database.db";
  } else {
    // Production: Store in user data directory
    const userDataPath = app.getPath("userData");

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    return path.join(userDataPath, "app-database.db");
  }
}

export function getPreloadPath(): string {
  return path.join(
    app.getAppPath(),
    isDev() ? "." : "..",
    "/dist-electron/electron/preload.cjs"
  );
}

export function getUIPath(): string {
  return path.join(app.getAppPath(), "/dist-react/index.html");
}

export function getAssetPath(): string {
  return path.join(app.getAppPath(), isDev() ? "." : "..", "/src/assets");
}
```

Now when you run `npm run dev`, both the React server and Electron app will start. The Electron window will use the React dev server with hot reloading enabled.

---

## 16. Adding Database and Connection

Create `src/electron/database.ts` for initial database creation and optional seeding with SQLite3:

```typescript
import Database from "better-sqlite3";
import { getDatabasePath } from "./pathResolver.js";

let db: Database.Database | null = null;

/**
 * Initialize database schema
 * Creates all necessary tables if they don't exist
 */
function initSchema() {
  if (!db) return;

  // Create todos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 🔥 Create indexes for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
    CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
  `);

  console.log("Database schema initialized");
}

/**
 * Seed the database with sample data
 * Only runs if tables are empty
 */
function seedDatabase() {
  if (!db) return;

  // Seed todos table if empty
  const todoCount = db.prepare("SELECT COUNT(*) as count FROM todos").get() as {
    count: number;
  };

  if (todoCount.count === 0) {
    const insertTodo = db.prepare(
      "INSERT INTO todos (title, description, completed, priority, due_date) VALUES (@title, @description, @completed, @priority, @due_date)"
    );

    const insertManyTodos = db.transaction((todos) => {
      for (const todo of todos) insertTodo.run(todo);
    });

    insertManyTodos([
      {
        title: "Complete project documentation",
        description: "Write comprehensive README and API documentation",
        completed: 0,
        priority: "high",
        due_date: "2025-12-15",
      },
      {
        title: "Review pull requests",
        description: "Review and merge pending PRs from team members",
        completed: 0,
        priority: "medium",
        due_date: "2025-12-05",
      },
      {
        title: "Fix login bug",
        description: "Resolve authentication timeout issue reported by users",
        completed: 1,
        priority: "high",
        due_date: "2025-12-01",
      },
      {
        title: "Update dependencies",
        description: "Update npm packages to latest stable versions",
        completed: 0,
        priority: "low",
        due_date: "2025-12-20",
      },
      {
        title: "Team meeting preparation",
        description: "Prepare slides and agenda for weekly standup",
        completed: 1,
        priority: "medium",
        due_date: "2025-12-02",
      },
      {
        title: "Refactor database queries",
        description: "Optimize slow queries and add proper indexing",
        completed: 0,
        priority: "medium",
        due_date: "2025-12-10",
      },
    ]);

    console.log("Sample todo data inserted");
  }

  // Log current data
  const todos = db
    .prepare("SELECT * FROM todos ORDER BY created_at DESC")
    .all();
  console.log("Current todos in database:", todos);
}

/**
 * Initialize the database
 * Must be called after app.whenReady()
 */
export function initDatabase() {
  const dbPath = getDatabasePath();
  console.log("Database location:", dbPath);

  // 🔥 Remove verbose logging in production for better performance
  db = new Database(dbPath, { verbose: console.log });

  // 🔥 Performance optimizations
  // WAL mode allows multiple readers and better concurrency
  db.pragma("journal_mode = WAL");

  // Increase cache size from default 2MB to 10MB (10000 pages * 1KB)
  db.pragma("cache_size = 10000");

  // Store temporary tables in memory instead of disk
  db.pragma("temp_store = MEMORY");

  // Synchronous mode: NORMAL is faster and safe with WAL mode
  db.pragma("synchronous = NORMAL");

  // Memory-mapped I/O for faster reads (30MB)
  db.pragma("mmap_size = 30000000");

  console.log("Database optimizations applied");

  // Initialize schema first
  initSchema();

  // Seed with sample data
  seedDatabase();

  return db;
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  try {
    // If you want to be extra safe and use better-sqlite3's flag:
    if (!db || !(db as any).open) {
      console.log("Database connection is already closed");
      db = null;
      return;
    }

    db.pragma("wal_checkpoint(TRUNCATE)");
    db.close();
    console.log("Database connection closed");

    db = null;
  } catch (error) {
    console.error("Error closing database:", error);
  }
}
```

Update `src/electron/main.ts` to intialise database and close it on shutdown

```typescript
import { app, BrowserWindow } from "electron";

import path from "node:path";
import { isDev } from "./util.js";
import { closeDatabase, initDatabase } from "./database.js";

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

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    closeDatabase();
    app.quit();
  }
});

// Close database on app quit
app.on("quit", () => {
  if (process.platform === "darwin") {
    closeDatabase();
  }
});
```

When you run `npm install && npm run build && npm run dev` locally a database should be created.

## 17. Creating and Exposing an IPC API for Database Interaction

To interact with the database securely from the renderer, you’ll need to create a small IPC layer within the Electron main process. An example structure is available in the repository under electron-app/src/electron/ipc, which includes the IPC type definitions and handler setup.

Next, create the preload file at electron-app/src/electron/preload.cts. This file will expose a secure, type-safe API to the renderer through contextBridge. Ensure that this preload script is registered in your main.ts so it loads correctly when the app starts.

After launching the app, open the Developer Tools to confirm that the API has been registered. If something is misconfigured, you’ll usually see an error message there. You can also test the IPC functions directly in the console.

Finally, once you begin using the shared folder, remember to update all relevant output paths — especially in your package.json — because dist-electron will now include compiled files from the shared directory as well.

---

## Best Practices

1. **Separation of Concerns**: Keep renderer, electron, and shared code in separate directories
2. **Path Aliases**: Configure aliases in both root and electron tsconfig files
3. **Environment Detection**: Use `isDev()` utility to handle development vs. production paths
4. **Hash Routing**: Always use `createHashHistory()` for TanStack Router in Electron
5. **Native Modules**: Remember to configure `asarUnpack` for native dependencies like better-sqlite3
6. **Database Location**: Store production databases in user data directory, not app directory

---

## Troubleshooting

### Module Resolution Issues

- Ensure path aliases are configured in both root and electron tsconfig files
- Verify `baseUrl` and `paths` match your project structure

### SQLite3 Build Errors

- Run `npm run rebuild` after installing or updating dependencies
- Check that `electron-builder install-app-deps` runs in postinstall
- The issue occurs because native Node modules like better-sqlite3 need to be compiled specifically for Electron's Node.js version (NODE_MODULE_VERSION 140 in your case), not the system Node.js version (131).

### White Screen on Load

- Verify `main` field in package.json points to `dist-electron/main.js`
- Check browser console for path resolution errors
- Ensure `createHashHistory()` is used in router configuration

---

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [TanStack Router](https://tanstack.com/router)
- [Vite](https://vitejs.dev/)
- [electron-builder](https://www.electron.build/)

---

## License

[Your chosen license]

```

```
