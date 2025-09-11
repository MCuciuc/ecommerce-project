"use client";

import { useEffect, useRef } from "react";
import { getClientRollbar } from "@/lib/rollbar";

export function RollbarConsoleProvider() {
	const originalErrorRef = useRef<typeof console.error | null>(null);
	const originalWarnRef = useRef<typeof console.warn | null>(null);

	useEffect(() => {
		const rollbar = getClientRollbar();
		if (!rollbar) return;

		// Save originals
		originalErrorRef.current = console.error;
		originalWarnRef.current = console.warn;

		console.error = (...args: unknown[]) => {
			try {
				rollbar.error(args[0] instanceof Error ? args[0] : (args[0] as any), {
					console: true,
					args: args.map(String).join(" "),
				});
			} catch {}
			// Always call original
			originalErrorRef.current?.(...(args as any));
		};

		console.warn = (...args: unknown[]) => {
			try {
				rollbar.warning(args[0] instanceof Error ? args[0] : (args[0] as any), {
					console: true,
					args: args.map(String).join(" "),
				});
			} catch {}
			originalWarnRef.current?.(...(args as any));
		};

		return () => {
			if (originalErrorRef.current) console.error = originalErrorRef.current;
			if (originalWarnRef.current) console.warn = originalWarnRef.current;
		};
	}, []);

	return null;
}
