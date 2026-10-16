import { inject, injectable, IUseCase, SystemException, Where } from "@egc-io/ckit-lib";
import {
    CLIENT_REPOSITORY, IClientRepository,
    CLIENT_PERMISSION_REPOSITORY, IClientPermissionRepository,
    Permission
} from "@ring-oauth/core";

export type RemoveClientPermissionsIn = {
    org_id: string;
    client_id: string;
    permissions: Pick<Permission, 'resource_server_identifier' | 'scope_value'>[];
};
export type RemoveClientPermissionsOut = void;
/**
 * Delete a list of permission from client.
 * Unkown permission are skipped
 * 
 * This use case can mix multiple resource servers at once.
 */
@injectable()
export class RemoveClientPermissions
    implements IUseCase<RemoveClientPermissionsIn, RemoveClientPermissionsOut> {
    constructor(
        @inject(CLIENT_REPOSITORY)
        private $clientRepo: IClientRepository,
        @inject(CLIENT_PERMISSION_REPOSITORY)
        private $clientPermsRepo: IClientPermissionRepository,
    ) { }

    /**
     * @param input Client scope with a list of permission to delete
     */
    async execute(input: RemoveClientPermissionsIn): Promise<RemoveClientPermissionsOut> {
        const map: Record<string, string[]> = {};
        try {
            input.permissions.forEach(v => {
                if (map[v.resource_server_identifier]) {
                    map[v.resource_server_identifier].push(v.scope_value);
                } else { map[v.resource_server_identifier] = [v.scope_value]; }
            });

            const promseList: Promise<any>[] = Object.keys(map)
                .map(rs => this.$clientPermsRepo.delete({
                    org_id: input.org_id,
                    resource_server_identifier: map[rs],
                    scope_value: { inq: map[rs] },
                    client_id: input.client_id,
                }));

            await Promise.all(promseList);

        } catch (error) {
            throw new SystemException(`cannot verify entities ${error.message}`);
        }
    }

}
