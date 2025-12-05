# Environment Configuration Guide

This project uses `dotenv` for environment configuration across different deployment stages.

## Environment Files

The project supports three environments:

- **Local Development** (`.env.local`)
- **Pre-Production** (`.env.preprod`)
- **Production** (`.env.production`)

### File Structure

- `.env.example` - Template file with all available variables (committed to git)
- `.env.local` - Local development configuration (gitignored)
- `.env.preprod` - Pre-production configuration (gitignored)
- `.env.production` - Production configuration (gitignored)

## Available Environment Variables

### Renderer Process (Vite - prefixed with VITE_)

Variables prefixed with `VITE_` are available in the renderer process:

```bash
VITE_API_BASE_URL=http://localhost:8080  # API endpoint URL
VITE_API_TIMEOUT=10000                   # API request timeout in ms
```

### Main Process (Electron)

Variables without the `VITE_` prefix are available in the main Electron process:

```bash
NODE_ENV=development                     # Environment mode
API_BASE_URL=http://localhost:8080       # API endpoint URL
API_TIMEOUT=10000                        # API request timeout in ms
LOG_LEVEL=debug                          # Logging level (debug, info, warn, error)
SYNC_INTERVAL_CRON=* * * * *             # Cron schedule for sync
SYNC_TIMEZONE=America/New_York           # Timezone for cron jobs
ENABLE_AUTO_SYNC=true                    # Enable/disable auto sync
ENABLE_DEV_TOOLS=true                    # Enable/disable dev tools
```

## NPM Scripts by Environment

### Development (Local)

```bash
npm run dev                # Run app in development mode
npm run dev:react          # Run only Vite dev server
npm run dev:electron       # Run only Electron
```

### Pre-Production

```bash
npm run dev:preprod        # Run app in preprod mode
npm run build:preprod      # Build for preprod
npm run dist:linux:preprod # Create Linux distribution (preprod)
npm run dist:mac:preprod   # Create macOS distribution (preprod)
npm run dist:win:preprod   # Create Windows distribution (preprod)
```

### Production

```bash
npm run dev:production        # Run app in production mode
npm run build:production      # Build for production
npm run dist:linux:production # Create Linux distribution (production)
npm run dist:mac:production   # Create macOS distribution (production)
npm run dist:win:production   # Create Windows distribution (production)
```

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit the values** in `.env.local` to match your local setup:
   ```bash
   # For local development with backend on localhost
   VITE_API_BASE_URL=http://localhost:8080
   API_BASE_URL=http://localhost:8080
   ```

3. **Create environment-specific files** as needed:
   ```bash
   cp .env.example .env.preprod
   cp .env.example .env.production
   ```

4. **Update the values** for each environment appropriately.

## Usage in Code

### Main Process (Electron)

```typescript
import { config } from './config.js'

// Access environment variables
const apiUrl = config.api.baseUrl
const timeout = config.api.timeout
const isDev = config.isDevelopment

// Feature flags
if (config.features.autoSync) {
  // Start auto-sync
}
```

### Renderer Process (React/Vite)

```typescript
import { config } from '@renderer/config'

// Access environment variables
const apiUrl = config.api.baseUrl
const timeout = config.api.timeout
const isDev = config.isDevelopment
```

## Security Notes

⚠️ **Important:**

- Never commit `.env.local`, `.env.preprod`, or `.env.production` to git
- Only commit `.env.example` with placeholder values
- Never store sensitive data (API keys, passwords) in environment files that are committed
- Use proper secret management for production deployments

## TypeScript Support

Environment variables are type-safe. The type definitions are in:

- `src/vite-env.d.ts` for renderer process variables
- `src/electron/config.ts` for main process variables

To add new environment variables:

1. Add them to the appropriate `.env.*` files
2. Update the TypeScript definitions
3. Update this documentation

## Troubleshooting

### Variables not loading

- Ensure you're using the correct script for your environment
- Check that the `.env.*` file exists
- Verify the variable names match exactly (case-sensitive)
- For renderer process, ensure variables are prefixed with `VITE_`

### Wrong environment being used

- Check the `NODE_ENV` in your `.env.*` file
- Verify you're running the correct npm script
- Check the mode parameter in Vite scripts (`--mode preprod`)
