import { Test, TestingModule } from "@nestjs/testing";
import { ParController } from "./par.controller";

describe("ParController", () => {
  let controller: ParController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParController],
    }).compile();

    controller = module.get<ParController>(ParController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
