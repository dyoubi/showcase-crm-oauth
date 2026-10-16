export class Model {

}

export class BusinessModel extends Model {
	created_at: Date = new Date();
	updated_at: Date | null = null;
	created_by: string;
	updated_by: string | null = null;
}

export type BusinessModelReadOnlyFields = keyof Omit<BusinessModel,
	| 'guid'
	| 'created_at'
	| 'created_by'
>;

export interface Revokable {
	revoked: boolean;
	revoked_at: Date | null;
}