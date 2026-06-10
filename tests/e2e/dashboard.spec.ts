/**
 * dashboard.spec.ts
 *
 * Covers the /dashboard page and its sub-routes:
 *  - Page renders with all three feature cards
 *  - "Start Transfer" navigates to /dashboard/transfer
 *  - "Wallet Management" and "Transaction History" cards are present (Coming Soon)
 *  - Protected route: unauthenticated user is redirected
 *
 * All tests run as an authenticated user (storageState applied via config).
 */
import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");
    });

    // ── Happy Path: page renders ──────────────────────────────────────────
    test("renders the dashboard heading and all three feature cards", async ({ page }) => {
        await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();

        // All three card headings must be visible
        await expect(page.getByRole("heading", { name: /Send Transfer/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /Wallet Management/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /Transaction History/i })).toBeVisible();
    });

    // ── Navigation: transfer ──────────────────────────────────────────────
    test("clicking 'Start Transfer' navigates to /dashboard/transfer", async ({ page }) => {
        const startTransferBtn = page
            .getByRole("link", { name: /Start Transfer/i })
            .or(page.getByRole("button", { name: /Start Transfer/i }))
            .first();

        await expect(startTransferBtn).toBeVisible();
        await startTransferBtn.click();

        await expect(page).toHaveURL(/\/dashboard\/transfer/, { timeout: 10_000 });
    });

    // ── State: Coming Soon buttons are disabled ───────────────────────────
    test("Wallet Management and Transaction History buttons are disabled (Coming Soon)", async ({ page }) => {
        const comingSoonButtons = page.getByRole("button", { name: /Coming Soon/i });
        const count = await comingSoonButtons.count();
        expect(count).toBeGreaterThanOrEqual(2);

        for (let i = 0; i < count; i++) {
            await expect(comingSoonButtons.nth(i)).toBeDisabled();
        }
    });
});

// ── Protected route (unauthenticated) ─────────────────────────────────────
test("unauthenticated user is redirected from /dashboard to /authentication", async ({ browser }) => {
    const context = await browser.newContext(); // fresh context — no auth
    const page = await context.newPage();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/authentication/, { timeout: 10_000 });

    await context.close();
});
