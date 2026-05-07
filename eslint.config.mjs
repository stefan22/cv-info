import { defineConfig, globalIgnores } from "eslint/config";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: {
            "react": reactPlugin,
            "react-hooks": hooksPlugin,
            "react-compiler": reactCompiler,
            "simple-import-sort": simpleImportSort,
            "@typescript-eslint": typescriptEslint,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        rules: {
            // Rules
            "react-compiler/react-compiler": "error",
            "react/no-unescaped-entities": "off",
            "curly": "error",
            "@typescript-eslint/no-unused-vars": [
                "off",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        ["^@?\\w"],
                        ["^@/"],
                        ["^\\.\\./", "^\\./"],
                        ["^\\u0000"],
                        ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
                        ["^.+\\.?(css)$"],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
        },
    },

    globalIgnores([
        "out/**",
        "build/**",
        "node_modules/**",
        ".react-router/**",
    ]),
]);
