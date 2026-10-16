import { g_context } from '@egc-io/ckit-lib';
import { Args, Command, Flags } from '@oclif/core';
import { IInstanceRepository, Instance, INSTANCE_REPOSITORY } from '@ring-oauth/core';
import { BaseArgs } from '../../base-command.js';
import { InstanceService } from '@ring-oauth/application';

export default class GetInst extends Command {
  static override args = BaseArgs;

  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    relations: Flags.string({
      delimiter: ',',
      multiple: true
    })
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetInst);

    let relations: Record<string, boolean> | undefined = undefined;

    if (flags.relations) {
      relations = {};
      for (const element of flags.relations ?? []) {
        relations[element] = true;
      }
    }

    const repo = await g_context.get<IInstanceRepository>(INSTANCE_REPOSITORY);
    const service = await g_context.get<InstanceService>(InstanceService);
    console.log(relations);
    const instance: Instance | null = await repo.findOne({
      where: { org_id: args.org_id },
    });

    console.table([instance]);

    if (!instance) { return; }

    let resourceList: { resource: string, values: object[]; }[] = [];

    if (relations?.clients) {
      resourceList.push(
        {
          resource: 'Clients',
          values: await service.clients(instance.org_id)
        }
      );
    }

    if (relations?.resource_servers ?? relations?.apis) {
      resourceList.push(
        {
          resource: 'Resource Servers',
          values: await service.apis(instance.org_id)
        }
      );
    }

    if (relations?.databases) {
      resourceList.push(
        {
          resource: 'Databases',
          values: await service.databases(instance.org_id)
        }
      );
    }


    if (relations?.users == true) {
      resourceList.push(
        {
          resource: 'Users',
          values: await service.users(instance.org_id)
        },
      );
    }

    for (const list of resourceList) {
      console.log(`${list.resource}:`);
      console.table(list.values);
    }

  }
}
