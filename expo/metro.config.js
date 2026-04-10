const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "../../App" || moduleName === "../App" || moduleName === "./App") {
    const appPath = __dirname + "/App.tsx"
    return {
      filePath: appPath,
      type: "sourceFile",
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
