import { FieldsQuery, IRepository, QueryWhere, Where } from "@egc-io/ckit-lib";
import { PrismaQueryTransformer } from "./transform";

import { PrismaError } from './error';

export abstract class PrismaRepository<T extends object, ID = unknown, K extends string = string> implements IRepository<T> {
	constructor(readonly $delegate: Readonly<any>) { }

	protected abstract $ID(v: ID): { [P in K]: ID };

	async create(data: Partial<T>): Promise<T> {
		try {
			const result = await this.$delegate.create({ data });
			return result;
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}

	async find(query?: QueryWhere<T>): Promise<T[]> {
		try {
			const filter = PrismaQueryTransformer<T>(query ?? {});
			const result = await this.$delegate.findMany(filter as any);
			return result;
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}

	async findOne(query?: QueryWhere<T> | undefined): Promise<T | null> {
		try {
			const result: T | null = await this.$delegate.findFirst(PrismaQueryTransformer<T>(query ?? {}) as any);
			return result;
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}

	async findById(pk: ID, query?: FieldsQuery<T>): Promise<T> {
		try {
			const entity: T = await this.$delegate.findUniqueOrThrow({
				select: PrismaQueryTransformer<T>({ ...query }).select,
				where: this.$ID(pk),
			});
			return entity;
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}

	async count(query?: QueryWhere<T> | undefined): Promise<number> {
		try {
			const filter = PrismaQueryTransformer<T>(query ?? {}) as any;
			const count = await this.$delegate.count({ where: filter.where, skip: filter.skip, take: filter.take });
			return count;
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}

	async update(data: Partial<T>, where?: Where<T> | undefined): Promise<void> {
		try {
			await this.$delegate.updateMany({ data, where: PrismaQueryTransformer<T>({ where }).where as any });
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}

	async updateById(id: ID, data: Partial<T>, opts?: object): Promise<void> {
		try {
			await this.$delegate.update({ where: this.$ID(id), data });
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	};

	async delete(where: Where<T>): Promise<void> {
		try {
			const query = PrismaQueryTransformer<T>({ where });
			await this.$delegate.deleteMany(query);
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}

	deleteById(id: ID): Promise<void> {
		try {
			return this.$delegate.delete({ where: this.$ID(id) }).then();
		} catch (error) {
			throw new (PrismaError(error))(error.message);
		}
	}
}