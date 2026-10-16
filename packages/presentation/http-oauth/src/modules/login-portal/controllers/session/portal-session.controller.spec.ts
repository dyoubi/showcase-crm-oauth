import { Test, TestingModule } from "@nestjs/testing";
import { PortalSessionController } from "./portal-session.controller";

describe("PortalSessionController", () => {
  let controller: PortalSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortalSessionController],
    }).compile();

    controller = module.get<PortalSessionController>(PortalSessionController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
