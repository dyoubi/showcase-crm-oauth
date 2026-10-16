import { createContext, useContext } from "react";
import { Store } from "../types";

import type { JSONObject } from "../types";

export type I18nState = {
	locale: string;          // ex: "fr", "en-US"
	i18n: JSONObject;      // dictionnaire plat ou nested
	dir?: "ltr" | "rtl";     // optionnel: direction d'écriture
	ready: boolean;          // hydraté ?
};

export const i18nStore = new Store<I18nState>();
export function hydrateI18n(initial: Partial<I18nState>) {
	i18nStore.setState(initial);
}

export const I18nContext = createContext<I18nState>({
	locale: "en",
	i18n: {},
	dir: "ltr",
	ready: true,
});

export function useI18nContext() { return useContext(I18nContext); }
