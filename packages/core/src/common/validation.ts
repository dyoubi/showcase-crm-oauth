
export type ValidationFunction<T> = (value: T) => boolean;

export namespace validators {
	export const REGEX_EMAIL: RegExp =
		/^(?:[a-zA-Z0-9!#$%&'*+=?^_`{|}~.-]+(?:\.[a-zA-Z0-9!#$%&'*+=?^_`{|}~.-]+)*)@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

	export function email(value: string) {
		return REGEX_EMAIL.test(value);
	}
	export namespace email {
		export function alias(value: string) {
			if (REGEX_EMAIL.test(value)) {
				return (value.split('@')[0].search('+') === 0);
			}
			return false;
		}
	}
}

export namespace formats {
	export namespace urn {
		export const NID_RE = /^[A-Za-z0-9][A-Za-z0-9-]*$/;
		export const URN_RE = /^urn:(?<nid>[a-z0-9][a-z0-9-]{1,31}):(?<nss>[^?#]+?)(?:\?\+(?<r>[^#?]*))?(?:\?=(?<q>[^#]*))?(?:#(?<f>.*))?$/i;
		export const PCHAR_RE = /^(?:%[0-9A-Fa-f]{2}|[A-Za-z0-9\-._~!$&'()*+,;=:@])+$/;
		export const NSS_RE = /^(?:%[0-9A-Fa-f]{2}|[A-Za-z0-9\-._~!$&'()*+,;=:@/])+$/;
		export const RQF_RE = /^(?:%[0-9A-Fa-f]{2}|[A-Za-z0-9\-._~!$&'()*+,;=:@/?])*$/;

		function hasBadPct(s: string): boolean { return (/%(?![0-9A-Fa-f]{2})/).test(s); };

		export function urn(nid: string, ...namespace: string[]) {
			if (!NID_RE.test(nid)) {
				throw new TypeError(`Parse Error`, { cause: `nid does not respect RFC-8141 format` });
			}
			const value = ['urn', nid, ...namespace].join(':');
			if (!value.match(URN_RE)) {
				throw new TypeError(`Parse Error`, { cause: `urn does not respect RFC-8141 format` });
			}
			return value;
		}
		export function parse(v: string) {
			const m = v.match(URN_RE);
			if (!m) return null;
			const { nid, nss, r = "", q = "", f = "" } = m.groups ?? {};

			// NID (RFC 8141)
			if (nid.length < 2 || nid.length > 32) { return null; }
			if (!NID_RE.test(nid)) { return null; }

			if (hasBadPct(nss) || !NSS_RE.test(nss)) { return null; }
			if (r && (hasBadPct(r) || !RQF_RE.test(r))) { return null; }
			if (q && (hasBadPct(q) || !RQF_RE.test(q))) { return null; }
			if (f && (hasBadPct(f) || !RQF_RE.test(f))) { return null; }

			return { nid, nss, r, q, f };
		}
	}
}