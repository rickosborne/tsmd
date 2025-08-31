import { catchAnd } from "@rickosborne/foundation/catch-and";
import { copyFile } from "node:fs/promises";
import { join as pathJoin, resolve as pathResolve } from "node:path";
import { rimraf } from "rimraf";
import { buildSource, type BuiltSource } from "./impl/build-source.js";
import { ensureDir } from "./impl/ensure-dir.js";
import { generateTypes } from "./impl/generate-types.js";
import { listDeep } from "./impl/list-deep.js";
import { repackage } from "./impl/repackage.js";

const scriptDir = import.meta.dirname;
const projectRoot = pathResolve(scriptDir, "..");
const srcDir = pathJoin(projectRoot, "src");
const distDir = pathJoin(projectRoot, "dist");
const schemaFileName: string = "tsmd-config.schema.json";

const build = async () => {
	await ensureDir(distDir);
	await rimraf(distDir, { preserveRoot: true });
	const sources: string[] = [];
	const builtSources: BuiltSource[] = [];
	for await (const sourceFile of listDeep(srcDir)) {
		if (sourceFile.endsWith(".ts") && !sourceFile.endsWith(".test.ts") && !sourceFile.includes("__test__")) {
			sources.push(sourceFile);
			builtSources.push(await buildSource(sourceFile, srcDir, distDir));
		}
	}
	await copyFile(pathJoin(srcDir, schemaFileName), pathJoin(distDir, schemaFileName));
	generateTypes(sources.map((s) => pathJoin(srcDir, s)), distDir, {
		declaration: true,
		declarationDir: "./",
		declarationMap: true,
		emitDeclarationOnly: true,
		noEmit: false,
		rootDir: "./src",
	});
	await repackage(builtSources, projectRoot, srcDir, distDir);
	// await writeFile(pathJoin(distDir, "index.d.ts"), indexDTS, "utf-8");
	await copyFile("README.md", pathJoin(distDir, "README.md"));
};

build().catch(catchAnd({
	prefix: "🔥 Build failed.",
}))
