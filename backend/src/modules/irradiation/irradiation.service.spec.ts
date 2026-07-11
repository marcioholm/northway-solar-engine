import { Test, TestingModule } from '@nestjs/testing';
import { IrradiationService } from './irradiation.service';

describe('IrradiationService', () => {
  let service: IrradiationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IrradiationService],
    }).compile();

    service = module.get<IrradiationService>(IrradiationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
