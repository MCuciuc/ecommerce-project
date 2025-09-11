"use client";

import { useEffect } from "react";
import { getClientRollbar } from "@/lib/rollbar";

export function RollbarBootstrap() {
	useEffect(() => {
		getClientRollbar();
	}, []);
	return null;
}
