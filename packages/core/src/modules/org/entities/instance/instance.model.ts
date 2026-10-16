import { BusinessModel } from "../../../../common";

export class Instance extends BusinessModel {
	guid: string;
	org_id: string;
	name: string;
	tags: string[] = [];
}
export type NewInstance =
	& { name: string, tags?: string[]; }
	& Pick<Instance, 'org_id'>
	& { user: { email: string; username: string; password: string; name: string; }; };