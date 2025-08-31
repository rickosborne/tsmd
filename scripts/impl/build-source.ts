import * as esbuild from "esbuild";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { join as pathJoin, resolve as pathResolve } from "path";
import { ensureDir } from "./ensure-dir.js";

export interface BuiltSource {
	bareSpecifier: string;
	sourcePath: string;
}

export const buildSource = async (
	fileName: string,
	srcDir: string,
	distDir: string,
): Promise<BuiltSource> => {
	const dirName = dirname(fileName);
	const outDir = pathResolve(distDir, dirName);
	const sourcePath = pathJoin(srcDir, fileName);
	const bareSpecifier = fileName.replace(/\.ts$/, "");
	await ensureDir(outDir);
	console.log(`Build: ${ fileName }`);
	for (const format of [ "esm", "cjs" ] as const) {
		const outExt = format === "esm" ? ".mjs" : ".cjs";
		await esbuild.build({
			bundle: false,
			charset: "utf8",
			entryPoints: [
				pathJoin(srcDir, fileName),
			],
			format,
			keepNames: true,
			loader: {
				".ts": "ts",
			},
			metafile: true,
			minify: false,
			outdir: outDir,
			outExtension: {
				".js": outExt,
			},
			packages: "external",
			platform: "neutral",
			plugins: [{
				name: "fixExt",
				setup(build) {
					build.onLoad({
						filter: /\.ts$/,
					}, ({ path }) => {
						let contents = readFileSync(path, "utf-8")
							.replace(/"(\.\.?\/[^"]+?)\.js"/g, `"$1${outExt}"`)
							.replace('jsModuleFormat: string = "___"', `jsModuleFormat: string = "${format}"`);
						if (outExt === ".cjs") {
							if (contents.includes("import.meta.url")) {
								if (!/\bpathToFileURL\b/.test(contents)) {
									contents = 'import { pathToFileURL } from "node:url";\n'.concat(contents);
								}
								contents = contents.replace(/\bimport\.meta\.url\b/g, "pathToFileURL(__filename)");
							}
						}
						return {
							contents,
							loader: "ts",
						};
					});
				}
			}],
			sourcemap: true,
			sourcesContent: false,
			target: [ "node18" ],
			treeShaking: true,
		});
		// for (const outFile of buildResult.outputFiles ?? []) {
		// 	const source = Buffer.from(outFile.contents).toString("utf-8"); // ?? await readFile(outFile.path, "utf-8");
		// 	if (outFile.path.endsWith(outExt)) {
		// 		source.replace(/"(.\/.+?)\.js"/g, `"$1${outExt}"`);
		// 	}
		// 	await writeFile(outFile.path, source, "utf-8");
		// }
		// const outFile = pathResolve(outDir, fileName);
	}
	return {
		bareSpecifier,
		sourcePath,
	}
};
