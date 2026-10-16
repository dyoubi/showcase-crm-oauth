import { DeepPartial } from "../../../../common";
import { Colors, Typography, Borders, WidgetBlock, PageBackground } from "../../interface";

export const ThemeSchema = {
  $id: 'ThemeSchema',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    theme_id: {
      type: 'string'
    },
    colors: {
      type: 'object',
      properties: {}
    },
    fonts: {
      type: 'object',
      properties: {}
    },
    widget: {
      type: 'object',
      properties: {}
    },
    page_background: {
      type: 'object',
      properties: {}
    }
  },
  required: [
    'org_id',
    'theme_id',
    'colors',
    'fonts',
    'widget',
    'page_background'
  ]
};

export type ThemeType = {
  org_id: string;
  theme_id: string;
  colors: Colors;
  fonts: Typography;
  borders: Borders;
  widget: WidgetBlock;
  page_background: PageBackground;
};
export const ThemeType = (() => {
  function check_ThemeType(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.theme_id === 'string' &&
      Borders(value.borders) &&
      Colors(value.colors) &&
      Typography(value.fonts) &&
      PageBackground(value.page_background) &&
      WidgetBlock(value.widget)
    );
  }
  return function check(value: any): value is ThemeType {
    return check_ThemeType(value);
  };
})();


export type PartialTheme = DeepPartial<ThemeType>;
