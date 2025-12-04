# Do It Now - Todo Application

A modern desktop Todo application built with **Electron**, **React**, **TanStack Router**, and **Java Spring Boot**.

## Project Overview

**Do It Now** is a cross-platform desktop application designed to help you manage your tasks efficiently. It features a robust **Electron** frontend using **React** for the UI and **SQLite** for local data persistence. It also includes a **Java Spring Boot** backend for advanced features and API capabilities.

## Tech Stack

*   **Frontend**: React, TanStack Router, Tailwind CSS, TypeScript
*   **Desktop Shell**: Electron
*   **Local Database**: SQLite (via `better-sqlite3`)
*   **Backend**: Java 21, Spring Boot 3
*   **Build Tools**: Vite, Gradle

---

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18 or higher) & **npm**
2.  **Java Development Kit (JDK)** 21
3.  **Git**

---

## Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd do-it-now
```

### 2. Backend Setup (Java Spring Boot)

Navigate to the backend directory and run the application:

```bash
cd backend
./gradlew bootRun
```

The backend server will start on `http://localhost:8080`.

**Key Endpoints:**
*   `GET /api/todos` - List all todos
*   `POST /api/todos` - Create a todo
*   `GET /api/todos/{id}` - Get a todo by ID
*   `PUT /api/todos/{id}` - Update a todo
*   `DELETE /api/todos/{id}` - Delete a todo

### 3. Frontend/Electron Setup

Navigate to the `electron-app` directory and install dependencies:

```bash
cd electron-app
npm install
```

**Note:** This project uses native modules (`better-sqlite3`). The `postinstall` script should automatically rebuild them for Electron. If you encounter issues, run:
```bash
npm run rebuild
```

### 4. Running the Application (Development)

To start the Electron application with hot-reloading for the React renderer:

```bash
cd electron-app
npm run dev
```

This command runs both the Vite development server and the Electron main process concurrently.

---

## Building for Production

To build the desktop application for your current operating system:

```bash
cd electron-app
npm run dist:win   # For Windows
npm run dist:mac   # For macOS
npm run dist:linux # For Linux
```

The artifacts (installers/executables) will be generated in the `electron-app/dist` directory.

---

## Project Structure

```
.
├── backend/                # Java Spring Boot Backend
│   ├── src/main/java       # Source code
│   └── build.gradle        # Gradle build configuration
│
├── electron-app/           # Electron + React Frontend
│   ├── src/
│   │   ├── electron/       # Electron Main Process (Node.js)
│   │   │   ├── ipc/        # IPC Handlers and Types
│   │   │   ├── service/    # Database Services
│   │   │   ├── database.ts # SQLite setup
│   │   │   └── main.ts     # Entry point
│   │   │
│   │   ├── renderer/       # React Renderer Process
│   │   │   ├── components/ # UI Components
│   │   │   ├── services/   # Frontend Services
│   │   │   └── main.tsx    # React Entry point
│   │   │
│   │   └── shared/         # Shared Types (used by both Main & Renderer)
│   │
│   ├── electron-builder.json # Build configuration
│   └── package.json
│
└── README.md               # This file
```

## Documentation

For detailed documentation on the codebase, please refer to the source files. All public functions, classes, and methods have been documented with Javadoc (Java) or JSDoc/TSDoc (TypeScript).

### Key Files to Explore:

*   **Backend**: `backend/src/main/java/com/kaizenflow/doitnow/controller/TodoController.java`
*   **Electron Main**: `electron-app/src/electron/main.ts` & `electron-app/src/electron/ipc/todoHandlers.ts`
*   **React Renderer**: `electron-app/src/renderer/services/todoService.ts`

---

## Troubleshooting

### Native Module Errors
If you see errors related to `better-sqlite3` or `NODE_MODULE_VERSION`, it means the native module wasn't compiled for the Electron version you are using. Run:
```bash
cd electron-app
npm run rebuild
```

### Port Conflicts
The Electron dev server runs on port `5123`. The Spring Boot backend runs on `8080`. Ensure these ports are free.

---

## License

[License Name]
