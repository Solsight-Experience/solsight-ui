/**
 * Shared test fixtures and helpers.
 * Extends the base Playwright `test` with utility methods used across specs.
 */
import { test as baseTest, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Credentials resolved from env or defaults for local development
// ---------------------------------------------------------------------------
export const TEST_USER = {
    email: process.env.E2E_TEST_EMAIL || "thaonguyen@dnkinno.com",
    password: process.env.E2E_TEST_PASSWORD || "Praesgsw5826@"
} as const;

// A well-known Solana address used in wallet-tracker tests
export const SAMPLE_WALLET_ADDRESS = process.env.E2E_SAMPLE_WALLET || "So11111111111111111111111111111111111111112";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigates to the authentication page and signs in via the email/password form.
 * Waits until the browser is redirected away from /authentication.
 */
export async function signInViaUI(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
    await page.goto("/authentication");

    // Ensure the Sign In tab is active (it is by default, but be explicit)
    const signInTab = page.locator("button", { hasText: "Sign In" }).first();
    await signInTab.click();

    await page.locator("#signin-email").fill(email);
    await page.locator("#signin-password").fill(password);
    await page.locator("#signin-submit").click();

    // Wait for redirect away from /authentication
    await expect(page).not.toHaveURL(/\/authentication/);
}

// ---------------------------------------------------------------------------
// Extended test object
// ---------------------------------------------------------------------------
export const test = baseTest.extend<{
    authenticatedPage: Page;
}>({
    /**
     * Provides a page that is already authenticated.
     * Uses the global storageState (auth_token cookie) set during setup.
     */
    authenticatedPage: async ({ page }, provide) => {
        await provide(page);
    }
});

export { expect };
