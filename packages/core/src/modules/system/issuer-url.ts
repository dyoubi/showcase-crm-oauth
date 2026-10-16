export interface IURLProvider { get(...subdomain: string[]): URL; }

export const ISSUER_URL_PROVIDER = Symbol('ISSUER_URL_PROVIDER');