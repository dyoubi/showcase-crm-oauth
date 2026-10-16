import { createContext, useCallback, useContext, useRef, useSyncExternalStore, type ReactNode } from "react";
import { THEME_STORE, type ThemeState } from "./store";

type ProviderProps = {
	initial?: Partial<ThemeState>;
	children: ReactNode;
};

export const DEFAULT_THEME: ThemeState = { json: {}, vars: {} };

export const ThemeContext = createContext<ThemeState>({});
export function useThemeContext() { return useContext(ThemeContext); }


export function ThemeProvider({ initial, children }: ProviderProps) {
	const serverSnapshotRef = useRef<ThemeState>({ ...DEFAULT_THEME, ...initial });
	if (!serverSnapshotRef.current) {
		serverSnapshotRef.current = { ...DEFAULT_THEME, ...initial };
	}

	const getServerSnapshot = useCallback(
		() => serverSnapshotRef.current as ThemeState,
		[]
	);
	const value = useSyncExternalStore(
		THEME_STORE.subscribe,
		THEME_STORE.getState,      // client snapshot
		getServerSnapshot         // server snapshot => pas de mismatch
	);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

type HeadProps = {
	nonce?: string;
};
export function ThemeHead({ nonce }: HeadProps) {
	const { vars = {}, json } = useThemeContext();

	// Google Fonts éventuelles depuis le JSON
	const fontUrl = (json?.fonts as any)?.font_url as string | undefined;

	// :root { --vars } généré côté serveur (via initial.vars)
	const css = `:root{${Object.entries(vars).map(([k, v]) => `${k}:${v};`).join("")}}`;
	return (
		<>
			{fontUrl && (
				<>
					<link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					<link rel="stylesheet" href={fontUrl} />
				</>
			)}
			<style id="org-theme-vars" nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
		</>
	);
}