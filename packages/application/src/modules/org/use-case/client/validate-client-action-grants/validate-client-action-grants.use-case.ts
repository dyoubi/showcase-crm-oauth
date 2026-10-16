import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
    CLIENT_REPOSITORY, CONNECTION_REPO, IClientRepository,
    IConnectionRepository, PK_Connection, UserAction
} from "@ring-oauth/core";

export type ValidateClientActionGrantsUseCaseIn = {
    org_id: string;
    client_id: string;
    connection: string;
    action: UserAction;
};
export type ValidateClientActionGrantsUseCaseOut = boolean;

@injectable()
export class ValidateClientActionGrantsUseCase
    implements IUseCase<ValidateClientActionGrantsUseCaseIn, ValidateClientActionGrantsUseCaseOut> {
    constructor(
        @inject(CLIENT_REPOSITORY)
        private readonly $clientRepo: IClientRepository,
        @inject(CONNECTION_REPO)
        private readonly $conRepo: IConnectionRepository,
    ) { }

    async execute(input: ValidateClientActionGrantsUseCaseIn): Promise<ValidateClientActionGrantsUseCaseOut> {
        const pk_connection: PK_Connection = {
            org_id: input.org_id,
            client_id: input.client_id,
            database_identifier: input.connection,
        };

        const connection = await this.$conRepo.findOne({
            where: {
                ...pk_connection,
                enable: true,
            }
        });

        if (!connection) { return false; }

        return connection.allow_actions.includes(input.action);

    }
}
