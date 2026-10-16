import { Form, redirect, type ActionFunctionArgs } from "react-router";
import FormButton from "~/component/atomic/form-button/form-button";
import FormInput from "~/component/atomic/form-input/form-input";
import { useText } from "~/domain/i18n";
import { ENDPOINTS } from "~/domain/oauth/api";
import { getConnections } from "~/domain/portal/api";
import siteMap from "~/site-map";
import { resolveUrl } from "~/utils";
import type { Route } from "./+types/sign-in";

interface Prefill {
	email?: string;
	username?: string;
	database?: string;
}

type Props = Route.ComponentProps & { prefill?: Prefill; };

export async function action({ request }: ActionFunctionArgs) {
	const form = await request.formData();
	const body = new URLSearchParams();

	for (const [k, v] of form.entries()) body.append(k, String(v));

	const url = resolveUrl(ENDPOINTS.signIn, 'http://org-ringtech.localhost:3000');
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
		credentials: "include",
		redirect: "manual",
	});

	if (res.status >= 300 && res.status < 400) {
		const location = res.headers.get("Location") ?? "/"; // fallback utile
		throw redirect(location);
	}

	if (res.ok) {
		throw redirect("/");
	}

	let message = "Une erreur est survenue.";
	try {
		const data = await res.clone().json();
		message = data?.message || data?.error || message;
	} catch {
		try { message = (await res.clone().text()) || message; } catch { }
	}

	return {
		status: res.status,
		error: message, fieldErrors: { email: null, password: null }
	};
}

export async function clientLoader(args: Route.LoaderArgs) {
	const url = new URL(args.request.url);
	const client_id = url.searchParams.get('client_id');
	const login_hint = url.searchParams.get('login_hint');
	const connection = url.searchParams.get('connection');
	const redirect_uri = url.searchParams.get('redirect_uri');
	const connectionList = await getConnections(client_id!);
	return { connectionList, client_id, login_hint, connection, redirect_uri };
}

export default function FormSignIn({ prefill, actionData, loaderData }: Props) {
	const text = useText();
	return (
		<>
			<div>
				<div>
					<h2>{text("signInPageTitle")}</h2>
				</div>
				<div>
					<Form method="post" encType="application/x-www-form-urlencoded" action="/sign-in">
						<FormInput
							id="email"
							name="email"
							type="email"
							label={text("email")}
							autoComplete="email"
							placeholder={text('emailInputPlaceholder')}
							value={prefill?.email}
							required
						/>
						<FormInput
							id="password"
							name="password"
							type="password"
							label={text('passwordInputLabel')}
							autoComplete="password"
							placeholder={text('passwordInputPlaceholder')}
							required
						/>
						<input hidden value={loaderData.client_id!} name="client_id" />
						<input hidden value={loaderData.redirect_uri!} name="redirect_uri" />
						<FormButton type="submit" text={text('signInSubmitLabel')} className="button-primary" />
					</Form>
					<p>
						{text("signUpPageRedirectMessage")}
						<a href={siteMap.pages.signUp}>
							{text("signUpPageRedirectLinkText")}
						</a>
					</p>
				</div>
			</div>
		</>
	);
}
