import { ControlShape } from "./types";

export const BorderStyleSchema = {
  $id: 'BorderStyleSchema',
  type: 'object',
  properties: {
    weight: {
      type: 'number'
    },
    radius: {
      type: 'string'
    },
    shape: {
      type: 'string'
    }
  },
  required: ['weight', 'radius', 'shape']
};

export type BorderStyle = {
  weight: number;
  radius: string;
  shape: ControlShape;
};
export const BorderStyle = (() => {
  function check_BorderStyle(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Number.isFinite(value.weight) &&
      typeof value.radius === 'string' &&
      typeof value.shape === 'string'
    );
  }
  return function check(value: any): value is BorderStyle {
    return check_BorderStyle(value);
  };
})();
