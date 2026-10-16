import { fetchJsonObject, resolveUrl } from "~/utils";

export const ENDPOINTS = {
	connections: '/portal/connections',
} as const;

export async function getConnections(client_id: string): Promise<string[]> {
	const res = fetchJsonObject<string[]>(resolveUrl(ENDPOINTS.connections));
	if (!res) { return []; }
	return res;
}