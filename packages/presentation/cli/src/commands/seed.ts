import { g_context } from '@egc-io/ckit-lib';
import { Command } from '@oclif/core';
import { CreateClientUseCase, CreatePermissionUseCase, CreateResourceServerUseCase, I18nService, InstanceService } from '@ring-oauth/application';
import { ClientType, EAccessGrantType, ManagementResources, ResourceServer } from '@ring-oauth/core';


export default class Seed extends Command {
  static override args = {};
  static override description = 'seed the database with default values';
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  static override flags = {};


  public override async init(): Promise<any> {
    await super.init();
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Seed);
    const service = g_context.get<InstanceService>(InstanceService);
    const i18n = g_context.get<I18nService>(I18nService);
    const createRS: CreateResourceServerUseCase = g_context.get<CreateResourceServerUseCase>(CreateResourceServerUseCase);
    const createClient: CreateClientUseCase = g_context.get<CreateClientUseCase>(CreateClientUseCase);
    const createPerm: CreatePermissionUseCase = g_context.get<CreatePermissionUseCase>(CreatePermissionUseCase);
    // create root instance
    const root = await service.new({
      name: 'Root',
      org_id: 'org-root',
      user: { email: 'root@root', name: 'root', password: 'root', username: 'root' },
      tags: ['root', 'interal'],
    });

    const ringDomainList = [
      'localhost',
      'egamingchain.io',
    ];

    // create ringtech instance
    const ringtech = await service.new({
      name: 'RingTech',
      org_id: 'org-ringtech',
      user: { email: 'youbi_d@egamingchain.io', name: 'admin', password: 'admin', username: 'admin' },
      tags: ['ring', 'interal'],
    });
    type Foo = {
      name: string, identifier: string;
      scope_values?: string[];
    };
    const serviceList: Foo[] = [
      {
        name: 'Ring Oauth', identifier: 'ringoauth',
        scope_values: [...ManagementResources],
      },
      {
        name: 'Ring Coins', identifier: 'ringcoins',
        scope_values: ['coin'],
      },
      {
        name: 'Ring Coms', identifier: 'ringcoms',
        scope_values: ['email', 'sms', 'outbound', 'task'],
      },
      {
        name: 'Ring Admin', identifier: 'ringadmin',
        scope_values: ['org', 'brand', 'agent', 'role', 'permission'],
      },
      {
        name: 'Ring Wallet', identifier: 'ringwallet',
        scope_values: ['bank', 'wallet', 'balance', 'transaction'],
      },
      {
        name: 'Ring Game', identifier: 'ringgame',
        scope_values: ['catalogue', 'account', 'game', 'action'],
      },
      {
        name: 'Ring Finance', identifier: 'ringfinance',
        scope_values: ['cashier', 'merchant', 'deposit', 'withdraw', 'method'],
      },
      {
        name: 'Ring Users', identifier: 'ringusers',
        scope_values: ['user', 'profile'],
      },
      {
        name: 'Ring User Activity', identifier: 'ringua',
        scope_values: ['report', 'event'],
      },
      {
        name: 'Ring Casino', identifier: 'ringcasino',
        scope_values: ['brand', 'client', 'player', 'balance', 'machine', 'bonus', 'content', 'feature', 'program'],
      },
      {
        name: 'Ring Casino Public Gateway', identifier: 'ringcasino-gtw',
        scope_values: ['casino', 'player', 'balance', 'machine', 'bonus', 'content', 'feature', 'program'],
      },
      {
        name: 'Ring Office Public Gateway', identifier: 'ringoffice-gtw',
        scope_values: ['brand', 'player', 'balance', 'machine', 'bonus', 'content', 'feature', 'program'],
      },
    ];
    const rsList: ResourceServer[] = await Promise.all(
      serviceList.map((v: Foo, index: number) => {
        return createRS.execute({
          org_id: ringtech.org_id, resource_server: {
            name: v.name,
            identifier: `rs_${v.identifier}`.toLowerCase()
          }
        }).then(rs => {
          if (serviceList[index].scope_values) {
            return createPerm.execute({
              org_id: rs.org_id,
              resource_server_identifier: rs.identifier,
              scope: (serviceList[index].scope_values ?? []).map(scope_value => ({ scope_value }))
            }).then(() => rs);
          } else { return rs; }
        });
      })
    );

    const clientList = await Promise.all(
      serviceList.map(v =>
        createClient.execute({
          org_id: ringtech.org_id, client: {
            name: v.name,
            allowed_callback_urls: ringDomainList.map(domain => new URL(`http://${domain}/oauth/callback`).toString()),
            allowed_logout_urls: ringDomainList.map(domain => new URL(`http://${domain}/oauth/logout`).toString()),
            allowed_web_origins: ringDomainList,
            type: ClientType.BACKEND,
            grant_types: Object.values(EAccessGrantType),
          }
        })
      )
    );

    await i18n.setDefault(ringtech.org_id);

    console.log('resource servers:');
    console.table(rsList.map(rs => ({ identifier: rs.identifier })));
    console.log('clients:');
    console.table(clientList.map(client => ({ name: client.name, client_id: client.client_id, client_secret: client.secret })));

  }
}
