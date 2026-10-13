# First Minds

First Minds is a mobile evolution and intelligence simulation where environmental pressures, genetics, learning, behaviour, and culture will eventually interact to produce emergent evolutionary histories.

**Core hook:** Shape the world. Watch intelligence emerge.

**Current milestone:** Application scaffold only.

**Planned next milestone:** Deterministic headless simulation engine.

The project is built on the reusable Expo SDK 57 production boilerplate. The boilerplate continues to own infrastructure; First Minds features own product logic.

## Getting started

Requirements: Node 22+, Yarn via Corepack, Xcode/Android Studio for local simulators, and an Expo account for EAS services.

```sh
corepack enable
yarn install
cp .env.example .env
yarn validate
yarn start
```

The default `start`, `ios`, and `android` scripts target a development client. Use `yarn start:go` for the subset supported by Expo Go.

## Configure application

Product metadata is centralized in `src/config/app-values.json` (exposed by `src/config/app.ts`). Development and preview builds automatically add visible name and identifier suffixes so variants can coexist. Replace the placeholder iOS and Android identifiers there before store release.

First Minds branding assets live in `assets/branding/`:

- `icon.png`: square production icon artwork
- `adaptive-icon-foreground.png`: 1024×1024 transparent Android foreground using the First Minds hand mark inside the adaptive safe zone
- `splash.png`: portrait splash artwork

The supplied artwork is wired into the app configuration. Validate the icon and splash on preview or production builds because Expo Go and development-client launch presentation differs from store binaries.

Set `EXPO_PUBLIC_APP_ENV` and `EXPO_PUBLIC_API_URL` in local/EAS environments. Never put secrets in `EXPO_PUBLIC_*` values; these are embedded in the client bundle. `.env` files and store credentials are ignored.

Link a freshly cloned starter before its first cloud build:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest update:configure
```

Copy the resulting public EAS project ID into the EAS environments as `EXPO_PUBLIC_EAS_PROJECT_ID`. `update:configure` is intentionally responsible for the project-specific update URL and native metadata; this starter does not hard-code a fake project ID or URL. Review the generated config diff. The checked-in runtime policy is `appVersion`, so native-incompatible changes require a version bump and a new binary.

## Commands

```sh
yarn start                 # development-client Metro server
yarn start:clear           # clear Metro cache
yarn ios                   # open iOS development client
yarn android               # open Android development client
yarn typecheck
yarn lint / yarn lint:fix
yarn format / yarn format:fix
yarn check                 # lint + formatting + types
yarn fix                   # safe automatic fixes
yarn test / yarn test:watch
yarn doctor
yarn validate              # types + lint + format + tests + Expo Doctor
```

Husky runs lint-staged before commits, formatting and linting only changed files. Full typechecking and tests remain in CI.

## EAS builds and submissions

`eas.json` defines `development`, `development-simulator`, `preview`, and `production`. Development uses Dev Client/internal distribution; preview is internal and production-like; production is store-ready with remote build numbers and auto-incrementing.

```sh
yarn build:dev                       # all platforms
yarn build:dev:ios
yarn build:dev:android
yarn build:dev:simulator
yarn build:preview
yarn build:preview:ios
yarn build:preview:android
yarn build:production
yarn build:production:ios
yarn build:production:android
yarn submit:ios
yarn submit:android
yarn submit:all
```

Cloud EAS usage may consume plan resources; Apple and Google developer memberships are separate.

## OTA updates

Build profiles and publication commands use `development`, `preview`, and `production` channels/environments. Installed binaries only receive platform- and runtime-compatible updates.

```sh
yarn update:development
yarn update:preview
yarn update:preview:ios
yarn update:preview:android
yarn update:production
yarn update:production:ios
yarn update:production:android
```

Cold startup checks, downloads, and safely applies a compatible update before interaction. Foreground checks are de-duplicated and limited to once every five minutes; they download but do not restart an active session. `useAppUpdates()` exposes a manual apply action.

OTA is appropriate for JavaScript and assets compatible with the installed native runtime. New native modules, native dependencies, permissions, config plugins, SDK upgrades, and other native configuration changes require a new binary build. Publish production updates deliberately; scripts do not publish or build from CI automatically.

## First Minds routes

- `/lab`
- `/world/create` and `/world/overview`
- `/simulation`
- `/hominin/[id]`
- `/evolution/timeline`
- `/discovery/[id]`
- `/population`
- `/lineage`
- `/experiments`
- `/histories`
- `/settings`

The future engine boundary is documented in `src/simulation/README.md`. It deliberately contains no simulation mechanics today.

### Alternate histories and checkpoint ownership

Engine checkpoints use schema version `1` and engine compatibility tag
`first-minds-engine-1`. A checkpoint contains every future-influencing mutable value: seed,
tick/generation, RNG integer and cached normal state, full world/resource state, predators,
living and recently deceased hominins, genomes/phenotypes/needs/decisions, memories, learned
behaviours, action preferences, relationships and reproduction state, lineage identifiers,
generation telemetry/counters, interventions and pending commands, event-detector state,
generation summaries/events, deceased inspector archives, lineage registry, and the next entity
ID. Restore bypasses world and population initialization.

Large checkpoint JSON payloads are stored under the Expo document directory in
`first-minds/histories`; the existing typed storage abstraction holds only the versioned manifest.
Payloads use temporary-file replacement, an FNV-1a integrity checksum, startup cleanup for
temporary/orphan files, and a 50 MB default limit. Main History cannot be deleted. Each child
branch owns an independent copied head payload, so no mutable engine objects or payload ownership
are shared. A source checkpoint referenced as a branch origin is protected from deletion, and a
parent branch with descendants must be deleted last.

Checkpoint policy is manual plus a continually replaced head save on branch switch and app
backgrounding; the engine never writes a checkpoint per tick. Only the active branch has an engine
instance. Switching serializes and pauses the source, validates/restores the destination, clears
agent presentation references, and leaves the destination paused until explicit playback.

## Architecture

- `src/app`: thin Expo Router routes only.
- `src/bootstrap`: ordered startup and splash lifecycle.
- `src/errors`: root class boundary, fallback, and privacy-safe diagnostics.
- `src/updates`: update service, state, hook, and foreground listener.
- `src/storage`: typed abstraction, schema migrations, and health/repair.
- `src/responsive` and `src/theme`: centralized breakpoints and design tokens.
- `src/components`: accessible common, feedback, and layout primitives.
- `src/config`: the only place client environment and app configuration are read.

The root hierarchy is `RootErrorBoundary → AppBootstrap → AppUpdateListener → ApplicationProviders → Expo Router`. Async bootstrap failures are converted into render errors so the root boundary can show the independent fallback instead of leaving the splash screen stuck.

### Responsive system

`useResponsiveLayout()` uses live window dimensions, including rotation and multitasking resize. Breakpoints are centralized: phone `<768`, tablet `>=768`, and large tablet `>=1024`. Use `responsive({ phone, tablet, largeTablet }, breakpoint)` for values and choose genuinely different structures where appropriate. `AppScreen` centralizes safe areas, centering, content widths, and phone/tablet padding; `ResponsiveGrid` calculates item widths without overflow.

### Error boundary and diagnostics

The root fallback supports retry, restart, diagnostics, export, safe storage repair, and confirmed destructive reset. Reports contain technical metadata only—never user content. The diagnostics route is rendered only in development/preview via a typed feature flag.

### Storage and state

Features must use `storage`, never AsyncStorage directly. Add one sequential, idempotent migration for every schema version; migrations never clear data implicitly. Use local React state for component-only state, Zustand for cross-screen UI/application state, storage/database layers for persistent data, and a service/query layer for remote state.

## Adding a feature

```text
src/features/<feature-name>/
  components/
  hooks/
  services/
  store/
  types.ts
  index.ts
```

Keep business logic out of route files. Import through the `@/*` alias and keep files focused—split responsibilities around 200 lines where practical.

## CI

`.github/workflows/validate.yml` runs immutable installation, typechecking, ESLint, Prettier, tests, and Expo Doctor for pull requests and pushes to `main`. It deliberately performs no paid cloud builds. Add a separately reviewed EAS Workflow or GitHub release workflow when a product’s release policy is known.
