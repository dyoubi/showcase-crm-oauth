import { Command, Flags } from '@oclif/core';
import * as readline from "node:readline/promises";

import { stdin, stdout } from "node:process";

import { InstanceService } from '@ring-oauth/application';
import { g_context } from '@egc-io/ckit-lib';
import { randomBytes } from 'node:crypto';
import { HashID } from '@ring-oauth/core';

export default class NewInst extends Command {
  static override args = {};
  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    org_id: Flags.string({}),
    name: Flags.string({}),
    email: Flags.string({}),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(NewInst);


    let org_id = flags.org_id;
    let name = flags.name;
    let email = flags.email;
    let answer: string = '';

    const rl = readline.createInterface({ input: stdin, output: stdout });

    if (!org_id) {
      answer = await rl.question("org_id : ");
      if (answer.length < 8 || answer.length > 24) {
        console.log(`org_id don't respect format`);
        this.exit(1);
      }
      org_id = answer;
    }
    console.log(`org_id : ${org_id}`);

    if (!name) {
      let defaultName: string = `Instance ${org_id}`;
      name = await rl.question(`instance name (${defaultName}) : `);
      if (answer.length === 0) {
        name = defaultName;
      } else {
        name = answer;
      }
    }
    console.log(`instance name : ${name}`);

    if (!email) {
      while (!email?.length) {
        answer = await rl.question(`email : `);
        if (answer.length) { email = answer; }
      }
    }

    console.log(`email : ${email}`);

    rl.close();

    const service = g_context.get<InstanceService>(InstanceService as any);

    try {
      const password = HashID(randomBytes(8).toString());
      const instance = await service.new({
        org_id,
        name,
        user: {
          email,
          username: 'admin',
          name: 'Administrator',
          password,
        },
        tags: ['from-cli'],
      });

      console.table([{ email, password, instance: instance.org_id }]);

    } catch (error) {
      console.error(error);
      console.error(`❗️ cannot create instance : ${(error as Error).message}`);
      this.exit(1);
    }

  }
}
