import type { ElectronAPI } from '../electron/ipc/ipc.types'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
