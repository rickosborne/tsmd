import * as ts from "typescript";
import { resolve as pathResolve } from "node:path";
import { writeFileSync } from "node:fs";

export const generateTypes = (
	sources: string[],
	distDir: string,
	options: ts.CompilerOptions,
): void => {
	console.log("Generating .d.ts files.");
	const host = ts.createCompilerHost(options);
	host.writeFile = (fileName: string, contents: string) => {
		const filePath = pathResolve(distDir, fileName);
		writeFileSync(filePath, contents, "utf-8");
	};

	// Prepare and emit the d.ts files
	const program = ts.createProgram(sources, options, host);
	program.emit();
}
