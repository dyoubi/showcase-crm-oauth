import React, { useMemo, useState } from "react";
import FormButton from "../atomic/form-button/form-button";
import FormInput, { type InputOption } from "../atomic/form-input/form-input";

interface Params {
	id: string;
	action: string;
	method: string;
	inputs: InputOption[];
	title: string;
	text?: string;
	footerLink?: {
		href: string;
		text?: string;
		linkText: string;
	};
	buttonText: string;
}

type Props = Params & { children?: React.ReactNode; };

export default function FormComponent({ id, action, method, inputs, title, text, footerLink, buttonText, children, }: Props) {
	const [submitting, setSubmitting] = useState(false);
	const computedInputs = useMemo(() => {
		return inputs.map((i) => {
			const key = i.id ?? i.name;
			const htmlId = i.id ? `${i.id}-${i.name}` : i.name;
			return { ...i, _key: key, _htmlId: htmlId };
		});
	}, [inputs]);
	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => { setSubmitting(true); };
	return (
		<div>
			<div><h2>{title}</h2></div>
			{text ? (<p>{text}</p>) : null}
			<div>
				<form
					id={id}
					action={action}
					method={method}
					onSubmit={handleSubmit}
				>
					{computedInputs.map((i) => {
						if (i.type === "hidden") {
							return (
								<input
									key={i._key}
									type="hidden"
									name={i.name}
									value={i.defaultValue ?? (i as any).value ?? ""}
								/>
							);
						}
						return (
							<FormInput
								key={i._key}
								id={i._htmlId}
								label={i.label}
								value={(i as any).value}
								defaultValue={i.defaultValue}
								name={i.name}
								type={i.type}
								autoComplete={i.autoComplete}
								required={i.required}
							/>
						);
					})}
					{children}
					<div>
						<FormButton
							id={`${id}-submit`}
							type="submit"
							disabled={submitting}
						>{submitting ? "…" : buttonText}</FormButton>
					</div>
				</form>
				<p>
					{footerLink ? (<>{footerLink.text ?? ""}{" "}<a href={footerLink.href}>{footerLink.linkText}</a></>) : null}
				</p>
			</div>
		</div>
	);
};