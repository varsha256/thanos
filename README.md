# Playwright Test Automation Framework (UI + API)

A TypeScript Playwright framework supporting **UI and API** testing, built with best-practice
patterns: Page Object Model, reusable components, custom fixtures, test-data config, network
mocks, secret/auth handling and parallel execution.

## Features

- Playwright + TypeScript, `strict` type-checking
- Page Object Model with reusable UI **components**
- Typed **API clients** for API testing
- Custom **fixtures** (`src/fixtures/fixtures.ts`) inject Page Objects + API clients into every test
- **Test-data config** for data-driven tests (`src/data`)
- **Network mocking** via `page.route` (`src/mocks`)
- **Secrets & auth**: credentials from `.env`/CI, one-time login stored as `storageState`
- **Parallel execution** with `fullyParallel` + multiple workers and separate projects
- Tag-based filtering (`@smoke`, `@regression`, `@ui`, `@api`)
- HTML report, traces, screenshots and video on failure

## Folder structure

```text
config/
  environment.ts        # env-specific base URLs + storageState path (dotenv)
  secrets.ts            # credentials/tokens read from env vars
src/
  api/
    BaseApiClient.ts
    clients/PostsClient.ts
  pages/
    BasePage.ts
    LoginPage.ts
    components/NavBar.ts # reusable UI component
  fixtures/fixtures.ts   # custom test/expect with injected POMs + API clients
  mocks/postsMock.ts     # network route mocks
  data/testData.ts       # data-driven test data
  utils/logger.ts
tests/
  setup/auth.setup.ts    # logs in once, saves storageState
  ui/                    # browser tests (reuse auth state)
  api/                   # API tests
.auth/                   # generated storageState (git-ignored)
.env.example             # copy to .env
playwright.config.ts     # projects: setup -> ui-chromium, api
```

## Setup

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env   # then edit credentials/URLs as needed
```

## Run

```bash
npm test                # everything (setup -> ui + api, in parallel)
npm run test:ui         # UI project only
npm run test:api        # API project only
npm run test:smoke      # only @smoke tagged tests
npm run test:regression # only @regression tagged tests
npm run test:headed     # UI, headed browser
npm run typecheck       # tsc --noEmit
npm run report          # open the HTML report
```

Select an environment with `TEST_ENV=dev|qa|prod` (see `config/environment.ts`).
