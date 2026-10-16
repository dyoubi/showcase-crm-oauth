export type ThemeTokens = Record<string, string>; // ex: { '--color-bg': '#fff', '--radius': '8px' }

export type ThemeMode = 'css' | 'json';

export type ThemeState = {
	org?: string;
	mode?: ThemeMode;
	version?: string;      // ex: ETag ou hash
	cssUrl?: string;       // si mode === 'css'
	cssText?: string;      // facultatif si on inline
	tokens?: ThemeTokens;  // si mode === 'json'
	loadedAt?: number;     // Date.now()
	error?: string;
};

export const DEFAULT_THEME: ThemeState = { mode: 'json', tokens: {}, version: '0' };
