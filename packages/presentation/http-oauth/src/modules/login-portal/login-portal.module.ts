import { MiddlewareConsumer, Module, NestModule, OnModuleInit } from "@nestjs/common";
import { FormController } from "./controllers/form/form.controller";
import { SSREngineService } from "./ssr-engine.service";
import { PortalSessionController } from "./controllers/session/portal-session.controller";
import { PortalCookieService } from './portal-cookie/portal-cookie.service';
import { CdnController } from './controllers/cdn/cdn.controller';
import { SsrMiddleware } from "./ssr.middleware";
import { PortalController } from './controllers/portal/portal.controller';

import routes from './routes';

@Module({
  providers: [SSREngineService, PortalCookieService],
  exports: [SSREngineService],
  controllers: [FormController, PortalSessionController, CdnController, PortalController],
})
export class LoginPortalModule implements NestModule, OnModuleInit {
  onModuleInit() { }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SsrMiddleware)
      .exclude(
        "/portal-session",
        "/cdn/*path",
        "/form/*path",
        "/.well-known",
        "/.well-known/*path",
        "/oauth",
        "/oauth/*path",
        "/authorize",
        "/token",
        "/par",
      )
      .forRoutes(...routes);
  }
}
