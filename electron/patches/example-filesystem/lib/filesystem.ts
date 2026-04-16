// This is an example Electron-specific file implementation
// Place this in : electron/patches/example-filesystem/lib/filesystem.ts
// It will override : expo/lib/filesystem.ts

export interface FileSystem {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  deleteFile(path: string): Promise<void>
}

// Electron implementation using IPC to communicate with main process
export const filesystem: FileSystem = {
  async readFile(path: string): Promise<string> {
    // @ts-ignore - window.electronAPI is injected by preload script
    return await window.electronAPI.readFile(path)
  },

  async writeFile(path: string, content: string): Promise<void> {
    // @ts-ignore - window.electronAPI is injected by preload script
    return await window.electronAPI.writeFile(path, content)
  },

  async deleteFile(path: string): Promise<void> {
    // @ts-ignore - window.electronAPI is injected by preload script
    return await window.electronAPI.deleteFile(path)
  },
}
