import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { CLIENT_REPOSITORY, IClientRepository } from "@ring-oauth/core";

export type ValidateClientCredentialsUseCaseIn = {
    org_id: string;
    credentials: {
        client_id: string;
        client_secret: string;
    };
};

/**
 * Perform a use credential verification
 */
@injectable()
export class ValidateClientCredentialsUseCase
    implements IUseCase<ValidateClientCredentialsUseCaseIn, boolean> {
    constructor(
        @inject(CLIENT_REPOSITORY)
        private $clients: IClientRepository
    ) { }

    async execute(input: ValidateClientCredentialsUseCaseIn): Promise<boolean> {
        const client = await this.$clients.findById({ org_id: input.org_id, client_id: input.credentials.client_id });
        return (client.secret === input.credentials.client_secret);
    }
}
