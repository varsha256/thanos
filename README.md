# Playwright POM Framework

A basic Playwright automation framework built using TypeScript and the Page Object Model (POM) design pattern.

## Features

- Playwright + TypeScript
- Page Object Model (POM)
- Reusable Page Classes
- Data-Driven Testing
- Screenshots, Videos & Traces on Failure
- HTML Reports

## Project Structure

```text
pages/
tests/
playwright.config.ts
test-data.json
package.json
```

## Installation

```bash
npm install
npx playwright install
```

## Run Tests

```bash
npx playwright test
```

Run specific test:

```bash
npx playwright test -g "Test Name"
```

Open report:

```bash
npx playwright show-report
```

## Author

Varsha Yadav
