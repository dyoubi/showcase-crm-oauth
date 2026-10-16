import {
    BadRequestException, ConflictException,
    inject, injectable,
    log,
    NotFoundException, SystemException,
    UnauthorizedException
} from "@egc-io/ckit-lib";
import {
    ECredentialType, EUserAction, IUserRepository, octets,
    User, USER_REPOSITORY, UserRegistration,
    UserRegistrationTicketRequest
} from "@ring-oauth/core";
import assert from "assert";
import { CreateRegistrationTicketUseCase, CreateUserUseCase } from "../use-case";
import { ValidateUserRegistrationTicketUseCase } from "../use-case/validate-user-registration-ticket/validate-user-registration-ticket.use-case";
import { ValidateClientActionGrantsUseCase } from "../../org";
import { ValidateRedirectUriUseCase } from "../../org";

@injectable()
export class UserService {
    constructor(
        @inject(USER_REPOSITORY)
        private $users: IUserRepository,
        @inject(CreateUserUseCase)
        private $createUser: CreateUserUseCase,
        @inject(ValidateClientActionGrantsUseCase)
        private readonly $validateAction: ValidateClientActionGrantsUseCase,
        @inject(ValidateRedirectUriUseCase)
        private readonly $validateRedirect: ValidateRedirectUriUseCase,
        @inject(CreateRegistrationTicketUseCase)
        private readonly $registrationTicket: CreateRegistrationTicketUseCase,
        @inject(ValidateUserRegistrationTicketUseCase)
        private readonly $validateRegistrationTicket: ValidateUserRegistrationTicketUseCase,
    ) { }


    async getIdentities(org_id: string, email: string): Promise<User[]> {
        const userList = await this.$users.find({ where: { org_id, email } });
        return userList;
    }

    async registrationTicket(
        org_id: string,
        request: UserRegistrationTicketRequest
    ) {
        log.trace(`registration metadata size ${octets(request.metadata)}o`);

        const canExecute = await this.$validateAction.execute({
            org_id,
            client_id: request.client_id,
            action: EUserAction.REGISTER,
            connection: request.connection,
        });

        if (!canExecute) { throw new UnauthorizedException(`unauthorized_action`); }

        const canRedirect = await this.$validateRedirect.execute({
            org_id,
            client_id: request.client_id,
            redirect_uri: request.redirect_uri
        });

        if (!canRedirect) { throw new UnauthorizedException(`unauthorized_redirection_uri`); }

        const ticket = await this.$registrationTicket.execute({
            org_id,
            client: { client_id: request.client_id },
            connection: request.connection,
            redirect_uri: request.redirect_uri,
            login_hint: request.login_hint ?? undefined,
            metadata: request.metadata ?? undefined,
        });

        return ticket;
    }

    async register(
        org_id: string,
        jti: string,
        user: UserRegistration,
    ): Promise<{ user: User, redirect_uri: string; }> {
        assert(UserRegistration(user), new BadRequestException(`invalid_request`));

        const ticket = await this.$validateRegistrationTicket.execute({
            org_id,
            jti,
        });

        if (typeof ticket === 'boolean') { throw new BadRequestException(`invalid_ticket`); }

        try {
            const newUser = await this.$createUser.execute({
                org_id,
                connection: ticket.connection,
                credentials: {
                    type: ECredentialType.PASSWORD,
                    value: user.password,
                },
                user: {
                    username: user.username,
                    email: user.email,
                    metadata: user.metadata,
                }
            });
            return {
                user: newUser,
                redirect_uri: ticket.redirect_uri,
            };
        } catch (error) {
            if (error instanceof TypeError ||
                error instanceof ReferenceError ||
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) { throw new BadRequestException(`invalid_request`); }

            throw new SystemException(`${error.message}`);
        }
    }
}