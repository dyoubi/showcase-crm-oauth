import { BorderStyle } from "./border-style";

export const BordersSchema = {
  $id: 'BordersSchema',
  type: 'object',
  properties: {
    buttons: {
      type: 'object',
      properties: {}
    },
    inputs: {
      type: 'object',
      properties: {}
    },
    widget_corner_radius: {
      type: 'number'
    },
    widget_border_weight: {
      type: 'number'
    },
    show_widget_shadow: {
      anyOf: [
        {
          type: 'number'
        },
        {
          type: 'null'
        }
      ]
    }
  },
  required: [
    'buttons',
    'inputs',
    'widget_corner_radius',
    'widget_border_weight'
  ]
};

export type Borders = {
  buttons: BorderStyle;
  inputs: BorderStyle;
  widget_corner_radius: number;
  widget_border_weight: number;
  show_widget_shadow?: number | null;
};
export const Borders = (() => {
  function check_Borders(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      BorderStyle(value.buttons) &&
      BorderStyle(value.inputs) &&
      Number.isFinite(value.widget_corner_radius) &&
      Number.isFinite(value.widget_border_weight) &&
      (value.show_widget_shadow !== undefined
        ? Number.isFinite(value.show_widget_shadow) ||
        value.show_widget_shadow === null
        : true)
    );
  }
  return function check(value: any): value is Borders {
    return check_Borders(value);
  };
})();
