import { JSONObject } from "../../common";

export interface IThemeProvider {
	get(org_id: string): Promise<JSONObject>;
}
export const THEME_PROVIDER: symbol = Symbol("THEME_PROVIDER");
