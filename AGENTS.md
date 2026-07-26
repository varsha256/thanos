# AGENTS.md

## Cursor Cloud specific instructions

This repo is a Playwright + TypeScript UI test-automation framework (Page Object Model). There is no server/app to run; the "application" is the Playwright test suite itself. Standard commands and structure are documented in `README.md`.

### Services / how to run

- Run all tests: `npx playwright test` (config: `playwright.config.ts`, `testDir: ./tests`, chromium project, 2 workers).
- Run a subset: `npx playwright test tests/login` or filter by title with `-g "Verify sucess login"`.
- Filter by tag: `npx playwright test --grep @smoke` (tags used: `@smoke`, `@regression`).
- View report after a run: `npx playwright show-report` (HTML reporter is used locally; `blob` when `CI` is set).
- Lint/build: there is no lint step and no build step (`package.json` `scripts` is empty; Playwright transpiles TS itself). `tsconfig.json` only sets node types.

### Non-obvious notes

- The login tests (`tests/login/LoginTest.spec.ts`) hit the live external site `https://practicetestautomation.com` (set as `baseURL`). They require outbound network access; if egress is blocked they will fail. The other suites (`food`, `transport`) are console-log-only placeholders and always pass offline.
- `pages/LoginPage.ts` imports `../test-data.json`, which resolves to the repo-root `test-data.json` (not a `pages/test-data.json`).
- `tests/login/BasePage.ts` is intentionally empty.
- `requirement.txt` (Python ML/langchain packages) is unrelated to this JS project — do NOT `pip install` it as part of setup.
- Playwright browsers must be present. In a fresh environment run `npx playwright install --with-deps chromium` (handled by the startup update script).
