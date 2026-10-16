// Types publics minimes
export type URNParts = { nid: string; nss: string; r?: string; q?: string; f?: string; };

export class URN implements URNParts {
	nid: string;
	nss: string;
	r: string;
	q: string;
	f: string;

	/**
	 * @example 
	 * new URN('urn:foo:bar')
	 * new URN('foo:bar')
	 */
	constructor(value: string);
	constructor(value: URN);
	/**
	 * @example
	 * new URN('foo', 'bar', "zef")
	 */
	constructor(nid: string | URN, ...namespace: string[]);
	constructor(a: string | URN, ...rest: string[]) {
		if (a instanceof URN) {
			this.nid = a.nid;
			this.nss = a.nss;
			this.r = a.r ?? '';
			this.q = a.q ?? '';
			this.f = a.f ?? '';
			return;
		}
		let s: string;
		if (rest.length === 0) {
			// new URN('urn:foo:bar') ou new URN('foo:bar')
			const v = a.startsWith('urn:') || a.startsWith('URN:') ? a : `urn:${a}`;
			s = URN.from(v); // normalise/valide
		} else {
			// new URN('foo', 'bar', 'zef')
			s = URN.from(a, ...rest);
		}
		const parts = URN.parse(s);
		// #parse lève déjà si invalide
		this.nid = parts.nid;
		this.nss = parts.nss;
		this.r = parts.r ?? '';
		this.q = parts.q ?? '';
		this.f = parts.f ?? '';
	}

	// ======================
	//      PUBLIC API
	// ======================

	static from(parts: URNParts): string;
	static from(value: string): string;
	static from(nid: string, ...namespace: string[]): string;
	static from(a: string | URNParts, ...rest: string[]): string {
		// 1) from(parts)
		if (typeof a === 'object') {
			const { nid, nss, r, q, f } = a;
			return URN.build({ nid, nss, r, q, f });
		}
		// 2) from('urn:...') ou from('nid:nss')
		if (rest.length === 0) {
			const v = a.startsWith('urn:') || a.startsWith('URN:') ? a : `urn:${a}`;
			const p = URN.parse(v);            // valide + normalise
			return URN.stringify(p);           // renvoie la forme normalisée
		}
		// 3) from(nid, ...namespace)
		const nid = a;
		const nss = rest.join(':');
		return URN.build({ nid, nss });
	}

	toString(): string { return URN.stringify({ nid: this.nid, nss: this.nss, r: this.r, q: this.q, f: this.f }); }
	toObject() { return { nid: this.nid, nss: this.nss, r: this.r, q: this.q, f: this.f }; }
	valueOf() { return this.toString(); }

	// ======================
	//   PRIVÉ / RFC 8141
	// ======================

	// NID 2..32, 1er alnum, puis alnum|-
	static readonly NID_RE = /^[A-Za-z0-9][A-Za-z0-9-]{1,31}$/;
	static readonly URN_RE = /^urn:(?<nid>[A-Za-z0-9][A-Za-z0-9-]{1,31}):(?<nss>[^?#]+?)(?:\?\+(?<r>[^#?]*))?(?:\?=(?<q>[^#]*))?(?:#(?<f>.*))?$/i;
	static readonly BAD_PCT = /%(?![0-9A-Fa-f]{2})/;

	// Caractères autorisés par composant
	static readonly CH_NSS = /[%A-Za-z0-9\-._~!$&'()*+,;=:@/]/;   // pchar + "/"
	static readonly CH_RQF = /[%A-Za-z0-9\-._~!$&'()*+,;=:@/?]/;   // pchar + "/" + "?"

	private static parse(input: string): Required<URNParts> {
		// tolérant sur la casse du schéma
		if (!/^urn:/i.test(input)) { throw new TypeError('Parse Error', { cause: 'Missing urn: scheme' }); }
		const m = input.match(this.URN_RE);
		if (!m || !m.groups) { throw new TypeError('Parse Error', { cause: 'URN does not match RFC 8141 grammar' }); }

		let nid = (m.groups.nid ?? '').toLowerCase();
		let nss = m.groups.nss ?? '';
		let r = m.groups.r ?? '';
		let q = m.groups.q ?? '';
		let f = m.groups.f ?? '';

		// NID
		if (nid.length < 2 || nid.length > 32 || !this.NID_RE.test(nid)) {
			throw new TypeError('Parse Error', { cause: 'Invalid NID (RFC 8141)' });
		}

		// NSS
		if (!nss.length) { throw new TypeError('Parse Error', { cause: 'Empty NSS' }); }
		if (this.BAD_PCT.test(nss) || !this.everyChar(nss, 'nss')) {
			throw new TypeError('Parse Error', { cause: 'Invalid characters in NSS' });
		}

		// r/q/f
		for (const [label, val] of [['r', r], ['q', q], ['f', f]] as const) {
			if (!val) { continue; };
			if (this.BAD_PCT.test(val) || !this.everyChar(val, 'rqf')) {
				throw new TypeError('Parse Error', { cause: `Invalid characters in ${label}-component` });
			}
		}

		// Normalisation (%hh → %HH)
		nss = this.normalizePct(nss);
		r = r ? this.normalizePct(r) : '';
		q = q ? this.normalizePct(q) : '';
		f = f ? this.normalizePct(f) : '';

		return { nid, nss, r, q, f };
	}

	private static stringify({ nid, nss, r, q, f }: URNParts): string {
		let s = `urn:${nid.toLowerCase()}:${nss}`;
		if (r) { s += `?+${r}`; }
		if (q) { s += `?=${q}`; }
		if (f) { s += `#${f}`; }
		return s;
	}

	private static build({ nid, nss, r, q, f }: URNParts): string {
		// Valide/encode chaque composant, puis revalide la forme globale
		if (nid.length < 2 || nid.length > 32 || !this.NID_RE.test(nid)) {
			throw new TypeError('Parse Error', { cause: 'Invalid NID (RFC 8141)' });
		}
		const nssEnc = this.encode(nss, 'nss');
		const rEnc = r ? this.encode(r, 'rqf') : '';
		const qEnc = q ? this.encode(q, 'rqf') : '';
		const fEnc = f ? this.encode(f, 'rqf') : '';

		const s = this.stringify({ nid: nid.toLowerCase(), nss: nssEnc, r: rEnc, q: qEnc, f: fEnc });
		// garde un filet de sécurité
		this.parse(s);
		return s;
	}

	private static everyChar(s: string, kind: 'nss' | 'rqf'): boolean {
		const CH = kind === 'nss' ? this.CH_NSS : this.CH_RQF;
		for (let i = 0; i < s.length; i++) {
			const ch = s[i]!;
			if (ch === '%') continue; // %xx validé ailleurs
			if (!CH.test(ch)) return false;
		}
		return true;
	}

	private static normalizePct(s: string): string {
		return s.replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
	}

	private static encode(s: string, kind: 'nss' | 'rqf'): string {
		const CH = kind === 'nss' ? this.CH_NSS : this.CH_RQF;
		let out = '';
		for (const ch of s) {
			if (ch === '%') { out += '%25'; continue; }                 // jamais laisser % brut
			if (CH.test(ch)) { out += ch; continue; }                   // caractère autorisé
			out += encodeURIComponent(ch).replace(/%[0-9a-f]{2}/g, m => m.toUpperCase());
		}
		return this.normalizePct(out);
	}
}