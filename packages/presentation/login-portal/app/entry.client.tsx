import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { hydrateI18n } from "./domain/i18n/store";
import { I18nProvider } from "./domain/i18n/provider";
import type { JSONObject } from "./domain/types";
import { hydrateTheme, ThemeProvider } from "./domain/theme";

declare global {
  interface Window {
    __BOOTSTRAP__?: {
      i18n?: JSONObject;
      theme?: JSONObject;
      locale?: string;
    };
  }
}

async function bootstrap() {
  if (!window.__BOOTSTRAP__) {
    throw new Error("Missing SSR i18n bootstrap");
  }

  const i18n = window.__BOOTSTRAP__?.i18n;
  const theme = window.__BOOTSTRAP__?.theme ?? {};
  const locale = document.documentElement.lang || 'en';
  const dir = document.documentElement.dir as 'ltr' | 'rtl' ?? "ltr";
  hydrateI18n({ locale, dir, i18n: i18n, ready: true, });
  hydrateTheme(theme);

  return { theme, locale, i18n, dir };

}

bootstrap().then((initial) => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nProvider>
          <ThemeProvider initial={initial.theme}>
            <HydratedRouter />
          </ThemeProvider>
        </I18nProvider>
      </StrictMode>,
    );
  });
});