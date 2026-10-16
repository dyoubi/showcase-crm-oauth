import { Test, TestingModule } from '@nestjs/testing';
import { PortalCookieService } from './portal-cookie.service';

describe('OpSessionCookieService', () => {
  let service: PortalCookieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalCookieService],
    }).compile();

    service = module.get<PortalCookieService>(PortalCookieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
