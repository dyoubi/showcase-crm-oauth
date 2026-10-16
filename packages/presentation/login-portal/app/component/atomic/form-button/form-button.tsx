import type { ButtonHTMLAttributes, ReactElement } from "react";


type ButtonProps = {
	text?: string;
	label?: string;
};

type Props =
	& ButtonHTMLAttributes<HTMLButtonElement>
	& { children?: ReactElement | string; }
	& ButtonProps;

export default function FormButton(props: Props) {
	return (
		<>
			<div /* className="form-button" */>
				{props?.label ?
					<label>{props.label}</label> :
					<></>}
				<div>
					<button {...props}>{props.text}</button>
				</div>
				{props.children}
			</div>
		</>
	);
}
