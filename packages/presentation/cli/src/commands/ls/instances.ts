import { g_context } from '@egc-io/ckit-lib';
import { Command, Flags } from '@oclif/core';

import { IInstanceRepository, Instance, INSTANCE_REPOSITORY, Relation, User } from "@ring-oauth/core";

export default class LsInstances extends Command {
  static override aliases: string[] = ['ls:inst', 'ls:org'];
  static override args = {};
  static override description = 'List instances';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    limit: Flags.integer({
      description: 'Maxium number of element to return'
    }),
    offset: Flags.integer({
      description: 'Offset element in list',
      dependsOn: ['limit'],
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(LsInstances);
    const repo = await g_context.get<IInstanceRepository>(INSTANCE_REPOSITORY);
    const instanceList: (Instance & Partial<Relation<User[], 'users'>>)[] = await repo.find({
      limit: flags.limit,
      offset: flags.offset,
      sort: { created_at: 'DESC' },
      fields: ['org_id', 'name', 'tags', 'created_at']
    });

    console.table(instanceList);
  }
}