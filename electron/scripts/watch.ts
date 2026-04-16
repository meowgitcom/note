#!/usr/bin/env bun
import { watch } from "fs"
import { cpSync, existsSync, readdirSync } from "fs"
import { join, resolve, relative } from "path"

const PATCHES_DIR = resolve(import.meta.dir, "../patches")
const EXPO_DIR = resolve(import.meta.dir, "../../expo")
const EXPO_PATCHED_DIR = resolve(import.meta.dir, "../expo-patched")

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

// Watch for changes using Bun's native fs.watch
const watcher = watch(EXPO_DIR, { recursive: true }, (event, filename) => {
  if (!filename) return

  // Skip temp files created by editors
  if (filename.endsWith("~") || filename.includes("/.") || /\/\d+$/.test(filename)) {
    return
  }

  // Skip these directories
  const skipDirs = ["node_modules", ".expo", "android", "ios", "dist", ".git"]
  for (const skipDir of skipDirs) {
    if (filename === skipDir || filename.startsWith(skipDir + "/")) {
      return
    }
  }

  // Skip patched files
  if (patchedFiles.has(filename)) {
    console.log(`⏭️  Skipping ${filename} (patched)`)
    return
  }

  const sourcePath = join(EXPO_DIR, filename)
  const targetPath = join(EXPO_PATCHED_DIR, filename)

  // Check if file still exists (might be deleted or temp file)
  if (!existsSync(sourcePath)) {
    return
  }

  try {
    cpSync(sourcePath, targetPath, { force: true })
    console.log(`🔄 Synced : ${filename}`)
  } catch (error) {
    console.error(`❌ Failed to sync ${filename} : `, error)
  }
})

console.log("✅ Watching for changes... (Ctrl+C to stop)")

// Keep process alive and handle cleanup
process.on("SIGINT", () => {
  console.log("\n👋 Stopping file watcher...")
  watcher.close()
  process.exit(0)
})
