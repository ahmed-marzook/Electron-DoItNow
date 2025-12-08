# CLAUDE.md - AI Assistant Guide for Electron-DoItNow

> **Last Updated**: 2025-12-08
> **Purpose**: Comprehensive guide for AI assistants working with this Electron + React + Spring Boot codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture at a Glance](#architecture-at-a-glance)
3. [Directory Structure](#directory-structure)
4. [Technology Stack](#technology-stack)
5. [Key Architectural Patterns](#key-architectural-patterns)
6. [Development Workflows](#development-workflows)
7. [Code Conventions](#code-conventions)
8. [Database Schema](#database-schema)
9. [Common Tasks & Recipes](#common-tasks--recipes)
10. [Important Context for AI Assistants](#important-context-for-ai-assistants)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## Project Overview

**Electron-DoItNow** is a desktop todo application with offline-first capabilities and cloud synchronization. It combines:

- **Electron Desktop App** (frontend): React + TypeScript with local SQLite database
- **Java Spring Boot Backend** (optional): RESTful API with PostgreSQL for cloud sync
- **Offline-First Architecture**: All operations work offline with background sync to cloud

### Core Features

- ✅ Todo management with priority levels and due dates
- 👥 User management with 1:N relationship to todos
- 🔄 Automatic background sync with configurable cron scheduling
- 📡 Offline-first with sync queue and retry mechanism
- 🗄️ Dual database strategy (SQLite local + PostgreSQL cloud)
- 📊 OpenAPI/Swagger documentation for REST API
- 🎨 Component development with Storybook
- 📦 Multi-platform distribution (Windows, macOS, Linux)

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                     ELECTRON APP                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Renderer (React) │◄───────►│  Main Process    │         │
│  │  - Routes        │  IPC    │  - Database      │         │
│  │  - Components    │         │  - IPC Handlers  │         │
│  │  - TanStack Query│         │  - Sync Service  │         │
│  └──────────────────┘         └────────┬─────────┘         │
│                                         │                    │
│                                   ┌─────▼─────┐             │
│                                   │  SQLite   │             │
│                                   │  (Local)  │             │
│                                   └─────┬─────┘             │
└─────────────────────────────────────────┼─────────────────────┘
                                          │
                                    Sync Queue
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SPRING BOOT BACKEND                        │
├─────────────────────────────────────────────────────────────┤
│  REST API (Port 8080)                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Todo Module  │  │ User Module  │  │    Common    │      │
│  │ - Controller │  │ - Controller │  │ - Config     │      │
│  │ - Service    │  │ - Service    │  │ - Exceptions │      │
│  │ - Repository │  │ - Repository │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         └──────────────────┼──────────────────┐             │
│                            ▼                   │             │
│                     ┌─────────────┐            │             │
│                     │ PostgreSQL  │            │             │
│                     │  (Cloud)    │            │             │
│                     └─────────────┘            │             │
└────────────────────────────────────────────────┼─────────────┘
                                                 │
                                          Docker Compose
```

### Three-Process Model (Electron)

1. **Main Process** (`src/electron/main.ts`)
   - Node.js environment with full system access
   - Manages app lifecycle, windows, database
   - Runs background sync via cron jobs
   - Location: `electron-app/src/electron/`

2. **Preload Script** (`src/electron/preload.cts`)
   - Security bridge using `contextBridge`
   - Exposes type-safe IPC API to renderer
   - No direct Node.js access from renderer

3. **Renderer Process** (`src/renderer/`)
   - Browser environment running React
   - Communicates via `window.electronAPI`
   - TanStack Router + TanStack Query

---

## Directory Structure

```
Electron-DoItNow/
├── backend/                          # Java Spring Boot API
│   ├── src/main/java/com/kaizenflow/doitnow/
│   │   ├── todo/                     # Todo feature module
│   │   │   ├── controller/           # REST endpoints
│   │   │   ├── service/              # Business logic
│   │   │   ├── repository/           # JPA repositories
│   │   │   ├── entity/               # Database entities
│   │   │   ├── dto/                  # Request/Response DTOs
│   │   │   ├── mapper/               # MapStruct mappers
│   │   │   └── exception/            # Custom exceptions
│   │   ├── user/                     # User feature module (same structure)
│   │   └── common/                   # Shared utilities
│   │       ├── config/               # Spring configuration
│   │       └── exception/            # Global exception handling
│   ├── src/main/resources/
│   │   ├── application.yaml          # Spring configuration
│   │   └── db/migration/             # Flyway SQL migrations
│   ├── build.gradle                  # Gradle build config
│   └── Dockerfile                    # Multi-stage Docker build
│
├── electron-app/                     # Electron + React frontend
│   ├── src/
│   │   ├── electron/                 # Main process (Node.js)
│   │   │   ├── main.ts               # Entry point - app lifecycle
│   │   │   ├── preload.cts           # Context bridge for IPC
│   │   │   ├── database.ts           # SQLite initialization & schema
│   │   │   ├── config.ts             # Environment configuration
│   │   │   ├── logger.ts             # Winston logging setup
│   │   │   ├── pathResolver.ts       # Dev/prod path utilities
│   │   │   ├── util.ts               # Helper functions (isDev, etc.)
│   │   │   ├── ipc/                  # IPC handlers
│   │   │   │   ├── todoHandlers.ts   # Todo CRUD via IPC
│   │   │   │   └── userHandlers.ts   # User CRUD via IPC
│   │   │   ├── service/              # Business logic services
│   │   │   │   ├── todoDatabaseService.ts       # Local CRUD
│   │   │   │   ├── todoApiService.ts            # REST client
│   │   │   │   ├── userApiService.ts            # User REST client
│   │   │   │   ├── SyncService.ts               # Sync orchestration
│   │   │   │   └── syncQueueDatabaseService.ts  # Queue management
│   │   │   ├── types/                # Electron-specific types
│   │   │   └── tsconfig.json         # Electron TypeScript config
│   │   │
│   │   ├── renderer/                 # React UI (Browser)
│   │   │   ├── main.tsx              # React app entry point
│   │   │   ├── routes/               # TanStack Router file-based routes
│   │   │   │   ├── __root.tsx        # Root layout with Header
│   │   │   │   ├── index.tsx         # Home page (Todos)
│   │   │   │   ├── users/            # User management routes
│   │   │   │   │   ├── index.tsx     # User list
│   │   │   │   │   └── new.tsx       # Create user form
│   │   │   │   └── demo/             # Demo/test pages
│   │   │   ├── components/           # React components
│   │   │   │   ├── Header.tsx        # App header with nav
│   │   │   │   └── storybook/        # Storybook UI components
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Input.tsx
│   │   │   │       └── *.stories.ts
│   │   │   ├── services/             # IPC service wrappers
│   │   │   │   ├── todoService.ts    # window.electronAPI.todo.*
│   │   │   │   └── userService.ts    # window.electronAPI.user.*
│   │   │   ├── integrations/         # Third-party setup
│   │   │   │   └── tanstack-query/   # Query client config
│   │   │   └── lib/                  # Utilities (cn, etc.)
│   │   │
│   │   └── shared/                   # Shared types (main ↔ renderer)
│   │       ├── index.ts              # Barrel exports
│   │       └── types/
│   │           ├── ipc.types.ts      # EventPayloadMapping
│   │           ├── todo.types.ts     # Todo, CreateTodoDto, etc.
│   │           └── user.types.ts     # User types
│   │
│   ├── dist-react/                   # Built React (gitignored)
│   ├── dist-electron/                # Compiled Electron (gitignored)
│   ├── .storybook/                   # Storybook config
│   ├── package.json                  # Dependencies & scripts
│   ├── tsconfig.json                 # Root TypeScript config
│   ├── vite.config.ts                # Vite bundler config
│   ├── electron-builder.json         # Distribution config
│   └── .env.{local,preprod,production}  # Environment files
│
├── docker-init/                      # PostgreSQL init scripts
├── docker-compose.yml                # Backend + DB orchestration
└── README.md                         # Setup documentation
```

### Important File Locations

| What | Where | Purpose |
|------|-------|---------|
| App entry point | `electron-app/src/electron/main.ts` | Electron main process |
| React entry | `electron-app/src/renderer/main.tsx` | React app initialization |
| IPC bridge | `electron-app/src/electron/preload.cts` | Secure renderer ↔ main |
| Routes | `electron-app/src/renderer/routes/` | TanStack Router pages |
| Shared types | `electron-app/src/shared/types/` | Cross-process types |
| Database init | `electron-app/src/electron/database.ts` | SQLite schema & seed |
| Sync logic | `electron-app/src/electron/service/SyncService.ts` | Cloud sync orchestration |
| Backend API | `backend/src/main/java/.../controller/` | REST endpoints |
| Migrations | `backend/src/main/resources/db/migration/` | Flyway SQL scripts |

---

## Technology Stack

### Frontend (Electron App)

#### Core Framework
- **Electron** 39.2.4 - Desktop app framework
- **React** 19.2.0 - UI library
- **TypeScript** 5.7.2 - Type safety
- **Vite** 7.1.7 - Build tool & dev server (port 5123)

#### Routing & State
- **TanStack Router** 1.132.0 - File-based routing with hash history
- **TanStack Query** 5.66.5 - Data fetching, caching, sync

#### Styling & UI
- **Tailwind CSS** 4.0.6 - Utility-first styling
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants
- **clsx** + **tailwind-merge** - Conditional classes

#### Desktop & Database
- **better-sqlite3** 12.5.0 - Local SQLite (native module)
- **Winston** 3.18.3 - Structured logging
- **winston-daily-rotate-file** - Log rotation
- **Cron** 4.3.5 - Scheduled sync jobs
- **Chalk** 5.6.2 - Colored console output

#### Development Tools
- **Storybook** 9.1.9 - Component development
- **Vitest** 3.0.5 - Unit testing
- **ESLint** - Linting (TanStack config)
- **Prettier** - Code formatting
- **electron-builder** 26.0.12 - App packaging

### Backend (Java Spring Boot)

#### Core Framework
- **Java** 25
- **Spring Boot** 4.0.0
- **Spring Data JPA** - Database ORM
- **Spring MVC** - REST API
- **Spring Validation** - Input validation
- **Spring Actuator** - Health checks

#### Database & Persistence
- **PostgreSQL** - Production database
- **Flyway** - Database migrations
- **Hibernate** - ORM implementation

#### Utilities
- **MapStruct** 1.5.5 - DTO ↔ Entity mapping
- **Lombok** - Boilerplate reduction
- **SpringDoc OpenAPI** 3.0.0 - Swagger UI

#### Build Tool
- **Gradle** - Build automation

---

## Key Architectural Patterns

### 1. Type-Safe IPC Communication

**Centralized Type Definitions** (`shared/types/ipc.types.ts`):

```typescript
// Defines all IPC events and their payloads
export interface EventPayloadMapping {
  'todo:getAll': IpcResponse<Todo[]>
  'todo:getById': IpcResponse<Todo>
  'todo:create': IpcResponse<Todo>
  'todo:update': IpcResponse<Todo>
  'todo:delete': IpcResponse<void>
  // ... ensures type safety across processes
}

// Standardized response wrapper
export interface IpcResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

**Communication Flow**:

```
1. Renderer calls:    window.electronAPI.todo.getAll()
2. Preload forwards:  ipcRenderer.invoke('todo:getAll')
3. Main handles:      ipcMain.handle('todo:getAll', async () => {...})
4. Returns:           IpcResponse<Todo[]>
```

**Key Files**:
- Type definitions: `electron-app/src/shared/types/ipc.types.ts`
- Preload bridge: `electron-app/src/electron/preload.cts`
- IPC handlers: `electron-app/src/electron/ipc/*.ts`
- Renderer services: `electron-app/src/renderer/services/*.ts`

### 2. Offline-First Sync Architecture

**Sync Queue Pattern**:

```
Local Change → Insert to sync_queue → Cron Job → Batch Sync → Remove on Success
```

**Components**:

1. **Sync Queue Table** (SQLite):
   ```sql
   CREATE TABLE sync_queue (
     id TEXT PRIMARY KEY,           -- UUID
     action_type TEXT,              -- 'CREATE', 'UPDATE', 'DELETE'
     entity_type TEXT,              -- 'todo', 'user'
     entity_id TEXT,                -- Reference to entity
     payload TEXT,                  -- JSON serialized
     retry_count INTEGER DEFAULT 0,
     status TEXT DEFAULT 'pending'
   )
   ```

2. **SyncService** (`electron-app/src/electron/service/SyncService.ts`):
   - Checks API health before syncing
   - Processes in batches (default: 50 items)
   - Max 3 retries per item
   - Handles CREATE/UPDATE/DELETE actions

3. **Cron Scheduling**:
   - Default: `* * * * *` (every minute)
   - Configurable via `SYNC_SCHEDULE` env var
   - Runs on app startup + scheduled intervals
   - Manual trigger via "Sync Cloud" button

**Sync Flow Example**:

```typescript
// 1. User creates todo offline
window.electronAPI.todo.create({ title: 'Buy milk' })
  → Saves to SQLite
  → Queues CREATE action in sync_queue

// 2. Cron job runs (background)
SyncService.syncPendingChanges()
  → Fetches pending items from queue
  → Checks API health
  → Batches requests to backend
  → Removes successful syncs from queue
  → Updates retry_count on failures
```

### 3. Service Layer Architecture

**Separation of Concerns**:

```typescript
// Database services - Pure CRUD operations
todoDatabaseService.create(todo)      // SQLite only
todoDatabaseService.getAll()          // Local reads

// API services - HTTP client layer
todoApiService.createTodo(todo)       // POST to backend
todoApiService.getTodos()             // GET from backend

// Sync services - Orchestration
SyncService.syncPendingChanges()      // Queue processing
syncQueueService.addToQueue(...)      // Queue management
```

**Benefits**:
- Clear separation between local and remote operations
- Testable in isolation
- Easy to switch backend implementations
- Offline operations don't depend on API

### 4. Feature-Based Backend Organization

**Vertical Slicing** (each feature is self-contained):

```
com.kaizenflow.doitnow/
  ├── todo/                # Complete feature
  │   ├── controller/      # TodoController
  │   ├── service/         # TodoService
  │   ├── repository/      # TodoRepository
  │   ├── entity/          # Todo
  │   ├── dto/             # TodoDTO, CreateTodoDto
  │   ├── mapper/          # TodoMapper (MapStruct)
  │   └── exception/       # TodoNotFoundException
  │
  ├── user/                # Complete feature
  │   └── (same structure)
  │
  └── common/              # Shared code
      ├── config/          # CorsConfig, etc.
      └── exception/       # GlobalExceptionHandler
```

**Benefits**:
- Low coupling between features
- Easy to locate all related code
- Clear ownership boundaries
- Scalable for large teams

### 5. Path Resolution Strategy

**Environment-Aware Paths** (`electron-app/src/electron/pathResolver.ts`):

```typescript
export function getDatabasePath(): string {
  if (isDev()) {
    // Development: project root
    return 'app-database.db'
  } else {
    // Production: user data directory
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'app-database.db')
  }
}
```

**Paths by Environment**:

| Environment | Database | Logs | Preload Script |
|-------------|----------|------|----------------|
| Development | `./app-database.db` | `./logs/` | `./dist-electron/preload.cjs` |
| Production | `~/AppData/Roaming/do-it-now/` (Win)<br>`~/Library/Application Support/do-it-now/` (Mac) | User data dir | Relative to ASAR |

### 6. Database Performance Optimizations

**SQLite Pragmas** (applied on init):

```javascript
db.pragma('journal_mode = WAL')        // Write-Ahead Logging
db.pragma('cache_size = 10000')        // 10MB cache (vs 2MB default)
db.pragma('temp_store = MEMORY')       // In-memory temp tables
db.pragma('synchronous = NORMAL')      // Balanced safety/speed
db.pragma('mmap_size = 30000000')      // 30MB memory-mapped I/O
```

**Indexes for Common Queries**:

```sql
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
```

---

## Development Workflows

### Setup & Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd Electron-DoItNow/electron-app

# 2. Install dependencies
npm install
# Runs postinstall: electron-builder install-app-deps && npm run rebuild

# 3. Start development mode
npm run dev
# Runs in parallel:
#   - Vite dev server (http://localhost:5123)
#   - Electron main process with live reload
```

### Environment-Specific Development

**Three environments supported**: development, preprod, production

```bash
# Development (uses .env.local)
npm run dev

# Pre-production (uses .env.preprod)
npm run dev:preprod

# Production mode (uses .env.production)
npm run dev:production
```

**Environment Files**:
- `.env.local` - Local development (committed)
- `.env.preprod` - Staging environment (committed)
- `.env.production` - Production config (committed)
- `.env` - User overrides (gitignored)

**Key Environment Variables**:

```bash
# Main process (.env files)
VITE_API_BASE_URL=http://localhost:8080/api
SYNC_SCHEDULE=* * * * *                  # Every minute
SYNC_BATCH_SIZE=50
LOG_LEVEL=debug                           # debug, info, warn, error

# Renderer process (VITE_ prefix required)
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Do It Now
```

### Build Processes

**Development Build**:
```bash
npm run build
# 1. vite build → dist-react/
# 2. tsc --project src/electron/tsconfig.json → dist-electron/
# 3. tsc-alias -p src/electron/tsconfig.json (resolves @shared/*, etc.)
```

**Distribution Packages**:
```bash
# Windows (creates NSIS installer, portable, MSI)
npm run dist:win

# macOS (creates DMG, ZIP)
npm run dist:mac

# Linux (creates AppImage, DEB)
npm run dist:linux

# Environment-specific distributions
npm run dist:win:production    # Uses .env.production
```

**Output**: Installers in `dist/` directory

### Running Backend

**With Docker** (recommended):
```bash
cd backend
docker compose up --build
# Starts:
#   - PostgreSQL on port 5432
#   - Spring Boot API on port 8080
```

**Without Docker**:
```bash
cd backend
./gradlew bootRun
# Requires PostgreSQL running separately
```

**API Documentation**:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI spec: http://localhost:8080/api-docs

### Testing

**Frontend Tests**:
```bash
cd electron-app
npm test              # Run all tests with Vitest
npm run test:watch    # Watch mode (if configured)
```

**Backend Tests**:
```bash
cd backend
./gradlew test        # Run JUnit tests
./gradlew check       # Tests + linting
```

### Linting & Formatting

**Frontend**:
```bash
npm run check         # Prettier + ESLint with auto-fix
npm run lint          # ESLint only
npm run format        # Prettier only
```

**Backend**:
```bash
./gradlew spotlessApply   # Auto-format Java code
./gradlew spotlessCheck   # Check formatting
```

### Storybook (Component Development)

```bash
npm run storybook            # Start dev server on port 6006
npm run build-storybook      # Build static site
```

**Component Stories**: `electron-app/src/renderer/components/storybook/*.stories.ts`

### Debugging

**Renderer Process**:
- Open DevTools in Electron window (Ctrl+Shift+I / Cmd+Option+I)
- React DevTools available via extension
- TanStack Query DevTools: Included in dev mode

**Main Process**:
- Console logs appear in terminal where you ran `npm run dev`
- VS Code debugger: Use launch config for Electron main

**Logs Location**:
- Development: `./logs/`
- Production: `app.getPath('userData')/logs/`
- Files: `app.log`, `error.log`, `exceptions.log`, `rejections.log`

---

## Code Conventions

### File Naming

**Frontend**:
- Components: `PascalCase.tsx` (e.g., `Header.tsx`, `Button.tsx`)
- Services: `camelCase.ts` with `Service` suffix (e.g., `todoService.ts`)
- Types: `camelCase.types.ts` (e.g., `todo.types.ts`)
- Routes: `lowercase.tsx` with `index.tsx` for directory routes
- Config: `lowercase.config.ts` (e.g., `vite.config.ts`)

**Backend**:
- Classes: `PascalCase` with layer suffix (e.g., `TodoController`, `TodoService`)
- Packages: `lowercase` (e.g., `controller`, `service`)
- Interfaces: No `I` prefix - use descriptive names

### Import/Export Patterns

**Path Aliases** (configured in tsconfig):

```typescript
import { Todo } from '@shared/types/todo.types'
import { todoService } from '@renderer/services/todoService'
import { getDatabase } from '@electron/database'
```

**Alias Mappings**:
- `@shared/*` → `./src/shared/*`
- `@renderer/*` → `./src/renderer/*`
- `@electron/*` → `./src/electron/*`
- `@/*` → `./src/*`

**Export Patterns**:
- Prefer **named exports** over default exports
- Use barrel files: `shared/index.ts` re-exports common types
- Singleton services: `export const todoApi = new TodoApiService()`

### TypeScript Conventions

**Strict Mode Enabled**:
- All compiler strict checks on
- No implicit `any`
- Null checking enforced

**Type Definitions**:
```typescript
// Interfaces for data shapes
export interface Todo {
  id: number
  title: string
  completed: boolean
  // ...
}

// Types for unions/intersections
export type Priority = 'low' | 'medium' | 'high'

// DTOs for API contracts
export interface CreateTodoDto {
  title: string
  description?: string
  priority?: Priority
}
```

### Database Conventions

**Table Naming**:
- Plural, lowercase: `todos`, `users`, `sync_queue`

**Column Naming**:
- snake_case: `user_id`, `created_at`, `due_date`

**Booleans**:
- SQLite: `INTEGER` (0 = false, 1 = true)
- PostgreSQL: `BOOLEAN` type

**Timestamps**:
- SQLite: `TEXT` with ISO 8601 strings or `INTEGER` unix timestamps
- PostgreSQL: `TIMESTAMPTZ` with timezone awareness

**Relationships**:
- Foreign keys: `{entity}_id` (e.g., `user_id`)
- Cascade delete where appropriate
- Indexes on foreign keys

### React Component Patterns

**Functional Components** (no class components):

```typescript
// Use named exports
export function Header() {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between p-4">
      {/* ... */}
    </header>
  )
}
```

**Hooks Usage**:
- TanStack Query for data fetching: `useQuery`, `useMutation`
- TanStack Router for navigation: `useNavigate`, `useParams`
- React hooks: `useState`, `useEffect`, `useMemo`

**Styling**:
- Tailwind utility classes preferred
- Use `cn()` utility for conditional classes:
  ```typescript
  import { cn } from '@renderer/lib/utils'

  <button className={cn('btn', isActive && 'btn-active')} />
  ```

---

## Database Schema

### Local Database (SQLite)

**File**: `electron-app/src/electron/database.ts`

#### todos table

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                      -- Foreign key to users.id
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,          -- 0 = false, 1 = true
  priority TEXT DEFAULT 'medium',       -- 'low', 'medium', 'high'
  due_date TEXT,                        -- ISO 8601 date string
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_user_id ON todos(user_id);
```

#### users table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### sync_queue table

```sql
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,                  -- UUID v4
  action_type TEXT NOT NULL,            -- 'CREATE', 'UPDATE', 'DELETE'
  entity_type TEXT NOT NULL,            -- 'todo', 'user'
  entity_id TEXT NOT NULL,              -- Reference to entity
  payload TEXT NOT NULL,                -- JSON serialized entity
  created_at INTEGER NOT NULL,          -- Unix timestamp (ms)
  retry_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',        -- 'pending', 'failed', 'processing'
  error_message TEXT,
  last_attempt_at INTEGER
);

CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
```

**Relationships**:
- User 1:N Todo (one user can have many todos)
- No cascade delete in SQLite (handled in application code)

---

### Remote Database (PostgreSQL)

**Migrations**: `backend/src/main/resources/db/migration/V*.sql`

#### todos table

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE todos
  ADD CONSTRAINT fk_todos_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

#### users table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Differences from SQLite**:
- `SERIAL` instead of `AUTOINCREMENT`
- `BOOLEAN` instead of `INTEGER` for flags
- `TIMESTAMPTZ` instead of `TEXT` for timestamps
- Foreign key constraints enforced at DB level

---

## Common Tasks & Recipes

### Adding a New Feature

**Example: Adding a "Tags" feature**

1. **Define Types** (`electron-app/src/shared/types/tag.types.ts`):
   ```typescript
   export interface Tag {
     id: number
     name: string
     color: string
     created_at: string
   }

   export interface CreateTagDto {
     name: string
     color?: string
   }
   ```

2. **Update IPC Types** (`electron-app/src/shared/types/ipc.types.ts`):
   ```typescript
   export interface EventPayloadMapping {
     // ... existing events
     'tag:getAll': IpcResponse<Tag[]>
     'tag:create': IpcResponse<Tag>
   }
   ```

3. **Create Database Service** (`electron-app/src/electron/service/tagDatabaseService.ts`):
   ```typescript
   export const tagDatabaseService = {
     getAll(): Tag[] {
       const db = getDatabase()
       return db.prepare('SELECT * FROM tags ORDER BY name').all() as Tag[]
     },
     create(dto: CreateTagDto): Tag {
       // Insert and return created tag
     }
   }
   ```

4. **Add IPC Handlers** (`electron-app/src/electron/ipc/tagHandlers.ts`):
   ```typescript
   import { ipcMain } from 'electron'
   import { tagDatabaseService } from '../service/tagDatabaseService'

   export function registerTagHandlers() {
     ipcMain.handle('tag:getAll', async () => {
       try {
         const tags = tagDatabaseService.getAll()
         return { success: true, data: tags }
       } catch (error) {
         return { success: false, error: error.message }
       }
     })
   }
   ```

5. **Register Handlers** (`electron-app/src/electron/main.ts`):
   ```typescript
   import { registerTagHandlers } from './ipc/tagHandlers'

   app.whenReady().then(() => {
     initDatabase()
     registerTodoHandlers()
     registerUserHandlers()
     registerTagHandlers()  // Add this
     createWindow()
   })
   ```

6. **Create Renderer Service** (`electron-app/src/renderer/services/tagService.ts`):
   ```typescript
   import type { Tag, CreateTagDto } from '@shared/types/tag.types'

   export const tagService = {
     async getAll() {
       return window.electronAPI.tag.getAll()
     },
     async create(dto: CreateTagDto) {
       return window.electronAPI.tag.create(dto)
     }
   }
   ```

7. **Use in React Component**:
   ```typescript
   import { useQuery } from '@tanstack/react-query'
   import { tagService } from '@renderer/services/tagService'

   export function TagsPage() {
     const { data } = useQuery({
       queryKey: ['tags'],
       queryFn: async () => {
         const response = await tagService.getAll()
         if (!response.success) throw new Error(response.error)
         return response.data
       }
     })

     return <div>{/* Render tags */}</div>
   }
   ```

8. **Add Backend Support** (if cloud sync needed):
   - Create feature module: `backend/src/main/java/.../tag/`
   - Add controller, service, repository, entity, dto, mapper
   - Create migration: `backend/src/main/resources/db/migration/V4__create_tags_table.sql`

### Adding a Database Migration (Backend)

1. **Create Migration File** (`backend/src/main/resources/db/migration/V5__add_tags_to_todos.sql`):
   ```sql
   CREATE TABLE tags (
     id SERIAL PRIMARY KEY,
     name TEXT UNIQUE NOT NULL,
     color TEXT DEFAULT '#gray',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE todo_tags (
     todo_id INTEGER REFERENCES todos(id) ON DELETE CASCADE,
     tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
     PRIMARY KEY (todo_id, tag_id)
   );
   ```

2. **Restart Backend**:
   ```bash
   docker compose down
   docker compose up --build
   # Flyway will automatically apply V5 migration
   ```

3. **Update SQLite Schema** (`electron-app/src/electron/database.ts`):
   ```typescript
   function initSchema() {
     // ... existing tables

     db.exec(`
       CREATE TABLE IF NOT EXISTS tags (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT UNIQUE NOT NULL,
         color TEXT DEFAULT '#gray',
         created_at TEXT DEFAULT CURRENT_TIMESTAMP
       )
     `)
   }
   ```

### Debugging IPC Communication

**Test from DevTools Console**:

```javascript
// 1. Verify API exists
window.electronAPI
// Should show: { todo: {...}, user: {...} }

// 2. Test a call
await window.electronAPI.todo.getAll()
// Should return: { success: true, data: [...] }

// 3. Check error handling
await window.electronAPI.todo.getById(99999)
// Should return: { success: false, error: 'Todo not found' }
```

**Enable IPC Logging** (add to `preload.cts`):

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  todo: {
    getAll: () => {
      console.log('[IPC] todo:getAll called')
      return ipcRenderer.invoke('todo:getAll')
    }
  }
})
```

### Manual Sync Trigger

**From Renderer**:

```typescript
// Add to IPC types
export interface EventPayloadMapping {
  'sync:trigger': IpcResponse<{ synced: number }>
}

// Add handler in main.ts
ipcMain.handle('sync:trigger', async () => {
  const result = await SyncService.syncPendingChanges()
  return { success: true, data: result }
})

// Call from UI
await window.electronAPI.sync.trigger()
```

### Environment Variable Loading

**Main Process**:
```typescript
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { loadConfig } from './config'

// Loads .env.{NODE_ENV} based on process.env.NODE_ENV
const config = loadConfig()
console.log(config.apiBaseUrl)  // From VITE_API_BASE_URL
```

**Renderer Process**:
```typescript
// Vite automatically loads VITE_* variables
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## Important Context for AI Assistants

### When Modifying Code

1. **Always Read Before Editing**:
   - Use the Read tool before making changes
   - Understand existing patterns and conventions
   - Match the coding style already in use

2. **Check Both Processes**:
   - Changes to types in `shared/` affect both main and renderer
   - IPC changes require updates in 3 places:
     1. Type definitions (`shared/types/ipc.types.ts`)
     2. Handler registration (`electron/ipc/*.ts`)
     3. Preload bridge (`electron/preload.cts`)

3. **Path Aliases**:
   - Always use `@shared`, `@renderer`, `@electron` aliases
   - Never use relative paths across directories like `../../shared`
   - Aliases work in TypeScript but are resolved by `tsc-alias` for runtime

4. **Database Changes**:
   - Update schema in TWO places: SQLite (local) + PostgreSQL (backend)
   - Add migration for backend
   - Update `initSchema()` for SQLite
   - Consider sync implications

5. **Testing Changes**:
   - Test IPC calls from DevTools console
   - Verify both offline (SQLite) and online (API) modes
   - Check logs in both terminal (main) and DevTools (renderer)

### Common Gotchas

1. **Native Modules (better-sqlite3)**:
   - Must be rebuilt for Electron: `npm run rebuild`
   - Must be unpacked from ASAR: Check `electron-builder.json` asarUnpack
   - Build errors? Run: `electron-builder install-app-deps`

2. **Hash History Required**:
   - TanStack Router MUST use `createHashHistory()` in Electron
   - Browser history won't work in desktop apps
   - Location: `electron-app/src/renderer/main.tsx`

3. **Preload Script**:
   - Must use `.cts` extension (CommonJS required)
   - Must be referenced in main.ts `webPreferences.preload`
   - Path resolver: Use `getPreloadPath()` for dev/prod

4. **Environment Variables**:
   - Main process: Standard `process.env.VAR_NAME`
   - Renderer: Must prefix with `VITE_` → `import.meta.env.VITE_VAR_NAME`
   - Not available in renderer unless prefixed

5. **TypeScript Compilation**:
   - Renderer: Vite bundles (no tsc output)
   - Main: tsc compiles to `dist-electron/`
   - Path aliases: Resolved by `tsc-alias` after compilation
   - Both processes have separate tsconfig files

6. **CORS in Development**:
   - Backend has `@CrossOrigin` on controllers
   - Electron doesn't enforce CORS (Node.js HTTP client)
   - Only matters if testing API from browser

7. **Sync Queue Failures**:
   - Max 3 retries before marking as failed
   - Check `sync_queue` table for stuck items
   - Error messages in `error_message` column
   - Manually retry: Delete from queue to re-trigger

### File Locations Quick Reference

| Task | File Path |
|------|-----------|
| Add IPC event type | `electron-app/src/shared/types/ipc.types.ts` |
| Implement IPC handler | `electron-app/src/electron/ipc/{feature}Handlers.ts` |
| Register handler | `electron-app/src/electron/main.ts` |
| Expose to renderer | `electron-app/src/electron/preload.cts` |
| Call from React | `electron-app/src/renderer/services/{feature}Service.ts` |
| Add route | `electron-app/src/renderer/routes/{path}.tsx` |
| Add React component | `electron-app/src/renderer/components/{Name}.tsx` |
| Database schema | `electron-app/src/electron/database.ts` → initSchema() |
| Database service | `electron-app/src/electron/service/{entity}DatabaseService.ts` |
| API client | `electron-app/src/electron/service/{entity}ApiService.ts` |
| Backend controller | `backend/src/.../controller/{Entity}Controller.java` |
| Backend migration | `backend/src/main/resources/db/migration/V{n}__{description}.sql` |
| Environment config | `electron-app/.env.{local,preprod,production}` |
| Logging config | `electron-app/src/electron/logger.ts` |

### Understanding Build Artifacts

**After running `npm run build`**:

```
electron-app/
├── dist-react/              # Vite output (static files)
│   ├── index.html
│   ├── assets/
│   │   ├── index-{hash}.js  # Bundled React app
│   │   └── index-{hash}.css # Bundled styles
│   └── ...
│
└── dist-electron/           # TypeScript compilation output
    ├── electron/
    │   ├── main.js          # Entry point (package.json "main")
    │   ├── preload.cjs      # Preload script
    │   ├── database.js
    │   ├── ipc/
    │   ├── service/
    │   └── ...
    └── shared/              # Shared types (compiled)
```

**electron-builder packages**:
- Bundles `dist-react/` and `dist-electron/` into app
- Creates platform-specific installers in `dist/`
- Unpacks native modules from ASAR (better-sqlite3)

### Recommended Workflow for Changes

1. **Plan**: Understand what needs to change (database? IPC? UI?)
2. **Types First**: Define interfaces in `shared/types/`
3. **Database**: Add tables/columns if needed
4. **Backend**: Create service layer, then IPC handlers
5. **Frontend**: Add service wrapper, then React components
6. **Test**: Use DevTools console to verify IPC
7. **Sync**: Add sync queue support if backend involved
8. **Verify**: Test offline mode, then online sync

---

## Troubleshooting Guide

### Build & Installation Issues

**Problem**: `npm install` fails with native module errors

```bash
# Solution: Rebuild native modules for Electron
npm run rebuild

# If that fails, try full reinstall:
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `MODULE_NOT_FOUND` errors after build

```bash
# Solution: Path aliases not resolved
npm run transpile:electron
# Ensure tsc-alias runs: Check package.json scripts

# Verify dist-electron has correct structure:
ls dist-electron/electron/
```

**Problem**: White screen on app launch

- Check DevTools console for errors (Ctrl+Shift+I)
- Verify `main` in package.json: `"dist-electron/electron/main.js"`
- Ensure hash history is used: Check `createHashHistory()` in router
- Check main process logs in terminal

### Database Issues

**Problem**: `SQLITE_CANTOPEN` error

```bash
# Check database path
# Development: Should be in project root
ls -la app-database.db*

# Production: Should be in user data
# Windows: %APPDATA%/do-it-now/
# macOS: ~/Library/Application Support/do-it-now/
# Linux: ~/.config/do-it-now/
```

**Problem**: Schema changes not applied

- SQLite: Delete `app-database.db` to recreate
- PostgreSQL: Check Flyway migrations in `db/migration/`
- Verify `initSchema()` was updated in `database.ts`

**Problem**: Sync queue stuck

```sql
-- Check stuck items
SELECT * FROM sync_queue WHERE status = 'failed';

-- Retry failed items (delete to re-trigger)
DELETE FROM sync_queue WHERE id = '{uuid}';

-- Clear all failed items
DELETE FROM sync_queue WHERE status = 'failed';
```

### IPC Communication Issues

**Problem**: `window.electronAPI` is undefined

- Check preload script is loaded: Verify `webPreferences.preload` in main.ts
- Check `contextBridge.exposeInMainWorld` is called
- Ensure `nodeIntegration: false` and `contextIsolation: true`

**Problem**: IPC handler not responding

```typescript
// Add logging to debug:
ipcMain.handle('todo:getAll', async () => {
  console.log('[IPC] todo:getAll handler called')
  // ... handler code
})
```

- Check handler is registered in `main.ts`
- Verify event name matches in preload and handler
- Check main process terminal for errors

### Sync Issues

**Problem**: Changes not syncing to backend

1. Check API is running: `curl http://localhost:8080/api/actuator/health`
2. Check sync queue: `SELECT * FROM sync_queue WHERE status = 'pending'`
3. Check logs: `tail -f logs/app.log`
4. Manually trigger sync: Call `window.electronAPI.sync.trigger()` (if implemented)

**Problem**: Duplicate entries after sync

- Check sync queue has unique constraints
- Verify backend uses `entityId` for upsert logic
- Review `TodoApiService` error handling

### Development Server Issues

**Problem**: Vite dev server won't start

```bash
# Check port 5123 is not in use
lsof -ti:5123 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5123   # Windows

# Restart dev server
npm run dev:react
```

**Problem**: Hot reload not working

- Check Vite is running on port 5123
- Verify Electron loads `http://localhost:5123` in dev mode
- Check `isDev()` returns true

### TypeScript Errors

**Problem**: Cannot find module '@shared/...'

```json
// Verify tsconfig.json has:
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@shared/*": ["shared/*"],
      "@renderer/*": ["renderer/*"],
      "@electron/*": ["electron/*"]
    }
  }
}
```

**Problem**: Type errors after adding new IPC events

1. Update `EventPayloadMapping` in `ipc.types.ts`
2. Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")
3. Verify both `preload.cts` and handlers use correct types

### Backend Issues

**Problem**: Backend won't start

```bash
# Check PostgreSQL is running
docker compose ps

# Check logs
docker compose logs backend

# Restart services
docker compose down
docker compose up --build
```

**Problem**: Flyway migration failed

```bash
# Check migration syntax in db/migration/
# Rollback: docker compose down -v (deletes volumes)
# Then: docker compose up --build
```

---

## Useful Commands Cheat Sheet

### Frontend (electron-app/)

```bash
# Development
npm run dev                    # Start dev mode (React + Electron)
npm run dev:preprod            # Dev with preprod config
npm run dev:production         # Dev with production config

# Building
npm run build                  # Build React + compile Electron
npm run build:preprod          # Build for preprod
npm run build:production       # Build for production

# Distribution
npm run dist:win               # Package for Windows
npm run dist:mac               # Package for macOS
npm run dist:linux             # Package for Linux

# Code Quality
npm run check                  # Prettier + ESLint (auto-fix)
npm run lint                   # ESLint only
npm test                       # Run Vitest tests

# Storybook
npm run storybook              # Start Storybook dev server
npm run build-storybook        # Build Storybook static site

# Maintenance
npm run rebuild                # Rebuild native modules
npm run transpile:electron     # Compile Electron TypeScript only
```

### Backend (backend/)

```bash
# Development
./gradlew bootRun              # Start Spring Boot (requires PostgreSQL)
docker compose up              # Start backend + PostgreSQL

# Building
./gradlew build                # Build JAR
./gradlew bootJar              # Build executable JAR

# Testing
./gradlew test                 # Run JUnit tests
./gradlew check                # Tests + linting

# Code Quality
./gradlew spotlessApply        # Auto-format code
./gradlew spotlessCheck        # Check formatting

# Docker
docker compose up --build      # Rebuild and start
docker compose down            # Stop services
docker compose down -v         # Stop and remove volumes (resets DB)
```

### Database

```bash
# SQLite (local)
sqlite3 app-database.db        # Open database
.tables                        # List tables
.schema todos                  # Show table schema
SELECT * FROM todos;           # Query data

# PostgreSQL (Docker)
docker compose exec postgres psql -U postgres -d doitnow
\dt                            # List tables
\d todos                       # Describe table
SELECT * FROM todos;           # Query data
```

---

## Additional Resources

### Documentation Links

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Query](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev/)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Repository Structure Summary

```
Backend:  Feature-based modules (vertical slicing)
Frontend: Layer-based with feature grouping in routes
Database: Dual strategy (SQLite local + PostgreSQL cloud)
Sync:     Offline-first with background queue processing
IPC:      Type-safe event-driven communication
Build:    Multi-environment support (dev/preprod/prod)
```

### Project Metadata

- **Name**: Do It Now
- **Version**: 0.0.0
- **Author**: Ahmed Marzook
- **License**: [Not specified]
- **Electron**: 39.2.4
- **React**: 19.2.0
- **Java**: 25
- **Spring Boot**: 4.0.0

---

## Changelog

| Date | Changes |
|------|---------|
| 2025-12-08 | Initial comprehensive documentation created |

---

**For AI Assistants**: This document should be your primary reference when working with this codebase. Always prioritize understanding existing patterns before suggesting changes. When in doubt, read the actual source files to verify current implementation details.
