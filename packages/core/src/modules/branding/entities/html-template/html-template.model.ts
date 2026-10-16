import { JSONObject } from "../../../../common";
import { TemplateUsage } from "./types";
import { HTMLTemplateType } from "./html-template.schema";

export class HTMLTemplate implements HTMLTemplateType {
    org_id: string;
    template_id: string;
    usage: TemplateUsage;
    html: string;
    schema: JSONObject;
    lang?: boolean | null;
    custom?: boolean | null;
}
export type PK_HTMLTemplate = Pick<HTMLTemplate, 'org_id' | 'template_id'>;