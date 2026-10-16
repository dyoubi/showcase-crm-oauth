import { BinaryTheme } from "./types";

export const ColorsSchema = {
  $id: 'ColorsSchema',
  type: 'object',
  properties: {
    primary_button: {
      type: 'string'
    },
    primary_button_label: {
      type: 'string'
    },
    secondary_button_border: {
      type: 'string'
    },
    secondary_button_label: {
      type: 'string'
    },
    read_only_background: {
      type: 'string'
    },
    base_focus_color: {
      type: 'string'
    },
    base_hover_color: {
      type: 'string'
    },
    links_focused_components: {
      type: 'string'
    },
    header: {
      type: 'string'
    },
    body_text: {
      type: 'string'
    },
    widget_background: {
      type: 'string'
    },
    widget_border: {
      type: 'string'
    },
    input_labels_placeholders: {
      type: 'string'
    },
    input_filled_text: {
      type: 'string'
    },
    input_border: {
      type: 'string'
    },
    input_background: {
      type: 'string'
    },
    icons: {
      type: 'string'
    },
    error: {
      type: 'string'
    },
    success: {
      type: 'string'
    },
    captcha_widget_theme: {
      type: 'string'
    }
  },
  required: [
    'primary_button',
    'primary_button_label',
    'secondary_button_border',
    'secondary_button_label',
    'read_only_background',
    'base_focus_color',
    'base_hover_color',
    'links_focused_components',
    'header',
    'body_text',
    'widget_background',
    'widget_border',
    'input_labels_placeholders',
    'input_filled_text',
    'input_border',
    'input_background',
    'icons',
    'error',
    'success',
    'captcha_widget_theme'
  ]
};

export type Colors = {
  primary_button: string;
  primary_button_label: string;
  secondary_button_border: string;
  secondary_button_label: string;
  read_only_background: string;
  base_focus_color: string;
  base_hover_color: string;
  links_focused_components: string;
  header: string;
  body_text: string;
  widget_background: string;
  widget_border: string;
  input_labels_placeholders: string;
  input_filled_text: string;
  input_border: string;
  input_background: string;
  icons: string;
  error: string;
  success: string;
  captcha_widget_theme: BinaryTheme;
};
export const Colors = (() => {
  function check_Colors(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.primary_button === 'string' &&
      typeof value.primary_button_label === 'string' &&
      typeof value.secondary_button_border === 'string' &&
      typeof value.secondary_button_label === 'string' &&
      typeof value.read_only_background === 'string' &&
      typeof value.base_focus_color === 'string' &&
      typeof value.base_hover_color === 'string' &&
      typeof value.links_focused_components === 'string' &&
      typeof value.header === 'string' &&
      typeof value.body_text === 'string' &&
      typeof value.widget_background === 'string' &&
      typeof value.widget_border === 'string' &&
      typeof value.input_labels_placeholders === 'string' &&
      typeof value.input_filled_text === 'string' &&
      typeof value.input_border === 'string' &&
      typeof value.input_background === 'string' &&
      typeof value.icons === 'string' &&
      typeof value.error === 'string' &&
      typeof value.success === 'string' &&
      typeof value.captcha_widget_theme === 'string'
    );
  }
  return function check(value: any): value is Colors {
    return check_Colors(value);
  };
})();
