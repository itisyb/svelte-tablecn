<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FormControlAttributes } from "./form-context.js";

	export type FormControlProps = {
		children?: Snippet<[FormControlAttributes]>;
	};
</script>

<script lang="ts">
	import { getFormFieldState } from "./form-context.js";

	let { children }: FormControlProps = $props();

	const field = $derived(getFormFieldState("FormControl"));
	const describedBy = $derived(
		field.invalid
			? `${field.formDescriptionId} ${field.formMessageId}`
			: field.formDescriptionId
	);
	const controlProps = $derived<FormControlAttributes>({
		"data-slot": "form-control",
		id: field.formItemId,
		"aria-describedby": describedBy,
		"aria-invalid": field.invalid
	});
</script>

{@render children?.(controlProps)}
