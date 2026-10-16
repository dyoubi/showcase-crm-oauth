import { Test, TestingModule } from '@nestjs/testing';
import { TicketChallengeController } from './ticket-challenge.controller';

describe('TicketChallengeController', () => {
  let controller: TicketChallengeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketChallengeController],
    }).compile();

    controller = module.get<TicketChallengeController>(TicketChallengeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
