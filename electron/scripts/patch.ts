#!/usr/bin/env bun
import { readdirSync, cpSync, existsSync, rmSync, symlinkSync, mkdirSync } from "node:fs"
import { join, resolve, relative } from "node:path"

const PATCHES_DIR = resolve(__dirname, "../patches")
const EXPO_DIR = resolve(__dirname, "../../expo")
const EXPO_PATCHED_DIR = resolve(__dirname, "../expo-patched")

console.log("🔧 Creating symlinked Expo app with patches for Electron...")

// Clean previous patched directory
if (existsSync(EXPO_PATCHED_DIR)) {
  console.log("🧹 Cleaning previous patched Expo app...")
  rmSync(EXPO_PATCHED_DIR, { recursive: true, force: true })
}

// Create base directory
mkdirSync(EXPO_PATCHED_DIR, { recursive: true })

// Collect all files that will be patched
const patchedFiles = new Set<string>()

if (existsSync(PATCHES_DIR)) {
  const patches = readdirSync(PATCHES_DIR, { withFileTypes: true })

  for (const patch of patches) {
    if (!patch.isDirectory()) continue

    const patchPath = join(PATCHES_DIR, patch.name)

    // Recursively find all files in this patch
    const findFiles = (dir: string, baseDir: string = dir): string[] => {
      const files: string[] = []
      const entries = readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          files.push(...findFiles(fullPath, baseDir))
        } else {
          // Store relative path from patch directory
          files.push(relative(baseDir, fullPath))
        }
      }

      return files
    }

    const filesInPatch = findFiles(patchPath)
    filesInPatch.forEach((f) => patchedFiles.add(f))
  }
}

console.log(`📋 Found ${patchedFiles.size} file(s) to patch`)

// Recursively symlink all files from expo, except those that will be patched
const symlinkDirectory = (sourceDir: string, targetDir: string, relativePath: string = "") => {
  const entries = readdirSync(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name)
    const targetPath = join(targetDir, entry.name)
    const relPath = join(relativePath, entry.name)

    // Skip these directories entirely
    const skipDirs = ["node_modules", ".expo", "android", "ios", "dist", ".git"]
    if (entry.isDirectory() && skipDirs.includes(entry.name)) {
      continue
    }

    if (entry.isDirectory()) {
      mkdirSync(targetPath, { recursive: true })
      symlinkDirectory(sourcePath, targetPath, relPath)
    } else {
      // Check if this file will be patched
      if (patchedFiles.has(relPath)) {
        console.log(`  ⏭️  Skipping symlink for ${relPath} (will be patched)`)
      } else {
        // Create symlink to original file
        try {
          symlinkSync(sourcePath, targetPath)
        } catch (error) {
          console.error(`  ❌ Failed to symlink ${relPath}:`, error)
        }
      }
    }
  }
}

console.log("🔗 Creating symlinks from original Expo app...")
symlinkDirectory(EXPO_DIR, EXPO_PATCHED_DIR)
console.log("✅ Symlinks created")

// Now apply patches (copying over/replacing symlinks)
if (!existsSync(PATCHES_DIR)) {
  console.log("ℹ️  No patches to apply")
  console.log("\n✨ Expo patched directory ready!")
  process.exit(0)
}

const patches = readdirSync(PATCHES_DIR, { withFileTypes: true })
let patchCount = 0

for (const patch of patches) {
  if (!patch.isDirectory()) continue

  const patchPath = join(PATCHES_DIR, patch.name)
  const targetPath = EXPO_PATCHED_DIR

  console.log(`📦 Applying patch: ${patch.name}`)

  try {
    cpSync(patchPath, targetPath, {
      recursive: true,
      force: true,
      filter: (src) => {
        return !src.includes("node_modules")
      },
    })
    patchCount++
    console.log(`  ✅ Applied ${patch.name}`)
  } catch (error) {
    console.error(`  ❌ Failed to apply ${patch.name}:`, error)
    process.exit(1)
  }
}

console.log(`\n✨ Symlinked Expo app with ${patchCount} patch(es) successfully!`)
