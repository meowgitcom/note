const { getDefaultConfig } = require("expo/metro-config")
const path = require("node:path")
const { existsSync } = require("node:fs")

const projectRoot = __dirname
const monorepoRoot = existsSync(path.resolve(projectRoot, "../db"))
  ? path.resolve(projectRoot, "..")
  : path.resolve(projectRoot, "../..")
const config = getDefaultConfig(__dirname)

config.resolver.sourceExts.push("sql")
config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
]

module.exports = config
