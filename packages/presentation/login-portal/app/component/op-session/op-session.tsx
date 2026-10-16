import * as React from 'react';
import { isSessionValid } from '~/domain/oauth/api';
import { getCookie } from '~/utils';

type Props = {
	action?: string;               // '/portal-session'
	expCookieName?: string;        // ex 'portal-session-exp'
	treatTokenAsJwt?: boolean;     // si 'portal-session' est un JWT
	hiddenFields?: Record<string, string | number | boolean | null | undefined>;
	onUpdated?: (hadCookieBefore: boolean) => void;
};

export function OpSessionForm({
	action = '/portal-session',
	expCookieName,
	treatTokenAsJwt,
	onUpdated,
}: Props) {
	const formRef = React.useRef<HTMLFormElement | null>(null);
	const hadBeforeRef = React.useRef<boolean>(false);
	const submittedRef = React.useRef<boolean>(false);

	React.useEffect(() => {
		hadBeforeRef.current = !!getCookie('ringoauth.portal-session');
		const ok = isSessionValid();
		if (!ok && formRef.current && !submittedRef.current) {
			submittedRef.current = true;
			if (typeof formRef.current.requestSubmit === 'function') formRef.current.requestSubmit();
			else formRef.current.submit();
		}
	}, [expCookieName, treatTokenAsJwt]);

	const onIframeLoad = React.useCallback(() => { onUpdated?.(hadBeforeRef.current); }, [onUpdated]);
	return (
		<>
			<iframe
				name="opSessionFrame"
				style={{ display: 'none' }}
				aria-hidden
				onLoad={onIframeLoad}
			/>
			<form
				ref={formRef}
				action={action}
				method="get"
				target="opSessionFrame"
				encType="application/x-www-form-urlencoded"
				style={{ display: 'none' }}
				aria-hidden
			>
			</form>
		</>
	);
}
