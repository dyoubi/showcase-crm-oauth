export type ThemeJson = {
	colors?: Record<string, string>;
	fonts?: {
		font_url?: string;
		reference_text_size?: string;
		title?: { bold?: string; size?: number | string; };
		subtitle?: { bold?: string; size?: number | string; };
		body_text?: { bold?: string; size?: number | string; };
		input_labels?: { bold?: string; size?: number | string; };
		links?: { bold?: string; size?: number | string; };
		links_style?: 'underline' | 'none';
		// font_family_base?: string;
	};
	borders?: {
		buttons?: { weight?: number | string; radius?: string; };
		inputs?: { weight?: number | string; radius?: string; };
		widget_corner_radius?: number | string;
		widget_border_weight?: number | string;
		show_widget_shadow?: number | boolean;
	};
	page_background?: { background_color?: string; };
	widget?: { logo_height?: number | string; };
};

export type ThemeVariantJson = ThemeJson;
export type ThemeFile = { [variant: string]: ThemeVariantJson; };

export type CssVars = Record<string, string>;

const px = (v?: number | string) =>
	v == null ? '' : (typeof v === 'number' ? `${v}px` : v);

export function themeJsonToCssVars(t: ThemeJson): CssVars {
	const vars: CssVars = {};
	const C = t.colors || {};
	const F = t.fonts || {};
	const B = t.borders || {};
	const PB = t.page_background || {};
	const W = t.widget || {};

	// Colors
	const mapColor = (k: string, v?: string) => { if (v) vars[`--color-${k}`] = v; };
	mapColor('primary-button', C.primary_button);
	mapColor('primary-button-label', C.primary_button_label);
	mapColor('secondary-button-border', C.secondary_button_border);
	mapColor('secondary-button-label', C.secondary_button_label);
	mapColor('read-only-background', C.read_only_background);
	mapColor('base-focus', C.base_focus_color);
	mapColor('base-hover', C.base_hover_color);
	mapColor('links-focused', C.links_focused_components);
	mapColor('header', C.header);
	mapColor('body-text', C.body_text);
	mapColor('widget-background', C.widget_background);
	mapColor('widget-border', C.widget_border);
	mapColor('input-labels', C.input_labels_placeholders);
	mapColor('input-text', C.input_filled_text);
	mapColor('input-border', C.input_border);
	mapColor('input-background', C.input_background);
	mapColor('icons', C.icons);
	mapColor('error', C.error);
	mapColor('success', C.success);

	if (PB.background_color) vars['--page-background-color'] = PB.background_color;

	// Fonts
	if (F.reference_text_size) vars['--font-size-reference'] = F.reference_text_size;
	// Families : si tu veux garder Inter par défaut :
	vars['--font-family-base'] = `'Inter', sans-serif`;

	const size = (v?: number | string) => v != null ? px(v) : undefined;
	const w = (v?: string | number) => (v != null ? String(v) : undefined);

	if (F.title) { if (size(F.title.size)) vars['--font-size-title'] = size(F.title.size)!; if (w(F.title.bold)) vars['--font-weight-title'] = w(F.title.bold)!; }
	if (F.subtitle) { if (size(F.subtitle.size)) vars['--font-size-subtitle'] = size(F.subtitle.size)!; if (w(F.subtitle.bold)) vars['--font-weight-subtitle'] = w(F.subtitle.bold)!; }
	if (F.body_text) { if (size(F.body_text.size)) vars['--font-size-body'] = size(F.body_text.size)!; if (w(F.body_text.bold)) vars['--font-weight-body'] = w(F.body_text.bold)!; }
	if (F.input_labels) { if (size(F.input_labels.size)) vars['--font-size-input-label'] = size(F.input_labels.size)!; if (w(F.input_labels.bold)) vars['--font-weight-input-label'] = w(F.input_labels.bold)!; }
	if (F.links) { if (size(F.links.size)) vars['--font-size-link'] = size(F.links.size)!; if (w(F.links.bold)) vars['--font-weight-link'] = w(F.links.bold)!; }
	if (F.links_style) vars['--font-link-decoration'] = F.links_style;

	// Borders
	if (B.buttons) {
		if (B.buttons.weight != null) vars['--button-border-weight'] = px(B.buttons.weight);
		if (B.buttons.radius) vars['--button-radius'] = B.buttons.radius;
	}
	if (B.inputs) {
		if (B.inputs.weight != null) vars['--input-border-weight'] = px(B.inputs.weight);
		if (B.inputs.radius) vars['--input-radius'] = B.inputs.radius;
	}
	if (B.widget_corner_radius != null) vars['--widget-radius'] = px(B.widget_corner_radius);
	if (B.widget_border_weight != null) vars['--widget-border-weight'] = px(B.widget_border_weight);

	const showShadow = (B.show_widget_shadow as any) ? true : false;
	vars['--widget-shadow'] = showShadow ? '0 4px 12px rgba(0,0,0,0.08)' : 'none';

	// Widget optional
	if (W.logo_height != null) vars['--widget-logo-height'] = px(W.logo_height);

	return vars;
}

export function cssVarsStyleTag(vars: CssVars, { scope = ':root', id = 'org-theme-vars', nonce }: { scope?: string; id?: string; nonce?: string; } = {}) {
	const body = Object.entries(vars).map(([k, v]) => `${k}:${v};`).join('');
	const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
	return `<style id="${id}"${nonceAttr}>${scope}{${body}}</style>`;
}
