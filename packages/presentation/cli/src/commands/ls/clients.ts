import { Command } from '@oclif/core';
import { BaseArgs, FilterFlags } from '../../base-command.js';
import { InstanceService } from '@ring-oauth/application';
import { g_context } from '@egc-io/ckit-lib';

export default class LsClients extends Command {
  static override args = BaseArgs;
  static override aliases: string[] = ['ls:cl'];
  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    ...FilterFlags
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(LsClients);
    const service: InstanceService = g_context.get<InstanceService>(InstanceService);

    const clientList = await service.clients(args.org_id, {
      ...flags,
      fields: [
        'org_id',
        'client_id',
        'name',
        'type',
        'allowed_callback_urls',
        'grant_types',
        'secret'
      ],
    });

    console.table(clientList);

  }
}
