import { fetchJsonObject, getLocaleHeader, resolveUrl } from "~/utils";
import type { JSONObject } from "../types";

export const ENDPOINTS = {
	theme: '/cdn/theme.json',
	i18n: '/cdn/i18n.json'
};

export async function fetchI18n() {
	try {
		let data: JSONObject | null = await fetchJsonObject(resolveUrl(ENDPOINTS.i18n, "http://org-ringtech.localhost:3000"), {
			method: 'GET',
			headers: {
				"Accept": "application/json",
				"Accept-Language": getLocaleHeader(),
			},
		});
		return data ?? undefined;

	} catch (error) {
		console.error(error.message);
		return undefined;
	}
}