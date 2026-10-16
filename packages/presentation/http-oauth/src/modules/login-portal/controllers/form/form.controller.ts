import { BadRequestException, g_context, log, NotFoundException } from "@egc-io/ckit-lib";
import { Controller, Post, Body, Inject, Redirect, Res, } from "@nestjs/common";
import * as HttpErrors from "@nestjs/common/exceptions";
import {
  CodeAuthorizationService, TicketService,
  UserService,
  ValidateChallengeRequestUseCase,
  ValidateChallengeTokenUseCase
} from "@ring-oauth/application";
import {
  ECredentialType, EResetMode,
  ETicketUsage, TicketChallenge
} from "@ring-oauth/core";
import { FastifyReply } from "fastify";

import { OrgID } from "src/modules/common/org-domain/org-domain.service";

@Controller("/form")
export class FormController {
  private readonly $tickets: TicketService;
  private readonly $authorization: CodeAuthorizationService;
  private readonly $users: UserService;

  constructor(
    @Inject(OrgID) private readonly $orgID: OrgID,
  ) {
    this.$tickets = g_context.get<TicketService>(TicketService);
    this.$authorization = g_context.get<CodeAuthorizationService>(CodeAuthorizationService);
    this.$users = g_context.get<UserService>(UserService);
  }

  @Post('/sign-up')
  @Redirect()
  async signUp(
    @Res() res: FastifyReply,
    @Body('email') email: string,
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('confirm') confirm: string,
    @Body('ticket') ticket: string,
  ) {

    if (password !== confirm) { throw new HttpErrors.BadRequestException(`password_confirm_missmatch`); }

    /**
     * @TODO add email format validation
     * production should reject alias email
     * developement should accept alias email
     */

    const result = await this.$users.register(
      this.$orgID.id,
      ticket,
      { email, username, password }
    );

    const url = new URL(result.redirect_uri);
    return { url: url.toString(), };

  }

  @Post('/sign-in')
  @Redirect()
  async signIn(
    @Body('client_id') client_id: string,
    @Body('redirect_uri') redirect_uri: string,
    @Body('password') password: string,
    @Body('email') email?: string,
    @Body('username') username?: string,
  ) {
    try {
      const result = await this.$authorization.authenticate(this.$orgID.id, {
        client_id,
        redirect_uri,
        credentials: {
          username: username,
          email: email,
          value: password,
          type: ECredentialType.PASSWORD
        },
      });

      const url = new URL(result.redirect_uri);
      url.searchParams.set('code', result.code);
      url.searchParams.set('response_type', result.response_type);
      const redirection_uri = url.toJSON();

      log.trace('redirect to', redirection_uri);

      return {
        url: redirection_uri,
      };

    } catch (error) {
      log.error(error);
      if (error instanceof TypeError ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw new HttpErrors.BadRequestException(error.message);
      }
      throw new HttpErrors.BadRequestException(`invalid_request`);
    }

  }

  @Post('/confirm-account')
  async confirmAccount(
    @Body('request_token') request_token: string,
    @Body('email') email: string,
  ) {
    const verify = g_context.get<ValidateChallengeRequestUseCase>(ValidateChallengeRequestUseCase);
    const result = await verify.execute({
      org_id: this.$orgID.id,
      token: request_token,
    });

    if (result.login_hint?.email) {
      if (result.login_hint.email !== email) {
        throw new HttpErrors.BadRequestException('request_missmatch');
      }
    }
    const domain = await this.$orgID.url;
    const form_uri = new URL('http://x.x');
    form_uri.hostname = domain.hostname;
    form_uri.pathname = '/reset-password';

    switch (result.usage) {
      case ETicketUsage.PASSWORD_RESET:
        try {
          await this.$tickets.resetCredentialsTicket(
            this.$orgID.id,
            EResetMode.EMAIL,
            ECredentialType.PASSWORD,
            result.connection,
            { email },
            result.redirect_uri,
            form_uri.toString(),
          );
          return { ok: true };
        } catch (error) {
          if (error instanceof NotFoundException) {
            if (error.message === 'user_not_found') { return { ok: true }; }
            throw new HttpErrors.NotFoundException(error.message);
          }
          if (error instanceof BadRequestException) { throw new HttpErrors.BadRequestException(error.message); }
          throw new HttpErrors.InternalServerErrorException(error.message);
        }
      default:
        throw new HttpErrors.NotImplementedException();
    }

  }

  @Post('/reset-password')
  async resetPassword(
    @Body('password') password: string,
    @Body('password-confirm') confirm: string,
    @Body('token') token: string,
  ) {
    if (password !== confirm) { throw new HttpErrors.BadRequestException(`password_confirm_missmatch`); }
    const validate = g_context.get<ValidateChallengeTokenUseCase>(ValidateChallengeTokenUseCase);
    let ticket: TicketChallenge | null = null;

    try {
      ticket = await validate.execute({
        org_id: this.$orgID.id,
        token,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpErrors.BadRequestException(`invalid_token`);
      }
      throw new HttpErrors.InternalServerErrorException(error.message);
    }

    if (!ticket) {
      throw new HttpErrors.BadRequestException(`invalid_request`);
    }

    try {
      await this.$tickets.updateCredentials(ticket.org_id, ticket, { type: ECredentialType.PASSWORD, value: password });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpErrors.BadRequestException(`invalid_token`);
      }
      throw new HttpErrors.InternalServerErrorException(error.message);
    }
    return { ok: true };
  }

}
