import { getContext, setContext } from "svelte";

const FACETED_CONTEXT = Symbol("faceted-context");

export type FacetedValue = string | string[];

export type FacetedContextValue = {
	value?: FacetedValue;
	multiple?: boolean;
	onItemSelect?: (value: string) => void;
};

export function setFacetedContext(context: FacetedContextValue) {
	setContext(FACETED_CONTEXT, context);
}

export function getFacetedContext(name: string) {
	const context = getContext<FacetedContextValue | undefined>(FACETED_CONTEXT);
	if (!context) {
		throw new Error(`\`${name}\` must be within Faceted`);
	}
	return context;
}
