import { Store, type JSONObject } from "../types";
import type { ThemeJson } from "./transform";

export type ThemeState = {
	json?: ThemeJson;
	vars?: Record<string, string>;
	styleTag?: string;
	fontUrl?: string;
};

export const THEME_STORE = new Store<ThemeState>();
export function hydrateTheme(initial?: Partial<ThemeState>) {
	if (initial) { THEME_STORE.setState(initial); }
}