import { contextBridge, ipcRenderer } from "electron"

// Make frameless window draggable.
// We do this in preload (not React) so it works regardless of RN-web styling.
window.addEventListener("DOMContentLoaded", () => {
  const apply = () => {
    const titlebar = document.getElementById("electron-titlebar") as HTMLElement | null
    const controls = document.getElementById("electron-window-controls") as HTMLElement | null

    if (titlebar) {
      // @ts-ignore - nonstandard Electron CSS property
      titlebar.style.webkitAppRegion = "drag"
      titlebar.style.userSelect = "none"
      // @ts-ignore
      titlebar.style.webkitUserSelect = "none"
    }

    if (controls) {
      // @ts-ignore - nonstandard Electron CSS property
      controls.style.webkitAppRegion = "no-drag"
      // Ensure nested buttons stay clickable.
      controls.querySelectorAll("*").forEach((el) => {
        // @ts-ignore
        ;(el as HTMLElement).style.webkitAppRegion = "no-drag"
      })
    }

    return !!titlebar && !!controls
  }

  if (apply()) return

  const obs = new MutationObserver(() => {
    if (apply()) obs.disconnect()
  })
  obs.observe(document.documentElement, { childList: true, subtree: true })
})

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  getDbSnapshot: () => ipcRenderer.invoke("db:getSnapshot"),
  resetDb: () => ipcRenderer.invoke("db:reset"),

  // File system operations
  readFile: (path: string) => ipcRenderer.invoke("fs:read", path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke("fs:write", path, content),
  deleteFile: (path: string) => ipcRenderer.invoke("fs:delete", path),

  // Platform info
  getPlatform: () => process.platform,
  isElectron: () => true,

  // Window controls
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
})
