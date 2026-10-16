import { g_context } from '@egc-io/ckit-lib';
import { input } from '@inquirer/prompts';
import { Args, Command, Flags } from '@oclif/core';
import { CreateClientUseCase } from '@ring-oauth/application';
import { EAccessGrantType, ClientType, EPKCEMethod } from '@ring-oauth/core';

export default class NewClient extends Command {
  static override args = {
    org_id: Args.string({ name: 'org_id', required: true }),
  };
  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    name: Flags.string(),
    callbacks: Flags.string({ multiple: true }),
    grantTypes: Flags.string({
      multiple: true, options: Object.values(EAccessGrantType), default: [
        EAccessGrantType.AUTHORIZATION_CODE,
        EAccessGrantType.REFRESH_TOKEN,
      ]
    }),
    allowImplicit: Flags.boolean({ default: false }),
    use_pkce: Flags.boolean({ default: true }),
    type: Flags.string({ options: Object.values(ClientType), default: ClientType.CSR })
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NewClient);

    const use = g_context.get<CreateClientUseCase>(CreateClientUseCase);
    const client = await use.execute({
      org_id: args.org_id,
      client: {
        name: flags.name ?? await input({ message: 'name' }),
        allowed_callback_urls: flags.callbacks,
        allow_implicit: flags.allowImplicit,
        grant_types: flags.grantTypes as undefined | EAccessGrantType[],
        pkce_method: EPKCEMethod.S256,
        use_pkce: flags.use_pkce,
        type: flags.type ? flags.type as ClientType : undefined,
      }
    });

    console.table([client]);
  }
}
