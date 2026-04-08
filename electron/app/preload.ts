import { contextBridge, ipcRenderer } from "electron"

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // File system operations
  readFile: (path: string) => ipcRenderer.invoke("fs:read", path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke("fs:write", path, content),
  deleteFile: (path: string) => ipcRenderer.invoke("fs:delete", path),

  // Platform info
  getPlatform: () => process.platform,
  isElectron: () => true,
})
