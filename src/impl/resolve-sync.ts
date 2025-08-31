import type { ResolveFnOutput, ResolveHookContext, ResolveHookSync } from "node:module";
import { resolvedFormat } from "./resolved-format.js";
import { getVirtualFormat } from "./virtual-format.js";

export const resolveSync: ResolveHookSync = (
	specifier: string,
	context: ResolveHookContext,
	nextResolve: (
		spec: string,
		ctx?: Partial<ResolveHookContext>,
	) => ResolveFnOutput,
): ResolveFnOutput => {
	const format = getVirtualFormat(specifier);
	if (format == null) {
		return nextResolve(specifier, context);
	}
	return resolvedFormat(specifier, context, format);
};
