import type { ThemeFile, ThemeVariantJson } from "./transform";

type PickOpts = {
	prefer?: string;
	fallback?: string;
};

export function pickThemeVariant(file: ThemeFile, opts: PickOpts = {}): { key: string; json: ThemeVariantJson; } {
	const { prefer, fallback = "light" } = opts;
	const variants = Object.keys(file || {});
	if (!variants.length) { return { key: 'default', json: {} }; };

	const key =
		(prefer && file[prefer] && prefer) ||
		(file[fallback] && fallback) ||
		variants[0]; // premier dispo

	return { key, json: file[key] };
}