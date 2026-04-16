# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.1 create --template minimal --types ts --no-install .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Testing

The project uses **Vitest** for unit/integration tests and **Playwright** for end-to-end tests.

### Running tests

```sh
# Unit + integration tests (Vitest)
npm test

# Unit tests in watch mode
npm run test:watch

# End-to-end tests (Playwright — builds the app first)
npm run test:e2e

# All tests (unit + integration + e2e)
npm run test:all
```

### Test structure

```
src/
  lib/server/
    auth.test.ts              # Password hashing & verification
    session.test.ts            # Session create/validate/delete (mocked DB)
    db/schema.test.ts          # Schema constraints & cascade deletes
    integration/
      login.test.ts            # Login flow (credentials, sessions)
      members.test.ts          # Member CRUD operations
      events.test.ts           # Event creation & RSVP
  tests/
    setup.ts                   # Global test setup
    db-helper.ts               # In-memory SQLite test database factory
e2e/
  login.spec.ts                # Login page E2E
  members.spec.ts              # Members management E2E
  events.spec.ts               # Events & RSVP E2E
```

### Test database

Unit and integration tests use an **in-memory SQLite** database (`createTestDb()` from `src/tests/db-helper.ts`), so no file-system state is needed and tests are fully isolated. Each test file gets its own database instance and cleans up between tests.

E2E tests use a separate file-based database at `./data/test-e2e.db` via the `DB_PATH` environment variable.

### Playwright setup

Before running E2E tests for the first time, install browser binaries:

```sh
npx playwright install chromium
```
