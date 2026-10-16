export namespace TTL {
	/** CODE_TTL_SEC = 60 sec * 10 min */
	export const GRANT_SESSION_TTL = 60 * 10;

	/** 
	 * LOGIN_SESSION_EXPIRATION_TTL = GRANT_SESSION_TTL - 1 sec
	 * 
	 * Using a lower TTL than GRANT_SESSION_TTL for prevent orphan login session
	 */
	export const LOGIN_SESSION_EXPIRATION_TTL = GRANT_SESSION_TTL - 1;

	/** CODE_TTL_SEC = 60 sec * 2 min */
	export const CODE_EXPIRATION_TTL = 60 * 2;


	/**
	 * PAR_REQUEST_EXPIRATION_TTL = 60 sec
	 */
	export const PAR_REQUEST_EXPIRATION_TTL = 60;

	export const APP_SESSION_EXPIRATION_TTL = LOGIN_SESSION_EXPIRATION_TTL;
}
