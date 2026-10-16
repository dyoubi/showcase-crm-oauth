import { IUseCase } from "@egc-io/ckit-lib";

export type JwksRotationUseCaseIn = unknown;
export type JwksRotationUseCaseOut = unknown;
export class JwksRotationUseCase implements IUseCase<JwksRotationUseCaseIn, JwksRotationUseCaseOut> {
    constructor(...args: unknown[]) { }
    execute(input: JwksRotationUseCaseIn): JwksRotationUseCaseOut | Promise<JwksRotationUseCaseOut> { throw new Error("not implemented"); }
}
