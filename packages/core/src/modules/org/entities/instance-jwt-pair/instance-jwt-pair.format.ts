import { InstanceJwtPairType } from ".";

export function toJwks(keys: InstanceJwtPairType[]) {
	const publicItems = keys.map(({ pub, kid, use, alg }) => {
		const { d, p, q, dp, dq, qi, oth, k, ...safe } = pub as any;
		const jwk: any = { ...safe, kid };
		if (use) jwk.use = use;
		jwk.alg = (pub as any).alg ?? alg;
		return jwk;
	});
	return { keys: publicItems };
}