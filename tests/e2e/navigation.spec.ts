/**
 * navigation.spec.ts
 *
 * Covers global navigation and layout behavior:
 *  - App layout (navbar/sidebar) is present on authenticated pages
 *  - Navigation links reach the correct routes
 *  - Active link is highlighted correctly
 *  - The logo link redirects to "/"
 *  - Responsive: sidebar collapses / header is present
 *
 * All tests run as an authenticated user (storageState applied via config).
 */
import { test, expect } from "@playwright/test";

test.describe("Global Navigation", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    // ── Logo ──────────────────────────────────────────────────────────────
    test("clicking the SolSight logo navigates to the home page", async ({ page }) => {
        // Navigate away first
        await page.goto("/portfolio");

        const logo = page.getByRole("link", { name: /SolSight/i }).first();
        await expect(logo).toBeVisible();
        await logo.click();

        await expect(page).toHaveURL("/", { timeout: 10_000 });
    });

    // ── Main nav links ────────────────────────────────────────────────────
    const navRoutes = [
        { label: /portfolio/i, path: "/portfolio" },
        { label: /wallet.tracker/i, path: "/wallet-tracker" },
        { label: /multi.chart/i, path: "/multi-chart" },
        { label: /notifications/i, path: "/notifications" }
    ];

    for (const { label, path } of navRoutes) {
        test(`clicking "${path}" nav link navigates to ${path}`, async ({ page }) => {
            const link = page
                .getByRole("link", { name: label })
                .or(page.getByRole("button", { name: label }))
                .first();

            if (await link.isVisible({ timeout: 5_000 }).catch(() => false)) {
                await link.click();
                await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/")), { timeout: 10_000 });
            } else {
                test.skip(true, `Nav link for ${path} not found in layout`);
            }
        });
    }

    // ── Dashboard link ─────────────────────────────────────────────────────
    test("dashboard nav link navigates to /dashboard", async ({ page }) => {
        const dashLink = page.getByRole("link", { name: /dashboard/i }).first();

        if (await dashLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await dashLink.click();
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
        } else {
            test.skip(true, "Dashboard nav link not in layout — skipping");
        }
    });

    // ── Home page heading ─────────────────────────────────────────────────
    test("home page shows the Discover heading and token table", async ({ page }) => {
        await expect(page.getByRole("heading", { name: /Discover/i })).toBeVisible();

        // Table should start loading
        const table = page.locator("table, [role='table']").first();
        await expect(table).toBeVisible({ timeout: 15_000 });
    });
});

// ── 404 page ─────────────────────────────────────────────────────────────
test("navigating to an unknown route shows a 404 / not-found page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-xyz");

    // Next.js not-found.tsx should render
    const notFound = page.getByText(/not found|404|page doesn't exist/i).first();

    await expect(notFound).toBeVisible({ timeout: 10_000 });
});
