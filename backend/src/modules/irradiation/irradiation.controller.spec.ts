import { Test, TestingModule } from '@nestjs/testing';
import { IrradiationController } from './irradiation.controller';

describe('IrradiationController', () => {
  let controller: IrradiationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IrradiationController],
    }).compile();

    controller = module.get<IrradiationController>(IrradiationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
