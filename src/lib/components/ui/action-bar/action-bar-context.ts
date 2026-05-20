import { getContext, setContext } from 'svelte';

export type ActionBarDirection = 'ltr' | 'rtl';
export type ActionBarOrientation = 'horizontal' | 'vertical';

export interface ActionBarContextValue {
	onOpenChange?: (open: boolean) => void;
	dir: ActionBarDirection;
	orientation: ActionBarOrientation;
}

const ACTION_BAR_CONTEXT_KEY = Symbol('action-bar');

export function setActionBarContext(value: ActionBarContextValue) {
	setContext(ACTION_BAR_CONTEXT_KEY, value);
}

export function getActionBarContext(consumerName: string): ActionBarContextValue {
	const context = getContext<ActionBarContextValue | undefined>(ACTION_BAR_CONTEXT_KEY);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`ActionBar\``);
	}
	return context;
}
