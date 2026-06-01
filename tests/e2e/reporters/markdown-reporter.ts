/**
 * markdown-reporter.ts
 *
 * A custom Playwright reporter that writes a Markdown table of every test
 * case (title + result) to `tests/e2e/TEST_RESULTS.md` after every run.
 *
 * Output format:
 *
 *   # SolSight E2E — Test Results
 *   > Generated: 2026-05-17 12:00:00 (7 passed, 1 failed, 1 skipped)
 *
 *   | # | Suite | Test Title | Browser | Status | Duration |
 *   |---|-------|-----------|---------|--------|----------|
 *   | 1 | login.spec.ts › Authentication | signs in with valid credentials | chromium | ✅ PASS | 3.2 s |
 *   ...
 */

import type { Reporter, TestCase, TestResult, FullResult } from "@playwright/test/reporter";
import fs from "fs";
import path from "path";

interface TestRow {
    index: number;
    file: string;
    suite: string;
    title: string;
    browser: string;
    status: string;
    durationMs: number;
    error?: string;
}

const STATUS_EMOJI: Record<string, string> = {
    passed: "✅ PASS",
    failed: "❌ FAIL",
    skipped: "⏭️ SKIP",
    timedOut: "⏳ TIMEOUT",
    interrupted: "🚫 INTERRUPT"
};

const OUTPUT_PATH = path.resolve(__dirname, "..", "TEST_RESULTS.md");

class MarkdownReporter implements Reporter {
    private rows: TestRow[] = [];
    private counter = 0;
    private startTime = Date.now();

    onBegin(): void {
        this.rows = [];
        this.counter = 0;
        this.startTime = Date.now();
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        this.counter++;

        // Build a readable suite path, e.g. "login.spec.ts › Authentication"
        const titlePath = test.titlePath();
        // titlePath: ["", "chromium", "login.spec.ts", "Authentication", "test title"]
        // — strip the first empty string and the project name (browser)
        const segments = titlePath.filter(Boolean);
        const browser = segments[0] ?? "";
        const fileParts = segments.slice(1, -1); // everything between project & test title
        const testTitle = segments[segments.length - 1] ?? test.title;

        // Derive just the spec file name (last path segment containing ".spec.")
        const fileSegment = fileParts.find((s) => s.includes(".spec.") || s.includes(".setup.")) ?? fileParts[0] ?? "";

        // Suite = everything between filename and the test title
        const suiteSegments = fileParts.filter((s) => s !== fileSegment);
        const suite = suiteSegments.join(" › ");

        // Pick the first error message line if test failed
        const error = result.status === "failed" || result.status === "timedOut" ? result.errors?.[0]?.message?.split("\n")[0]?.trim() : undefined;

        this.rows.push({
            index: this.counter,
            file: fileSegment,
            suite,
            title: testTitle,
            browser,
            status: result.status,
            durationMs: result.duration,
            error
        });
    }

    onEnd(result: FullResult): void {
        const passed = this.rows.filter((r) => r.status === "passed").length;
        const failed = this.rows.filter((r) => r.status === "failed" || r.status === "timedOut").length;
        const skipped = this.rows.filter((r) => r.status === "skipped").length;
        const total = this.rows.length;
        const totalDurationSec = ((Date.now() - this.startTime) / 1000).toFixed(1);

        const now = new Date().toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        const overallStatus = result.status === "passed" ? "✅ All Passed" : result.status === "failed" ? "❌ Some Failed" : "⚠️ Interrupted";

        // ── Summary block ──────────────────────────────────────────────────
        const lines: string[] = [
            "# SolSight E2E — Test Results",
            "",
            `> **Generated:** ${now} · **Total runtime:** ${totalDurationSec} s`,
            `> **Overall:** ${overallStatus} — ${passed} passed, ${failed} failed, ${skipped} skipped / ${total} total`,
            "",
            "---",
            "",
            "## Summary",
            "",
            "| Metric | Value |",
            "|--------|-------|",
            `| Total tests | **${total}** |`,
            `| ✅ Passed | ${passed} |`,
            `| ❌ Failed | ${failed} |`,
            `| ⏭️ Skipped | ${skipped} |`,
            `| 🕒 Runtime | ${totalDurationSec} s |`,
            `| Generated at | ${now} |`,
            "",
            "---",
            "",
            "## Results by Test",
            "",
            "| # | File | Suite | Test Title | Browser | Status | Duration |",
            "|---|------|-------|-----------|---------|--------|----------|"
        ];

        for (const row of this.rows) {
            const duration = (row.durationMs / 1000).toFixed(2) + " s";
            const statusCell = STATUS_EMOJI[row.status] ?? row.status;

            // Escape pipe characters inside cells
            const escape = (s: string) => s.replace(/\|/g, "\\|");

            lines.push(
                `| ${row.index} | \`${escape(row.file)}\` | ${escape(row.suite)} | ${escape(row.title)} | ${escape(row.browser)} | ${statusCell} | ${duration} |`
            );

            // Attach error detail as a sub-row if the test failed
            if (row.error) {
                const short = row.error.length > 120 ? row.error.slice(0, 117) + "…" : row.error;
                lines.push(`| | | | ⚠️ _${escape(short)}_ | | | |`);
            }
        }

        // ── Failures section (detailed) ────────────────────────────────────
        const failedRows = this.rows.filter((r) => r.status === "failed" || r.status === "timedOut");
        if (failedRows.length > 0) {
            lines.push("", "---", "", "## ❌ Failure Details", "");
            for (const row of failedRows) {
                lines.push(`### ${row.index}. ${row.title}`);
                lines.push(`- **File:** \`${row.file}\``);
                lines.push(`- **Suite:** ${row.suite}`);
                lines.push(`- **Browser:** ${row.browser}`);
                lines.push(`- **Status:** ${STATUS_EMOJI[row.status]}`);
                if (row.error) {
                    lines.push(`- **Error:** \`${row.error}\``);
                }
                lines.push("");
            }
        }

        lines.push("---", "", "_This file is auto-generated by the Playwright markdown reporter. Do not edit manually._", "");

        // Write to disk
        fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
        fs.writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf-8");

        console.log(`\n📄  Test results written to: ${OUTPUT_PATH}`);
    }
}

export default MarkdownReporter;
