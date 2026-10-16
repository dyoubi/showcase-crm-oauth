import {
  Module,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { OauthModule } from "./modules/oauth/oauth.module";
import { LoginPortalModule } from "./modules/login-portal/login-portal.module";
import { CommonModule } from './modules/common/common.module';


@Module({
  imports: [
    CommonModule,
    OauthModule,
    LoginPortalModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {
}
