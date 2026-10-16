import { Query, Where } from "@egc-io/ckit-lib";

export type PrismaLiteralOperator =
    | 'equals'
    | 'not'
    | 'notIn'
    | 'lt'
    | 'gt'
    | 'gte'
    | 'contains'
    | 'search'
    | 'startsWith'
    | 'endsWith';

export type PrismaLiteralMode =
    | 'insensitive';

export type PrismaLiteralFilter<T extends object> = {
    [P in keyof T]?: {
        [K in PrismaLiteralOperator]?: T[P];
    } & { mode?: PrismaLiteralMode; };
};
export type PrismaWhereValue<T extends object> = { [P in keyof T]?: T[P] } | PrismaLiteralFilter<T>;

export type PrismaConditionOperator = 'OR' | 'AND' | 'NOT';
export type PrismaWhere<T extends object> = (PrismaWhereValue<T>)
    | { [K in PrismaConditionOperator]?: PrismaWhereValue<T>[] };


export type PrismaFilter<T extends object> = {
    select?: Record<keyof T, boolean>;
    take?: number;
    skip?: number;
    where?: PrismaWhereValue<T>;
    include?: Partial<Record<keyof T, boolean>>;
};

export type WhereTransform<T extends object> = (q: Where<T>) => void;

export function PrismaWhereTransform<T extends object>(q: Where<T>[] | Where<T>): PrismaWhereValue<T> {
    const where: Record<string, any> = {};
    if (Array.isArray(q)) {
        where.OR = q.map(v => PrismaWhereTransform(v));
        return where;
    }
    try {
        for (const key in q) {
            if (q.hasOwnProperty(key)) {
                const value = q[key];
                if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    where[key] = {};
                    for (const operator in value) {
                        const k = operator as keyof typeof value;
                        if (value.hasOwnProperty(operator)) {
                            switch (operator) {
                                case "eq":
                                    const eqVal = value[k];
                                    where[key] = Array.isArray(eqVal) ? { hasEvery: eqVal } : eqVal;
                                    break;
                                case "neq":
                                    where[key] = { not: value[k] };
                                    break;
                                case "gt":
                                case "gte":
                                case "lt":
                                case "lte":
                                    where[key] = { [operator]: value[k] };
                                    break;
                                case "inq":
                                    const inVal = value[k];
                                    where[key] = {
                                        in: Array.isArray(inVal) ? inVal : [inVal]
                                    };
                                    break;
                                case "nin":
                                    const notInVal = value[k];
                                    where[key] = {
                                        notIn: Array.isArray(notInVal) ? notInVal : [notInVal]
                                    };
                                    break;
                                case "between":
                                    where[key] = { gte: (value[k] as [any, any])[0], lte: (value[k] as [any, any])[1] };
                                    break;
                                case "like":
                                    where[key] = { contains: value[k] };
                                    break;
                                case "nlike":
                                    where[key] = { NOT: { contains: value[k] } };
                                    break;
                                case "ilike":
                                    where[key] = { contains: value[k], mode: "insensitive" };
                                    break;
                                case "nilike":
                                    where[key] = { NOT: { contains: value[k], mode: "insensitive" } };
                                    break;
                                case "regexp":
                                    where[key] = { contains: value[k] };
                                    break;
                                case "and":
                                    where.AND = (value[k] as Where<T>[]).map(PrismaWhereTransform);
                                    break;
                                case "or":
                                    where.OR = (value[k] as Where<T>[]).map(PrismaWhereTransform);
                                    break;
                                default:
                                    where[key] = value[k];
                                    break;
                            }
                        }
                    }
                } else {
                    where[key] = Array.isArray(value) ? { hasEvery: value } : value;
                }
            }
        }

    } catch (error) {
        throw new TypeError(`PrismaWhereTransform  : cannot parse object ${JSON.stringify(q)} ${error.message}`);
    }
    return where;
}


export function PrismaQueryTransformer<T extends object>(q: Query<T>): PrismaFilter<T> {
    const filter: PrismaFilter<T> = {};
    try {
        if (q.where) {
            filter.where = PrismaWhereTransform(q.where);
        }

        if (q.relations) {
            filter.include = q.relations as Partial<Record<keyof T, boolean>>;
        }

        if (q.limit) { filter.take = q.limit; }
        if (q.offset) { filter.skip = q.offset; }

        if (q.fields && !q.relations) {
            const select: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
            for (const field of q.fields) {
                select[field] = true;
            }
            filter.select = select;
        }
    } catch (error) {
        throw new TypeError(`PrismaQueryTransformer : cannot transform object ${JSON.stringify(q)} ${error.message}`);
    }

    return filter;
}