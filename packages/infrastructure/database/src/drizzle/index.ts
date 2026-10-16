import 'reflect-metadata';

import { Query, QueryWhere, Where } from "@egc-io/ckit-lib";
import { Client, Instance, PK_Client } from "@ring-oauth/core";
import { ClientTable, InstanceTable } from "./schema";

import { drizzle } from "drizzle-orm/node-postgres";
import { Repo } from './common/repository';

type A = {
	a: string;
	b: string;
};

type B = {
	b: string;
	c: string;
};

type PK = Extract<B, A>;



(async () => {
	const db = await drizzle("postgresql://ringoauth:ringoauth@dev-farod:5432/ringoauth", {
		logger: true,
	});

	const instances = new (class extends Repo<Instance, 'guid'> {
		override $ID(id: string): Pick<Instance, keyof Instance> {
			throw new Error('Method not implemented.');
		}
	})(db, ClientTable);

	const clients = new (class extends Repo<Client, PK_Client> {
		override $ID(id: PK_Client): PK_Client { return id; }
	})(db, ClientTable);

	const where: QueryWhere<Client> = {
		where: {
			grant_types: {
				inq: [
					'client_credentials'
				]
			},
		},
		limit: 1,
		offset: 1,
		sort: { name: 'DESC' }
	};

	console.log(await clients.find(where));

})().then().catch(console.error)

