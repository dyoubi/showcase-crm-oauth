import { g_context } from '@egc-io/ckit-lib';
import { input } from '@inquirer/prompts';
import { Args, Command, Flags } from '@oclif/core';
import { CreateClientUseCase, CreateResourceServerUseCase, InstanceService } from '@ring-oauth/application';
import { ResourceServer } from '@ring-oauth/core';

export default class NewResourceServer extends Command {
  static override aliases: string[] = ['new:rs', 'new:api'];
  static override args = {
    org_id: Args.string({ name: 'org_id', required: true }),
  };
  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    name: Flags.string({ required: false })
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NewResourceServer);

    const use = g_context.get<CreateResourceServerUseCase>(CreateResourceServerUseCase);
    use.execute({
      org_id: args.org_id,
      resource_server: {
        name: flags.name ?? (await input({ message: 'name' })),
      }
    });

  }
}
