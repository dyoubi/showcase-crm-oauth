export interface IHostnameProvider { get(): URL; }
export const HOSTNAME_PROVIDER: symbol = Symbol("HOSTNAME_PROVIDER");
