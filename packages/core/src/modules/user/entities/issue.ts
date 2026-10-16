import { IRepository } from "@egc-io/ckit-lib";
import { BusinessModel, Revokable } from "../../../common";

export enum IssueType {
	PASSWORD_RESET = 'password-reset',
	EMAIL_VALIDATION = 'email-validation',
}
export class UserIssue extends BusinessModel implements Revokable {
	org_id: string;
	user_id: string;
	type: IssueType;
	token: string;
	callback_url: string;
	issued_at: Date | null;
	expires_at: Date;
	revoked: boolean;
	revoked_at: Date | null;
}
export type PK_UserIssue = Pick<UserIssue, 'org_id' | 'user_id'>;
export type IUserIssueRepository = IRepository<UserIssue, PK_UserIssue>;
export const USER_ISSUE_REPOSITORY: symbol = Symbol('USER_ISSUE_REPOSITORY');