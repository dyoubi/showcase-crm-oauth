import { BadRequestException, inject, injectable, log, SystemException } from "@egc-io/ckit-lib";

import {
	APP_SESSION_TABLE,
	Client,
	CLIENT_REPOSITORY,
	ClientURN,
	CODE_AUTHORIZATION_TABLE,
	CodeAuthorization, coercePermissions,
	CredentialType, EAccessGrantType, ECodeAuthorizationStatus, ECredentialType, EGrantSessionStatus,
	EPKCEMethod,
	GRANT_SESSION_STORE,
	IAppSessionTable,
	IClientRepository, ICodeAuthorizationTable, IGrantSessionStore,
	IResourceServerRepository,
	IUserRepository,
	LoginSession,
	RESOURCE_SERVER_REPO,
	ResourceServer,
	TokenRequestClientCredentials, TokenRequestCode,
	TokenRequestRefreshToken,
	TokenRequestUserCredentials,
	User,
	USER_REPOSITORY,
	UserURN,
} from "@ring-oauth/core";
import { AuthenticateUserCredentialsUseCase } from "../../user";
import {
	ActualiseLoginSessionUseCase,
	AuthDetailsItem,
	ExtractPermissionListUseCase,
	GenerateAccessTokenUseCase,
	PkceVerificationUseCase,
	RefreshTokenUseCase,
	ValidateClientCredentialsUseCase,
} from "../use-cases";
import { GetLoginSessionUseCase } from "../use-cases/get-login-session/get-login-session.use-case";

@injectable()
export class TokenRequestService {
	constructor(
		@inject(ValidateClientCredentialsUseCase)
		private readonly $secrets: ValidateClientCredentialsUseCase,
		@inject(PkceVerificationUseCase)
		private readonly $pkce: PkceVerificationUseCase,
		@inject(ExtractPermissionListUseCase)
		private readonly $extractPermList: ExtractPermissionListUseCase,
		@inject(AuthenticateUserCredentialsUseCase)
		private $userCredentials: AuthenticateUserCredentialsUseCase,
		@inject(GenerateAccessTokenUseCase)
		private readonly $genToken: GenerateAccessTokenUseCase,
		@inject(RefreshTokenUseCase)
		private readonly $refreshToken: RefreshTokenUseCase,
		@inject(GetLoginSessionUseCase)
		private readonly $session: GetLoginSessionUseCase,
		@inject(ActualiseLoginSessionUseCase)
		private readonly $actualise: ActualiseLoginSessionUseCase,
		@inject(RESOURCE_SERVER_REPO)
		private $rs: IResourceServerRepository,
		@inject(CLIENT_REPOSITORY)
		private readonly $clients: IClientRepository,
		@inject(USER_REPOSITORY)
		private readonly $users: IUserRepository,
		@inject(CODE_AUTHORIZATION_TABLE)
		private readonly $codes: ICodeAuthorizationTable,
		@inject(GRANT_SESSION_STORE)
		private readonly $grants: IGrantSessionStore,
	) { }

	async codeRequest(org_id: string, request: TokenRequestCode) {
		// validate request parameters
		if (request.grant_type !== EAccessGrantType.AUTHORIZATION_CODE) {
			throw new BadRequestException(`invalid_request`);
		}

		/**
		 * @TODO make a correct audience parsing
		 */
		let rs: ResourceServer | null = null;
		await this.$rs.findById({ org_id, identifier: request.audience.trim() });
		try {
			rs = await this.$rs.findById({ org_id, identifier: request.audience });
		} catch (error) {
			throw new BadRequestException(`invalid_audience`);
		}

		if (!rs) {
			log.error(`resource server ${request.audience} does not exists`);
			throw new BadRequestException(`invalid_audience`);
		}

		let client: Client | null = null;
		client = await this.$clients.findById({ org_id, client_id: request.client_id });

		if (!client) {
			log.error(`client ${request.client_id} does not exists`);
			throw new BadRequestException(`unauthorized_client`);
		}

		// validate client credential
		let isValid = await this.$secrets.execute({
			org_id,
			credentials: {
				client_id: client.client_id,
				client_secret: request.client_secret
			}
		});
		if (!isValid) {
			log.error(`client ${client.client_id} secret verification failure`);
			throw new BadRequestException(`unauthorized_client`);
		}

		const pk_code = {
			org_id,
			client_id: request.client_id,
			code: request.code,
		};
		let code_authorization: CodeAuthorization | null = await this.$codes.pull(pk_code);

		if (!code_authorization) {
			log.error(`client ${request.client_id} use uknown code (code => ${request.code})`);
			throw new BadRequestException(`unauthorized_client`);
		}

		if (code_authorization.status !== ECodeAuthorizationStatus.PENDING) {
			log.error(`client ${request.client_id} invalid code_authorization status (code_authorization.status => ${code_authorization.status})`);
			throw new BadRequestException(`unauthorized_client`);
		}

		let grant_session = await this.$grants.pull({
			org_id,
			client_id: client.client_id,
			grant_id: code_authorization.grant_id,
		});

		if (!grant_session) {
			log.error(`client ${request.client_id} uknown grant session for code ${request.code}`);
			throw new BadRequestException(`unauthorized_client`);
		}

		if (grant_session.status !== EGrantSessionStatus.PENDING) {
			console.error(`grant session ${grant_session.grant_id} closed (status => ${grant_session.status})`);
			throw new BadRequestException(`unauthorized_client`);
		}

		const request_scope = coercePermissions((request.scope || '')
			.trim().split(/[;, ]/)).map(v => v.trim()).join(' ');
		const grant_scope = grant_session.scope.join(' ');
		if (grant_scope !== request_scope) {
			log.error(`request_scope does not match grant_scope (${request_scope} != ${grant_scope})`);
			throw new BadRequestException(`unauthorized_client`);
		}

		// pkce verifiaction
		if (grant_session.code_challenge) {
			if (!request.code_verifier) {
				log.error(`missing code_verifier ${JSON.stringify(request)}`);
				throw new BadRequestException(`invalid_request`);
			}

			if (!grant_session.pkce_method) {
				log.error(`pkce method missmatch ${JSON.stringify(request)}`);
				throw new BadRequestException(`pkce_method_missmatch`);
			}

			const challenge = await this.$pkce.execute({
				client,
				code_challenge: grant_session.code_challenge,
				code_verifier: request.code_verifier,
				pkce_method: grant_session.pkce_method,
			});

			if (!challenge) {
				log.error(`client ${client.client_id} pkce challenge failed (code => ${request.code}, method => ${''})`);
				throw new BadRequestException(`unauthorized_client`);
			}

		} else if (!grant_session.code_challenge && request.code_verifier) {
			log.error(`pkce parameter missmatch (grant_session => {${grant_session.pkce_method}, ${grant_session.code_challenge}} request.code_verifier => ${request.code_verifier})`);
			throw new BadRequestException(`invalid_request`);
		}

		// validate redirect_uri
		if (request.redirect_uri && request.redirect_uri.length) {
			if (request.redirect_uri !== grant_session.redirect_uri) {
				log.error(`request redirect_uri doesnt match grant session request_uri (${request.redirect_uri} != ${grant_session.redirect_uri})`);
				throw new BadRequestException(`invalid_request`);
			}
		}
		const redirect_uri = grant_session.redirect_uri;

		// @TODO validate nonce

		// generate tokens
		const user = await this.$users.findById({
			org_id,
			user_id: code_authorization.user_id,
		});

		try {
			await this.$grants.push({ ...grant_session, status: EGrantSessionStatus.ISSUED });
		} catch (error) {
			log.error(`cannot update grant ${error.message?.trim()}`);
		}

		try {
			await this.$codes.push({ ...code_authorization, status: ECodeAuthorizationStatus.ISSUED, });
		} catch (error) {
			log.error(`cannot upate code status ${error.message?.trim()}`);
			throw new SystemException(`authentication_failure`);
		}

		const session: LoginSession = await this.$session.execute({
			org: { org_id },
			client,
			audience: grant_session.audience,
			subject: UserURN({ ...user, org_id, }),
			scope: grant_scope,
			app_sid: code_authorization.app_sid,
		});

		const result = await this.$genToken.execute({
			org: { org_id, },
			resource_server: rs,
			client,
			session,
			scope: grant_scope,
		});

		return {
			redirect_uri,
			state: grant_session.state,
			nonce: grant_session.nonce,
			...result,
		};
	}

	async clientCredentialsRequest(org_id: string, request: TokenRequestClientCredentials) {
		// @TODO validate request parameters

		let rs = await this.$rs.findById({ org_id, identifier: request.audience.trim() });
		if (!rs) { throw new BadRequestException(`invalid_audience`); }

		// validate client credential
		const isClient = await this.$secrets.execute({
			org_id, credentials: {
				client_id: request.client_id,
				client_secret: request.client_secret,
			}
		});
		if (!isClient) { throw new BadRequestException(`unauthorized_client`); }

		const client = await this.$clients.findById({ org_id, client_id: request.client_id });

		// validate client grants
		if (!client.grant_types.includes(request.grant_type)) { throw new BadRequestException(`unauthorized_client`); }


		const audience = request.audience;
		if (request.scope) {
			// @TODO validate request scope
			const permList = await this.$extractPermList.execute({
				audience,
				authorization_details: request.authorization_details ?? [],
				scope: request.scope,
			});
		}

		// get login session
		const session = await this.$session.execute({
			org: { org_id },
			audience,
			client,
			scope: request.scope,
			subject: ClientURN(client),
		});

		// generate tokens
		const access = await this.$genToken.execute({
			org: { org_id },
			resource_server: rs,
			client,
			scope: request.scope,
			session,
		});

		return {
			...access
		};
	}

	async refreshTokenRequest(org_id: string, request: TokenRequestRefreshToken) {
		// validate request parameters
		if (request.grant_type !== EAccessGrantType.REFRESH_TOKEN) { throw new BadRequestException(`invalid_request`); }
		if (!request.client_id || !request.client_secret) { throw new BadRequestException(`invalid_request`); }

		if (!request.refresh_token) { throw new BadRequestException(`invalid_request`); }

		// validate client credential
		const isValid = await this.$secrets.execute({
			org_id, credentials: {
				client_id: request.client_id,
				client_secret: request.client_secret
			}
		});

		if (!isValid) {
			throw new BadRequestException(`invalid_credentials`);
		}

		// validate client grants
		const client = await this.$clients.findById({
			org_id,
			client_id: request.client_id
		});

		if (!client.grant_types.includes(request.grant_type)) {
			throw new BadRequestException(`unauthorized_client`);
		}

		/**
		 * refresh tokens
		 */
		const accessToken = await this.$refreshToken.execute({
			org: { org_id },
			refresh_token: request.refresh_token,
		});
		return accessToken;
	}

	async userCredentialsRequest(org_id: string, request: TokenRequestUserCredentials) {
		// @TODO validate request parameters
		if (request.grant_type !== EAccessGrantType.USER_CREDENTIALS) { throw new BadRequestException(`invalid_request`); }
		if (!request.client_id || !request.client_secret) { throw new BadRequestException(`invalid_request`); }

		if (!request.username || !request.password) { throw new BadRequestException(`invalid_request`); }


		const audience = request.audience.trim();
		const rs = await this.$rs.findOne({
			where: {
				org_id,
				identifier: audience,
			}
		});

		if (!rs) {
			throw new BadRequestException(`invalid_audience`);
		}

		// validate client credential
		const isValid = await this.$secrets.execute({
			org_id, credentials: {
				client_id: request.client_id,
				client_secret: request.client_secret
			}
		});

		if (!isValid) {
			throw new BadRequestException(`invalid_credentials`);
		}

		// validate client grants
		const client = await this.$clients.findById({
			org_id,
			client_id: request.client_id
		});

		if (!client.grant_types.includes(request.grant_type)) {
			throw new BadRequestException(`unauthorized_client`);
		}

		// validate user credentials
		const user: User | null = await this.$userCredentials.execute({
			connection: request.connection,
			credentials: {
				type: ECredentialType.PASSWORD,
				value: request.password,
				email: request.username
			},
			org_id,
		});

		if (!user) {
			throw new BadRequestException(`invalid_credentials`);
		}

		// @TODO validate request scope
		const permList: AuthDetailsItem[] = this.$extractPermList.execute({
			audience,
			authorization_details: request.authorization_details,
			scope: request.scope,
		});

		const session = await this.$session.execute({
			org: { org_id },
			client,
			subject: UserURN(user),
			audience,
			scope: request.scope,
		});

		// generate tokens
		const accessToken = await this.$genToken.execute({
			org: { org_id, },
			client,
			resource_server: rs,
			scope: request.scope,
			session,
		});
		return accessToken;
	};

}