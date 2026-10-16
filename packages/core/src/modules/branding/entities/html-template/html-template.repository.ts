import { IRepository } from "@egc-io/ckit-lib";
import { HTMLTemplate, PK_HTMLTemplate } from "./html-template.model";

export type IHTMLTemplateRepository = IRepository<HTMLTemplate, PK_HTMLTemplate>;
export const HTML_TEMPLATE_REPOSITORY: symbol = Symbol("HTML_TEMPLATE_REPOSITORY");
