import { ModuleDefinition, IContext, log } from '@egc-io/ckit-lib';
import {
	INSTANCE_REPOSITORY, USER_REPOSITORY, IInstanceRepository, IUserRepository,
	IDatabaseRepository,
	DATABASE_REPO,
	IClientRepository,
	CLIENT_REPOSITORY,
	IResourceServerRepository,
	RESOURCE_SERVER_REPO,
	IConnectionRepository,
	IRolePermissionRepository,
	CONNECTION_REPO,
	ROLE_PERMISSION_REPOSITORY,
	IPermissionRepository,
	IUserPermissionRepository,
	USER_PERMISSION_REPOSITORY,
	IUserRoleRepository,
	USER_ROLE_REPOSITORY,
	PERMISSION_REPOSITORY,
	ROLE_REPOSITORY,
	IRoleRepository,
	USER_CREDENTIALS_REPOSITORY,
	IUserCredentialsRepository,
	IClientPermissionRepository,
	CLIENT_PERMISSION_REPOSITORY,
	IUserCredentialsResolver,
	USER_CREDENTIALS_RESOLVER,
	IAccessTokenRepository,
	ACCESS_TOKEN_REPOSITORY,
	ILoginSessionRepository,
	IRefreshTokenRepository,
	LOGIN_SESSION_REPOSITORY,
	REFRESH_TOKEN_REPOSITORY,
	CLIENT_SIGNING_KEY_REPOSITORY,
	IClientSigningKeyRepository,
	IInstanceJwtPairRepository,
	INSTANCE_JWT_PAIR_REPOSITORY,
	ITicketChallengeRepository,
	TICKET_CHALLENGE_REPOSITORY,
	II18nRepository,
	I18N_REPOSITORY,
	HTML_TEMPLATE_REPOSITORY,
	IHTMLTemplateRepository,
	IThemeRepository,
	THEME_REPOSITORY,
} from '@ring-oauth/core';
import {
	ClientRepo,
	ConnectionRepo,
	DatabaseRepo,
	InstanceRepo,
	UserRepo,
	UserCredentialsRepo,
	PermissionRepo,
	ResourceServerRepo,
	RolePermissionRepo,
	RoleRepo,
	UserPermissionRepo,
	UserRoleRepo,
	ClientPermissionRepo,
	UserCredentialResolver,
	RefreshTokenRepo,
	LoginSessionRepo,
	AccessTokenRepo,
	ClientSigningKeyRepository,
	InstanceJWTKRepo,
	TickerChallengeRepo,
	I18nRepo,
	HTMLTemplateRepo,
	ThemeRepo,
} from './prisma/repositories';
import { client, disconnect } from './global';


export const PGModule: ModuleDefinition = {
	setup(ioc: IContext) {
		const prisma = client();

		log.info(`bind database repositories `);
		ioc.bind<IInstanceRepository>({ key: INSTANCE_REPOSITORY, value: new InstanceRepo(prisma.instance) });
		ioc.bind<IInstanceJwtPairRepository>({ key: INSTANCE_JWT_PAIR_REPOSITORY, value: new InstanceJWTKRepo(prisma.instanceJwtKeyPair) });
		ioc.bind<IResourceServerRepository>({ key: RESOURCE_SERVER_REPO, value: new ResourceServerRepo(prisma.resourceServer) });
		ioc.bind<IPermissionRepository>({ key: PERMISSION_REPOSITORY, value: new PermissionRepo((prisma.permission)) });
		ioc.bind<IRoleRepository>({ key: ROLE_REPOSITORY, value: new RoleRepo((prisma.role)) });
		ioc.bind<IRolePermissionRepository>({ key: ROLE_PERMISSION_REPOSITORY, value: new RolePermissionRepo((prisma.rolePermission)) });

		ioc.bind<IClientRepository>({ key: CLIENT_REPOSITORY, value: new ClientRepo(prisma.client) });
		ioc.bind<IClientPermissionRepository>({ key: CLIENT_PERMISSION_REPOSITORY, value: new ClientPermissionRepo(prisma.clientPermission) });
		ioc.bind<IClientSigningKeyRepository>({ key: CLIENT_SIGNING_KEY_REPOSITORY, value: new ClientSigningKeyRepository(prisma.clientSigningKey) });

		ioc.bind<IUserRepository>({ key: USER_REPOSITORY, value: new UserRepo(prisma.user) });
		ioc.bind<IUserCredentialsResolver>({ key: USER_CREDENTIALS_RESOLVER, value: new UserCredentialResolver(prisma.userCredentials) });
		ioc.bind<IUserCredentialsRepository>({ key: USER_CREDENTIALS_REPOSITORY, value: new UserCredentialsRepo((prisma.userCredentials)) });
		ioc.bind<IUserRoleRepository>({ key: USER_ROLE_REPOSITORY, value: new UserRoleRepo((prisma.userRole)) });
		ioc.bind<IUserPermissionRepository>({ key: USER_PERMISSION_REPOSITORY, value: new UserPermissionRepo((prisma.userPermission)) });

		ioc.bind<IDatabaseRepository>({ key: DATABASE_REPO, value: new DatabaseRepo((prisma.database)) });
		ioc.bind<IConnectionRepository>({ key: CONNECTION_REPO, value: new ConnectionRepo(prisma.connection) });

		ioc.bind<ILoginSessionRepository>({ key: LOGIN_SESSION_REPOSITORY, value: new LoginSessionRepo(prisma.loginSession) });
		ioc.bind<IAccessTokenRepository>({ key: ACCESS_TOKEN_REPOSITORY, value: new AccessTokenRepo(prisma.accessToken) });
		ioc.bind<IRefreshTokenRepository>({ key: REFRESH_TOKEN_REPOSITORY, value: new RefreshTokenRepo(prisma.refreshToken) });
		ioc.bind<ITicketChallengeRepository>({ key: TICKET_CHALLENGE_REPOSITORY, value: new TickerChallengeRepo(prisma.ticketChallenge) });

		ioc.bind<II18nRepository>({ key: I18N_REPOSITORY, value: new I18nRepo(prisma.i18n) });
		ioc.bind<IHTMLTemplateRepository>({ key: HTML_TEMPLATE_REPOSITORY, value: new HTMLTemplateRepo(prisma.hTMLTemplate) });
		ioc.bind<IThemeRepository>({ key: THEME_REPOSITORY, value: new ThemeRepo(prisma.theme) });
	},
	async shutdown() {
		await disconnect();
	}
};