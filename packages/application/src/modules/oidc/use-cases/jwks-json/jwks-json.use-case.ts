import { inject, injectable, IUseCase, NotFoundException } from "@egc-io/ckit-lib";
import {
    INSTANCE_JWT_PAIR_REPOSITORY, IInstanceJwtPairRepository, INSTANCE_REPOSITORY, IInstanceRepository,
    EJwkUse, Instance, InstanceJwtPair, PublicKeyFileds, PublicKeyFieldsList
} from "@ring-oauth/core";
import { JsonWebKey } from "crypto";

export type JwksJsonUseCaseIn = {
    org_id: string;
};
export type JwksJsonUseCaseOut = {
    keys: JsonWebKey[];
};

@injectable()
export class JwksJsonUseCase implements IUseCase<JwksJsonUseCaseIn, JwksJsonUseCaseOut> {
    constructor(
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $jwks: IInstanceJwtPairRepository,
        @inject(INSTANCE_REPOSITORY)
        private readonly $orgs: IInstanceRepository
    ) { }

    async execute(input: JwksJsonUseCaseIn): Promise<JwksJsonUseCaseOut> {

        let org: Instance | null;
        org = await this.$orgs.findOne({ where: { org_id: input.org_id } });


        if (!org) { throw new NotFoundException(`instance not found`); }

        let pairs: Pick<InstanceJwtPair, PublicKeyFileds>[];
        pairs = await this.$jwks.find({
            where: {
                org_id: input.org_id,
                revoked: false,
            },
            fields: [...PublicKeyFieldsList],
            sort: { kty: 'ASC', alg: 'ASC', use: 'ASC', }
        });

        return {
            keys: pairs.map(sig => ({
                ...sig.pub,
                kid: sig.kid,
                alg: sig.alg,
                exp: sig.expires_at,
            })),
        };
    }
}
