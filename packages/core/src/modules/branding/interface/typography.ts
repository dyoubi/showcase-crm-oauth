import { FontStyle } from "./font-style";
import { LinksStyle } from "./types";

export const TypographySchema = {
  $id: 'TypographySchema',
  type: 'object',
  properties: {
    font_url: {
      type: 'string'
    },
    reference_text_size: {
      type: 'string'
    },
    title: {
      type: 'object',
      properties: {}
    },
    subtitle: {
      type: 'object',
      properties: {}
    },
    body_text: {
      type: 'string'
    },
    input_labels: {
      type: 'object',
      properties: {}
    },
    links: {
      type: 'object',
      properties: {}
    },
    links_style: {
      type: 'object',
      properties: {}
    }
  },
  required: [
    'font_url',
    'reference_text_size',
    'title',
    'subtitle',
    'body_text',
    'input_labels',
    'links',
    'links_style'
  ]
};

export type Typography = {
  font_url: string;
  reference_text_size: string;
  title: FontStyle;
  subtitle: FontStyle;
  body_text: FontStyle;
  input_labels: FontStyle;
  links: FontStyle;
  links_style: LinksStyle;
};

export const Typography = (() => {
  function check_Typography(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.font_url === 'string' &&
      typeof value.reference_text_size === 'string' &&
      FontStyle(value.title) &&
      FontStyle(value.subtitle) &&
      FontStyle(value.body_text) &&
      FontStyle(value.input_labels) &&
      FontStyle(value.links) &&
      typeof value.links_style === 'string'
    );
  }
  return function check(value: any): value is Typography {
    return check_Typography(value);
  };
})();
