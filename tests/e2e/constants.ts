/**
 * Shared E2E constants — imported by both playwright.config.ts and test files.
 * Keeping these here avoids circular resolution when test files import from
 * playwright.config.ts (which is processed differently by the test runner).
 */
import path from "path";

export const AUTH_STATE_FILE = path.resolve(__dirname, ".auth/user.json");
