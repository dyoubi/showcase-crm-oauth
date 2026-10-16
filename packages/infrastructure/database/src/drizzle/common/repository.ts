import { FieldsQuery, IRepository, QueryWhere, Where } from "@egc-io/ckit-lib";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { transformFilter, transformWhere } from "./query-transform";
import { PgTableWithColumns } from "drizzle-orm/pg-core";

export abstract class Repo<Model extends object, ID extends (Partial<Model> | keyof Model)> implements IRepository<Model> {
	abstract $ID(id: ID extends keyof Model ? Model[ID] : ID): ID extends Partial<Model> ? ID : Pick<Model, keyof Model>;

	constructor(private readonly $db: NodePgDatabase, private readonly $table: PgTableWithColumns<any>) { }

	count(query?: QueryWhere<Model> | undefined): Promise<number> {
		const select = transformFilter(query ?? {}, this.$table, this.$db, true);
		return select.then(result => result.length ? result[0].count : 0);
	}

	update(data: Partial<Model>, where?: Where<Model> | undefined): Promise<void> {
		return this.$db.update(this.$table)
			.set(data)
			.where(transformWhere(where ?? {}, this.$table))
			.then(result => { result.rowCount; });
	}

	updateById(id: ID, data: Partial<Model>): Promise<void> {
		const pk = this.$ID(id as any);
		return this.$db.update(this.$table)
			.set(data)
			.where(transformWhere(pk, this.$table))
			.then((result) => { result.rows; });
	}

	delete(where: Where<Model>): Promise<void> {
		return this.$db.delete(this.$table)
			.where(transformWhere(where, this.$table))
			.then(() => { });
	}

	deleteById(id: ID): Promise<void> {
		const pk = this.$ID(id as any);
		return this.$db.delete(this.$table)
			.where(transformWhere(pk, this.$table))
			.then((result) => { result.rowCount; });
	}

	create(data: Partial<Model>): Promise<Model> {
		return this.$db.insert(this.$table)
			.values(Object.assign({}, data))
			.then((result) => result.rows[0]);
	}


	find(filter?: QueryWhere<Model>): Promise<Model[]> {
		const select = transformFilter(filter ?? {}, this.$table, this.$db);
		return select.then();
	}

	async findOne(filter?: QueryWhere<Model>): Promise<Model | null> {
		const clause = Object.assign({}, filter);
		clause.limit = 1;
		return this.find(clause)
			.then(result =>
				result.length ? result[0] : null
			);
	}

	async findById(id: ID, query?: FieldsQuery<Model> | undefined): Promise<Model> {
		const pk = this.$ID(id as any);
		const clause = Object.assign({}, query ?? {}, pk);
		const result = await this.$db.select()
			.from(this.$table)
			.where(transformWhere(clause, this.$table))
			.limit(1);
		if (result.length) {
			return result[0];
		}

		throw new Error(`not found`);
	}

}