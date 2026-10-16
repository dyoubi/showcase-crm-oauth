import { Test, TestingModule } from '@nestjs/testing';
import { Hostname } from './hostname';

describe('Hostname', () => {
  let provider: Hostname;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Hostname],
    }).compile();

    provider = module.get<Hostname>(Hostname);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
