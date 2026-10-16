import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { IResourceServerRepository, RESOURCE_SERVER_REPO, ResourceServer } from "@ring-oauth/core";
import { errors } from "../../../../common/exception-helpers";

export type ExtractAudienceUseCaseIn = {
    org_id: string;
    audience: string | string[];
};
export type ExtractAudienceUseCaseOut = ResourceServer[];
/**
 * Extract resource list from the audience.
 * The audience input can be a string or an array of string
 */
@injectable()
export class ExtractAudienceUseCase implements IUseCase<ExtractAudienceUseCaseIn, ExtractAudienceUseCaseOut> {
    constructor(
        @inject(RESOURCE_SERVER_REPO)
        private readonly $rsRepo: IResourceServerRepository
    ) { }


    async execute(input: ExtractAudienceUseCaseIn): Promise<ExtractAudienceUseCaseOut> {
        let rsList: ResourceServer[] = [];
        const identifierList = (Array.isArray(input.audience) ? input.audience : input.audience
            .trim()
            .split(/[,; ]/))
            .map(v => v.trim());
        try {
            rsList = await this.$rsRepo.find({ where: { org_id: input.org_id, identifier: { inq: identifierList } } });
        } catch (error) {
            throw errors.datasource.exception('read', error.message);
        }
        return rsList;
    }
}
