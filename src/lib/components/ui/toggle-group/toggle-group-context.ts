import { getContext, setContext } from "svelte";
import type { ToggleSize, ToggleVariant } from "../toggle/toggle.svelte";

const TOGGLE_GROUP_CONTEXT = Symbol("toggle-group-context");

export type ToggleGroupContext = {
	variant?: ToggleVariant;
	size?: ToggleSize;
};

export function setToggleGroupContext(context: ToggleGroupContext) {
	setContext(TOGGLE_GROUP_CONTEXT, context);
}

export function getToggleGroupContext() {
	return getContext<ToggleGroupContext | undefined>(TOGGLE_GROUP_CONTEXT);
}
