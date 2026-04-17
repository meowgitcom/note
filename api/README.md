## meow[note] api

Elysia API with file-based routing. Targets Cloudflare Workers.

### Dev

```sh
bun dev
```

This runs `bun gen:routes` then `bun dev.ts`, which spawns a routes watcher and the Bun dev server concurrently. Press Ctrl+C to stop.

### File-based routing

Route files live in `routes/**/route.ts`. The filename itself is never part of the URL.

- `routes/route.ts` → `GET /`
- `routes/users/route.ts` → `GET /users`
- `routes/users/[id]/route.ts` → `GET /users/:id`
- `routes/[...rest]/route.ts` → `GET /*`

Route files export named HTTP method handlers:

```ts
export const GET = () => "hello"
export const POST = async ({ body }) => body
```

Route modules are registered via `registerFileRoutes(app)` in `app.ts`.

### Generating routes

```sh
bun gen:routes        # generate router.ts once
bun watch:routes      # generate and watch for changes (250ms polling)
```

`gen:routes` scans `routes/**/route.ts` and writes `router.ts`. It skips the write if content is unchanged to avoid unnecessary rebuilds.

### Cloudflare

```sh
bun gen:routes && wrangler dev   # local worker
bun gen:routes && wrangler deploy
```

Uses `CloudflareAdapter` + `.compile()` in `app.ts`. The entrypoints are:
- `worker.ts` — Cloudflare Workers (`export default app`)
- `bun.ts` — Bun local dev (`app.listen()`)

### Scripts

| Script | Description |
|---|---|
| `gen:routes` | Generate `router.ts` from route files |
| `watch:routes` | Generate + watch for changes |
| `dev` | Gen routes + spawn dev server with watcher |
| `dev:cf` | Gen routes + `wrangler dev` |
| `deploy:cf` | Gen routes + `wrangler deploy` |
