import { injectable, IUseCase } from "@egc-io/ckit-lib";

export type ExtractScopeUseCaseIn = { scope: string; };
export type ExtractScopeUseCaseOut = string[];

@injectable()
export class ExtractScopeUseCase implements IUseCase<ExtractScopeUseCaseIn, ExtractScopeUseCaseOut> {
    execute(input: ExtractScopeUseCaseIn): ExtractScopeUseCaseOut {
        return input.scope
            .trim()
            .split(/,; /)
            .map(v => v.trim())
            .filter(Boolean);
    }
}
