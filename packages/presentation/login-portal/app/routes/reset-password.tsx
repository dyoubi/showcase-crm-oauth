import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import FormComponent from "~/component/form/form";
import { ENDPOINTS } from "~/domain/oauth/api";

type Data = { token: string; };

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	let token = url.searchParams.get('token') || '';
	return { token } satisfies Data;
}

export default function PasswordForgot() {
	const { token } = useLoaderData() as Data;
	return (
		<>
			<FormComponent
				id="reset-password-form"
				method="POST"
				action={ENDPOINTS.resetPassword}
				inputs={[
					{ name: 'password', type: 'password', id: 'password', label: '@promptPassword', required: true },
					{ name: 'password-confirm', type: 'password', id: 'password-confirm', label: '@promptPasswordConfirm', required: true },
					{ name: 'token', type: 'hidden', id: 'token', value: token },
				]}
				title="promptResetPasswordTitle"
				text="promptResetPasswordMessage"
				buttonText="@actionConfirm"
				footerLink={{ href: '/', linkText: '@homeLoginPageLabel' }}
			>
			</FormComponent>
		</>
	);
}