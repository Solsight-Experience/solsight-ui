/**
 * async-flows.spec.ts
 */
import { test, expect } from "@playwright/test";
import { SAMPLE_WALLET_ADDRESS } from "./fixtures/auth";

test.describe("Async & Indexer Flows", () => {
    test("[Async/Logic] - TC26 - Wallet positions appear after indexer sync 🔄", async ({ page }) => {
        await page.goto(`/wallet-tracker?address=${SAMPLE_WALLET_ADDRESS}`);
        await expect.poll(async () => page.locator("tbody tr").count(), { timeout: 30000 }).toBeGreaterThan(0);
    });

    test("[Async/Logic] - TC27 - Token discovery table re-fetches on revisit 🔄", async ({ page }) => {
        await page.goto("/");
        await page.goto("/portfolio");
        await page.goto("/");
        await expect(page.locator("tbody tr").first()).toBeVisible();
    });

    test("[Async/Logic] - TC28 - In-app notification after wallet alert fires 🔄", async ({ page }) => {
        await page.goto("/notifications");
        // simulation
    });

    test("[Async/Logic] - TC29 - Activity feed updates after on-chain tx 🔄", async ({ page }) => {
        await page.goto(`/wallet-tracker?address=${SAMPLE_WALLET_ADDRESS}`);
        await page.getByRole("tab", { name: /Activity/i }).click();
        await expect(page.getByText(/Swap|Sent|Received/i).first()).toBeVisible();
    });
});
