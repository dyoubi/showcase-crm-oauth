import { BadRequestException, inject, injectable, log } from "@egc-io/ckit-lib";
import {
	EGrantSessionStatus,
	CLIENT_REPOSITORY,
	GRANT_SESSION_STORE, JTI_LOOKUP_TABLE,
	CodeRequest, CredentialType, Client,
	GrantCoercion, GrantSession,
	IClientRepository, IGrantSessionStore,
	IJtiLookupTable, IJwtDecoder,
	JwtDecoder,
	PermissionListCoerceMapper,
	PushAuthorizationSession,
	PUSH_AUTHORIZATION_SESSION_TABLE,
	IPushAuthorizationSessionTable,
	PushedAuthorizationCallback,
	JsonAuthorizationRequest,
	APP_SESSION_TABLE,
	IAppSessionTable,
	ECredentialType,
	RedirectionURNProvider,
	URN,
	RedirectionNS,
	EAuthorizationResponseType,
	coercePermissions,
	coerceAuthorizationDetails,
} from "@ring-oauth/core";
import {
	CoerceGrantSessionUseCase, DecodeJarUseCase, ExtractAudienceUseCase, ExtractPermissionListUseCase,
	ExtractPromptUseCase, GenerateAuthorizationCodeUseCase, ParSessionUseCase, PromptField
} from "../use-cases";
import { AuthenticateUserCredentialsUseCase } from "../../user";
import { ValidateRedirectUriUseCase } from "../../org";

@injectable()
export class CodeAuthorizationService {
	private readonly $extractPrompt: ExtractPromptUseCase = new ExtractPromptUseCase();
	private readonly $extractPermList: ExtractPermissionListUseCase = new ExtractPermissionListUseCase();
	private readonly $decoder: IJwtDecoder = new JwtDecoder();

	constructor(
		@inject(ExtractAudienceUseCase)
		private readonly $extractAudience: ExtractAudienceUseCase,
		@inject(CoerceGrantSessionUseCase)
		private readonly $coerce: CoerceGrantSessionUseCase,
		@inject(ValidateRedirectUriUseCase)
		private readonly $uriRedirectValidate: ValidateRedirectUriUseCase,
		@inject(AuthenticateUserCredentialsUseCase)
		private readonly $userCredentials: AuthenticateUserCredentialsUseCase,
		@inject(GenerateAuthorizationCodeUseCase)
		private readonly $codes: GenerateAuthorizationCodeUseCase,
		@inject(ParSessionUseCase)
		private readonly $par: ParSessionUseCase,
		@inject(DecodeJarUseCase)
		private readonly $jar: DecodeJarUseCase,
		@inject(CLIENT_REPOSITORY)
		private readonly $clientRepo: IClientRepository,
		@inject(GRANT_SESSION_STORE)
		private readonly $grants: IGrantSessionStore,
		@inject(APP_SESSION_TABLE)
		private readonly $sids: IAppSessionTable,
		@inject(JTI_LOOKUP_TABLE)
		private readonly $jtiTable: IJtiLookupTable,
		@inject(PUSH_AUTHORIZATION_SESSION_TABLE)
		private readonly $parTable: IPushAuthorizationSessionTable,
	) { }

	isPushAuthorizationCallback(request: any): request is PushedAuthorizationCallback {
		return request instanceof PushedAuthorizationCallback ||
			typeof request === 'object' && !!request.request_uri && typeof request?.request_uri === 'string';
	}

	/**
	 * create a PAR session
	 * @param org_id e.g org_<hash_id>
	 * @param request 
	 * @returns the PAR session
	 */
	async pushAuthorizationRequest(org_id: string, request: JsonAuthorizationRequest | CodeRequest,): Promise<PushAuthorizationSession> {
		const isJAR = JsonAuthorizationRequest(request);
		let codeRequest: CodeRequest;
		if (isJAR) {
			codeRequest = await this.$jar.execute({
				org_id,
				jar: request.request
			});

			throw new BadRequestException(`cannot handle JAR request`);
		} else {
			codeRequest = { ...request };
		}

		let session: PushAuthorizationSession;
		session = await this.$par.execute({
			client: {
				org_id,
				client_id: codeRequest.client_id,
			},
			request: codeRequest,
		});
		return session;
	}

	/**
	 * Handle the PAR authorization for the session from the request_uri
	 * @param org_id 
	 * @param request must contain the request_uri parameter 
	 * @returns 
	 */
	async pushAuthorizationCallback(org_id: string, request: PushedAuthorizationCallback): Promise<CodeRequest> {
		const request_uri: string = request.request_uri;
		const pk = { org_id, client_id: request.client_id, request_uri };

		let session = await this.$parTable.pull(pk);

		if (!session) {
			log.error(`not PAR session found for request ${JSON.stringify(request)}`);
			throw new BadRequestException(`invalid_request`);
		}

		if (session.issued || session.expires_at <= Date.now() / 1000) {
			log.error(`expired par session ${JSON.stringify(session)}`);
			throw new BadRequestException(`invalid_request`);
		}
		return session.request;
	}

	/**
	 * Creat a code request session
	 * @param org_id 
	 * @param request if the request is a PAR callback resolve it before
	 * @returns 
	 */
	async authorize(
		org_id: string,
		request: CodeRequest | PushedAuthorizationCallback,
	) {
		/**
		 * @TODO validate request
		 */

		let codeRequest: CodeRequest;
		if (!!request.client_id && !!(request as any).request_uri) {
			codeRequest = await this.pushAuthorizationCallback(org_id, request as PushedAuthorizationCallback);
		} else {
			codeRequest = { ...request as CodeRequest };
		}

		const client = await this.$clientRepo.findOne({
			where: {
				org_id,
				client_id: codeRequest.client_id,
			}
		});

		if (!client) {
			throw new BadRequestException(`unauthorized_client`);
		}

		// set redirection_url
		let redirect_uri;
		if (codeRequest.redirect_uri) {
			const canRedirect = this.$uriRedirectValidate.execute({ client_id: client.client_id, redirect_uri: codeRequest.redirect_uri, org_id });
			if (!canRedirect) {
				throw new BadRequestException('invalid_request');
			}
			redirect_uri = codeRequest.redirect_uri;
		} else if (client.allowed_callback_urls.length) {
			redirect_uri = client.allowed_callback_urls[0];
		} else {
			throw new BadRequestException('invalid_request');
		}

		if (!redirect_uri.length) {
			log.error(`cannot parse redirection_uri ${redirect_uri} . YOU SHOULD NEVER REACH THIS STATEMENT !`);
			throw new BadRequestException(`invalid_request`);
		}

		// extract audience
		const rsList = await this.$extractAudience.execute({
			audience: codeRequest.audience,
			org_id,
		});

		if (rsList.length === 0) {
			log.warn(`no resource server found for the given request (org_id:${org_id}) ${JSON.stringify({ codeRequest })}`.trim());
		}
		const audience = codeRequest.audience;

		const scopeValueList = (codeRequest.scope ?? "")
			.split(/[ ,;]/)
			.map(v => v.trim());

		// extract scope
		// extract authorization_details
		// build permission list
		const permList: {
			resource_server_identifier: string;
			scope_value: string;
			resource?: unknown;
		}[] = this.$extractPermList.execute({
			audience,
			authorization_details: codeRequest.authorization_details,
			scope: codeRequest.scope
		});

		// build prompt object
		const prompt: Record<PromptField, boolean | undefined> = this.$extractPrompt.execute({
			prompts: codeRequest.prompts ?? undefined,
		});

		// validate state
		if (!codeRequest.state?.length) {
			throw new BadRequestException(`invalid_request`);
		}
		if (codeRequest.state.length >= 2048) {
			throw new BadRequestException(`state_max_length`);
		}
		// coerce session
		const coerce: GrantCoercion = {
			org_id,
			client_id: codeRequest.client_id,
			audience,
			connection: codeRequest.connection,
			login_hint: codeRequest.login_hint,
			prompts: Object.keys(prompt).filter(k => prompt[k] === true),
			redirect_uri,
			scope: coercePermissions(scopeValueList),
			authorization_details: coerceAuthorizationDetails(codeRequest.authorization_details ?? []),
			code_challenge: codeRequest.code_challenge ?? undefined,
			pkce_method: codeRequest.pkce_method ?? undefined,
			nonce: codeRequest.nonce ?? undefined,
			response_type: codeRequest.response_type ?? undefined,
		};

		// pull grant session from store
		const grant_session = await this.$coerce.execute(coerce);

		// return grant_session
		return {
			client_id: grant_session.client_id,
			redirect_uri: grant_session.redirection_urn,
			jwt: grant_session.jwt,
			login_hint: grant_session.login_hint,
			connection: grant_session.connection,
			scope: grant_session.scope.join(' '),
		};
	}

	/**
	 * Authenticate the user to the grant_session
	 * @param org_id org_id
	 * @param request request from user_agent
	 * @param user_agent informations from the user_agent
	 * @returns 
	 */
	async authenticate(org_id: string,
		request: {
			client_id: string,
			redirect_uri: string;
			connection?: string;
			credentials: {
				email?: string;
				username?: string;
				value: string;
				type: CredentialType;
			};
		},
		user_agent?: {
			/**
			 * application session id
			 */
			app_sid?: string;
			user_agent?: string;
			ip?: string;
		},
	) {

		// decode the redirection urn for retreive the grant_session
		const urndecoder = new RedirectionURNProvider();
		let ns: RedirectionNS;
		try {
			ns = urndecoder.decode(request.redirect_uri);
		} catch (error) {
			log.error(`cannot decode redirect urn ${error.message}`);
			throw new BadRequestException(`invalid_request`);
		}

		// org_id from rederiction should match org_id from request
		if (ns.org_id !== org_id) {
			log.error(`org_id missmatch ${ns.org_id} !== ${org_id}`);
			throw new BadRequestException(`invalid_request`);
		}

		// client_id from rederiction should match client_id from request
		if (ns.client_id !== request.client_id) {
			log.error(`client_id missmatch ${ns.client_id} !== ${request.client_id}`);
			throw new BadRequestException(`invalid_request`);
		}

		/**
		 * @TODO validate request payload
		 */
		if (
			(!request.credentials.email && !request.credentials.username)
			|| (request.credentials.email && request.credentials.username)
		) {
			throw new BadRequestException(`invalid_credentials`);
		}

		let client: Client | null;

		try {
			client = await this.$clientRepo.findOne({ where: { client_id: ns.client_id, org_id } });
		} catch (error) {
			throw new BadRequestException(`unauthorized_client`);
		}


		if (!client) { throw new BadRequestException(`unauthorized_client`); }

		/*
		* verify jwt expiration & signature
		* verify jwt expiration
		* resolve grant session
		*/
		const jti = ns.jti;

		let grant_id = await this.$jtiTable.pull({ client_id: request.client_id, jti, org_id });

		if (!grant_id) {
			throw new BadRequestException(`invalid_session`);
		}

		let grant_session: GrantSession | null = await this.$grants.pull({
			org_id, grant_id,
			client_id: request.client_id,
		});
		if (!grant_session) {
			throw new BadRequestException(`invalid_request`);
		}

		const { claims } = await this.$decoder.decode(grant_session.jwt);
		if (claims.jti !== jti) {
			throw new BadRequestException(`invalid_session`);
		}

		if (grant_session.status !== EGrantSessionStatus.PENDING) {
			/**
			 * @TODO : should log expired attempt for security analysis
			 */
			switch (grant_session.status) {
				case EGrantSessionStatus.EXPIRED:
					{ throw new BadRequestException(`authorization_request_expired`); }
				case EGrantSessionStatus.ISSUED:
				case EGrantSessionStatus.REVOKED:
				default:
					{ throw new BadRequestException(`invalid_request`); }
			}
		}
		/**
		 * redirect_uri provided to authentication app is masked as an urn
		 * check urn value & get original redirect_uri
		 */
		if (grant_session.redirection_urn !== request.redirect_uri) {
			throw new BadRequestException(`invalid_request`);
		}

		/**
		 * redirection_uri should already be valid from authorization process but check again
		 */
		const canRedirect = this.$uriRedirectValidate.execute({
			org_id,
			client_id: grant_session.client_id,
			redirect_uri: grant_session.redirect_uri,
		});

		if (!canRedirect) {
			log.error(`grant ${grant_id} invalid redirection_uri ${grant_session.redirect_uri}`);
			throw new BadRequestException('invalid_request');
		}

		// set back original redirection url
		let redirect_uri = grant_session.redirect_uri;

		// validate user credentials
		let connection: string;

		if (grant_session.connection && request.connection) {
			if (grant_session.connection !== request.connection) {
				throw new BadRequestException(`invalid_request`);
			}
		}

		if (request.connection) {
			connection = request.connection;
		} else if (grant_session.connection) {
			connection = grant_session.connection;
		} else {
			throw new BadRequestException(`invalid_request`);
		}

		let user = await this.$userCredentials.execute({
			org_id,
			connection,
			credentials: {
				email: request.credentials.email,
				username: request.credentials.username,
				type: ECredentialType.PASSWORD,
				value: request.credentials.value
			}
		});

		if (!user) { throw new BadRequestException(`invalid_credentials`); }

		/**
		 * @TODO validate user scope
		 */


		// generate authorization code
		const code = await this.$codes.execute({
			grant_session,
			user: { ...user },
			app_sid: user_agent?.app_sid,
			ip: user_agent?.ip,
			user_agent: user_agent?.user_agent,
		});


		/**
		 * @TODO bind the user to the app_sid if any exists
		 */

		if (user_agent?.app_sid) {
			const pk_sid = { org_id, sid: user_agent.app_sid, };
			const session = await this.$sids.pull(pk_sid);
			if (session) {
				await this.$sids.push({
					...session,
					user_id: user.user_id,
					connection: user.connection
				});
			}
		}


		/**
		 * @TODO should handle different response type here.
		 */
		// let responseType: { access_token?: string, id_token?: string; expires_at?: string; refresh_token?: string; } = {};
		return {
			org_id,
			redirect_uri,
			response_type: grant_session.response_type ?? 'code',
			code: code.code,
			//...responseType,
		};
	}
}