import { JSONObject } from "../../common";
import { TemplateUsage } from "./entities/html-template/types";

export interface ITemplateRenderer {
	/**
	 * @param org_id The org id
	 * @param usage Template usage eg `VERIFICATION_EMAIL_LINK`
	 * @param args 	Context value object, must match usage context schema
	 * @param lang Optional lang type. The default lang is used if this value is not provided
	 */
	render(org_id: string, usage: TemplateUsage, args: JSONObject, lang?: string): Promise<string>;
}
export const TEMPLATE_RENDERER: symbol = Symbol("TEMPLATE_RENDERER");
