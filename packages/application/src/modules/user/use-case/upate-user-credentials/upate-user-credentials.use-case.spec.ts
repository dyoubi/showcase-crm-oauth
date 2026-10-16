import 'reflect-metadata';

import { beforeEach, describe, expect, it } from 'vitest';
import { UpateUserCredentialsUseCase } from "./upate-user-credentials.use-case";
import { createRepoMock, resetRepoMocks } from '../../../../../__test__/orm-mock.spec';
import { base64url, Database, DefaultCredentialEncryptionProvider, PK_Database, PK_User, PK_UserCredentials, User, UserCredentials } from '@ring-oauth/core';

describe("UpateUserCredentialsUseCase", () => {
	const $users = createRepoMock<User, PK_User>();
	const $creds = createRepoMock<UserCredentials, PK_UserCredentials>();
	const $dbs = createRepoMock<Database, PK_Database>();

	const usecase = new UpateUserCredentialsUseCase(
		$users,
		$creds,
		$dbs,
	);

	const user = Object.assign<User, Partial<User>>(new User(), {});
	beforeEach(() => {
		resetRepoMocks($users, $creds, $dbs);
	});

	it('create a new credential & revoke olds ones', async () => {
		let newCreds: UserCredentials | null = null;
		let revoked: UserCredentials = new UserCredentials();
		const db = new Database();
		db.salt = '0';
		$users.findOne.mockResolvedValue(user);
		$creds.findOne.mockResolvedValue(new UserCredentials());
		$creds.count.mockResolvedValue(0);
		$creds.update.mockResolvedValue(0);
		$creds.update.mockImplementation(v => Object.assign(revoked, v));
		$creds.create.mockImplementation(
			async (creds) => {
				newCreds = creds as UserCredentials;
			});
		$dbs.findById.mockResolvedValue(db);

		const hash = DefaultCredentialEncryptionProvider('foo', db.salt);
		const value = base64url(hash);
		await usecase.execute({
			org_id: '',
			credentials: { type: 'PASSWORD', connection: '', email: '', value: 'foo' },
		});
		expect(newCreds).not.null;
		expect(newCreds!.value).eq(value);
		expect(revoked.revoked).eq(true);
		expect(revoked.revoked_at).not.null;
		expect(revoked.revoked_at).toBeInstanceOf(Date);
	});

});
