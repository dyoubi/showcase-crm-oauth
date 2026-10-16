import type { InputHTMLAttributes, ReactElement } from "react";

export type InputOption<T extends HTMLInputElement = HTMLInputElement> =
	& InputHTMLAttributes<T>
	& { label?: string; errorHint?: string; };

export type Props = InputOption & { children?: ReactElement; };

export default function FormInput(props: Props) {
	return (
		<>
			<div>
				{props.label ?
					<label htmlFor="username">
						{props.label}
					</label> :
					<></>}
				<div>
					<input {...props} />
					{props.errorHint ?
						<p>{props.errorHint}</p> :
						<></>
					}
				</div>
			</div>
		</>
	);
}