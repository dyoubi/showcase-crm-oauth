import { Where, Operators, OperatorsLiteral, QueryWhere } from "@egc-io/ckit-lib";
import {
	and, between, Column, eq, gt, gte, ilike,
	inArray, like, lt, lte, not, notIlike, notInArray,
	notLike, or, SQL, Table, isNull,
	isNotNull,
	arrayContains,
	arrayOverlaps,
	asc,
	desc,
	count,
} from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

const operators: ReadonlySet<string> = new Set<string>([...OperatorsLiteral]);

function isOperator(k: string): k is Operators { return operators.has(k); }
function isOperatorObject(v: unknown): v is Record<Operators, unknown> {
	if (typeof v !== 'object' || !v) { return false; }
	const keys = Object.keys(v as object);
	if (keys.length > 1) { return false; }
	return isOperator(keys[0]);
}

function mapOperatorObject(value: Record<Operators, unknown>, column: Column) {
	if (!isOperatorObject(value)) {
		throw new TypeError(`value is not an operator object`);
	}
	const operator = Object.keys(value)[0] as Operators;
	return mapOperator(operator, value[operator], column);
}

function mapOperator<T = unknown>(
	key: Operators,
	value: T,
	column: Column
): SQL | SQL[] {
	const valueType = typeof value;
	if (valueType === 'undefined') { return []; }

	if (isOperatorObject(value)) { return mapOperatorObject(value, column); }

	switch (key) {
		case 'eq': return value === null ? isNull(column) :
			column.dataType === 'array' ?
				arrayContains(column, value) :
				eq(column, value);
		case "neq": return value === null ? isNotNull(column) :
			column.dataType === 'array' ?
				not(arrayContains(column, value)) :
				not(eq(column, value));
		case "gt": return gt(column, value);
		case "gte": return gte(column, value);
		case "lt": return lt(column, value);
		case "lte": return lte(column, value);
		case "like": if (valueType !== 'string') { throw new TypeError(`value type must be string`); } return like(column, value as string);
		case "nlike": if (valueType !== 'string') { throw new TypeError(`value type must be string`); } return notLike(column, value as string);
		case "ilike": if (valueType !== 'string') { throw new TypeError(`value type must be string`); } return ilike(column, value as string);
		case "nilike": if (valueType !== 'string') { throw new TypeError(`value type must be string`); } return notIlike(column, value as string);
		case "inq":
			if (!Array.isArray(value)) { throw new TypeError(`valuse must be an array`); }
			if (column.dataType === 'array') { return arrayOverlaps(column, value); }
			return inArray(column, value);
		case "nin":
			if (!Array.isArray(value)) { throw new TypeError(`valuse must be an array`); }
			if (column.dataType === 'array') { return not(arrayOverlaps(column, value)); }

			return notInArray(column, value);
		case "between":
			{
				if (!Array.isArray(value)) { throw new TypeError(`valuse must be an array`); }
				if (value.length !== 2) {
					throw new TypeError(`values me be an array of two element`);
				}
				return between(column, value[0], value[1]);
			}
		case "regexp":
		case "exists":
		default: throw new TypeError(`cannot parse operator ${key}`);
	}
}

export function transformWhere<T extends object = any>(where: Where<T>, table: Table): SQL | undefined {
	const sqlList: SQL[] = [];
	for (const columnName in where) {
		const value = where[columnName];
		const columnSQL: SQL[] = [];

		if (value === undefined) { continue; }

		const column = table[columnName as keyof typeof table] as Column;
		if (!column) { throw new ReferenceError(`unkown column name ${columnName}`); }

		if (isOperatorObject(value)) {
			const operator = Object.keys(value)[0] as Operators;
			const matchValue = value[operator];
			if (operator === 'or' || operator === 'and') {
				if (!Array.isArray(matchValue)) { throw new TypeError(`${operator} match values must be an array`); }

				const sql = operator === 'or' ?
					or(...matchValue.flatMap(v => Object.keys(v)
						.flatMap(k => mapOperator(k as Operators, v[k as keyof typeof v], column))
					)) :
					and(...matchValue.flatMap(v => Object.keys(v)
						.flatMap(k => mapOperator(k as Operators, v[k as keyof typeof v], column))
					));

				if (sql) { sqlList.push(sql); }

			} else {
				const sql = mapOperator(operator, matchValue, column);
				if (Array.isArray(sql)) { columnSQL.push(...sql); }
				else { columnSQL.push(sql); }
			}
		}
		else if (value === null) { columnSQL.push(isNull(column)); }
		else { columnSQL.push(eq(column, value)); }
		sqlList.push(...columnSQL);
	}
	return and(...sqlList);
}

export function transformFilter<Model extends object = any>(
	filter: QueryWhere<Model>,
	table: Table,
	database: NodePgDatabase,
	countRow?: boolean,
) {
	let select = (countRow ?
		database.select({ count: count() }) :
		database.select())
		.from(table)
		.where(transformWhere<Model>(filter?.where ?? {}, table));

	if (filter?.limit) { select = select.limit(filter?.limit) as unknown as typeof select; }
	if (filter?.offset) { select = select.offset(filter.offset) as unknown as typeof select; }
	if (filter?.sort) {
		const columnList = Object.keys(filter.sort).map(k =>
			table[k as (keyof typeof table)]
		) as Column[];
		select = select.orderBy(...
			Object.keys(filter.sort)
				.map(k =>
					filter.sort![k as (keyof typeof filter.sort)]!.toUpperCase() === 'DESC' ?
						desc((table as any)[k]) :
						asc((table as any)[k])
				)
		) as unknown as typeof select;
		if (countRow) {
			select = select.groupBy(...columnList as any[]) as unknown as typeof select;;
		}
	}

	return select;
}