/**
 * wallet-alerts.spec.ts
 */
import { test, expect } from "@playwright/test";
import { SAMPLE_WALLET_ADDRESS } from "./fixtures/auth";

test.describe("Wallet Alerts Features", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/wallet-tracker?address=${SAMPLE_WALLET_ADDRESS}`);
        await page.getByRole("tab", { name: /Alerts/i }).click();
    });

    test("[Alerts/Logic] - TC21 - Create Large Transfer alert", async ({ page }) => {
        await page.getByRole("button", { name: /Add Alert/i }).click();
        await page.getByText(/Large Transfer/i).click();
        await page.getByRole("button", { name: /Create Alert/i }).click();
        await expect(page.getByText(/Alert created/i)).toBeVisible();
    });

    test("[Alerts/UI] - TC23 - Empty mint rejected with validation", async ({ page }) => {
        await page.getByRole("button", { name: /Add Alert/i }).click();
        await page.getByText(/Token Balance Change/i).click();
        await page.getByRole("button", { name: /Create Alert/i }).click();
        await expect(page.getByText(/required/i)).toBeVisible();
    });

    test("[Alerts/UI] - TC59 - Zalo/Email connection status sync", async ({ page }) => {
        await expect(page.getByText(/Zalo/i)).toBeVisible();
    });
});
