// schema.ts
export const PermissionSchema = {
	$id: 'Permission',
	type: 'object',
	properties: {
		org_id: {
			type: 'string'
		},
		scope_value: {
			type: 'string'
		},
		resource_server_identifier: {
			type: 'string'
		}
	},
	required: ['org_id', 'scope_value', 'resource_server_identifier']
};

export type PermissionType = {
	org_id: string;
	scope_value: string;
	resource_server_identifier: string;
};
export const Permission = (() => {
	function check_Permission(value: any): boolean {
		return (
			typeof value === 'object' &&
			value !== null &&
			!Array.isArray(value) &&
			typeof value.org_id === 'string' &&
			typeof value.scope_value === 'string' &&
			typeof value.resource_server_identifier === 'string'
		);
	}
	return function check(value: any): value is PermissionType {
		return check_Permission(value);
	};
})();
