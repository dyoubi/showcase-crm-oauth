import { Form, redirect, type ActionFunctionArgs } from "react-router";
import FormButton from "~/component/atomic/form-button/form-button";
import FormInput from "~/component/atomic/form-input/form-input";
import { useText } from "~/domain/i18n";
import { ENDPOINTS } from "~/domain/oauth/api";
import siteMap from "~/site-map";
import { resolveUrl } from "~/utils";
import type { Route } from "../+types/root";

type Props = Route.ComponentProps & {};

export async function action({ request }: ActionFunctionArgs) {
	const form = await request.formData();
	const body = new URLSearchParams();

	for (const [k, v] of form.entries()) body.append(k, String(v));

	const url = resolveUrl(ENDPOINTS.signUp, 'http://org-ringtech.localhost:3000');
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
	const hint_email = url.searchParams.get('hint_email');
	const hint_username = url.searchParams.get('hint_username');
	const ticket = url.searchParams.get('ticket');
	return { client_id, hint_email, hint_username, ticket };
}

export function HydrateFallback() {
	return <p>Loading Game...</p>;
}

export default function FormSignUpPage({ loaderData, actionData }: Props) {
	const text = useText();
	return (
		<>
			<div>
				<div>
					<h2>{text('signUpTitle')}</h2>
				</div>
				<div>
					<Form method="post" encType="application/x-www-form-urlencoded" action={siteMap.pages.signUp}>
						<FormInput
							id="email"
							name="email"
							type="email"
							label={text("email")}
							autoComplete="email"
							placeholder={text('emailInputPlaceholder')}
							defaultValue={loaderData?.hint_email}
							required
						/>
						<FormInput
							id="username"
							name="username"
							type="username"
							label={text('usernameInputLabel')}
							autoComplete="username"
							placeholder={text('usernameInputPlaceholder')}
							defaultValue={loaderData?.hint_username}
							required
						/>
						<FormInput
							id="password"
							name="password"
							type="password"
							label={text('passwordInputLabel')}
							autoComplete="new-password webauthn"
							placeholder={text('passwordInputPlaceholder')}
							required
						/>
						<FormInput
							id="confirm"
							name="confirm"
							type="password"
							autoComplete="new-password webauthn"
							label={text('passwordConfirmLabel')}
							placeholder={text('passwordConfirmPlaceholder')}
							required
						/>
						<div>
							<FormButton id="action-signup" type="submit" text={text('signUpSubmitLabel')} />
						</div>
						<input hidden id="ticket" name="ticket" value={loaderData?.ticket} readOnly />
					</Form>
					<p>
						{text("signInPageRedirectMessage")}{' '}
						<a href={siteMap.pages.signIn}>
							{text("signInPageRedirectLinkText")}
						</a>
					</p>
				</div>
			</div>
		</>
	);
}