import { Args, Command, Flags } from '@oclif/core';
import { BaseArgs } from '../../base-command.js';
import { CreateUserUseCase } from '@ring-oauth/application';
import { g_context } from '@egc-io/ckit-lib';
import { input } from '@inquirer/prompts';
import { CredentialType, ECredentialType } from '@ring-oauth/core';

export default class NewUser extends Command {
  static override args = BaseArgs;

  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    email: Flags.string({}),
    username: Flags.string({}),
    password: Flags.string({}),
    connection: Flags.string({ description: 'database name to use' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NewUser);
    const use: CreateUserUseCase = g_context.get<CreateUserUseCase>(CreateUserUseCase);

    const user = await use.execute({
      org_id: args.org_id,
      user: {
        email: flags.email ?? await input({ message: 'email' }),
        username: flags.username ?? await input({ message: 'username' }),
      },
      credentials: {
        type: ECredentialType.PASSWORD,
        value: flags.password ?? await input({ message: 'password' }),
      },
      connection: flags.connection ?? await input({ message: 'connection' }),
    });
    console.table([user]);
  }
}
