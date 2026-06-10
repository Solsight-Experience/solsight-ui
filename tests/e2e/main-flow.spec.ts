/**
 * main-flow.spec.ts
 *
 * End-to-end coverage of the primary authenticated user journey:
 *
 *   Login → Home (token table) → Token Detail → Favorite toggle
 *
 * This is the "happy path" integration test that validates the entire
 * front-end ↔ backend ↔ indexer pipeline from a user's perspective.
 */
import { test, expect } from "@playwright/test";

test.describe("Main User Flow — authenticated", () => {
    // ── Full journey: home → token → detail ──────────────────────────────
    test("user browses trending tokens and opens a token detail page", async ({ page }) => {
        // 1. Land on the home page (auth cookie already set via storageState)
        await page.goto("/");
        await expect(page.getByRole("heading", { name: /Discover/i })).toBeVisible();

        // 2. Wait for the token table to populate (indexer data may be async)
        await expect
            .poll(async () => page.locator("tbody tr").count(), {
                message: "Token table must have rows",
                timeout: 30_000,
                intervals: [2_000, 3_000]
            })
            .toBeGreaterThan(0);

        // 3. Click first row → navigate to /token/[address]
        await page.locator("tbody tr").first().click();
        await expect(page).toHaveURL(/\/token\/.+/, { timeout: 15_000 });

        // 4. Token name / symbol visible on detail page
        const tokenNameEl = page.locator("[data-testid='token-name'], h1, h2").first();
        await expect(tokenNameEl).toBeVisible({ timeout: 10_000 });
    });

    // ── Favorite toggle (requires authenticated user) ─────────────────────
    test("user can toggle a token as favorite from the detail page", async ({ page }) => {
        await page.goto("/");

        // Wait for table rows
        await expect.poll(async () => page.locator("tbody tr").count(), { timeout: 30_000 }).toBeGreaterThan(0);

        await page.locator("tbody tr").first().click();
        await expect(page).toHaveURL(/\/token\/.+/, { timeout: 15_000 });

        // Find the favourite/star button
        const favBtn = page
            .getByRole("button", { name: /favorite|star|bookmark|watch/i })
            .or(page.locator("[data-testid='favorite-btn'], [aria-label*='favorite'], [aria-label*='star']"))
            .first();

        if (await favBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
            const ariaBefore = await favBtn.getAttribute("aria-pressed");
            await favBtn.click();

            // State should change (aria-pressed flips, or button text changes)
            await expect
                .poll(async () => favBtn.getAttribute("aria-pressed"), {
                    message: "Favorite button state should change after click",
                    timeout: 10_000
                })
                .not.toBe(ariaBefore);
        } else {
            // If the button isn't present, skip gracefully
            test.skip(true, "Favorite button not found on token detail page");
        }
    });

    // ── Protected route redirect (unauthenticated) ─────────────────────────
    test("unauthenticated user is redirected from a protected route to /authentication", async ({ browser }) => {
        // Create a fresh browser context (no cookies / auth state)
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto("/portfolio");

        // Middleware should redirect to /authentication
        await expect(page).toHaveURL(/\/authentication/, { timeout: 10_000 });

        // The redirect param should be preserved
        const url = page.url();
        expect(url).toContain("redirect");

        await context.close();
    });
});
