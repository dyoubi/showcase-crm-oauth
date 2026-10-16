import {
  BadRequestException,
  g_context,
  log,
  NotFoundException,
  UnauthorizedException,
} from "@egc-io/ckit-lib";
import {
  Controller,
  BadRequestException as BadRequest,
  InternalServerErrorException as InternalServerError,
  UnprocessableEntityException as UnprocessableEntity,
  UnauthorizedException as Unauthorized,
  Body,
  Header,
  Post,
  Inject,
} from "@nestjs/common";
import { TokenRequestService } from "@ring-oauth/application";
import {
  EAccessGrantType,
  TokenRequest,
  TokenRequestClientCredentials,
  TokenRequestCode,
  TokenRequestRefreshToken,
  TokenRequestUserCredentials,
} from "@ring-oauth/core";
import { RequestValidationPipe } from "../../pipes/request-validation.pipe";
import { OrgID } from "src/modules/common/org-domain/org-domain.service";

@Controller("/oauth/token")
export class TokenController {
  constructor(@Inject(OrgID) private readonly $orgID: OrgID) { }
  @Post()
  @Header('Accept', 'application/x-www-form-urlencoded')
  @Header('Accept', 'application/json')
  @Header('Cache-Control', 'no-store')
  @Header('Content-type', 'application/json')
  async getToken(
    @Body(new RequestValidationPipe(TokenRequest)) request: TokenRequest,
  ) {
    const org_id: string = this.$orgID.id;
    const service: TokenRequestService = g_context.get<TokenRequestService>(TokenRequestService);
    let result: any;
    try {
      switch (request.grant_type) {
        case EAccessGrantType.AUTHORIZATION_CODE:
          result = await service.codeRequest(
            org_id,
            request as TokenRequestCode,
          );
          break;
        case EAccessGrantType.CLIENT_CREDENTIALS:
          result = await service.clientCredentialsRequest(
            org_id,
            request as TokenRequestClientCredentials,
          );
          break;
        case EAccessGrantType.REFRESH_TOKEN:
          result = await service.refreshTokenRequest(
            org_id,
            request as TokenRequestRefreshToken,
          );
          break;
        case EAccessGrantType.USER_CREDENTIALS:
          result = await service.userCredentialsRequest(
            org_id,
            request as TokenRequestUserCredentials,
          );
          break;
        default:
          throw new BadRequest(`invalid_grant_type`);
      }
      return result;
    } catch (error) {
      log.error(`request ${request.grant_type} failed ${error.message}`);
      if (error instanceof BadRequestException || error instanceof BadRequest) {
        throw new BadRequest({ error: error.message.trim() });
      }

      if (error instanceof NotFoundException) {
        throw new BadRequest({ error: "invalid_request" });
      }

      if (error instanceof UnauthorizedException) {
        throw new Unauthorized({ error: error.message });
      }

      if (
        error instanceof TypeError ||
        error instanceof ReferenceError ||
        error instanceof SyntaxError
      ) {
        throw new UnprocessableEntity({ error: error.message });
      }

      throw new InternalServerError({ error: error.message });
    }
  }
}
