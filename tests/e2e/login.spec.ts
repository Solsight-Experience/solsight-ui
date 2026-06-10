/**
 * login.spec.ts
 *
 * Tests covering the authentication flows:
 *  1. Happy path — valid credentials → redirect to home
 *  2. Critical negative — wrong password → error message shown
 *  3. Register tab switch — form toggles to sign-up view
 *
 * These tests do NOT rely on the persisted auth state (they run
 * against the unauthenticated authentication page directly).
 */
import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures/auth";

test.describe("Authentication", () => {
    test.beforeEach(async ({ page }) => {
        // Clear any stored session so we always start unauthenticated
        await page.context().clearCookies();
        await page.goto("/authentication");

        // The desktop auth aside must be visible (viewport ≥ 1280px)
        await expect(page.locator("aside")).toBeVisible();
    });

    // ── Happy Path ────────────────────────────────────────────────────────
    test("signs in with valid credentials and lands on home page", async ({ page }) => {
        await page.locator("#signin-email").fill(TEST_USER.email);
        await page.locator("#signin-password").fill(TEST_USER.password);
        await page.locator("#signin-submit").click();

        // Expect redirect to the homepage
        await expect(page).toHaveURL("/", { timeout: 15_000 });

        // Token table (the main landing content) should be rendered
        await expect(page.getByRole("heading", { name: /Discover/i })).toBeVisible();
    });

    // ── Critical Negative ─────────────────────────────────────────────────
    test("shows error message on invalid credentials", async ({ page }) => {
        await page.locator("#signin-email").fill(TEST_USER.email);
        await page.locator("#signin-password").fill("wrong-password-xyz");
        await page.locator("#signin-submit").click();

        // A dismissible error banner should appear; the page must NOT navigate
        await expect(page.locator("text=Login Failed").or(page.locator("text=Invalid")).or(page.locator("text=Incorrect"))).toBeVisible({
            timeout: 10_000
        });
        // URL must remain on the authentication page
        await expect(page).toHaveURL(/\/authentication/);
    });

    // ── Tab Toggle ────────────────────────────────────────────────────────
    test("switches between Sign In and Create Account forms", async ({ page }) => {
        // Click the "Create Account" tab inside the desktop aside
        await page.locator("aside").getByRole("button", { name: "Create Account" }).click();

        // The sign-up form should now be visible (it has a different heading)
        await expect(page.locator("aside").getByText("Create your account")).toBeVisible();

        // Switch back
        await page.locator("aside").getByRole("button", { name: "Sign In" }).click();
        await expect(page.locator("aside").getByText("Welcome back")).toBeVisible();
    });
});
