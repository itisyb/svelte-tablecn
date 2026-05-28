import Root from "./faceted.svelte";
import BadgeList from "./faceted-badge-list.svelte";
import Content from "./faceted-content.svelte";
import Item from "./faceted-item.svelte";
import Trigger from "./faceted-trigger.svelte";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandList,
	CommandSeparator,
} from "$lib/components/ui/command/index.js";
import type { FacetedValue } from "./faceted-context.js";

export {
	Root,
	BadgeList,
	Content,
	CommandEmpty as Empty,
	CommandGroup as Group,
	CommandInput as Input,
	Item,
	CommandList as List,
	CommandSeparator as Separator,
	Trigger,
	//
	Root as Faceted,
	BadgeList as FacetedBadgeList,
	Content as FacetedContent,
	CommandEmpty as FacetedEmpty,
	CommandGroup as FacetedGroup,
	CommandInput as FacetedInput,
	Item as FacetedItem,
	CommandList as FacetedList,
	CommandSeparator as FacetedSeparator,
	Trigger as FacetedTrigger,
};

export type { FacetedValue };
