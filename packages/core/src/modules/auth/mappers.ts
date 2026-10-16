import { formats } from "../../common";
import { Client, ResourceServer } from "../org";
import { User } from "../user";


export function ScopeToPermission(item: string) {
	const components = item.trim().split(/=/).map(v => v.trim());
	return components.length > 1 ?
		{ resource_server_identifier: components[0], scope_value: components[1], } :
		{ resource_server_identifier: '', scope_value: components[0], };
}

export function ScopeToPermissionList(scope: string) {
	return scope.trim()
		.split(/\s*;\s*|\s+/)
		.map(ScopeToPermission);
}

export function UserURN(usr: Pick<User, `org_id` | 'email'>) {
	return formats.urn.urn('org', usr.org_id.trim(), 'user', usr.email.trim());
}

export function ClientURN(client: Pick<Client, `org_id` | 'client_id'>) {
	return formats.urn.urn('org', client.org_id.trim(), 'client', client.client_id.trim());
}

export function AudienceURN(rs: Pick<ResourceServer, `org_id` | 'identifier'>) {
	return formats.urn.urn('org', rs.org_id.trim(), 'rs', rs.identifier.trim());
}