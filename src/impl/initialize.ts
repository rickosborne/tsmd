import type { InitializeHook } from "module";
import { jsModuleFormat } from "./module-format.js";

export const initialize: InitializeHook = (args: unknown): void => {
	console.log(`[${ jsModuleFormat }] initialize`, args);
};
