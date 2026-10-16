import { injectable, IUseCase } from "@egc-io/ckit-lib";

export type PushClientSigningKeyUseCaseIn = unknown;
export type PushClientSigningKeyUseCaseOut = unknown;

@injectable()
export class PushClientSigningKeyUseCase implements IUseCase<PushClientSigningKeyUseCaseIn, PushClientSigningKeyUseCaseOut> {
    constructor(...args: unknown[]) { }
    async execute(input: PushClientSigningKeyUseCaseIn): Promise<PushClientSigningKeyUseCaseOut> {
        return;
    }
}
