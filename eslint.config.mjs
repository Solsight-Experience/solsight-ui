// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript"), {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
}, {
  // Phase 3: Error on store imports in all components (decoupling complete)
  files: ["components/ui/**/*.tsx", "features/**/components/**/*.tsx"],
  rules: {
    "no-restricted-imports": [
      "warn",
      {
        patterns: [
          {
            group: ["**/stores/**", "**/*store*.ts", "**/*Store*.ts"],
            message: "⚠️ Store imports in UI components should go through hooks or props. Consider prop drilling or context for UI state."
          },
          {
            group: ["@/stores/**", "@/features/*/stores/**"],
            message: "⚠️ Direct store imports create coupling. Pass data via props instead."
          }
        ]
      }
    ]
  }
}, {
  // Phase 2: Error on store imports in shared components (components/* must be store-free)
  files: ["components/**/*.tsx", "components/**/*.ts"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/stores/**", "**/*store*.ts", "**/*Store*.ts"],
            message: "🚫 components/* must not import stores directly. Pass state via props."
          },
          {
            group: ["@/stores/**", "@/features/*/stores/**"],
            message: "🚫 components/* must not import stores directly. Pass state via props."
          }
        ]
      }
    ]
  }
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
