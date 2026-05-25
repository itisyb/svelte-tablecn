import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getAbsoluteUrl(path: string) {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	if (typeof window !== "undefined") {
		return normalizedPath;
	}

	const baseUrl = process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: `http://localhost:${process.env.PORT ?? 3000}`;

	return `${baseUrl}${normalizedPath}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
