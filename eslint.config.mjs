// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { rules } from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**", "coverage/**", "public/**", "next-env.d.ts"],
        rules: {
            // Relax rules that produce many repo-wide warnings during CI lint
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "react-hooks/exhaustive-deps": "off",
            "@next/next/no-img-element": "off",
            "react/no-unescaped-entities": "off"
        }
    },
    ...storybook.configs["flat/recommended"]
];

export default eslintConfig;
