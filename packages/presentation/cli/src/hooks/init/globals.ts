import { Hook } from '@oclif/core';

import { g_context } from "@egc-io/ckit-lib";
import { PGModule } from "@ring-oauth/infra-database";
import { DomainModule } from "@ring-oauth/infra-domain";
import { I18nModule, HTMLTemplateModule } from "@ring-oauth/i18n";

const hook: Hook<'init'> = async function (opts) {
  await g_context.bootstrap([PGModule, DomainModule, I18nModule, HTMLTemplateModule]);
};

export default hook;
