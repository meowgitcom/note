# Sync Plan

## Goal

Make `meow[note]` work in two modes:

1. `local-only`
   The app works fully against the local SQLite database with no login required.

2. `signed-in sync`
   When a user logs in, the app syncs local data with the server database running behind `api` on Cloudflare + Elysia.

The local database remains the primary runtime database in both Expo and Electron.
The server database is the source for cross-device sync, not a hard requirement for basic app usage.

## Core Rules

1. The app must boot and remain usable with zero network and zero auth.
2. Logging in must not replace the local DB. It only enables sync.
3. Sync must be incremental and resumable.
4. Server auth tables stay server-only.
5. Shared note/page/block/database schema stays in `db` and is reused by local apps and the API server.

## Target Architecture

### Shared Schema Package

Keep `db` as the shared schema workspace package:

- `db/client`
  Shared app schema used by Expo, Electron, and server sync storage.
- `db/server`
  Client schema plus server-only auth schema.
- Add sync-specific tables under a client-safe area if the local apps need them.
- Add server-only auth/session tables only under `db/server` and `db/auth`.

### Local Databases

Keep the current local-first shape:

- Expo uses `expo-sqlite` + Drizzle + local migrations.
- Electron uses `better-sqlite3` + Drizzle + local migrations.

The local DB should own:

- pages
- blocks
- workspaces
- databases/tables/rows/columns/views/relations/rollups
- local sync metadata
- local operation log
- device identity
- optional signed-in account binding metadata

### API Server Database

Implement a real server DB inside `api` with its own Drizzle config, just like we now have for Expo and Electron.

Planned shape:

- `api/drizzle.config.ts`
  Server Drizzle config for the Cloudflare-side database.
- `api/drizzle/`
  Server migrations.
- `api/db/`
  Server DB client/bootstrap code.

Recommended server database target:

- Production: Cloudflare D1
- Local dev: local SQLite or local D1 workflow, but still through the `api` workspace

The API server should use `db/server` or a dedicated server sync schema export built from it.

## Sync Data Model

We need more than the raw note tables. We need sync tables and stable IDs.

### Required Identity Fields

Each local installation needs:

- `deviceId`
  Permanent per-install UUID.
- `userId`
  Present only when signed in.
- `workspaceId`
  Stable shared ID for synced workspaces.

Each synced record should use stable IDs generated client-side so offline writes are valid before sync.

### Required Sync Tables

Planned new tables:

- `sync_state`
  Per local database state:
  - device id
  - current signed-in user id or null
  - last successful push cursor
  - last successful pull cursor
  - last full sync time
  - sync enabled flag

- `sync_operations`
  Local append-only operation log:
  - operation id
  - device id
  - user id nullable
  - workspace id
  - entity type
  - entity id
  - mutation type
  - payload json
  - lamport timestamp
  - wall clock timestamp
  - sync status
  - retry count

- `sync_tombstones`
  Deletion tracking:
  - entity type
  - entity id
  - deleted by device id
  - deleted at
  - lamport timestamp

### Server-Side Sync Tables

Server should keep:

- canonical synced entities
- mutation journal for pull cursors
- tombstones
- workspace membership / ownership
- user-device registration

Proposed server-only tables:

- `server_mutations`
- `server_tombstones`
- `user_devices`
- `sync_checkpoints`

## Sync Math / Merge Logic

We need deterministic conflict math, not vague last-write-wins everywhere.

### Use From `math`

Reuse `math/blocks` for ordered block positions:

- keep block ordering via fractional indexing strings
- preserve existing `position` math for inserts/reorders
- sync block moves by syncing `position`, not integer indexes

This is already a good fit for collaborative ordering because it avoids renumbering.

### New Math Concepts To Add Later

Add a small sync math utility in `math` for deterministic merge ordering:

- Lamport clocks
- version comparison helpers
- canonical operation ordering
- maybe simple vector-clock helpers if we need causal conflict inspection later

Planned helper package shape:

- `math/sync/clock.ts`
- `math/sync/merge.ts`
- `math/sync/order.ts`

### Merge Policy

Use field-aware merge rules:

1. Block order
   Use `position` from `math/blocks`.

2. Simple scalar fields
   Resolve with deterministic Lamport ordering:
   - higher lamport wins
   - if equal, newer server timestamp wins
   - if still equal, lexicographically smaller device id wins

3. Deletions
   Tombstone beats stale updates unless the update causally happened after the tombstone.

4. Complex content blobs
   Start with replace-whole-field semantics per field.
   Do not attempt full CRDT text editing in v1.

This gives us sane offline sync without pretending to solve Google Docs in one pass.

## Auth Model

### No Login

If no user is logged in:

- local DB only
- no sync calls
- no server dependency
- local workspaces are fully usable

### Logged In

If logged in:

- keep using local DB for reads/writes
- enqueue local ops
- background push to server
- pull remote ops back into local DB
- persist sync checkpoint locally

Auth is server concern only. The client should only store:

- session token or secure auth token reference
- current user id
- sync enabled state

## API Endpoints

Planned Elysia endpoints in `api`:

- `POST /auth/...`
  Auth flows later if needed.

- `GET /sync/bootstrap`
  Returns account + workspace metadata + latest sync cursors.

- `POST /sync/push`
  Accepts local operation batch from a device.

- `GET /sync/pull`
  Returns server mutations after a cursor.

- `POST /sync/ack`
  Optional explicit ack for large cursor windows if needed.

- `POST /sync/register-device`
  Registers device metadata after login.

### Push Contract

Client sends:

- device id
- user id
- workspace id
- last known server cursor
- operation batch

Server returns:

- accepted operations
- rejected operations
- canonical server cursor
- conflict resolutions if any

### Pull Contract

Client sends:

- device id
- workspace ids
- last pulled cursor

Server returns:

- ordered mutation batch
- tombstones
- new cursor

## Local Sync Engine

Add a shared sync engine module used by both Expo and Electron.

Planned package location:

- `db/sync/` or `db/local-sync/`

Core responsibilities:

1. record local operations whenever note data changes
2. maintain lamport clock per device
3. push unsynced ops when authenticated
4. pull remote ops by cursor
5. apply remote ops into local DB transactionally
6. update sync status and retry state

### Important Constraint

Do not make UI code write raw tables directly everywhere.
We should move writes behind repositories or mutation helpers so sync logging is guaranteed.

Planned write APIs:

- `createPage(...)`
- `updatePage(...)`
- `deletePage(...)`
- `createBlock(...)`
- `moveBlock(...)`
- `updateBlock(...)`
- `deleteBlock(...)`

Each mutation helper should:

1. update the local tables
2. append a sync operation
3. bump local lamport clock

## Implementation Phases

### Phase 1

Build the server DB foundation in `api`:

- add `db: workspace:*`
- add `drizzle-orm`
- add server Drizzle config
- add server DB bootstrap
- add first server migrations
- add sync tables

### Phase 2

Add local sync metadata:

- local sync tables in shared schema
- device id generation
- lamport clock storage
- operation log storage
- tombstones

### Phase 3

Refactor local writes behind mutation/repository functions:

- pages
- blocks
- workspace basics

### Phase 4

Implement API sync routes:

- register device
- push
- pull

### Phase 5

Implement client sync engine:

- optional auth binding
- background push/pull
- retry and checkpoint logic

### Phase 6

Conflict handling and recovery:

- deterministic merge rules
- replay safety
- idempotent operation handling
- full rebootstrap for damaged local sync state

## First Concrete Files To Add Later

### API

- `api/drizzle.config.ts`
- `api/drizzle/`
- `api/db/client.ts`
- `api/db/schema.ts`
- `api/sync/routes.ts`
- `api/sync/service.ts`
- `api/auth/`

### DB Package

- `db/sync/device.ts`
- `db/sync/operation.ts`
- `db/sync/tombstone.ts`
- `db/sync/state.ts`
- `db/sync/index.ts`

### Math Package

- `math/sync/clock.ts`
- `math/sync/merge.ts`
- `math/sync/index.ts`

### Client Runtime

- `expo/lib/sync.ts`
- `electron/patches/local-db/lib/sync.ts`
- shared mutation/repository helpers in `db` or app-specific runtime packages

## Risks

1. If we keep direct table writes all over the app, sync logging will be inconsistent.
2. If we try CRDT-grade rich text sync immediately, implementation cost will explode.
3. If we do not track tombstones, deletes will resurrect.
4. If auth and sync are too tightly coupled, local-only mode will break.

## v1 Scope

For the first real implementation, keep scope tight:

- local-first app always works
- authenticated sync only for structured note/page/block/database entities
- deterministic merge with lamport clocks + block fractional positions
- no rich text CRDT yet
- no live multiplayer presence yet

That is enough to get a serious offline-first sync base without overbuilding.

## Status (Implemented)

Phase 1-2 groundwork is now in place:

1. Shared local sync metadata tables added in `db/sync/*` and included in a new `db/local-client.ts` schema.
2. Expo and Electron now use `localClientSchema` and create a stable per-install `deviceId` row via `ensureLocalSyncState(...)`.
3. Local migrations updated to include the new sync tables:
   - Expo: `expo/drizzle/0001_*.sql`
   - Electron: `electron/drizzle/0001_*.sql`
4. API workspace has Drizzle config + initial server migrations generated from `db/server.ts`:
   - `api/drizzle.config.ts`
   - `api/drizzle/0000_*.sql`
   - server-only sync journal tables live in `db/sync/server.ts` and are included in `db/server.ts`.
