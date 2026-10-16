import { IUseCase } from "@egc-io/ckit-lib";

export type RevokeClientSigningKeyUseCaseIn = unknown;
export type RevokeClientSigningKeyUseCaseOut = unknown;
export class RevokeClientSigningKeyUseCase implements IUseCase<RevokeClientSigningKeyUseCaseIn, RevokeClientSigningKeyUseCaseOut> {
    constructor(...args: unknown[]) { }
    execute(input: RevokeClientSigningKeyUseCaseIn): RevokeClientSigningKeyUseCaseOut | Promise<RevokeClientSigningKeyUseCaseOut> { throw new Error("not implemented"); }
}
