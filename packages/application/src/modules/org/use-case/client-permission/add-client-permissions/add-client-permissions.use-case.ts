import { ConflictException, inject, injectable, IUseCase, SystemException, Where } from "@egc-io/ckit-lib";
import {
    CLIENT_PERMISSION_REPOSITORY, CLIENT_REPOSITORY,
    ClientPermission, IClientPermissionRepository, IClientRepository, Permission
} from "@ring-oauth/core";

export type AddClientPermissionsIn = {
    org_id: string;
    client_id: string;
    permissions: Pick<Permission, 'resource_server_identifier' | 'scope_value'>[],
};

export type AddClientPermissionsOut = ClientPermission[];

/**
 * Add a list of permission from client. Permissions must not exists before.
 * 
 * This use case can mix multiple resource servers at once.
 */
@injectable()
export class AddClientPermissions implements IUseCase<AddClientPermissionsIn> {

    constructor(
        @inject(CLIENT_REPOSITORY)
        private $clientRepo: IClientRepository,
        @inject(CLIENT_PERMISSION_REPOSITORY)
        private $clientPermsRepo: IClientPermissionRepository,
    ) { }

    /**
     * Throw an `ConflictException` if duplicate permission are found
     * @param input client scope with permissions list
     * @returns void
     */
    async execute(input: AddClientPermissionsIn): Promise<AddClientPermissionsOut> {
        let count: number;
        try {
            const where: Where<Permission>[] = input.permissions.map(perm => ({
                org_id: input.org_id,
                ...perm,
            }));
            count = await this.$clientPermsRepo.count({ where, });
        } catch (error) {
            throw new SystemException(`cannot verify entities ${error.message}`);
        }

        if (count > 0) {
            throw new ConflictException(`permission scope conflict`);
        }

        try {
            const promises = input.permissions.map(perm =>
                this.$clientPermsRepo.create(
                    Object.assign(new Permission(), {
                        org_id: input.org_id,
                        ...perm,
                        client_id: input.client_id,
                    })
                )
            );
            const clientPermissionList = await Promise.all(promises);
            return clientPermissionList;
        } catch (error) {
            throw new SystemException(`cannot create entities ${error.message}`);
        }
    }
}
