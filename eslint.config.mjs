import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import json from "eslint-plugin-jsonc";
import markdown from "eslint-plugin-markdown";
import sortKeysFix from "eslint-plugin-sort-keys-fix";
import tsDoc from "eslint-plugin-tsdoc";
import globals from "globals";
import fs from "node:fs";
import path from "node:path";
import tseslint from "typescript-eslint";

const projectRoot = import.meta.dirname;

/**
 * Load the `ignores` definitions from the `.gitignore` instead of replicating it.
 */
const ignores = fs.readFileSync(path.join(projectRoot, ".gitignore"), {encoding: "utf-8"})
	.split("\n")
	// remove comments
	.map((line) => line.replace(/#.*$/g, "").trim())
	// remove empty lines
	.filter((line) => line !== "")
	// Turn trailing slashes into globs
	.map((line) => line.endsWith("/") ? line.concat("*") : line);

ignores.push("**/package-lock.json");

// console.debug("eslint ignores: ", ignores);

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
const config = [];

config.push({ignores});
config.push({
	linterOptions: {
		reportUnusedDisableDirectives: "error",
	},
});
config.push({
	...js.configs.recommended,
	files: [ "**/*.js" ],
	languageOptions: {
		ecmaVersion: "latest",
		globals: {...globals.node},
		sourceType: "commonjs",
	},
});
config.push({
	...js.configs.recommended,
	files: [ "**/*.mjs" ],
	languageOptions: {
		ecmaVersion: "latest",
		globals: {...globals.node},
		sourceType: "module",
	},
});

config.push(...tseslint.config({
	"extends": [
		tseslint.configs.recommendedTypeChecked,
		tseslint.configs.stylisticTypeChecked,
	],
	files: [ "**/*.ts", "**/*.tsx", "**/*.mts" ],
	languageOptions: {
		// parser: tsp,
		// ...c.languageOptions,
		parserOptions: {
			// ...c.languageOptions?.parserOptions,
			project: "tsconfig.json",
			tsconfigRootDir: projectRoot,
		},
	},
	plugins: {
		// "@typescript-eslint": tse,
		tsdoc: tsDoc,
	},
	rules: {
		// ...("rules" in classic ? classic[ "rules" ] : {}),
		"@typescript-eslint/consistent-type-definitions": "off",
		"@typescript-eslint/consistent-type-imports": [
			"error",
			{
				fixStyle: "separate-type-imports",
				prefer: "type-imports",
			},
		],
		"@typescript-eslint/explicit-member-accessibility": "error",
		"@typescript-eslint/no-inferrable-types": "off",
		"@typescript-eslint/no-empty-interface": [
			"error",
			{allowSingleExtends: true},
		],
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				ignoreRestSiblings: true,
				varsIgnorePattern: "^_",
			},
		],
		"tsdoc/syntax": "error",
	},
}));

// config.push(buildTypeChecked(tseslint.configs.recommendedTypeChecked));
// config.push(buildTypeChecked(tseslint.configs.stylisticTypeChecked));

config.push({
	plugins: {
		"@stylistic/js": stylistic,
		markdown,
		// "require-extensions": requireExtensions,
		sortKeysFix,
	},
});

config.push(...json.configs[ "flat/recommended-with-json" ]);

config.push({
	rules: {
		"jsonc/key-spacing": "error",
		"jsonc/no-irregular-whitespace": "error",
		"jsonc/sort-keys": "error",
		quotes: [
			"error",
			"double",
			{
				allowTemplateLiterals: true,
				avoidEscape: true,
			},
		],
		"sort-keys": "off",
	},
});

config.push({
	files: [ "**/*.md", "**/*.md/*.ts" ],
	processor: "markdown/markdown",
	...tseslint.configs.disableTypeChecked,
});

config.push({
	rules: {
		"@stylistic/js/no-extra-parens": "off",
		"@stylistic/js/space-infix-ops": "error",
		"array-bracket-spacing": [ "error", "always" ],
		"comma-dangle": [ "error", "always-multiline" ],
		"eol-last": [ "error", "always" ],
		"linebreak-style": [ "error", "unix" ],
		"no-mixed-spaces-and-tabs": "error",
		"no-multi-spaces": [ "error", {ignoreEOLComments: true} ],
		"no-shadow": [ "error", {allow: [ "console", "process" ], builtinGlobals: true, hoist: "all"} ],
		"no-trailing-spaces": "error",
		"no-unused-vars": "off",
		"object-curly-spacing": [ "error", "always" ],
		"quote-props": [
			"error",
			"as-needed",
			{keywords: true, numbers: true},
		],
		semi: [ "error", "always" ],
		"sort-imports": [
			"error",
			{ignoreCase: true, ignoreDeclarationSort: true},
		],
		// ...requireExtensions.configs.recommended.rules,
	},
});

config.push({
	files: [ "**/*.schema.d.ts" ],
	rules: {
		"@typescript-eslint/consistent-indexed-object-style": "off",
		"@typescript-eslint/consistent-type-definitions": "off",
	},
});

config.push({
	files: [ "**/package.json", "**/package-lock.json" ],
	rules: {
		"jsonc/sort-keys": [
			"error",
			{
				/**
				 * Because someone at Node is a monster.
				 */
				order: [
					"types",
					"import",
					"require",
					"default",
				],
				pathPattern: "^exports\\[.+?\\]$",
			},
			{
				pathPattern: ".*",
				order: {type: "asc"},
			},
		],
	},
});

config.push({
	files: [ "**/tsconfig*.json" ],
	rules: {
		"jsonc/no-comments": "off",
	},
});

export default tseslint.config({
	files: [ "**/*.ts", "**/*.tsx", "**/*.mts" ],
	extends: [
		tseslint.configs.recommendedTypeChecked,
		tseslint.configs.stylisticTypeChecked,
	],
	languageOptions: {
		parserOptions: {
			projectService: true,
			tsconfigRootDir: import.meta.dirname,
		},
	},
	plugins: {
		tsdoc: tsDoc
	},
	rules: {
		// ...("rules" in classic ? classic[ "rules" ] : {}),
		"@typescript-eslint/consistent-type-definitions": "off",
		"@typescript-eslint/consistent-type-imports": [
			"error",
			{
				fixStyle: "separate-type-imports",
				prefer: "type-imports",
			},
		],
		"@typescript-eslint/explicit-member-accessibility": "error",
		"@typescript-eslint/no-duplicate-type-constituents": "off",
		"@typescript-eslint/no-inferrable-types": "off",
		"@typescript-eslint/no-empty-interface": [
			"error",
			{allowSingleExtends: true},
		],
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				ignoreRestSiblings: true,
				varsIgnorePattern: "^_",
			},
		],
		"tsdoc/syntax": "error",
	},
});
