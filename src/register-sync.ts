import { register } from "node:module";
import { jsModuleFormat } from "./impl/module-format.js";

let metaUrl = import.meta.url as string | URL;
if (metaUrl instanceof URL) {
	metaUrl = metaUrl.href;
}

console.log(`[${jsModuleFormat}] register-sync: ${metaUrl}`);

register("./loader-sync.js", metaUrl, {
	data: {
		metaUrl,
		jsModuleFormat,
		register: "sync",
	},
});
