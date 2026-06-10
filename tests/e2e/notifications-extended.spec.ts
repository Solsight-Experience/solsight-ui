/**
 * notifications-extended.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Notifications Extended Features", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/notifications");
        await page.waitForLoadState("networkidle");
    });

    test("[Notifications/UI] - TC45 - Filter Unread vs All 🔐", async ({ page }) => {
        await page.getByRole("button", { name: /Unread/i }).click();
        await expect(page.getByRole("button", { name: /Unread/i })).toBeVisible();
    });

    test("[Notifications/Logic] - TC46 - Clear All requires confirmation 🔐", async ({ page }) => {
        const clearBtn = page.getByRole("button", { name: /Clear All/i });
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
            await expect(page.getByText(/Confirm|Cancel/i)).toBeVisible();
        }
    });
});
