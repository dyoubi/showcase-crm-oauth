import { log } from "@egc-io/ckit-lib";
import { PrismaClient } from "@prisma/client";

type PGOpts = {
	PG_HOST: string;
	PG_DATABASE: string;
	PG_PORT: number;
	PG_USER: string;
	PG_PASSWORD: string;
};

let g_prisma: PrismaClient | null = null;

export function client(): PrismaClient {
	if (g_prisma) {
		return g_prisma;
	}
	log.info(`connect prisma client ...`);

	const env = process.env;
	const opts: PGOpts = {
		PG_DATABASE: String(env.PG_DATABASE),
		PG_HOST: String(env.PG_HOST),
		PG_PORT: env.PG_PORT ? Number(env.PG_PORT) : 5432,
		PG_PASSWORD: String(env.PG_PASSWORD),
		PG_USER: String(env.PG_USER),
	};

	log.info(`PGOpts : ${JSON.stringify(opts)}`);

	const prisma: PrismaClient = new PrismaClient({
		datasources: {
			db: { url: `postgresql://${opts.PG_USER}:${opts.PG_PASSWORD}@${opts.PG_HOST}:${opts.PG_PORT}/${opts.PG_DATABASE}` },
		},
		log: ['info', 'warn', 'error'],
	});

	g_prisma = prisma;

	return g_prisma;
}

export async function disconnect() {
	log.info(`disconnect prisma client ...`);
	if (g_prisma) {
		await g_prisma.$disconnect();
	}
	g_prisma = null;
	log.info(`prisma client disconnected`);
}