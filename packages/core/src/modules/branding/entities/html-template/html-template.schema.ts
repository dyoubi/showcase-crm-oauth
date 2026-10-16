import { JSONObject } from "../../../../common";
import { TemplateUsage } from "./types";

export const HTMLTemplateSchema = {
  $id: 'HTMLTemplateSchema',
  type: 'object',
  properties: {
    org_id: { type: 'string' },
    template_id: { type: 'string' },
    usage: { type: 'string' },
    html: { type: 'string' },
    schema: { type: 'object' },
    custom: { type: 'boolean' },
    lang: { type: 'boolean' },
  },
  required: [
    'org_id',
    'template_id',
    'usage',
    'html',
    'schema'
  ]
};

export type HTMLTemplateType = {
  org_id: string;
  template_id: string;
  usage: TemplateUsage;
  html: string;
  schema: JSONObject;
  custom?: boolean | null;
};
export const HTMLTemplateType = (() => {
  function check_HTMLTemplateType(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.template_id === 'string' &&
      typeof value.usage === 'string' &&
      typeof value.html === 'string' &&
      typeof value.schema === 'object' &&
      !Array.isArray(value.schema) &&
      (value.custom !== undefined ?
        value.custom === null ||
        typeof value.custom === 'boolean'
        : true) &&
      (value.lang !== undefined ?
        value.lang === null ||
        typeof value.lang === 'boolean'
        : true)
    );
  }
  return function check(value: any): value is HTMLTemplateType {
    return check_HTMLTemplateType(value);
  };
})();
