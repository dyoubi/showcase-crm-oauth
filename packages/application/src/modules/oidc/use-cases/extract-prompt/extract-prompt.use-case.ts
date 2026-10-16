import { injectable, IUseCase } from "@egc-io/ckit-lib";

const PromptParameters: string[] = [
    'none',
    'login',
    'consent',
    'select_account',
] as const;

export type PromptField = typeof PromptParameters[number];

export type ExtractPromptUseCaseIn = {
    prompts?: string;
};
type ExtractPromptUseCaseOut = Record<PromptField, boolean | undefined>;

/**
 * Extract a prompt object from the prompt value
 */
@injectable()
export class ExtractPromptUseCase implements IUseCase<ExtractPromptUseCaseIn, ExtractPromptUseCaseOut> {
    execute(input: ExtractPromptUseCaseIn): ExtractPromptUseCaseOut {
        if (!input.prompts?.length) {
            return {};
        }
        const values = input.prompts.split(' ')
            .map(v => v.trim().toLowerCase())
            .filter(PromptParameters.includes);
        const prompt: Record<PromptField, boolean | undefined> = {};
        for (const v of values) { prompt[v] = true; }
        return prompt;
    }
}
