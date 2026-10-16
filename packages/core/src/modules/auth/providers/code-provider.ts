import { RandomAlphaNumID, HashID } from "../../../common";

export interface IAuthorizationCodeProvider {
	get(input: { org_id: string, client_id: string, grant_id: string; }): string | Promise<string>;
}
export const AUTHORIZATION_CODE_PROVIDER = Symbol('AUTHORIZATION_CODE_PROVIDER');
export class DefaultCodeProvider implements IAuthorizationCodeProvider {
	get(input: { org_id: string; client_id: string; grant_id: string; }): string {
		return HashID(`${input.org_id}:${input.client_id}:${input.grant_id}:${RandomAlphaNumID(8)}`);
	}
}