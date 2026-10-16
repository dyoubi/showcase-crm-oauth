import { Args, Command, Flags } from '@oclif/core';
import { BaseArgs, FilterFlags } from '../../base-command.js';
import { g_context } from '@egc-io/ckit-lib';
import { InstanceService } from '@ring-oauth/application';

export default class LsDatabases extends Command {
  static override args = BaseArgs;
  static override aliases: string[] = ['ls:db'];
  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = FilterFlags;

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(LsDatabases);

    const service = g_context.get<InstanceService>(InstanceService);
    const databaseList = await service.databases(args.org_id, {
      limit: flags.limit,
      offset: flags.offset,
    });

    console.table(databaseList);
  }
}
