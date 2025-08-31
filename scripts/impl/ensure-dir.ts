import { mkdir } from "node:fs/promises";

export const ensureDir = (() => {
	const made = new Set<string>();
	return async (dirName: string): Promise<void> => {
		if (!made.has(dirName)) {
			made.add(dirName);
			await mkdir(dirName, { recursive: true });
		}
	}
})();
