import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { join } from "node:path";
import { ViteDevServer } from "vite";
import { fastifyStatic } from "@fastify/static";
import { log } from "@egc-io/ckit-lib";

type ConnectHandler = (req: any, res: any, next: (err?: any) => void) => any;

const DEVELOPMENT = process.env.NODE_ENV === "production" ? false : true;
const APP_ROOT = join(__dirname, "../../../../", "login-portal");

@Injectable()
export class SSREngineService implements OnModuleInit, OnModuleDestroy {
  private handler: ConnectHandler = (_req, _res, next) => next();
  private vite: ViteDevServer | null = null;

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  async onModuleInit() {
    let app;
    try {
      app = this.httpAdapterHost.httpAdapter.getInstance();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`cannot get fastify instance`);
      }
    }

    // await fastify.register(middie);

    if (DEVELOPMENT) {
      log.info("create vite server ...");
      // -------- DEV: Vite middleware + SSR dynamique --------
      const vite = await import("vite");
      this.vite = await vite.createServer({
        root: APP_ROOT,
        server: {
          middlewareMode: true,
          allowedHosts: true
        },
        appType: "custom",

      });

      // HMR/transform/serve static dev par Vite
      app.use((req, res, next) => {
        const pathname = new URL(req.url || "/", "http://x").pathname;
        if (
          pathname.startsWith("/@vite") ||
          pathname.startsWith("/@id/") ||
          pathname.startsWith("/@fs/") ||
          pathname === "/@react-refresh" ||
          pathname.startsWith("/__vite") ||
          pathname.startsWith("/app/") ||
          pathname.startsWith("/__manifest") ||
          /\.(ts|tsx|js|jsx|mjs|css|map|ico)$/.test(pathname)
        ) {
          return this.vite?.middlewares(req, res, next);
        }
        next();
      });

      // handler SSR: load /server/app.ts middleware
      const mod = await this.vite!.ssrLoadModule("/server/app.ts");
      this.handler = async (req, res, next) => {
        try {
          return (mod.app as ConnectHandler)(req, res, next);
        } catch (error) {
          if (this.vite?.ssrFixStacktrace && error?.stack) {
            this.vite.ssrFixStacktrace(error);
          }
          next(error);
        }
      };
    } else {
      // -------- PROD: static /assets + bundle serveur --------
      log.info("register asset bundle ...");
      await app.register(fastifyStatic, {
        root: join(APP_ROOT, "build/client/assets"),
        prefix: "/assets/",
        immutable: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        index: false,
        decorateReply: false,
      });

      // charge l’app SSR (Express RequestHandler)
      const { app: ssrApp } = await import(
        join(APP_ROOT, "build/server/index.js")
      );
      this.handler = (req, res, next) =>
        (ssrApp as ConnectHandler)(req, res, next);
    }
  }

  async onModuleDestroy() {
    if (this.vite) {
      await this.vite.close().catch(() => void 0);
      this.vite = null;
    }
  }

  get handle(): ConnectHandler {
    return this.handler;
  }
}
