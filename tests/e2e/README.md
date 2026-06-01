# SolSight E2E Tests — Setup & Execution Guide

End-to-end tests for the **SolSight** frontend, written with [Playwright](https://playwright.dev/).

---

## Prerequisites

| Requirement        | Version                 |
| ------------------ | ----------------------- |
| Node.js            | ≥ 18                    |
| pnpm               | ≥ 9 (or npm / yarn)     |
| Chromium / Firefox | installed by Playwright |

---

## Project Structure

```
tests/
└── e2e/
    ├── .auth/
    │   └── .gitignore              # Session state stored here (not committed)
    ├── fixtures/
    │   └── auth.ts                 # Shared helpers, TEST_USER, SAMPLE_WALLET
    ├── auth.setup.ts               # One-time login → persists session cookie
    ├── login.spec.ts               # Authentication flows (sign-in, register tab, errors)
    ├── token-discovery.spec.ts     # Home page token table + token detail page
    ├── token-detail.spec.ts        # Token detail: header, chart, tabs, trading panel, AI
    ├── wallet-tracker.spec.ts      # Watchlist CRUD + async indexer flow
    ├── main-flow.spec.ts           # Full end-to-end user journey
    ├── dashboard.spec.ts           # Dashboard page + transfer navigation
    ├── portfolio.spec.ts           # Portfolio page: Positions/Activity tabs, sidebar
    ├── notifications.spec.ts       # Notifications: filters, mark-read, clear-all
    ├── profile.spec.ts             # Profile page: user info, wallets, stats
    ├── multi-chart.spec.ts         # Multi-chart: empty state, add/remove charts
    └── navigation.spec.ts          # Global nav: logo, links, 404 page

playwright.config.ts                # Playwright configuration
```

---

## Installation

### 1. Install Node dependencies

```bash
pnpm install
# or
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install --with-deps chromium firefox
```

> On CI/CD you can restrict to `chromium` only if Firefox isn't needed:
>
> ```bash
> npx playwright install --with-deps chromium
> ```

---

## Environment Setup

Create a `.env.test` file (or set variables in your shell) before running:

```env
# URL of the running Next.js app (default: http://localhost:3001)
BASE_URL=http://localhost:3001

# Test account credentials (must exist in the backend)
E2E_TEST_EMAIL=e2e_test@solsight.local
E2E_TEST_PASSWORD=TestPassword123!

# A Solana wallet address used in wallet-tracker tests
E2E_SAMPLE_WALLET=So11111111111111111111111111111111111111112
```

> ⚠️ The test user **must exist** in the backend database. Create it once:
>
> ```bash
> # Example using the auth API directly
> curl -X POST http://localhost:3001/api/auth/register \
>   -H "Content-Type: application/json" \
>   -d '{"email":"e2e_test@solsight.local","password":"TestPassword123!"}'
> ```

---

## Running Tests

### Start the app first (if not using the built-in web server)

```bash
pnpm dev
# runs on http://localhost:3001
```

### Run all E2E tests

```bash
pnpm test:e2e
# or
npx playwright test
```

### Run with interactive UI mode

```bash
pnpm test:e2e:ui
# or
npx playwright test --ui
```

### Run a specific spec file

```bash
npx playwright test tests/e2e/login.spec.ts
```

### Run on a single browser

```bash
npx playwright test --project=chromium
```

### Show the HTML report after a run

```bash
npx playwright show-report
```

---

## CI / CD Integration

The `playwright.config.ts` automatically:

- Retries once on failure when `CI=true`
- Uses 2 workers when `CI=true`
- Emits GitHub Actions annotations (`["github"]` reporter)

Typical GitHub Actions step:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  env:
      CI: true
      BASE_URL: http://localhost:3001
      E2E_TEST_EMAIL: ${{ secrets.E2E_TEST_EMAIL }}
      E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
  run: npx playwright test --project=chromium

- name: Upload Playwright report
  if: always()
  uses: actions/upload-artifact@v4
  with:
      name: playwright-report
      path: playwright-report/
```

---

## Architecture & Best Practices

### Auth setup pattern

`auth.setup.ts` runs **once** before any dependent project. It performs a real login and serialises the session state (cookies) into `tests/e2e/.auth/user.json`. All subsequent test files inherit this state via `storageState` in `playwright.config.ts` — no repeated logins.

### No hard waits

`waitForTimeout` is banned. Instead:

- `await expect(locator).toBeVisible()` — auto-retries up to `actionTimeout`.
- `await expect.poll(fn, { timeout })` — for async backend/indexer flows that may take several seconds to propagate.

### Selector priority (most → least preferred)

1. `getByRole` (semantic)
2. `getByText` / `getByLabel`
3. `#id` selectors (for critical form controls)
4. `[data-testid]` (explicitly added for E2E)
5. CSS classes (only when nothing else is available)

### Adding `data-testid` attributes

When a locator proves brittle, add `data-testid` to the React component and update the selector in the spec. Example:

```tsx
// In your component
<button data-testid="favorite-btn" aria-pressed={isFav} onClick={toggle}>
```

```ts
// In your spec
page.locator("[data-testid='favorite-btn']");
```

---

## Troubleshooting

| Symptom                          | Likely Cause                            | Fix                                                                    |
| -------------------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `auth.setup` fails               | No backend running or wrong credentials | Start backend; verify `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`           |
| Tests time out on token table    | Backend / indexer service is down       | Ensure both services are running                                       |
| `user.json` not found            | Setup project was skipped               | Run `npx playwright test --project=setup` first                        |
| Selector `tbody tr` finds 0 rows | API returns empty or mock mode active   | Check `NEXT_PUBLIC_ENABLE_MOCK` — set to `false` for E2E               |
| Firefox tests fail on CSS        | Rendering difference                    | Check if feature is supported; add a `test.skip` per project if needed |

---

## Mock Mode

If `NEXT_PUBLIC_ENABLE_MOCK=true` the frontend uses local fixture data instead of the live API. E2E tests should run with **mock mode disabled** so they test the real backend.

```bash
NEXT_PUBLIC_ENABLE_MOCK=false pnpm dev
```
