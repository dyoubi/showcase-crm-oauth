import { Args, Command, Flags } from '@oclif/core';
import { EAuthorizationResponseType, PushAuthorizationSession } from '@ring-oauth/core';
import { createHash, randomBytes } from 'crypto';
import { createInterface } from 'readline/promises';

export default class Login extends Command {
  static override args = {
    org_id: Args.string({ required: true, name: 'org_id' }),
    audience: Args.string({ required: true, name: 'audience' }),
    client_id: Args.string({ required: true, name: 'client_id' }),
  };

  static override description = 'describe the command here';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {
    login_hint: Flags.string({ name: 'login_hint' }),
    connection: Flags.string({ name: 'connection' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Login);
    const { org_id, audience, client_id } = args;

    console.log(org_id, audience, client_id);

    const nonce = randomBytes(8).toString('hex');
    const state = randomBytes(8).toString('hex');
    const code_verifier = randomBytes(32)
      .toString('base64url');
    const code_challenge = createHash('sha256')
      .update(code_verifier)
      .digest('base64url');

    const rl = createInterface({ input: process.stderr, output: process.stdout });

    const connection = (await rl.question('connection ?')).trim();

    const request = {
      audience,
      client_id,
      redirect_uri: 'http://org-ringtech.localhost:3000/',
      authorization_details: [],
      code_challenge,
      nonce,
      state,
      connection,
      login_hint: '',
      pkce_method: 'S256',
      response_type: EAuthorizationResponseType.ID_TOKEN_TOKEN,
      scope: 'openid profile email',
    };

    console.log(request);

    const response = await fetch(`http://${org_id}.localhost:3000/oauth/par`, {
      method: "POST",
      redirect: "manual",
      headers: [['content-type', 'application/json']],
      body: JSON.stringify(request)
    });

    if (response.status >= 400) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    console.log(response.status, response.statusText, response.ok);
    console.log(await response.text());

    console.log('redirection to ', response.url);

  }
}
