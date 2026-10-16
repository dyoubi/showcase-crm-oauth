import { Injectable, NestMiddleware } from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";
import { SSREngineService } from "./ssr-engine.service";

@Injectable()
export class SsrMiddleware implements NestMiddleware {
  constructor(private readonly ssr: SSREngineService) { }

  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    return this.ssr.handle(req, res, next);
  }
}
