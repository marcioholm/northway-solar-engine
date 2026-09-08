import { Test, TestingModule } from '@nestjs/testing';
import { IrradiationService } from './irradiation.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('IrradiationService', () => {
  let service: IrradiationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IrradiationService,
        { provide: CACHE_MANAGER, useValue: {} }
      ],
    }).compile();

    service = module.get<IrradiationService>(IrradiationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
