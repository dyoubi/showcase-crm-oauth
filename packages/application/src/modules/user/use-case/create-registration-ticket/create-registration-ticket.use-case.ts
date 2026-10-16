import { inject, injectable, IUseCase, SystemException } from "@egc-io/ckit-lib";
import {
    CLIENT_REPOSITORY, CONNECTION_REPO, EJwkUse, EUserAction, IClientRepository,
    IConnectionRepository, IInstanceJwtPairRepository, INSTANCE_JWT_PAIR_REPOSITORY,
    ISSUER_URL_PROVIDER, IURLProvider, IUserRegistrationTicketTable, JSONObject, JwtSigner, LoginHint, seconds,
    URN,
    USER_REGISTRATION_TICKET_TABLE,
    UserRegistrationTicket
} from "@ring-oauth/core";
import { randomBytes } from "crypto";

export type CreateRegistrationTicketUseCaseIn = {
    org_id: string;
    client: { client_id: string; };
    connection: string;
    redirect_uri: string;
    login_hint?: LoginHint;
    metadata?: JSONObject;
};

export type CreateRegistrationTicketUseCaseOut = UserRegistrationTicket;

const signer = new JwtSigner();

@injectable()
export class CreateRegistrationTicketUseCase implements IUseCase<CreateRegistrationTicketUseCaseIn, CreateRegistrationTicketUseCaseOut> {
    constructor(
        @inject(CLIENT_REPOSITORY)
        private readonly $clients: IClientRepository,
        @inject(CONNECTION_REPO)
        private readonly $connection: IConnectionRepository,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $jwks: IInstanceJwtPairRepository,
        @inject(ISSUER_URL_PROVIDER)
        private readonly $issuer: IURLProvider,
        @inject(USER_REGISTRATION_TICKET_TABLE)
        private readonly $table: IUserRegistrationTicketTable,
    ) { }

    async execute(input: CreateRegistrationTicketUseCaseIn): Promise<CreateRegistrationTicketUseCaseOut> {
        const jwk = await this.$jwks.findOne({
            where: [
                {
                    use: EJwkUse.SIG,
                    revoked: false,
                },
            ]
        });

        if (!jwk) {
            throw new SystemException(`cannot provide sig key`);
        }
        const date = new Date();
        const issued_at = seconds(new Date());
        const expires = seconds(new Date(date.setHours(date.getHours() + 1)));

        const issuer = this.$issuer.get(input.org_id).toString();
        const jti = randomBytes(16).toString(('base64url'));
        const subject = new URN('org', input.org_id, 'client', input.client.client_id).toString();

        const jwt = await signer.sign({
            iss: issuer,
            aud: issuer,
            sub: subject,
            exp: expires,
            iat: issued_at,
            jti,
            connection: input.connection,
            client_id: input.client.client_id,
            action: EUserAction.REGISTER,
            login_hint: input.login_hint,
            metadata: input.metadata,
        }, jwk);

        const ticket: UserRegistrationTicket = {
            org_id: input.org_id,
            client_id: input.client.client_id,
            client_auth_method: 'client_secret_basic',
            connection: input.connection,
            login_hint: input.login_hint,
            redirect_uri: input.redirect_uri,
            expires,
            jti,
            jwt
        };

        await this.$table.push(ticket);

        return ticket;
    }
}
