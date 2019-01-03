import { SubResolver, ResolverContext } from "../resolvers";

export interface BrowserCompatibleUrlResolverContext extends ResolverContext {
	// options?: request.Options;
}

// Proof of concept
export function BrowserCompatibleUrlResolver(): SubResolver {
	return (what: string, ctx: BrowserCompatibleUrlResolverContext): Promise<string | null> =>
		new Promise((resolve, reject) => {
			// TODO: url check
			if (1 < 0) {
				return resolve(null);
			}

			ctx.system.tmpFile((err, path, sink) => {
				if (err) {
					return reject(err);
				}

				ctx.system.requestGet(
					what,
					reject,
					(data: any) => {
						sink(data);
					},
					() => {
						resolve(path);
					})
			})

		});
}
