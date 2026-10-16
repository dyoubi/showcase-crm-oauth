import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { Client, CLIENT_REPOSITORY, IClientRepository } from "@ring-oauth/core";
import assert from "assert";

export type ValidateRedirectUriUseCaseIn = {
    org_id: string;
    client_id: string;
    redirect_uri: string;
};

export type ValidateRedirectUriUseCaseOut = boolean;

@injectable()
export class ValidateRedirectUriUseCase
    implements IUseCase<ValidateRedirectUriUseCaseIn, ValidateRedirectUriUseCaseOut> {

    constructor(
        @inject(CLIENT_REPOSITORY)
        private readonly $clientRepo: IClientRepository,
    ) { }

    async execute(input: ValidateRedirectUriUseCaseIn): Promise<ValidateRedirectUriUseCaseOut> {
        assert(URL.canParse(input.redirect_uri), new SyntaxError(`invalid_url`));

        let client: Client;

        const pk = {
            org_id: input.org_id,
            client_id: input.client_id,
        };

        client = await this.$clientRepo.findById(pk);

        const uriList = client.allowed_callback_urls
            .map(v => new URL(v).toString());

        return uriList.includes(new URL(input.redirect_uri).toString());
    }
}
