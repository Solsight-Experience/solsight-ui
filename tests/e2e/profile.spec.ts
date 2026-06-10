/**
 * profile.spec.ts
 *
 * Covers the authenticated /profile page (currently uses mock data):
 *  - Page renders the user avatar section
 *  - Username is displayed
 *  - Connected Wallets section is present with at least one wallet card
 *  - Account Information section shows Fullname / Email / Phone fields
 *  - "Add Wallet" button exists
 *  - "Verify account" button exists
 *
 * All tests run as an authenticated user (storageState applied via config).
 */
import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/profile");
        await page.waitForLoadState("networkidle");
    });

    // ── Happy Path: page structure renders ───────────────────────────────
    test("renders a username and avatar section", async ({ page }) => {
        // Avatar image should be present (mock uses pravatar.cc)
        const avatar = page.locator("img[alt='User avatar']").first();
        await expect(avatar).toBeVisible({ timeout: 10_000 });

        // A username-like text should be present somewhere in the header area
        const header = page
            .locator("div")
            .filter({ hasText: /devlansight|Verified|Not verified/i })
            .first();
        await expect(header).toBeVisible();
    });

    // ── Connected Wallets section ─────────────────────────────────────────
    test("render the Connected Wallets section with wallet cards", async ({ page }) => {
        await expect(page.getByRole("heading", { name: /Connected Wallets/i })).toBeVisible();

        // Expect at least one wallet card (mock has 3)
        const walletCards = page.locator("div").filter({ hasText: /Main Wallet|Second Wallet|Third Wallet/ });
        await expect(walletCards.first()).toBeVisible();
    });

    // ── Add Wallet button ────────────────────────────────────────────────
    test("'Add Wallet' button is visible in the Connected Wallets section", async ({ page }) => {
        await expect(page.getByRole("button", { name: /Add Wallet/i })).toBeVisible();
    });

    // ── Account Information section ───────────────────────────────────────
    test("renders the Account Information section with user details", async ({ page }) => {
        await expect(page.getByRole("heading", { name: /Account Information/i })).toBeVisible();

        // Field labels should be visible
        await expect(page.getByText(/Fullname/i).first()).toBeVisible();
        await expect(page.getByText(/Email/i).first()).toBeVisible();
        await expect(page.getByText(/Phone/i).first()).toBeVisible();
    });

    // ── Verify Account button ────────────────────────────────────────────
    test("'Verify account' button is visible in Account Information", async ({ page }) => {
        await expect(page.getByRole("button", { name: /Verify account/i })).toBeVisible();
    });

    // ── Stats cards ────────────────────────────────────────────────────────
    test("renders the four stats cards (transactions, fees, days, volume)", async ({ page }) => {
        await expect(page.getByText(/Total transactions/i).first()).toBeVisible();
        await expect(page.getByText(/Fees saved/i).first()).toBeVisible();
        await expect(page.getByText(/Days active/i).first()).toBeVisible();
        await expect(page.getByText(/Total Volumes/i).first()).toBeVisible();
    });
});

// ── Protected route (unauthenticated) ─────────────────────────────────────
test("unauthenticated user is redirected from /profile to /authentication", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/profile");
    await expect(page).toHaveURL(/\/authentication/, { timeout: 10_000 });

    await context.close();
});
