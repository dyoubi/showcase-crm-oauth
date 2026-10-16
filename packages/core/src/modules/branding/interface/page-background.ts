import { PageLayout } from "./types";

export const PageBackgroundSchema = {
  $id: 'PageBackgroundSchema',
  type: 'object',
  properties: {
    page_layout: {
      type: 'string'
    },
    background_color: {
      type: 'string'
    },
    background_image_url: {
      type: 'string'
    }
  },
  required: ['page_layout', 'background_color', 'background_image_url']
};

export type PageBackground = {
  page_layout: PageLayout;
  background_color: string;
  background_image_url: string;
};
export const PageBackground = (() => {
  function check_PageBackground(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.page_layout === 'string' &&
      typeof value.background_color === 'string' &&
      typeof value.background_image_url === 'string'
    );
  }
  return function check(value: any): value is PageBackground {
    return check_PageBackground(value);
  };
})();
