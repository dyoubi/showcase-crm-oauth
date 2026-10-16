import { g_context } from '@egc-io/ckit-lib';
import { InstanceService } from '@ring-oauth/application';
import { BaseArgs, FilterFlags } from '../../base-command.js';
import { Command, Args, Flags } from '@oclif/core';

export default class LsResourceServers extends Command {
  static override aliases: string[] = ['ls:apis', 'ls:rs'];
  static override args = BaseArgs;
  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = FilterFlags;

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(LsResourceServers);

    const service = g_context.get<InstanceService>(InstanceService);
    const rsList = await service.apis(args.org_id, {
      ...flags
    });

    console.table(rsList);

  }
}
