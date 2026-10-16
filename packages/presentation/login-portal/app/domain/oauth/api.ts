import { getCookie, resolveUrl } from "~/utils";

export type Credentials = { email: string; password: string; };
export const ENDPOINTS = {
	signIn: '/form/sign-in',
	signUp: '/form/sign-up',
	confirmAccount: '/form/confirm-account',
	resetPassword: '/form/reset-password',
} as const;

type Flow = keyof typeof ENDPOINTS;

export async function session() {
	if (typeof document === 'undefined') {
		throw new Error('postRedirect must be called in the browser');
	}
	const res = await fetch(resolveUrl('/oauth/portal-session'));
	let data: any = null;
	try { data = await res.json(); } catch { }

	if (!res.ok) {
		const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
		throw new Error(msg);
	}
	return data;
}

export function isSessionValid(): boolean { return !!getCookie('ringoauth.portal-session'); }
