/**
 * Shared code and types for Electron app
 *
 * This folder contains code and types that are shared between:
 * - Main process (electron/main.ts)
 * - Renderer process (ui/*)
 * - Preload script (electron/preload.ts)
 *
 * Usage:
 *   import { Car, CarCreateInput, IpcResponse, ElectronAPI } from '@/shared'
 */

// Export all types
export * from './types/index'
