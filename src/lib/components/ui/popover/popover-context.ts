import { getContext, setContext } from "svelte";

const POPOVER_CONTEXT = Symbol("popover");

interface PopoverContext {
	anchor: HTMLElement | null;
	hasAnchor: boolean;
	setAnchor: (anchor: HTMLElement | null) => void;
	setHasAnchor: (hasAnchor: boolean) => void;
}

export function setPopoverContext(context: PopoverContext) {
	return setContext(POPOVER_CONTEXT, context);
}

export function getPopoverContext() {
	return getContext<PopoverContext | undefined>(POPOVER_CONTEXT);
}
