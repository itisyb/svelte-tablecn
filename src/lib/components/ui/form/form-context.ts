import { getContext, setContext } from "svelte";

export type FormFieldError = string | { message?: string } | null | undefined;

export interface FormContextValue {
	get errors(): Record<string, FormFieldError>;
}

export interface FormFieldContextValue {
	get name(): string;
	get error(): FormFieldError;
}

export interface FormItemContextValue {
	get id(): string;
}

export interface FormFieldState {
	id: string;
	name: string;
	formItemId: string;
	formDescriptionId: string;
	formMessageId: string;
	error: FormFieldError;
	invalid: boolean;
}

export type FormControlAttributes = {
	"data-slot": "form-control";
	id: string;
	"aria-describedby": string;
	"aria-invalid": boolean;
};

const FORM_CONTEXT_KEY = Symbol("form-context");
const FORM_FIELD_CONTEXT_KEY = Symbol("form-field-context");
const FORM_ITEM_CONTEXT_KEY = Symbol("form-item-context");

export function setFormContext(context: FormContextValue) {
	setContext(FORM_CONTEXT_KEY, context);
}

export function getFormContext(): FormContextValue | undefined {
	return getContext<FormContextValue | undefined>(FORM_CONTEXT_KEY);
}

export function setFormFieldContext(context: FormFieldContextValue) {
	setContext(FORM_FIELD_CONTEXT_KEY, context);
}

export function getFormFieldContext(consumerName: string): FormFieldContextValue {
	const context = getContext<FormFieldContextValue | undefined>(FORM_FIELD_CONTEXT_KEY);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`FormField\``);
	}
	return context;
}

export function setFormItemContext(context: FormItemContextValue) {
	setContext(FORM_ITEM_CONTEXT_KEY, context);
}

export function getFormItemContext(consumerName: string): FormItemContextValue {
	const context = getContext<FormItemContextValue | undefined>(FORM_ITEM_CONTEXT_KEY);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`FormItem\``);
	}
	return context;
}

export function getFormFieldState(consumerName: string): FormFieldState {
	const fieldContext = getFormFieldContext(consumerName);
	const itemContext = getFormItemContext(consumerName);
	const error = fieldContext.error;
	const id = itemContext.id;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		error,
		invalid: Boolean(error)
	};
}

export function getFormErrorMessage(error: FormFieldError): string {
	if (!error) return "";
	return typeof error === "string" ? error : (error.message ?? "");
}
