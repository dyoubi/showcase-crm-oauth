import { BadRequestException, injectable, IUseCase } from "@egc-io/ckit-lib";
import { Client, CodeChallenge, PKCEMethod } from "@ring-oauth/core";

export type PkceVerificationUseCaseIn = {
    client: Pick<Client, 'pkce_method' | 'use_pkce'>;
    code_challenge: string;
    code_verifier: string;
    pkce_method: PKCEMethod;
};
/**
 * Perform a PKCE verification
 */
@injectable()
export class PkceVerificationUseCase implements IUseCase<PkceVerificationUseCaseIn, boolean> {
    constructor() { }
    execute(input: PkceVerificationUseCaseIn): boolean {
        if (input.client.use_pkce === false || input.client.pkce_method !== input.pkce_method) {
            throw new BadRequestException(`pkce_verification_failure`);
        }
        return CodeChallenge({
            code_challenge: input.code_challenge,
            code_verifier: input.code_verifier,
            pkce_method: input.pkce_method,
        });
    }
}
