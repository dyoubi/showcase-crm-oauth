import { Command, Flags } from '@oclif/core';
import { BaseArgs, FilterFlags } from '../../base-command.js';
import { g_context } from '@egc-io/ckit-lib';
import { InstanceService } from '@ring-oauth/application';

export default class LsUsers extends Command {
  static override args = BaseArgs;
  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static override flags = {
    ...FilterFlags,
    connection: Flags.string()
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(LsUsers);
    const { limit, offset } = flags;
    const service = g_context.get<InstanceService>(InstanceService);
    const userList = await service.users(args.org_id, {
      ...{ limit, offset },
      where: flags.connection ? { connection: flags.connection } : undefined
    });
    console.table(userList);
  }
}
