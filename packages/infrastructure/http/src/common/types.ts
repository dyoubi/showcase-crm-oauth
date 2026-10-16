export type ClientOpts = {
    host: string;
};

export type ReqOptions = Pick<RequestInit,
    | 'headers'
    | 'body'
    | 'redirect'
> & {
    args?: Record<string, any>;
    params?: URLSearchParams;
} & {method:string};

export type HttpHeader = Headers;

export type Res<T extends any> = {
    response: Response,
    headers: HttpHeader;
    status: number;
    statusText: string;
    ok: boolean;
    redirected?: boolean;
    url: string;
    body: T;
};
