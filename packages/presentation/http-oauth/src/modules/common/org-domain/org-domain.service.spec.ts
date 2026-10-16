import { Test, TestingModule } from '@nestjs/testing';
import { OrgID } from './org-domain.service';

describe('OrgDomainService', () => {
  let service: OrgID;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgID],
    }).compile();

    service = module.get<OrgID>(OrgID);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
