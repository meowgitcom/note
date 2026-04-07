const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

// Enable symlink resolution for Electron development
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Use default resolver but with symlinks enabled
  return context.resolveRequest(context, moduleName, platform)
}

// Follow symlinks
config.resolver.unstable_enableSymlinks = true

module.exports = config
