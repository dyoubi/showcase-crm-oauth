import { JSONObject } from "../../common";

export interface II18nProvider {
	get(org_id: string, page: string, lang?: string): Promise<JSONObject>;
}
export const I18N_PROVIDER: symbol = Symbol("I18N_PROVIDER");
