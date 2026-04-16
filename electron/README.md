# meow[note] Electron

Electron wrapper for the meow[note] Expo app.

## Architecture

This Electron app uses meow[note] Expo app as the frontend, allowing you to share code between mobile, web, and desktop platforms. The patch system allows you to override meow[note] Expo app files with Electron-specific implementations for native features.

## How It Works

1. **Copy-Based Patch System**:
   - Creates `electron/expo-patched/` directory
   - **Copies** entire meow[note] Expo app (excluding node_modules, .expo, android, ios, dist)
   - **Overlays** patch files on top
   - The original Expo app is **never modified**
   - A file watcher syncs changes from `../expo/` to `expo-patched/`

2. **Development**:
   - `expo-patched/` runs Metro bundler in web mode (localhost:8081)
   - File watcher syncs changes from `../expo/` to `expo-patched/`
   - Patched files are independent copies → Electron-specific code works
   - You can develop mobile apps in `../expo/` simultaneously
3. **Production**:
   - Same copy + patch structure created
   - `expo-patched/` exports static web build to `expo-patched/dist/`
   - Electron Builder packages the web build
   - Electron loads from bundled `expo-dist/index.html`

## Patch System

The patch system uses **copy with file watching** to give you automatic hot reload while allowing platform-specific overrides. **The original Expo app remains untouched** for mobile development.

### How Patching Works

1. Patch script (`scripts/patch.ts`) creates `electron/expo-patched/` directory
2. **Copies** all files from `../expo/` into `expo-patched/`
3. **Copies** patch files on top (overwriting)
4. File watcher (`scripts/watch.ts`) keeps `expo-patched/` in sync with `../expo/`
5. Result:
   - Changes to non-patched files in `../expo/` → **synced automatically**
   - Patched files are independent copies → **Electron-specific code works**
   - The original `../expo/` is never modified

This allows you to override any file with Electron-specific implementations:

- Native file system operations
- Desktop-specific UI components
- Platform-specific APIs

### How to Create a Patch

1. Create a folder in `electron/patches/` (e.g., `electron/patches/filesystem/`)
2. Mirror the Expo app structure inside the patch folder
3. Add your Electron-specific files

Example structure:

```
electron/
├── patches/
│   └── filesystem/              # Patch name
│       └── lib/
│           └── filesystem.ts    # Overrides expo-patched/lib/filesystem.ts
```

When you run `bun run dev` or `bun run build`, the patch script:

1. Creates `expo-patched/` directory
2. Copies all files from `../expo/` into `expo-patched/`
3. Copies patch files on top
4. Result: Files are copied, patched files use Electron code

### Example Patch

See `electron/patches/example-filesystem/` for a complete example of overriding file system operations with Electron's IPC.

## Setup

```bash
cd electron
bun install
```

## Development

```bash
bun run dev
```

This will:

1. Run `scripts/patch.ts` to create `expo-patched/` with patches
2. Start the file watcher to sync `../expo/` → `expo-patched/`
3. Install dependencies in `expo-patched/` and start Metro bundler (localhost:8081)
4. Launch Electron (waits for Metro to be ready)
5. Open DevTools for debugging

**Hot Reload**: Changes to files in `../expo/` are synced automatically to `expo-patched/`. Changes to patched files require restart.

**Note**: The original Expo app at `../expo/` is never modified. You can develop mobile apps there while Electron runs.

## Building

```bash
bun run build
```

This will:

1. Run `scripts/patch.ts` to create `expo-patched/` with patches
2. Install dependencies in `expo-patched/`
3. Export Expo app as static web build to `expo-patched/dist/`
4. Compile TypeScript to JavaScript
5. Package everything with Electron Builder

This creates distributable packages for your platform in the `build/` directory.

## Fix & Lint

```bash
bun run fix
```

Runs formatting (oxfmt), linting (oxlint), and type checking (tsc --noEmit).

## Project Structure

```
electron/
├── app/
│   ├── main.ts      # Electron main process
│   └── preload.ts   # Preload script for renderer communication
├── config/
│   ├── oxfmt.json   # Formatting config
│   └── oxlint.json  # Linting config
├── patches/         # Electron-specific file overrides
├── scripts/
│   ├── patch.ts     # Patch application script
│   └── watch.ts     # File watcher script
├── expo-patched/    # Patched copy of Expo app (gitignored)
├── dist/            # Compiled TypeScript output
└── package.json
```

## IPC APIs

The preload script exposes these APIs to the renderer:

- `window.electronAPI.fs.read(path)` - Read a file
- `window.electronAPI.fs.write(path, content)` - Write a file
- `window.electronAPI.fs.delete(path)` - Delete a file

Add more APIs in `app/preload.ts` and handle them in `app/main.ts`.
