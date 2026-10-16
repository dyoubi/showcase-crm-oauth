export const Elements = [
	'button',
	'header',
	'input',
	'label',
	'text',
	'title',
	'error',
	'success',
] as const;

export const ColorFamily = [
	'icons',
	'error',
	'success',
	'text',
	'link',
	'label',
	'background',
] as const;

export const Styling = [
	'border',
	'padding',
	'margin',
	'radius',
	'height',
	'width',
	'size',
	'box-shadow',
] as const;

export type CSSElement = typeof Elements[number];
export type CSSVarName = `--${Lowercase<string>}`;
export type CSSVarsDict = Record<CSSVarName, string>;