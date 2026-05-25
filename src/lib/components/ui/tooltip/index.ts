import { Tooltip as TooltipPrimitive } from "bits-ui";
import Root, { type TooltipProps } from "./tooltip.svelte";
import Trigger from "./tooltip-trigger.svelte";
import Content from "./tooltip-content.svelte";
import Provider from "./tooltip-provider.svelte";

const Portal = TooltipPrimitive.Portal;

export {
	Root,
	Trigger,
	Content,
	Provider,
	Portal,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider,
	Portal as TooltipPortal,
	type TooltipProps,
};
