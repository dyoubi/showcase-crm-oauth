import { hostname } from "node:os";

import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import type { FastifyCookieOptions } from "@fastify/cookie";
import fastifyCookie from "@fastify/cookie";
import { FastifyOtelInstrumentation } from '@fastify/otel';

import { g_context, ILogger, setLogger } from "@egc-io/ckit-lib";

import { StoreModule } from "@ring-oauth/infra-redis";
import { PGModule } from "@ring-oauth/infra-database";
import { DomainModule } from "@ring-oauth/infra-domain";
import { I18nModule } from "@ring-oauth/i18n";
import { ThemeModule } from "@ring-oauth/theme";
import { EmailTransportModule } from "@ring-oauth/infra-email";
import {
  getInstruments, detectResources, envDetector, osDetector, hostDetector,
  processDetector, serviceInstanceIdDetector, resourceFromAttributes, Semantic
} from "@ring-oauth/otel";
import { HOSTNAME_OVERRIDE } from "@ring-oauth/infra-domain";

import { AppModule } from "./app.module";
import cors from "./cors";
import salt from "./salt";

import LoggerImpl from "./logger";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

let logger: ILogger;

async function bootstrap() {

  // first reading host informations
  const port = process.env.OAUTH_HTTP_PORT ? Number(process.env.OAUTH_HTTP_PORT) : 3000;
  const publicURL = new URL(process.env.OAUTH_PUBLIC_ENDPOINT ?? new URL(`http://${hostname()}`));

  // bind hostname
  g_context.bind<string>({ key: HOSTNAME_OVERRIDE, value: publicURL.toString() });

  // setup open telemetry
  /* const resource = detectResources({
    detectors: [
      osDetector,
      processDetector,
      serviceInstanceIdDetector,
      hostDetector,
      envDetector,
    ]
  }).merge(
    resourceFromAttributes({
      [Semantic.ATTR_SERVICE_NAME]: '@ring-oauth/http-oauth',
      [Semantic.ATTR_SERVICE_VERSION]: '@ring-oauth/http-oauth',
    })
  );

  const instruments = getInstruments(resource, { optl: { host: 'http://monitoring.egamingchain.lan:4318/v1', }, },
    [
      new HttpInstrumentation({ enabled: true, serverName: 'ring-oauth/http-oauth' }),
      new FastifyOtelInstrumentation({ enabled: true, servername: '@ring-oauth/http-oauth' }),
    ]
  );
  const otelLogger = instruments.loggerProvider.getLogger('@ring-oauth/http-oauth');

  logger = new LoggerImpl(otelLogger);
  setLogger(logger); */

  // boot injection context
  await g_context.bootstrap([PGModule, StoreModule, DomainModule, EmailTransportModule, I18nModule, ThemeModule]);

  // boot application
  const adapter = new FastifyAdapter({ logger: false });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  app.enableCors(cors);

  await app.register(fastifyCookie as any, {
    secret: salt,
    parseOptions: {
      httpOnly: true,
    },
  } as FastifyCookieOptions,
  );

  await app.listen(port, '0.0.0.0');

  console.log(`server listening on ${publicURL}`,);
  console.log(`server listening on ${await app.getUrl()}`,);

  // handle gracefull shutdown
  process.on("SIGINT", async () => {
    console.log('close application ...');
    await app.close();
    await g_context.shutdown(0);
  });
}

bootstrap().catch((error: Error) => {
  console.error(error.stack?.trim());
  process.exit(1);
});
