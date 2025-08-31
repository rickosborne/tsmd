import { initialize as initializeSync } from "./impl/initialize.js";
import { loadSync as loadS } from "./impl/load-sync.js";
import { jsModuleFormat } from "./impl/module-format.js";
import { resolveSync as resolveS } from "./impl/resolve-sync.js";

console.log(`[${jsModuleFormat}] loader-sync`);

export const loadSync = loadS;
export const load = loadSync;
export const resolveSync = resolveS;
export const resolve = resolveSync;
export const initialize = initializeSync;

export default {
	loadSync,
	load,
	resolveSync,
	resolve,
	initialize
};
