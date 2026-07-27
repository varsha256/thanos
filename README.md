# Enterprise Playwright Checkout Automation

Production-ready Playwright + TypeScript framework for food checkout booking flows.

## Architecture

```text
tests/           # Business scenarios only (no locators)
pages/           # Page Objects (UI interactions)
components/      # Reusable widgets (Header, Toast, Search, Modals)
workflows/       # Business orchestration (CheckoutWorkflow)
api/             # Backend verification clients
fixtures/        # Dependency-injected Playwright fixtures
config/          # Environment + timeouts
data/            # JSON test data + TypeScript models
helpers/         # Assertions, failure handling, network capture
utils/           # Logger, DataLoader, PriceCalculator
reporting/       # ReportingManager (steps, screenshots, JSON attachments)
```

## Design Principles

- **Separation of concerns** — specs describe business intent; workflows orchestrate; pages interact; helpers assert.
- **SOLID** — constructor DI for pages/components/workflows; single-responsibility classes.
- **No hardcoded locators in tests** — all selectors live in Page Objects / Components.
- **No hardcoded test data** — loaded from `data/bookingData.json`.

## Checkout Business Flow

1. Customer logs in
2. Searches for a restaurant
3. Selects a food item and adds to cart
4. Applies a coupon
5. Chooses a delivery address
6. Selects Wallet payment
7. Places the order
8. Verifies successful booking (UI + API + Order History + DB placeholder)

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

## Run

```bash
# All tests
npm test

# Checkout booking only
npm run test:checkout

# Smoke tag
npm run test:smoke

# Typecheck
npm run lint:types
```

## Reporting & Logging

Every business step uses `test.step()` via `ReportingManager` and records:

- Step duration
- Browser name / environment / worker id / timestamp
- Test data JSON
- Booking response JSON
- Screenshots after Login, Restaurant, Cart, Checkout, Payment, Success
- Network request/response captures (when available)

`Logger` supports `INFO`, `WARN`, `ERROR`, `STEP`, and `API` levels.

On failure, `FailureHandler` attaches screenshot, page HTML, console logs, failed network requests, and retains Playwright trace/video.

## Key Classes

| Class | Responsibility |
| --- | --- |
| `CheckoutWorkflow` | End-to-end business orchestration |
| `LoginPage` / `RestaurantPage` / `CartPage` / `CheckoutPage` | UI actions |
| `Header` / `Toast` / `Search` / `AddressModal` / `PaymentModal` | Reusable components |
| `CheckoutAssertions` | Business assertions separated from actions |
| `ReportingManager` | Step timing + report attachments |
| `Logger` | Structured execution logs |

## Author

Varsha Yadav
