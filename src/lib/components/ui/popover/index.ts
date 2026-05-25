import { Popover as PopoverPrimitive } from "bits-ui";
import Root from "./popover.svelte";
import Anchor from "./popover-anchor.svelte";
import Content from "./popover-content.svelte";
import Trigger from "./popover-trigger.svelte";
const Close = PopoverPrimitive.Close;

export {
	Root,
	Anchor,
	Content,
	Trigger,
	Close,
	//
	Root as Popover,
	Anchor as PopoverAnchor,
	Content as PopoverContent,
	Trigger as PopoverTrigger,
	Close as PopoverClose,
};
