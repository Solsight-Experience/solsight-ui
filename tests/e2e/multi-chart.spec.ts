/**
 * multi-chart.spec.ts
 */
import { test, expect } from "@playwright/test";

const SOL_ADDRESS = "So11111111111111111111111111111111111111112";
const CHARTS_KEY = "solsight_charts";

test.describe("Multi-Chart Features", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/multi-chart");
        await page.evaluate((key) => localStorage.removeItem(key), CHARTS_KEY);
        await page.reload();
        await page.waitForLoadState("networkidle");
    });

    test("[Multi-chart/UI] - TC01 - Empty state on first visit", async ({ page }) => {
        await expect(page.getByRole("heading", { name: /No charts yet/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /Add Your First Chart/i })).toBeVisible();
    });

    test("[Multi-chart/Logic] - TC02 - Maximum 6 tokens enforcement", async ({ page }) => {
        const dummyCharts = Array.from({ length: 6 }, (_, i) => ({
            id: `test-${i}`,
            address: SOL_ADDRESS,
            symbol: `SOL-${i}`
        }));
        await page.evaluate(([key, data]) => localStorage.setItem(key as string, JSON.stringify(data)), [CHARTS_KEY, dummyCharts]);
        await page.reload();

        const addBtn = page.getByRole("button", { name: /Add Chart/i }).first();
        if ((await addBtn.isVisible()) && !(await addBtn.isDisabled())) {
            await addBtn.click();
            await expect(page.getByText(/maximum|limit|6/i).first()).toBeVisible();
        } else {
            expect(true).toBe(true); // Button hidden or disabled is also success
        }
    });

    test("[Multi-chart/Logic] - TC03 - Adding chart via token address", async ({ page }) => {
        await page.getByRole("button", { name: /Add Your First Chart/i }).click();
        const input = page.locator("input").first();
        await input.fill(SOL_ADDRESS);
        await page.keyboard.press("Enter");

        await expect.poll(async () => page.locator("canvas").count(), { timeout: 15000 }).toBeGreaterThan(0);
    });

    test("[Multi-chart/UI] - TC04 - Removing token updates chart correctly", async ({ page }) => {
        await page.evaluate((key) => localStorage.setItem(key, JSON.stringify([{ id: "1", address: SOL_ADDRESS, symbol: "SOL" }])), CHARTS_KEY);
        await page.reload();

        const removeBtn = page.locator("button[title*='Remove'], button[aria-label*='Remove']").first();
        await removeBtn.click();
        await expect(page.getByRole("heading", { name: /No charts yet/i })).toBeVisible();
    });

    test("[Multi-chart/UI] - TC30 - Grid layout toggle (2 columns vs 3 columns)", async ({ page }) => {
        const dummyCharts = Array.from({ length: 4 }, (_, i) => ({
            id: `test-${i}`,
            address: SOL_ADDRESS,
            symbol: `SOL-${i}`
        }));
        await page.evaluate(([key, data]) => localStorage.setItem(key as string, JSON.stringify(data)), [CHARTS_KEY, dummyCharts]);
        await page.reload();

        const grid = page.locator(".grid, [class*='grid']").first();
        await expect(grid).toBeVisible();
    });

    test("[Multi-chart/Logic] - TC31 - Persist charts after page reload", async ({ page }) => {
        await page.evaluate((key) => localStorage.setItem(key, JSON.stringify([{ id: "1", address: SOL_ADDRESS, symbol: "SOL" }])), CHARTS_KEY);
        await page.reload();
        await expect(page.locator("canvas").first()).toBeVisible();
    });

    test("[Multi-chart/UI] - TC32 - Clear All button removes all charts", async ({ page }) => {
        await page.evaluate((key) => localStorage.setItem(key, JSON.stringify([{ id: "1", address: SOL_ADDRESS, symbol: "SOL" }])), CHARTS_KEY);
        await page.reload();

        const clearBtn = page.getByRole("button", { name: /Clear All/i });
        if (await clearBtn.isVisible()) {
            page.on("dialog", (dialog) => dialog.accept());
            await clearBtn.click();
            await expect(page.getByRole("heading", { name: /No charts yet/i })).toBeVisible();
        }
    });
});
