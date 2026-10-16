import {
  Controller,
  Get,
  Query,
  Res,
  HttpRedirectResponse,
  BadRequestException,
  Inject,
  Post,
  Body,
} from "@nestjs/common";
import { CodeRequest, PushedAuthorizationCallback } from "@ring-oauth/core";
import { g_context, log } from "@egc-io/ckit-lib";
import { CodeAuthorizationService } from "@ring-oauth/application";
import { FastifyReply } from "fastify";
import { OrgID } from "src/modules/common/org-domain/org-domain.service";

@Controller("oauth/authorize")
export class AuthorizationController {
  private readonly $service: CodeAuthorizationService;
  constructor(@Inject(OrgID) private orgID: OrgID) {
    this.$service = g_context.get<CodeAuthorizationService>(CodeAuthorizationService);
  }

  async _handle(
    data: CodeRequest,
    res: FastifyReply,
  ) {
    let codeRequest: CodeRequest;

    if (PushedAuthorizationCallback(data)) {
      codeRequest = await this.$service.pushAuthorizationCallback(this.orgID.id, data);
    } else if (CodeRequest(data)) {
      codeRequest = { ...data };
    } else {
      const raw = JSON.stringify(data);
      log.debug("is code request:", raw, "=>", CodeRequest(data));
      log.debug(
        "is par callback:",
        raw,
        "=>",
        PushedAuthorizationCallback(data),
      );
      throw new BadRequestException(`invalid_request`);
    }


    const result = await this.$service.authorize(this.orgID.id, codeRequest);
    const url = new URL(`/sign-in`, `${res.request.protocol}://${res.request.host}`);

    url.searchParams.set("client_id", result.client_id);

    if (result.connection) { url.searchParams.set("connection", result.connection); }
    if (result.login_hint) { url.searchParams.set("login_hint", result.login_hint); }

    url.searchParams.set("redirect_uri", result.redirect_uri);

    const redirection = url.toString();
    log.trace('redirect to', redirection);
    res.setCookie("ringoauth.login_session", result.jwt, {
      maxAge: 60_000,
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax',
    });
    res.redirect(redirection, 302);
    return res;
  }

  @Get()
  async get(
    @Query() data: CodeRequest,
    @Res({ passthrough: false }) response: FastifyReply,
  ): Promise<HttpRedirectResponse> { return this._handle(data, response); }

  @Post()
  async post(
    @Body() data: CodeRequest,
    @Res({ passthrough: false }) response: FastifyReply,
  ) { return this._handle(data, response); }

}
