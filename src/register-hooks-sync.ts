import { registerHooks } from "node:module";
import { loadSync } from "./impl/load-sync.js";
import { jsModuleFormat } from "./impl/module-format.js";
import { resolveSync } from "./impl/resolve-sync.js";

console.log(`[${jsModuleFormat}] register-hooks-sync`);

registerHooks({
	load: loadSync,
	resolve: resolveSync,
});
