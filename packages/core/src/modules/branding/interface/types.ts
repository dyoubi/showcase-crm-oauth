
export enum EBinaryTheme {
	Light = "light",
	Dark = "dark",
}
export type BinaryTheme = `${EBinaryTheme}` | EBinaryTheme;

export enum ELinksStyle {
	Normal = "normal",
	Underline = "underline",
	Italic = "italic",
}
export type LinksStyle = `${ELinksStyle}` | ELinksStyle;

export enum EHorizontalAlign {
	Left = "left",
	Center = "center",
	Right = "right",
}
export type HorizontalAlign = `${EHorizontalAlign}` | EHorizontalAlign;

export type LogoPosition = HorizontalAlign;
export type HeaderTextAlignment = HorizontalAlign;
export type PageLayout = HorizontalAlign;

export enum ESocialButtonsLayout {
	Top = "top",
	Bottom = "bottom",
}
export type SocialButtonsLayout = `${ESocialButtonsLayout}` | ESocialButtonsLayout;

export enum EControlShape {
	Rounded = "rounded",
	Square = "square",
	Pill = "pill",
}
export type ControlShape = `${EControlShape}` | EControlShape;
