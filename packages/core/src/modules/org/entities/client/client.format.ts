import { Client } from "./client.model";

export type ClientTokenParams = Pick<Client,
    | 'client_id'
    | 'id_token_expiration'
    | 'refresh_token_expiration'
    | 'token_sender_constraining'
>;
export function clientToIssueTokenParams(client: Client): ClientTokenParams {
    const fields: (keyof ClientTokenParams)[] = [
        'client_id',
        'id_token_expiration',
        'refresh_token_expiration',
        'token_sender_constraining',
    ];
    const entries: [keyof ClientTokenParams, any][] = [];
    for (const k of fields) {
        const value = client[k];
        if (value === undefined || value === null) {
            throw new TypeError(`missing field ${k} in object ${JSON.stringify(client)}`);
        }
        entries.push([k, value]);
    }
    return Object.fromEntries(entries) as ClientTokenParams;
}

export function IsJsonWebKey(obj: Record<string, unknown>) {

}