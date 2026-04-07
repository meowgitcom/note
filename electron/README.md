# open[note] Electron

Electron wrapper for the open[note] Expo app.

## Architecture

This Electron app uses your Expo app as the frontend, allowing you to share code between mobile, web, and desktop platforms. The patch system allows you to override Expo files with Electron-specific implementations for native features.

## How It Works

1. **Symlink-Based Patch System**:
   - Creates `electron/expo-patched/` directory
   - **Symlinks** all original files from `../expo/` → `expo-patched/`
   - **Copies** only the patched files (breaking symlinks for those)
   - Your original Expo app is **never modified**
   - Changes to `../expo/` files hot reload instantly via symlinks

2. **Development**:
   - `expo-patched/` runs Metro bundler in web mode (localhost:8081)
   - Non-patched files are symlinked → changes in `../expo/` hot reload automatically
   - Patched files are real copies → Electron-specific code works
   - You can develop mobile apps in `../expo/` simultaneously
3. **Production**:
   - Same symlink + patch structure created
   - `expo-patched/` exports static web build to `expo-patched/dist/`
   - Electron Builder packages the web build
   - Electron loads from bundled `expo-dist/index.html`

## Patch System

The patch system uses **symlinks** to give you automatic hot reload while allowing platform-specific overrides. **Your original Expo app remains untouched** for mobile development.

### How Symlink Patching Works

1. Patch script creates `electron/expo-patched/` directory structure
2. **Symlinks** all files from `../expo/` into `expo-patched/`
3. **Copies** only the patched files (replacing symlinks for those files)
4. Result:
   - Changes to non-patched files in `../expo/` → **hot reload instantly**
   - Patched files are independent copies → **Electron-specific code works**
   - Your original `../expo/` is never modified

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

1. Creates directory structure in `expo-patched/`
2. Symlinks all files from `../expo/` into `expo-patched/`
3. Copies patch files on top (breaking symlinks for patched files)
4. Result: Most files hot reload via symlinks, patched files use Electron code

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

1. Create `expo-patched/` with symlinks to `../expo/` + apply patches
2. Install dependencies in `expo-patched/`
3. Start Metro bundler in web mode (localhost:8081)
4. Launch Electron (waits for Metro to be ready)
5. Open DevTools for debugging

**Hot Reload**: Changes to files in `../expo/` hot reload automatically (via symlinks). Changes to patched files require restart.

**Note**: Your original Expo app at `../expo/` is never modified. You can develop mobile apps there while Electron runs.

## Building

```bash
bun run build
```

This will:

1. Create `expo-patched/` with symlinks to `../expo/` + apply patches
2. Install dependencies in `expo-patched/`
3. Export Expo app as static web build to `expo-patched/dist/`
4. Compile TypeScript to JavaScript
5. Package everything with Electron Builder

This creates distributable packages for your platform in the `build/` directory.

**Note**: Build process uses symlinks, so it always includes your latest `../expo/` code.

## Project Structure

```
electron/
├── app/
│   ├── main.ts      # Electron main process
│   └── preload.ts   # Preload script for renderer communication
├── patches/         # Electron-specific file overrides
├── scripts/
│   └── patch.ts     # Patch application script
├── expo-patched/    # Patched copy of Expo app (gitignored)
├── dist/            # Compiled TypeScript output
└── package.json
```

## IPC APIs

The preload script exposes these APIs to the renderer:

- `window.electronAPI.readFile(path)` - Read a file
- `window.electronAPI.writeFile(path, content)` - Write a file
- `window.electronAPI.deleteFile(path)` - Delete a file
- `window.electronAPI.getPlatform()` - Get OS platform
- `window.electronAPI.isElectron()` - Check if running in Electron

Add more APIs in `app/preload.ts` and handle them in `app/main.ts`.
