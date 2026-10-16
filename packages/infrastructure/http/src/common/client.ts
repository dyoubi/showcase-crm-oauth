import { ClientOpts, ReqOptions, Res } from "./types";

export class HttpClient {
    constructor(protected readonly options: ClientOpts) { };
    protected async _invoke<T extends any>(
        endpoint: string,
        opts: ReqOptions
    ): Promise<Res<T>> {

        if (opts.args) {
            for (const k in opts.args) {
                const value: string =
                    typeof opts.args[k] === 'object' ? JSON.stringify(opts.args[k])
                        : String(opts.args);
                endpoint.replace(`:${k}`, value);
            }
        }
        const queryURL = new URL(`${this.options.host}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`);
        if (opts.params) {
            for (const k in opts.params.keys()) {
                queryURL.searchParams.set(k, opts.params.get(k) ?? '');
            }
        }
        const response = await fetch(
            queryURL,
            {
                method: opts.method,
                body: opts.body,
                headers: opts.headers,
                redirect: opts.redirect,
            }
        );
        const {
            headers,
            status,
            statusText,
            ok,
            redirected,
            url } = response;

        const res: Res<T> = {
            response,
            headers,
            status,
            statusText,
            ok,
            redirected,
            url,
            body: (await response.json()) as T
        };

        return res;
    }

}

export type OauthOpts = {
    endpoint: string;
    client_id: string;
    client_secret: string;
    scope: string | 'openid';
};

export type BasicAuth = {
    username: string;
    password: string;
};

export type Secure = object;


export type AuthenticationResult = {
    endpoint: string;
    options: ReqOptions,
};
export abstract class SecureHttpClient extends HttpClient {
    protected abstract _authenticate(endpoint: string, opts: ReqOptions): Promise<AuthenticationResult> | AuthenticationResult;

    protected override async _invoke<T extends unknown>(endpoint: string, opts: ReqOptions): Promise<Res<T>> {
        const options = await this._authenticate(endpoint, opts);
        return (await super._invoke<T>(options.endpoint, options.options));
    }

}