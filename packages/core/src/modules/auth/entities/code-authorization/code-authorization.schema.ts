import { Type } from "@sinclair/typebox";
import { TypeCompiler } from '@sinclair/typebox/compiler';

export const CodeRequestSchema = Type.Object({
	client_id: Type.String({ readOnly: true }),
	audience: Type.String({ readOnly: true }),
	scope: Type.String({ readOnly: true }),
	prompts: Type.Optional(
		Type.String()
	),
	connection: Type.Optional(
		Type.String()
	),
	redirect_uri: Type.Optional(
		Type.String()
	),
	pkce_method: Type.Optional(
		Type.String()
	),
	code_challenge: Type.Optional(
		Type.String()
	),
	state: Type.Optional(
		Type.String()
	),
	nonce: Type.Optional(
		Type.String()
	),
});

const CodeRequestSchemaCheck = TypeCompiler.Compile(CodeRequestSchema);
export function IsCodeRequest(value: any): boolean { return CodeRequestSchemaCheck.Check(value); }