import type { ResolveFnOutput, ResolveHookContext } from "node:module";
import { FORMAT_TSMD, type TSMDOutputFormat } from "../tsmd.js";

export const resolvedFormat = (
	specifier: string,
	context: ResolveHookContext,
	format: TSMDOutputFormat,
): ResolveFnOutput => {
	const resolvedUrl = (context.parentURL == null ? new URL(specifier) : new URL(specifier, context.parentURL)).href;
	return {
		format: FORMAT_TSMD,
		importAttributes: {
			...format,
		},
		shortCircuit: true,
		url: resolvedUrl,
	} satisfies ResolveFnOutput;
};
