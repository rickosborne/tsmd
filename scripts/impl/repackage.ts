import { deepCopy } from "@rickosborne/foundation";
import { entriesOf } from "@rickosborne/foundation/entries-of";
import { readFile, writeFile } from "node:fs/promises";
import { join as pathJoin } from "path";

import type { PackageJson, PackageJsonExports } from "pkg-types";
import type { BuiltSource } from "./build-source.js";

export const repackage = async (
	builtSources: BuiltSource[],
	projectRoot: string,
	srcDir: string,
	distDir: string,
) => {
	const projectPackage = JSON.parse(await readFile(pathJoin(projectRoot, "package.json"), "utf-8")) as PackageJson;
	const packageTemplate = JSON.parse(await readFile(pathJoin(srcDir, "package-template.json"), "utf-8")) as PackageJson;
	const outFile = pathJoin(distDir, "package.json");
	const pkg = deepCopy(packageTemplate);
	// Update dependency versions
	for (const [ k, v ] of entriesOf(pkg.dependencies ?? {})) {
		pkg[ k ] = projectPackage.dependencies?.[ k ] ?? v;
	}
	pkg.exports ??= {};
	const ex = pkg.exports as Record<string, PackageJsonExports>;
	for (const {bareSpecifier} of builtSources) {
		const spec = {
			types: `./${bareSpecifier}.d.ts`,
			import: `./${bareSpecifier}.mjs`,
			require: `./${bareSpecifier}.cjs`,
			default: `./${bareSpecifier}.mjs`,
		};
		ex[`./${bareSpecifier}.js`] = spec;
		ex[`./${bareSpecifier}`] = spec;
		ex[`./${bareSpecifier}.mjs`] = `./${bareSpecifier}.mjs`;
		ex[`./${bareSpecifier}.cjs`] = `./${bareSpecifier}.cjs`;
		ex[`./${bareSpecifier}.d.ts`] = `./${bareSpecifier}.d.ts`;
	}
	await writeFile(outFile, JSON.stringify(pkg, undefined, "\t"), "utf-8");
};
