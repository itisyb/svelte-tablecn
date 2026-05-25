import { getContext, setContext } from "svelte";
import type { DrawerDirection } from "./drawer.svelte";

export interface DrawerContextValue {
	get direction(): DrawerDirection;
}

const DRAWER_CONTEXT_KEY = Symbol("drawer-context");

export function setDrawerContext(context: DrawerContextValue) {
	setContext(DRAWER_CONTEXT_KEY, context);
}

export function getDrawerContext(consumerName: string): DrawerContextValue {
	const context = getContext<DrawerContextValue | undefined>(DRAWER_CONTEXT_KEY);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`Drawer\``);
	}
	return context;
}
