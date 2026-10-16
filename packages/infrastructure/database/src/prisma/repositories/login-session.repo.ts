import { AccessToken, IAccessTokenRepository, ILoginSessionRepository, IRefreshTokenRepository, LoginSession, PK_AccessToken, PK_LoginSession, PK_RefreshToken, RefreshToken } from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

export class LoginSessionRepo extends PrismaRepository<LoginSession, PK_LoginSession, 'org_id_sid'>
	implements ILoginSessionRepository {
	protected override $ID(v: PK_LoginSession): { org_id_sid: PK_LoginSession; } {
		return { org_id_sid: v };
	}
}

export class AccessTokenRepo extends PrismaRepository<AccessToken, PK_AccessToken, 'org_id_jti'>
	implements IAccessTokenRepository {
	protected override $ID(v: PK_AccessToken): { org_id_jti: PK_AccessToken; } {
		return { org_id_jti: v };
	}
}

export class RefreshTokenRepo extends PrismaRepository<RefreshToken, PK_RefreshToken, "org_id_jti">
	implements IRefreshTokenRepository {
	protected override $ID(v: PK_RefreshToken): { org_id_jti: PK_RefreshToken; } {
		return { org_id_jti: v };
	}
}