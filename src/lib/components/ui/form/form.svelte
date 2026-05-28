<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FormFieldError } from "./form-context.js";

	export type FormProps = {
		children?: Snippet;
		errors?: Record<string, FormFieldError>;
	};
</script>

<script lang="ts">
	import { setFormContext } from "./form-context.js";

	let { children, errors = {} }: FormProps = $props();

	setFormContext({
		get errors() {
			return errors;
		}
	});
</script>

{@render children?.()}
