import { HeaderTextAlignment, LogoPosition } from "./types";

export const WidgetBlockSchema = {
  $id: 'WidgetBlockSchema',
  type: 'object',
  properties: {
    logo_position: {
      type: 'string'
    },
    logo_url: {
      type: 'string'
    },
    logo_height: {
      type: 'number'
    },
    header_text_alignment: {
      type: 'string'
    },
    social_buttons_layout: {
      type: 'string'
    }
  },
  required: [
    'logo_position',
    'logo_url',
    'logo_height',
    'header_text_alignment',
    'social_buttons_layout'
  ]
};

export type WidgetBlock = {
  logo_position: LogoPosition;
  logo_url: string;
  logo_height: number;
  header_text_alignment: HeaderTextAlignment;
  social_buttons_layout: HeaderTextAlignment;
};
export const WidgetBlock = (() => {
  function check_WidgetBlock(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.logo_position === 'string' &&
      typeof value.logo_url === 'string' &&
      Number.isFinite(value.logo_height) &&
      typeof value.header_text_alignment === 'string' &&
      typeof value.social_buttons_layout === 'string'
    );
  }
  return function check(value: any): value is WidgetBlock {
    return check_WidgetBlock(value);
  };
})();
