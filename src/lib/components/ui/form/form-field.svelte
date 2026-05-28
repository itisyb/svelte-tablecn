<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FormFieldError, FormFieldState } from "./form-context.js";

	export type FormFieldProps = {
		name: string;
		error?: FormFieldError;
		children?: Snippet<[FormFieldState]>;
	};
</script>

<script lang="ts">
	import { getFormContext, getFormFieldState, setFormFieldContext } from "./form-context.js";

	let { name, error, children }: FormFieldProps = $props();

	const form = getFormContext();
	const fieldError = $derived(error ?? form?.errors[name]);

	setFormFieldContext({
		get name() {
			return name;
		},
		get error() {
			return fieldError;
		}
	});

	const fieldState = $derived(getFormFieldState("FormField"));
</script>

{@render children?.(fieldState)}
