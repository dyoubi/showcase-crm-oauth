import { Args, Command, Flags } from '@oclif/core';
import { BaseArgs } from '../../base-command.js';
import { CreateDatabaseUseCase } from '@ring-oauth/application';
import { g_context } from '@egc-io/ckit-lib';
import { Database } from '@ring-oauth/core';
import { input } from '@inquirer/prompts';

export default class NewDatabase extends Command {
  static override args = BaseArgs;

  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %> <org_id> --name="Agent Users"',
  ];
  static override flags = {
    name: Flags.string({ name: 'name', description: 'database name' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NewDatabase);
    const use: CreateDatabaseUseCase = g_context.get<CreateDatabaseUseCase>(CreateDatabaseUseCase);
    const database: Database = await use.execute({
      org_id: args.org_id,
      database: {
        name: flags.name ?? (await input({ message: 'name' })),
      }
    });
    console.table([database]);
  }
}
