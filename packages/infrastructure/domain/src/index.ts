import { inject, injectable, ModuleDefinition } from '@egc-io/ckit-lib';
import { ISSUER_URL_PROVIDER, HOSTNAME_PROVIDER, IURLProvider, IHostnameProvider } from '@ring-oauth/core';
import { hostname } from 'os';

function getHostname() {
	return process.env.PUBLIC_DOMAIN ? String(process.env.PUBLIC_DOMAIN) : hostname();
}

export const HOSTNAME_OVERRIDE = Symbol('HOSTNAME_OVERRIDE');

@injectable({ token: HOSTNAME_PROVIDER })
export class HostnameProvider implements IHostnameProvider {
	private $hostname: URL;
	constructor(
		@inject(HOSTNAME_OVERRIDE, { isOptional: true })
		publicHostname?: string
	) {

		if (publicHostname) {
			if (URL.canParse(publicHostname)) {
				this.$hostname = new URL(publicHostname);
			}
		} else {
			const hostname = getHostname();
			if (URL.canParse(hostname)) { this.$hostname = new URL(hostname); }
			else { this.$hostname = new URL(`http://${hostname}`); }
		}
	}
	get(): URL { return this.$hostname; }
}

@injectable({ token: ISSUER_URL_PROVIDER })
export class URLProvider implements IURLProvider {
	private $hostname: URL;
	constructor(
		@inject(HOSTNAME_PROVIDER, { isOptional: true })
		provider?: IHostnameProvider
	) {
		this.$hostname = provider ? provider.get() : (new HostnameProvider(getHostname())).get();
	}
	get(...subdomain: string[]): URL {
		const url = new URL(this.$hostname);
		url.hostname = `${subdomain.join('.')}.${url.hostname}`;
		return url;
	}
}

export const DomainModule: ModuleDefinition = {
	exports: [
		{
			key: HOSTNAME_PROVIDER,
			value: HostnameProvider,
		},
		{
			key: ISSUER_URL_PROVIDER,
			value: URLProvider,
		}
	]
};