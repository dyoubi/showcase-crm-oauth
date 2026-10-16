import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { CodeVerification, EMAIL_TRANSPORT, ETemplateUsage, IEmailTransport, ITemplateRenderer, TEMPLATE_RENDERER, TicketChallenge, User } from "@ring-oauth/core";


export type ChallengeEmailUseCaseIn = {
    org_id: string,
    token: string,
    ticket: Pick<TicketChallenge,
        | 'tid'
        | 'jti'
        | 'expires'
        | 'secret'
    >;
    user: Pick<User,
        | 'email'
        | 'username'
        | 'name'
    >;
    form_uri: string;
};
export type ChallengeEmailUseCaseOut = unknown;

@injectable()
export class ChallengeEmailUseCase implements IUseCase<ChallengeEmailUseCaseIn, ChallengeEmailUseCaseOut> {
    constructor(
        @inject(TEMPLATE_RENDERER)
        private readonly $templates: ITemplateRenderer,
        @inject(EMAIL_TRANSPORT)
        private readonly $email: IEmailTransport,
    ) { }

    async execute(input: ChallengeEmailUseCaseIn): Promise<ChallengeEmailUseCaseOut> {
        const form_uri = new URL(input.form_uri);
        form_uri.searchParams.set('token', input.token);
        const html = await this.$templates.render(input.org_id, ETemplateUsage.CHANGE_PASSWORD_EMAIL_LINK, {
            email: input.user.email,
            username: input.user.username,
            name: input.user.name,
            reset_link: form_uri.toString(),
        });

        const messageID = await this.$email.emit({
            subject: 'Reset your password',
            from: {
                email: 'no-reply@ringoauth.egamingchain.io',
                name: 'Org Name'
            },
            to: [{
                email: input.user.email,
                name: input.user.name ?? undefined,
            }],
            body: { html, },
        });

        return;
    }
}
