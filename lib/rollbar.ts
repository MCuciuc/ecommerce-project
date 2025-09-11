import Rollbar from "rollbar";

// Client-side singleton (initialized lazily to avoid SSR issues)
let clientInstance: Rollbar | null = null;

function createClientInstance(): Rollbar | null {
	if (typeof window === "undefined") return null;
	if (clientInstance) return clientInstance;
	const accessToken = process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN;
	if (!accessToken) {
		// Token not set; return null to avoid runtime noise
		return null;
	}
	clientInstance = new Rollbar({
		accessToken,
		captureUncaught: true,
		captureUnhandledRejections: true,
		environment: process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV ?? "development",
	});
	return clientInstance;
}

export function getClientRollbar(): Rollbar | null {
	return createClientInstance();
}

// Server-side instance (constructed eagerly when token present)
let serverInstance: Rollbar | null = null;
(() => {
	if (typeof window !== "undefined") return; // server only
	const accessToken = process.env.ROLLBAR_SERVER_ACCESS_TOKEN;
	if (!accessToken) return;
	serverInstance = new Rollbar({
		accessToken,
		captureUncaught: true,
		captureUnhandledRejections: true,
		environment: process.env.NODE_ENV ?? "development",
	});
})();

export function getServerRollbar(): Rollbar | null {
	return serverInstance;
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
	const isBrowser = typeof window !== "undefined";
	const rb = isBrowser ? getClientRollbar() : getServerRollbar();
	if (!rb) return;
	try {
		if (context) {
			rb.error(error as any, context);
		} else {
			rb.error(error as any);
		}
	} catch {
		// Swallow to avoid cascading failures during error reporting
	}
}
