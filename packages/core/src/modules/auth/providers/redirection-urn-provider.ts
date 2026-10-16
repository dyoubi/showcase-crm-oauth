import { URN } from "../../../common/urn";

export type RedirectionNS = {
	org_id: string,
	client_id: string;
	jti: string;
};

type NsTuple = [string, "client", string, "redirect", string];

export class RedirectionURNProvider {
	encode(ns: RedirectionNS) {
		return new URN(
			`org`, ns.org_id,
			'client', ns.client_id,
			'redirect', ns.jti
		);
	}
	decode(value: string | URN): RedirectionNS {
		let urn: URN = new URN(value);
		const components = urn.nss.split(':', 5);
		if (components.length !== 5) {
			throw new TypeError(`invalid nss format, component size must be ${5} (length === ${components.length})`);
		}
		const [org_id, nsclient, client_id, nsredirect, jti] = components as NsTuple;
		return { org_id, client_id, jti, };
	}

}