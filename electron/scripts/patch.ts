#!/usr/bin/env bun
import { readdirSync, cpSync, existsSync, rmSync, mkdirSync } from "node:fs"
import { join, resolve, relative } from "node:path"

const PATCHES_DIR = resolve(__dirname, "../patches")
const EXPO_DIR = resolve(__dirname, "../../expo")
const EXPO_PATCHED_DIR = resolve(__dirname, "../expo-patched")

console.log("🔧 Creating patched Expo app for Electron...")

// Clean previous patched directory
if (existsSync(EXPO_PATCHED_DIR)) {
  console.log("🧹 Cleaning previous patched Expo app...")
  rmSync(EXPO_PATCHED_DIR, { recursive: true, force: true })
}

// Create base directory
mkdirSync(EXPO_PATCHED_DIR, { recursive: true })

// Copy the entire Expo app (excluding certain directories)
console.log("📂 Copying Expo app...")
cpSync(EXPO_DIR, EXPO_PATCHED_DIR, {
  recursive: true,
  filter: (src) => {
    const relativeSrc = relative(EXPO_DIR, src)
    // Skip these directories
    const skipDirs = ["node_modules", ".expo", "android", "ios", "dist", ".git"]

    for (const skipDir of skipDirs) {
      if (relativeSrc === skipDir || relativeSrc.startsWith(skipDir + "/")) {
        return false
      }
    }

    return true
  },
})
console.log("✅ Expo app copied")

// Now apply patches
if (!existsSync(PATCHES_DIR)) {
  console.log("ℹ️  No patches to apply")
  console.log("\n✨ Expo patched directory ready!")
  process.exit(0)
}

const patches = readdirSync(PATCHES_DIR, { withFileTypes: true })
let patchCount = 0

console.log(`📋 Found ${patches.filter((p) => p.isDirectory()).length} patch(es) to apply`)

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

console.log(`\n✨ Patched Expo app with ${patchCount} patch(es) successfully!`)
