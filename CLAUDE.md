# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Delicias" — a bakery/confectionery e-commerce storefront + admin panel, originally scaffolded by Base44, now a self-hosted full-stack app: React/Vite frontend + a local Express backend backed by Postgres.

## Commands

```bash
npm run dev      # runs Vite dev server AND the Express API server together (concurrently)
npm run build     # vite build (frontend only)
npm run lint      # eslint .
npm run preview   # vite preview
```

There is no test suite configured in this repo.

The Express API server (`server.js`) runs standalone on port 3001 and can also be started alone with `node server.js`. `npm run dev` starts both `vite --host` and `node server.js` via `concurrently`. Vite's dev server has `allowedHosts: true`, so it's reachable from other devices on the network. `server.js` requires Postgres to be up (`npm run db:up`) before it will start.

`./start.sh` / `./stop.sh` are an alternative to `npm run dev` for running the app in the background (PID-tracked under `.run/`, logs under `logs/`) — useful when you don't want a foreground terminal tied up. `start.sh` prints the Vite Local/Network URLs once the dev server is ready.

```bash
npm run db:up       # starts the delicias-postgres container (docker-compose.postgres.yml)
npm run db:down      # stops it
npm run db:migrate   # one-off: copies data from the legacy database.sqlite into Postgres
```

## Architecture

**Two independent processes, one repo:**
- **Frontend**: Vite + React 18 (JSX, not TSX — despite `@types/react` and one `.ts` file, this is not a TypeScript project) in `src/`, served on Vite's default port.
- **Backend**: a single-file Express server (`server.js`) on port 3001, talking to Postgres via `pg` (`db/pool.js` — a `Pool` reading `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE` from `.env`). No ORM/query builder — raw parameterized SQL (`$1, $2, ...`) with async/await. It also serves uploaded images statically from `public/uploads/`.

**Frontend ↔ backend communication** goes exclusively through `src/api/localApiClient.js`, which derives `BASE_URL` at runtime from `window.location.hostname` (localhost vs LAN IP) so the app works both locally and from other devices on the same network. Some entities (products, settings) have dedicated named functions here (`getProducts`, `createProduct`, `getSettings`, ...); everything else goes through the generic `localApiClient.get/post/put` object. When adding a new backend resource, prefer extending this file rather than calling `fetch` directly from components.

**Auth is Firebase** (`src/firebase/config.js`, `src/context/AuthContext.jsx`) — email/password and Google sign-in. Firebase only handles identity; app-level user profile data (address, phone, payment method) lives in the Postgres `user_profiles` table, keyed by Firebase `uid`, and is fetched/synced via `localApiClient` (see `AuthContext`'s `onAuthStateChanged` handler and the `/api/user-profile` / `/api/profile` endpoints in `server.js`). `orders.user_id` deliberately has no foreign key to `user_profiles.uid` — a logged-in Firebase user without a local profile row yet must still be able to check out.

**Admin access is a hardcoded email check**, not a role/claims system: `currentUser?.email === 'ebetta@gmail.com'` — duplicated in `src/pages/index.jsx` (route guard for `/admin`) and `src/pages/Layout.jsx` (nav visibility). If admin logic changes, update both places.

**Routing** (`src/pages/index.jsx`) is a flat `PAGES` map + React Router `<Routes>`, wrapped by the `Layout` component. All page components live directly in `src/pages/` (not nested by route).

**Cart state lives in `localStorage`** (not React context or a backend table) under the `cart` key. Components mutate it directly and then dispatch a `window.dispatchEvent(new Event('cartUpdated'))` so other mounted components (e.g. the cart icon/count in `Layout.jsx`) can react — there's no shared cart provider, so any new cart-reading UI needs to listen for this event itself.

**UI components** (`src/components/ui/`) are shadcn/ui-style (Radix primitives + `class-variance-authority` + Tailwind), configured via `components.json` (style: `new-york`, no RSC/TSX). Use the `@/` path alias (mapped to `src/`, set up in both `vite.config.js` and `jsconfig.json`) for imports rather than relative paths across feature boundaries.

**Feature components** are organized by domain under `src/components/`: `admin/`, `cart/`, `home/`, `login/`, `products/`, plus the shared `ui/` and `utils/` (`formatters.jsx`).

**Database schema** is defined imperatively in `db/schema.js` (`ensureSchema(pool)`) via `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, run once at server startup by `server.js` (there is no migration framework). When adding a column, follow this same pattern: add it to the `CREATE TABLE`, then add an idempotent `ALTER TABLE ADD COLUMN IF NOT EXISTS`. Tables: `products`, `orders`, `order_items`, `user_profiles`, `settings` (a flat key/value store used for site content like hero image, WhatsApp number/message, category icons/descriptions). `price`/`total_amount` are `DOUBLE PRECISION`, not `NUMERIC` — `NUMERIC` comes back from `pg` as a string, which would silently break frontend code that does plain `+` arithmetic on prices (e.g. `AdminStats.jsx`).

**Postgres runs in its own Docker container** (`delicias-postgres`, defined in `docker-compose.postgres.yml`, port 5433 on the host, named volume `delicias_pgdata`) — kept deliberately separate from any other Postgres containers on the host (e.g. one on the default 5432 port for an unrelated project). Credentials live in `.env` (`PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`), loaded via `dotenv/config` in `db/pool.js`. The legacy `database.sqlite` file and its `sqlite3` devDependency are kept around only for `scripts/migrate-sqlite-to-pg.mjs` (a re-runnable one-off migration — it truncates and re-inserts, so re-running it overwrites Postgres with whatever is currently in the sqlite file).

**File uploads** go through `multer` (disk storage, timestamped filenames) into `public/uploads/`, served statically by Express. Generic uploads use `POST /api/upload` (returns an array of URLs); hero/logo images have dedicated endpoints (`/api/upload/hero`, `/api/upload/logo`) that also write the resulting URL into the `settings` table.

## Environment

- `.env` holds `VITE_BASE44_APP_ID` (a leftover from the original Base44 scaffold — the app no longer talks to the Base44 API; everything goes through the local Express server).
- Firebase config in `src/firebase/config.js` is hardcoded inline rather than sourced from env vars.
