/**
 * auth.setup.ts
 *
 * Runs ONCE before any test project that depends on "setup".
 * Performs a real login via the UI and saves browser storage state
 * (cookies + localStorage) to disk so all subsequent tests start
 * already authenticated — no repeated logins.
 */
import path from "path";
import { test as setup, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures/auth";

// Must match the path in playwright.config.ts — kept here to avoid
// importing from playwright.config (circular resolution in test loader).
const AUTH_STATE_FILE = path.resolve(__dirname, ".auth/user.json");

setup("authenticate and persist session", async ({ page }) => {
    await page.goto("/authentication");

    // ── Make sure the Sign In panel is visible ──────────────────────────
    // The auth panel is a fixed right-side aside on desktop (≥ lg).
    // We set viewport to 1280×800 in the config, so it's always visible.
    await expect(page.locator("aside")).toBeVisible();

    // ── Fill in credentials ─────────────────────────────────────────────
    await page.locator("#signin-email").fill(TEST_USER.email);
    await page.locator("#signin-password").fill(TEST_USER.password);

    // ── Submit ──────────────────────────────────────────────────────────
    await page.locator("#signin-submit").click();

    // ── Wait for redirect to home ───────────────────────────────────────
    // The SignInForm calls `router.push(redirectTo)` on success.
    await expect(page).toHaveURL("/", { timeout: 20_000 });

    // ── Persist the authenticated state ────────────────────────────────
    // Saves auth_token cookie (set by the server) + any localStorage data.
    await page.context().storageState({ path: AUTH_STATE_FILE });
});
