import {
  g_context,
  BadRequestException,
  NotFoundException,
  log,
} from "@egc-io/ckit-lib";
import {
  BadRequestException as BadRequest,
  Body, Controller, Inject, InternalServerErrorException,
  Post, Req, Res,
} from "@nestjs/common";
import { CodeAuthorizationService } from "@ring-oauth/application";
import {
  JsonAuthorizationRequest, CodeRequest,
} from "@ring-oauth/core";
import { FastifyReply, FastifyRequest } from "fastify";
import { OrgID } from "src/modules/common/org-domain/org-domain.service";

@Controller("/oauth/par")
export class ParController {
  constructor(@Inject(OrgID) private orgID: OrgID) {
  }

  @Post()
  async pushAuthorizationRequest(
    @Body() request: JsonAuthorizationRequest | CodeRequest,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    try {
      const service = g_context.get<CodeAuthorizationService>(
        CodeAuthorizationService,
      );
      const result = await service.pushAuthorizationRequest(
        this.orgID.id,
        request,
      );
      const url = new URL('/oauth/authorize', `${req.protocol}://${req.host}`);
      if (result.request_uri) {
        url.searchParams.set("client_id", String(result.client_id));
        url.searchParams.set("request_uri", String(result.request_uri));
      }
      const redirection = url.toString();
      log.trace("redirect client to", redirection);
      res.redirect(redirection, 302);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof TypeError ||
        error instanceof ReferenceError
      ) {
        throw new BadRequest(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
