export interface ITable<T, ID> {
	push(data: any): Promise<void>;
	pull(pk: ID): Promise<T | null>;
	pop(pk: ID): Promise<void>;
	has(pk: ID): Promise<boolean>;
}