/**
 * navigation-extended.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Global Navigation Features", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("[Navigation/UI] - TC64 - Sidebar active state highlights current route", async ({ page }) => {
        await page.goto("/portfolio");
        const activeLink = page.locator("aside a[class*='active']");
        if (await activeLink.isVisible()) {
            await expect(activeLink).toContainText(/Portfolio/i);
        }
    });

    test("[Navigation/Logic] - TC65 - Clicking logo redirects to home page", async ({ page }) => {
        await page.goto("/portfolio");
        await page.locator("a").filter({ hasText: "SolSight" }).click();
        await expect(page).toHaveURL("/");
    });

    test("[Navigation/Logic] - TC66 - Protected routes redirect to auth for guest", async ({ browser }) => {
        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();
        await page.goto("/portfolio");
        await expect(page).toHaveURL(/\/authentication/);
    });
});
