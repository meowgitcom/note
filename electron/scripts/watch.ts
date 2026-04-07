#!/usr/bin/env bun
import chokidar from "chokidar"
import { cpSync, existsSync, readdirSync } from "node:fs"
import { join, resolve, relative } from "node:path"

const PATCHES_DIR = resolve(__dirname, "../patches")
const EXPO_DIR = resolve(__dirname, "../../expo")
const EXPO_PATCHED_DIR = resolve(__dirname, "../expo-patched")

console.log("👀 Watching Expo app for changes...")

// Collect all patched file paths to skip them
const patchedFiles = new Set<string>()

if (existsSync(PATCHES_DIR)) {
  const collectPatchedFiles = (dir: string, baseDir: string = dir) => {
    const entries = readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        collectPatchedFiles(fullPath, baseDir)
      } else {
        const relPath = relative(baseDir, fullPath)
        patchedFiles.add(relPath)
      }
    }
  }

  const patches = readdirSync(PATCHES_DIR, { withFileTypes: true })
  
  for (const patch of patches) {
    if (!patch.isDirectory()) continue
    collectPatchedFiles(join(PATCHES_DIR, patch.name))
  }
}

console.log(`📋 Ignoring ${patchedFiles.size} patched file(s)`)

// Watch for changes with chokidar
const watcher = chokidar.watch(EXPO_DIR, {
  ignored: [
    "**/node_modules/**",
    "**/.expo/**",
    "**/android/**",
    "**/ios/**",
    "**/dist/**",
    "**/.git/**",
  ],
  persistent: true,
  ignoreInitial: true,
})

watcher.on("change", (path) => {
  const filename = relative(EXPO_DIR, path)

  // Skip patched files
  if (patchedFiles.has(filename)) {
    console.log(`⏭️  Skipping ${filename} (patched)`)
    return
  }

  const targetPath = join(EXPO_PATCHED_DIR, filename)

  try {
    cpSync(path, targetPath, { force: true })
    console.log(`🔄 Synced: ${filename}`)
  } catch (error) {
    console.error(`❌ Failed to sync ${filename}:`, error)
  }
})

watcher.on("ready", () => {
  console.log("✅ Watching for changes... (Ctrl+C to stop)")
})

// Keep process alive
process.on("SIGINT", () => {
  console.log("\n👋 Stopping file watcher...")
  watcher.close()
  process.exit(0)
})
