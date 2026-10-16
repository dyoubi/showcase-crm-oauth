import { injectable, IUseCase } from "@egc-io/ckit-lib";

export type UpdateHtmlTemplateUseCaseIn = unknown;
export type UpdateHtmlTemplateUseCaseOut = unknown;

@injectable()
export class UpdateHtmlTemplateUseCase implements IUseCase<UpdateHtmlTemplateUseCaseIn, UpdateHtmlTemplateUseCaseOut> {
    constructor() { }

    async execute(input: UpdateHtmlTemplateUseCaseIn): Promise<UpdateHtmlTemplateUseCaseOut> {
        return;
    }
}
