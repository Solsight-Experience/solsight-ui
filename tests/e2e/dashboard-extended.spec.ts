/**
 * dashboard-extended.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Dashboard Extended Features", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");
    });

    test("[Dashboard/UI] - TC53 - Quick Action cards navigation", async ({ page }) => {
        await expect(page.getByText(/Send Transfer/i)).toBeVisible();
        await page.getByRole("link", { name: /Start Transfer/i }).click();
        await expect(page).toHaveURL(/\/dashboard\/transfer/);
    });

    test("[Dashboard/Logic] - TC54 - Send Transfer recipient validation", async ({ page }) => {
        await page.goto("/dashboard/transfer");
        await page.getByRole("button", { name: /Send/i }).click();
        await expect(page.getByText(/invalid|required/i).first()).toBeVisible();
    });

    test("[Dashboard/Logic] - TC55 - Send Transfer amount validation", async ({ page }) => {
        await page.goto("/dashboard/transfer");
        await page.locator("input[name='amount']").fill("-1");
        await page.getByRole("button", { name: /Send/i }).click();
        await expect(page.getByText(/positive|invalid/i).first()).toBeVisible();
    });

    test("[Dashboard/UI] - TC57 - Responsive design test (Mobile vs Desktop)", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        // check menu
    });
});
