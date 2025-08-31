import { readdir } from "node:fs/promises";
import { join as pathJoin } from "path";

export async function* listDeep(rootDir: string): AsyncGenerator<string, undefined, undefined> {
	const dirs: string[] = [ rootDir ];
	const prefix = rootDir.endsWith("/") ? rootDir : rootDir.concat("/");
	do {
		const dir = dirs.shift()!;
		const entries = await readdir(dir, { withFileTypes: true, recursive: false, encoding: "utf-8" });
		for (const de of entries) {
			if (de.name.startsWith(".")) {
				continue;
			}
			const fullPath = pathJoin(de.parentPath, de.name);
			if (de.isFile()) {
				yield fullPath.replace(prefix, "");
			} else if (de.isDirectory()) {
				dirs.push(fullPath);
			}
		}
	} while (dirs.length > 0);
}
