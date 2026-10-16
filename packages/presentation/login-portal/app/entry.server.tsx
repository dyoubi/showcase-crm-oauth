import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import { fetchI18n } from "./domain/i18n/api";
import { getLocaleHeader } from "./utils";
import { I18nProvider } from "./domain/i18n/provider";
import { fetchTheme, ThemeProvider } from "./domain/theme";
import { cssVarsStyleTag, themeJsonToCssVars, type ThemeFile } from "./domain/theme/transform";
import type { JSONObject } from "./domain/types";
import { pickThemeVariant } from "./domain/theme/select";

export const streamTimeout = 5_000;

// Petite sérialisation safe pour éviter l’injection de </script> et <
// (tu peux la factoriser ailleurs)
function safeSerialize(data: unknown) {
  return JSON.stringify(data)
    .replaceAll("<", "\\u003C")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
  // If you have middleware enabled:
  // loadContext: unstable_RouterContextProvider
) {
  const [i18n, theme] = await Promise.all([fetchI18n(), fetchTheme(),]);

  const { key: variantKey, json: themeJson } = pickThemeVariant(theme as ThemeFile, { prefer: "light", fallback: "default" });

  const vars = themeJsonToCssVars(themeJson);
  const styleTag = cssVarsStyleTag(vars, { id: 'org-theme-vars', /* nonce: cspNonce */ });

  const fontUrl = (theme?.fonts as JSONObject)?.font_url as string | undefined;
  const bootstrap = safeSerialize({
    i18n,
    theme: { json: themeJson, vars, styleTag },
    locale: getLocaleHeader()
  });
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    let readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000,
    );

    const { pipe, abort } = renderToPipeableStream(
      <I18nProvider initial={{ i18n }}>
        <ThemeProvider initial={{ json: themeJson, vars, styleTag, fontUrl }}>
          <ServerRouter context={routerContext} url={request.url} />
        </ThemeProvider>
      </I18nProvider>,
      {
        bootstrapScriptContent: `window.__BOOTSTRAP__=${bootstrap};`,
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              // Clear the timeout to prevent retaining the closure and memory leak
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          pipe(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );
  });
}
