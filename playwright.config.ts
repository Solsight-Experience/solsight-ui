import { defineConfig, devices } from "@playwright/test";
import { AUTH_STATE_FILE } from "./tests/e2e/constants";

export default defineConfig({
    // Root directory for all E2E specs
    testDir: "./tests/e2e",

    // Run specs in parallel within a file, but not across files by default
    fullyParallel: false,

    // Fail the build on CI if a test.only slip is committed
    forbidOnly: !!process.env.CI,

    // Retry once on CI to reduce flakiness from network timing
    retries: process.env.CI ? 1 : 0,

    // Single worker to keep auth state deterministic locally
    workers: process.env.CI ? 2 : 1,

    // Reporter: show full trace on failure in CI; use html + line locally
    // The custom markdown reporter always runs and writes tests/e2e/TEST_RESULTS.md
    reporter: process.env.CI
        ? [["html", { outputFolder: "playwright-report" }], ["github"], ["./tests/e2e/reporters/markdown-reporter.ts"]]
        : [["html", { outputFolder: "playwright-report", open: "never" }], ["list"], ["./tests/e2e/reporters/markdown-reporter.ts"]],

    /* Global test settings */
    use: {
        // Base URL — change via env var in CI
        baseURL: process.env.BASE_URL || "http://localhost:3001",

        // Capture a full trace when a test retries (useful for debugging)
        trace: "on-first-retry",

        // Screenshot on failure
        screenshot: "only-on-failure",

        // Video on failure
        video: "retain-on-failure",

        // Reasonable default timeout for expect assertions
        actionTimeout: 10_000,

        // Browsers default size
        viewport: { width: 1280, height: 800 }
    },

    /* Test-suite-level timeout */
    timeout: 60_000,
    expect: {
        // Raised for expect.poll()-based async assertions (indexer flows)
        timeout: 30_000
    },

    projects: [
        // ── Auth Setup ────────────────────────────────────────────────
        // Runs first; stores session cookies for all dependent tests
        {
            name: "setup",
            testMatch: /.*\.setup\.ts/,
            use: { ...devices["Desktop Chrome"] }
        },

        // ── Chromium (primary) ────────────────────────────────────────
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                // Reuse the auth state created by the setup project
                storageState: AUTH_STATE_FILE
            },
            dependencies: ["setup"]
        },

        // ── Firefox ───────────────────────────────────────────────────
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                storageState: AUTH_STATE_FILE
            },
            dependencies: ["setup"]
        }
    ],

    /* Start the Next.js dev server automatically when running locally */
    webServer: process.env.SKIP_WEB_SERVER
        ? undefined
        : {
              command: "npm run dev",
              url: "http://localhost:3001",
              reuseExistingServer: true,
              timeout: 120_000,
              stdout: "pipe",
              stderr: "pipe"
          }
});
