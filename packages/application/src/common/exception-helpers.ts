import { SystemException } from "@egc-io/ckit-lib";

export namespace errors {
	export namespace datasource {
		export enum EAction {
			WRITE = 'write',
			READ = 'read',
		}
		export type Action = `${EAction}` | EAction;
		export function exception(action: Action, resource: string, original?: Error) {
			const msg = String(`cannot perfom ${action} action on ${resource}`)
				.concat(original ? `. reason : ${original.message}` : '');
			return new SystemException(msg, 'datasource', 500, { crud: action, resource }, original);
		}
	}
}