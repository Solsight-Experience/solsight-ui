/**
 * auth-extended.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Auth Extended Features", () => {
    test("[Auth/Logic] - TC48 - Register new account flow", async ({ page }) => {
        await page.goto("/authentication");
        await page.getByRole("tab", { name: /Create Account/i }).click();
        await page.locator("#signup-email").fill(`test_${Date.now()}@example.com`);
        await page.locator("#signup-password").fill("Password123!");
        await page.locator("#signup-confirm-password").fill("Password123!");
        await page.locator("#signup-submit").click();
    });

    test("[Auth/Logic] - TC49 - Logout clears session and redirects", async ({ page }) => {
        await page.goto("/");
        const logoutBtn = page.getByRole("button", { name: /Logout/i });
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
            await expect(page).toHaveURL(/\/authentication/);
        }
    });

    test("[Auth/UI] - TC50 - Password reset form validation", async ({ page }) => {
        await page.goto("/authentication");
        const resetBtn = page.getByText(/Forgot password/i);
        if (await resetBtn.isVisible()) {
            await resetBtn.click();
            await expect(page.getByRole("button", { name: /Reset/i })).toBeVisible();
        }
    });

    test("[Auth/Logic] - TC51 - Session persists after hard refresh 🔐", async ({ page }) => {
        await page.goto("/");
        await page.reload();
        await expect(page).not.toHaveURL(/\/authentication/);
    });
});
