import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import * as isDev from "electron-is-dev"
import { promises as fs } from "fs"
import { getDesktopDbSnapshot, initializeDesktopDb, resetDesktopDb } from "./database"

let mainWindow: BrowserWindow | null = null

// Window control IPC (registered once; targets current mainWindow)
ipcMain.on("window:minimize", () => {
  mainWindow?.minimize()
})

ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on("window:close", () => {
  mainWindow?.close()
})

ipcMain.handle("window:isMaximized", () => {
  return mainWindow?.isMaximized() ?? false
})

ipcMain.handle("db:getSnapshot", async () => {
  return getDesktopDbSnapshot()
})

ipcMain.handle("db:reset", async () => {
  return resetDesktopDb()
})

// IPC handlers for file system operations
ipcMain.handle("fs:read", async (_, filePath: string) => {
  try {
    return await fs.readFile(filePath, "utf-8")
  } catch (error) {
    throw new Error(`Failed to read file : ${error}`)
  }
})

ipcMain.handle("fs:write", async (_, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, "utf-8")
  } catch (error) {
    throw new Error(`Failed to write file : ${error}`)
  }
})

ipcMain.handle("fs:delete", async (_, filePath: string) => {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    throw new Error(`Failed to delete file : ${error}`)
  }
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    // In development, load from Expo Metro bundler (web platform)
    mainWindow.loadURL("http://localhost:8081")
  } else {
    // In production, load from bundled Expo web export
    const expoDistPath = path.join(process.resourcesPath, "expo-dist")
    mainWindow.loadFile(path.join(expoDistPath, "index.html"))
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  initializeDesktopDb()
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
