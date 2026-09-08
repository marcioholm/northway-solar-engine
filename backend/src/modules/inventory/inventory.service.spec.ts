import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryModuleEntity } from './entities/inventory-module.entity';
import { InventoryInverterEntity } from './entities/inventory-inverter.entity';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(InventoryModuleEntity), useValue: {} },
        { provide: getRepositoryToken(InventoryInverterEntity), useValue: {} },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
