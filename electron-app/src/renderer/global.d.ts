import type { ElectronAPI } from '../shared/types/ipc.types'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
