# Expo Production Boilerplate

A reusable Expo SDK 57, React Native, Expo Router, and strict TypeScript starter for phone and tablet apps. It provides infrastructure only: **the boilerplate owns infrastructure. Features own business logic.**

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

Change the reusable placeholders in `src/config/app-values.json` (exposed to application code by `src/config/app.ts`): app name, slug, scheme, version, iOS bundle identifier, and Android package. Development and preview builds automatically add visible name and identifier suffixes so variants can coexist.

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
