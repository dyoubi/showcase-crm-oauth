import "reflect-metadata";

import { beforeEach, describe, expect, it } from 'vitest';
import { ValidateUserPermission } from './validate-user-permission.use-case';
import { Permission } from '@ring-oauth/core';
import { $userPermRepo, $userRoleRepo, $rolePermRepo } from "../../../../../__test__/orm-mock.spec";

const ORG_ID = 'org-mock';

const Permissions: Permission[] = [
	Object.assign<Permission, Partial<Permission>>(new Permission(),
		{
			scope_value: 'mock.create',
			resource_server_identifier: 'rs_mock',
			org_id: ORG_ID,
		}
	),
	Object.assign<Permission, Partial<Permission>>(new Permission(),
		{
			scope_value: 'mock.read',
			resource_server_identifier: 'rs_mock',
			org_id: ORG_ID,
		}
	),
	Object.assign<Permission, Partial<Permission>>(new Permission(),
		{
			scope_value: 'mock.update',
			resource_server_identifier: 'rs_mock',
			org_id: ORG_ID,
		}
	),

];


const uc = new ValidateUserPermission(
	$userPermRepo,
	$userRoleRepo,
	$rolePermRepo,
);

describe('CreateClientUseCase', async () => {
	beforeEach(() => {
		$userPermRepo.find.mockReset();
		$userRoleRepo.find.mockReset();
		$rolePermRepo.find.mockReset();
	});
	it('should be true by user permission', async () => {
		$userPermRepo.find.mockResolvedValue(Permissions);
		$userRoleRepo.find.mockResolvedValue([]);
		$rolePermRepo.find.mockResolvedValue([]);
		expect(await uc.execute({
			org_id: 'org-id',
			permission: [
				{ scope_value: 'mock.create' },
			],
			resource_server_identifier: 'rs_mock',
			user_id: ''
		})).toBe(true);
	});


	it('should be true by user role', async () => {
		$userPermRepo.find.mockResolvedValue([]);
		$userRoleRepo.find.mockResolvedValue([]);
		$rolePermRepo.find.mockResolvedValue(Permissions);
		expect(await uc.execute({
			org_id: 'org-id',
			permission: [
				{ scope_value: 'mock.create' },
			],
			resource_server_identifier: 'rs_mock',
			user_id: ''
		})).toBe(true);
	});

	it('openid default scope should be ignored', async () => {
		$userPermRepo.find.mockResolvedValue(Permissions);
		$userRoleRepo.find.mockResolvedValue([]);
		$rolePermRepo.find.mockResolvedValue([]);
		expect(await uc.execute({
			org_id: 'org-id',
			permission: [
				{ scope_value: 'email' },
				{ scope_value: 'openid' },
			],
			resource_server_identifier: 'rs_mock',
			user_id: ''
		})).toBe(true);
	});

	it('unknown server scope should be false', async () => {
		$userPermRepo.find.mockResolvedValue(Permissions);
		$userRoleRepo.find.mockResolvedValue([]);
		$rolePermRepo.find.mockResolvedValue(Permissions);
		expect(await uc.execute({
			org_id: 'org-id',
			permission: [
				{ scope_value: 'nope' },
				{ scope_value: 'openid' },
			],
			resource_server_identifier: 'rs_mock',
			user_id: ''
		})).toBeFalsy();
	});

	it('missing permission should be false', async () => {
		$userPermRepo.find.mockResolvedValue([]);
		$userRoleRepo.find.mockResolvedValue([]);
		$rolePermRepo.find.mockResolvedValue([]);
		expect(await uc.execute({
			org_id: 'org-id',
			permission: [
				{ scope_value: 'nope' },
				{ scope_value: 'openid' },
			],
			resource_server_identifier: 'rs_mock',
			user_id: ''
		})).toBeFalsy();
	});


});