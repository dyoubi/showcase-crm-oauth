import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import FormComponent from "~/component/form/form";
import { ENDPOINTS } from "~/domain/oauth/api";
import { ErrorBoundary } from "~/root";

type Data = { usage?: string; login_hint?: string; };

const DEFAULT_TICKET_USAGE = 'password-reset';

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const usage = url.searchParams.get('usage') || DEFAULT_TICKET_USAGE;
	let login_hint = url.searchParams.get('login_hint') || undefined;
	return { usage, login_hint } satisfies Data;
}

export default function ConfirmAccountForm() {
	const { usage, login_hint } = useLoaderData() as Data;
	return (
		<>
			<ErrorBoundary params={{}} error={undefined} />
			<FormComponent
				id="confirm-account-form"
				method="POST"
				action={ENDPOINTS.confirmAccount}
				inputs={[
					{ name: 'email', type: 'email', id: 'email', label: '@promptEmail', required: true, placeHolder: '@promptEmailPlaceHolder', value: login_hint },
					{ name: 'usage', type: 'hidden', id: 'usage', value: usage ?? DEFAULT_TICKET_USAGE },
				]}
				title="@promptAccountConfirm"
				text="@promptEmailMessage"
				buttonText="@actionConfirm"
			>
			</FormComponent>
		</>
	);
}