import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import FormComponent from "~/component/form/form";
import { ENDPOINTS } from "~/domain/oauth/api";

type Data = {
	request_token?: string;
	login_hint?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const request_token = url.searchParams.get('request_token') || undefined;
	let login_hint = url.searchParams.get('login_hint') || undefined;
	return { request_token, login_hint } satisfies Data;
}

export default function PasswordForgot() {
	const { request_token, login_hint } = useLoaderData() as Data;
	return (
		<>
			<FormComponent
				id="forgot-password-form"
				method="POST"
				action={ENDPOINTS.confirmAccount}
				inputs={[
					{ name: 'email', type: 'email', id: 'email', label: '@email', required: true, value: login_hint },
					{ name: 'request_token', type: 'hidden', id: 'request_token', value: request_token },
				]}
				title="@forgotPasswordTitle"
				text="@promptPasswordResetText"
				buttonText="@actionConfirm"
				footerLink={{
					href: '/',
					text: '@homeRedirectMessage',
					linkText: '@homeRedirectLinkText',
				}}
			>
			</FormComponent>
		</>
	);
}