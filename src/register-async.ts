import { register } from "node:module";
import { jsModuleFormat } from "./impl/module-format.js";

let metaUrl = import.meta.url as string | URL;
if (metaUrl instanceof URL) {
	metaUrl = metaUrl.href;
}

if (jsModuleFormat === "cjs") {
	console.error("❌ register-async cannot work under CJS.\n❌ Use register-sync or register-hooks-sync, or switch to ESM.");
	throw new Error("Cannot use async resolve/load under CJS.");
}

console.log(`[${jsModuleFormat}] register-async: ${metaUrl}`);

register("./loader-async.js", metaUrl, {
	data: {
		metaUrl,
		jsModuleFormat,
		register: "async",
	},
});
