import { FieldsQuery, IDType, IRepository, QueryWhere, Where } from "@egc-io/ckit-lib";
import { PK_RolePermission, PK_UserPermission, PK_UserRole, RolePermission, UserPermission, UserRole } from "@ring-oauth/core";
import { Mock, vi } from "vitest";


export type RepoMock<T extends object, ID extends IDType | Partial<T> = any> = IRepository<T, ID> & {
	[K in keyof IRepository<T, ID>]:
	IRepository<T, ID>[K] extends (...a: infer _A) => infer _R
	? Mock<any>
	: IRepository<T, ID>
};
export function createRepoMock<T extends object, ID extends (Partial<T> | IDType) = any>(): RepoMock<T, ID> {
	return {
		create: vi.fn<(data: Partial<T>) => Promise<T>>(),
		find: vi.fn<(query?: QueryWhere<T>) => Promise<T[]>>(),
		findOne: vi.fn<(query?: QueryWhere<T>) => Promise<T | null>>(),
		findById: vi.fn<(id: ID, query?: FieldsQuery<T>) => Promise<T>>(),
		count: vi.fn<(query?: QueryWhere<T>) => Promise<number>>(),
		update: vi.fn<(data: Partial<T>, where?: Where<T>) => Promise<void>>(),
		updateById: vi.fn<(id: ID, data: Partial<T>, opts?: object) => Promise<void>>(),
		delete: vi.fn<(where: Where<T>) => Promise<void>>(),
		deleteById: vi.fn<(id: ID) => Promise<void>>(),
	};
}

export const $userPermRepo = createRepoMock<UserPermission, PK_UserPermission>();
export const $userRoleRepo = createRepoMock<UserRole, PK_UserRole>();
export const $rolePermRepo = createRepoMock<RolePermission, PK_RolePermission>();

export function resetRepoMocks(...repos: Array<RepoMock<any, any>>) {
	for (const repo of repos) {
		(Object.values(repo) as Mock[]).forEach(m => m.mockReset());
	}
}