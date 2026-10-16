import { CodeAuthorization, PK_CodeAuthorization } from "./code-authorization.model";

export interface ICodeAuthorizationTable {
	push(data: CodeAuthorization): Promise<void>;
	pull(pk: PK_CodeAuthorization): Promise<CodeAuthorization | null>;
	pop(pk: PK_CodeAuthorization): Promise<void>;
	has(pk: PK_CodeAuthorization): Promise<boolean>;
}
export const CODE_AUTHORIZATION_TABLE = Symbol('CODE_AUTHORIZATION_TABLE');

