import { Module } from "@nestjs/common";
import { AuthorizationController } from "./controllers/authorization/authorization.controller";
import { TokenController } from "./controllers/token/token.controller";
import { ParController } from "./controllers/par/par.controller";
import { TicketChallengeController } from './controllers/ticket-challenge/ticket-challenge.controller';
import { WellKnownController } from "./controllers/well-known/well-known.controller";
import { LogoutController } from "./controllers/logout/logout.controller";
import { UserController } from "./controllers/user/user.controller";

@Module({
  controllers: [
    AuthorizationController,
    TokenController,
    ParController,
    TicketChallengeController,
    WellKnownController,
    LogoutController,
    UserController,
  ],
})
export class OauthModule { }
