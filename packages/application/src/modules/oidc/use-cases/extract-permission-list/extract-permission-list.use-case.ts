import { BadRequestException, injectable, IUseCase, log } from "@egc-io/ckit-lib";
import { AuthorizationDetails, ScopeToPermissionList } from "@ring-oauth/core";

export type AuthDetailsItem = {
    resource_server_identifier: string,
    scope_value: string;
    resource?: unknown;
};

export type ExtractPermissionListUseCaseIn = {
    audience: string;
    authorization_details?: AuthorizationDetails[];
    scope?: string;
};
type ExtractPermissionListUseCaseOut = AuthDetailsItem[];

function isValideType(v: string) {
    if (typeof v !== 'string' || v === null || v === undefined) {
        return false;
    }
    return !v.match(/[,;/ ]/);
}

function ensureObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function getByteLength(value: unknown): number {
    try { return Buffer.byteLength(JSON.stringify(value), 'utf8'); }
    catch { return Number.MAX_SAFE_INTEGER; }
}

const MAX_AUTHZ_DETAILS = 10;
const MAX_RESOURCE_BYTES = 8 * 1024; // 8KB, to adjust or configure

/**
 * Extract the permission list from the request.
 * Fails if the authorization_details parameters exeed the maximum size
 */
@injectable()
export class ExtractPermissionListUseCase implements IUseCase<ExtractPermissionListUseCaseIn, ExtractPermissionListUseCaseOut> {
    execute(input: ExtractPermissionListUseCaseIn): ExtractPermissionListUseCaseOut {
        if (!input.scope && !input.authorization_details) { return []; }

        let audiences: string[] = [input.audience];

        const seens: Record<string, Set<string>> = Object.fromEntries([
            ['', new Set()],
            ...audiences.map(a => [a, new Set()]),
        ]);

        let permList: {
            resource_server_identifier: string;
            scope_value: string;
            resource?: unknown;
        }[] = [];

        if (input.scope?.length) {
            log.trace('map scope to permission list');
            for (const perm of ScopeToPermissionList(input.scope)) {
                if (!seens[perm.resource_server_identifier]) {
                    log.error(`no reference to ${perm.resource_server_identifier} in audience list`);
                    throw new BadRequestException('invalid_request');
                }
                log.trace(`${perm.resource_server_identifier} => ${perm.scope_value}`);
                seens[perm.resource_server_identifier].add(perm.scope_value);
            }
        }

        for (const details of input.authorization_details ?? []) {
            if (!ensureObject(details)) {
                log.error(`!ensureObject(details) : False`);
                throw new BadRequestException('invalid_authorization_details');
            }
            const audience = details.audience.trim();
            const scope_value = details.type.trim();
            if (!audience || !scope_value) {
                log.error(`!audience || !scope_value`);
                throw new BadRequestException('invalid_authorization_details');
            }

            if (!isValideType(scope_value)) {
                log.error(`!isValideType(scope_value)`);
                throw new BadRequestException(`invalid_authorization_details`);
            }
            const resource = details.resource;
            if (resource !== undefined) {
                if (!ensureObject(resource)) {
                    throw new BadRequestException('invalid_authorization_details');
                }
                if (getByteLength(resource) > MAX_RESOURCE_BYTES) {
                    throw new BadRequestException('invalid_authorization_details');
                }
            }

            if (!seens[audience]) {
                log.error(`no reference to ${audience} in audience list`);
                throw new BadRequestException('invalid_authorization_details');
            }

            if (seens[details.audience].has(details.type)) {
                log.warn(`duplicate scope_value ${details.type} in audience ${details.audience}`);
            }

            seens[details.audience].add(details.type);

            permList.push({
                resource_server_identifier: details.audience,
                scope_value: details.type,
                resource: details.resource
            });
        }

        return permList;
    }
}
