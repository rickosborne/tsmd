import type { ResolveFnOutput, ResolveHook, ResolveHookContext } from "node:module";
import { resolvedFormat } from "./resolved-format.js";
import { getVirtualFormat } from "./virtual-format.js";

export const resolveAsync: ResolveHook = async (
	specifier: string,
	context: ResolveHookContext,
	nextResolve: (
		spec: string,
		ctx?: Partial<ResolveHookContext>,
	) => ResolveFnOutput | Promise<ResolveFnOutput>,
): Promise<ResolveFnOutput> => {
	const format = getVirtualFormat(specifier);
	if (format == null) {
		return nextResolve(specifier, context);
	}
	return resolvedFormat(specifier, context, format);
};
