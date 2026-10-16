import { fetchJsonObject, resolveUrl, getLocaleHeader } from "~/utils";
import { ENDPOINTS } from "../i18n/api";
import type { JSONObject } from "../types";

export async function fetchTheme() {
	try {
		let data: JSONObject | null = await fetchJsonObject(resolveUrl(ENDPOINTS.theme, "http://org-ringtech.localhost:3000"), {
			method: "GET",
			headers: {
				"Accept": "application/json",
				"Accept-Language": getLocaleHeader(),
			},
		});
		return data ? data as JSONObject : undefined;

	} catch (error) {
		console.error(error.message);
		return undefined;
	}
}
