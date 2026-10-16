import { useSyncExternalStore, type ReactNode } from "react";
import { IsBrowser } from "../../utils";
import { get, interpolate, type JSONObject } from "../types";
import { I18nContext, i18nStore, useI18nContext, type I18nState, } from "./store";

export function useI18n() {
	return useSyncExternalStore(i18nStore.subscribe, i18nStore.getState, i18nStore.getState);
}

export function useText() {
	const { i18n } = useI18nContext();
	return (key: string, vars?: Record<string, string | number>) => {
		const v = get(i18n ?? {}, key);
		const s = typeof v === "string" ? v : `@${key}`; // fallback : renvoie la clé
		return interpolate(s, vars);
	};
}

type Props = {
	initial?: Partial<I18nState>;
	children: ReactNode;
};

export function I18nProvider({ initial, children, }: Props) {
	const store = useI18n();
	const value: I18nState = IsBrowser()
		? store
		: {
			locale: initial?.locale ?? "en",
			dir: initial?.dir ?? "ltr",
			i18n: (initial?.i18n ?? {}) as JSONObject,
			ready: true,
		};
	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}