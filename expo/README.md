## meow[note] expo

Expo app using expo-router. Targets web (via react-native-web) and mobile.

### Dev

```sh
bun web          # web only
bun android     # Android
bun ios         # iOS
bun dev         # default
```

### Building

```sh
bun build        # exports to ./dist (expo export --platform web)
```

### Cloudflare Pages

```sh
bun build && wrangler pages deploy   # deploy
bun dev:cf                             # local Cloudflare Pages dev
```

Exports the web app to `./dist`, then `wrangler pages deploy` pushes it to Cloudflare Pages.

The `wrangler.toml` sets `pages_build_output_dir = "./dist"`.

### Scripts

| Script | Description |
|---|---|
| `dev` | Expo dev server |
| `web` | Expo web only |
| `android` | Expo Android |
| `ios` | Expo iOS |
| `export:web` | `expo export --platform web` |
| `build` | Export web to `./dist` |
| `deploy:cf` | Build + `wrangler pages deploy` |
| `dev:cf` | `wrangler pages dev ./dist` |
