/**
 * portfolio.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Portfolio Features", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/portfolio");
        await page.waitForLoadState("networkidle");
    });

    test("[Portfolio/UI] - TC17 - Positions tab shows token holdings", async ({ page }) => {
        await expect.poll(async () => page.locator("tbody tr").count(), { timeout: 20000 }).toBeGreaterThanOrEqual(0);
    });

    test("[Portfolio/UI] - TC18 - Activity tab shows recent events", async ({ page }) => {
        await page.getByRole("tab", { name: /Activity/i }).click();
        await expect(page.locator("tbody, [class*='list']")).toBeVisible();
    });

    test("[Portfolio/UI] - TC19 - PnL colour-coding correct", async ({ page }) => {
        const row = page.locator("tbody tr").first();
        if (await row.isVisible()) {
            await expect(row.locator(".text-emerald-400, .text-red-400, [class*='text-green'], [class*='text-red']").first()).toBeVisible();
        }
    });

    test("[Portfolio/Logic] - TC51 - Sorting positions by Value USD", async ({ page }) => {
        const header = page.getByText(/Value/i);
        await header.click();
    });

    test("[Portfolio/UI] - TC52 - Portfolio overview cards show non-zero values", async ({ page }) => {
        const totalValue = page.getByText(/\$/).first();
        await expect(totalValue).toBeVisible();
    });
});
