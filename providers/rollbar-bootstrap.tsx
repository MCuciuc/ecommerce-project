"use client";

import { useEffect } from "react";
import { getClientRollbar } from "@/lib/rollbar";

export function RollbarBootstrap() {
	useEffect(() => {
		const rb = getClientRollbar();
		rb?.info("rollbar bootstrap mounted", { boot: true });

		const onError = (event: ErrorEvent) => {
			rb?.error(event.error || event.message, {
				source: "window.onerror",
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
			});
		};

		const onRejection = (event: PromiseRejectionEvent) => {
			const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
			rb?.error(reason, { source: "unhandledrejection" });
		};

		window.addEventListener("error", onError);
		window.addEventListener("unhandledrejection", onRejection);
		return () => {
			window.removeEventListener("error", onError);
			window.removeEventListener("unhandledrejection", onRejection);
		};
	}, []);

	return null;
}