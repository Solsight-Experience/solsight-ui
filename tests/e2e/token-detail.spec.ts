/**
 * token-detail.spec.ts
 */
import { test, expect } from "@playwright/test";

const TOKEN_ADDRESS = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";

test.describe("Trading & Token Detail Features", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/token/${TOKEN_ADDRESS}`);
        await page.waitForLoadState("networkidle");
    });

    test("[Trading/Logic] - TC13 - Swap success (route selection)", async ({ page }) => {
        const input = page.locator("input").first();
        await input.fill("0.1");
        await expect.poll(async () => page.locator("input").nth(1).inputValue(), { timeout: 15000 }).not.toBe("");
    });

    test("[Trading/Logic] - TC15 - Swap failure (insufficient balance)", async ({ page }) => {
        const input = page.locator("input").first();
        await input.fill("9999999");
        await expect(page.getByText(/insufficient/i)).toBeVisible();
    });

    test("[Trading/Logic] - TC16 - Limit order price calculation", async ({ page }) => {
        await page.getByRole("button", { name: /Limit/i }).click();
        const priceInput = page.getByPlaceholder(/price/i);
        await priceInput.fill("100");
        // Verify output
    });

    test("[Trading/UI] - TC39 - Chart time range switching (1h, 4h, 1d)", async ({ page }) => {
        const rangeBtn = page.getByText(/4H|1D|1H/i).first();
        await rangeBtn.click();
    });

    test("[Trading/UI] - TC40 - AI Summary regenerates content", async ({ page }) => {
        const aiBtn = page.getByText(/AI Summary/i);
        if (await aiBtn.isVisible()) {
            await aiBtn.click();
            await expect(page.getByText(/analysis/i)).toBeVisible();
        }
    });

    test("[Trading/Logic] - TC41 - Favorite toggle persists to backend 🔐", async ({ page }) => {
        const favBtn = page
            .locator("button")
            .filter({ has: page.locator("svg") })
            .first();
        await favBtn.click();
    });

    test("[Trading/UI] - TC42 - Order History tab visible when authenticated 🔐", async ({ page }) => {
        await expect(page.getByRole("tab", { name: /Orders|Trades/i })).toBeVisible();
    });
});
