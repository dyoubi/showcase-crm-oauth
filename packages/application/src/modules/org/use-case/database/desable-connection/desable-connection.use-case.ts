import { inject, injectable, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import { CONNECTION_REPO, IConnectionRepository, PK_Connection } from "@ring-oauth/core";

export type DesableConnectionIn = {
    org_id: string;
    connection: Omit<PK_Connection, 'org_id'>;
};
export type DesableConnectionOut = void;

@injectable()
export class DesableConnection implements IUseCase<DesableConnectionIn, DesableConnectionOut> {
    constructor(
        @inject(CONNECTION_REPO)
        private connRepo: IConnectionRepository,
    ) { }

    async execute(input: DesableConnectionIn): Promise<DesableConnectionOut> {
        let num: number = 0;
        const pk: PK_Connection = { ...input.connection, org_id: input.org_id };
        try {
            num = await this.connRepo.count({ where: pk });
        } catch (error) {
            throw new SystemException(`cannot verify connection ${error.message}`);
        }

        if (num < 1) {
            throw new NotFoundException(`connection not found`);
        }

        try {
            await this.connRepo.updateById(pk, { enable: false, updated_at: new Date() });
        } catch (error) {
            throw new SystemException(`cannot update connection ${error.message}`);
        }

        // @TODO : revoke all access token for the connection
    }
}
