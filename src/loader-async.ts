import { loadAsync } from "./impl/load-async.js";
import { jsModuleFormat } from "./impl/module-format.js";
import { resolveAsync } from "./impl/resolve-async.js";
import { initialize as initializeSync } from "./impl/initialize.js";

console.log(`[${jsModuleFormat}] loader-async`);

export const load = loadAsync;
export const resolve = resolveAsync;
export const initialize = initializeSync;

export default {
	load,
	resolve,
	initialize,
};
