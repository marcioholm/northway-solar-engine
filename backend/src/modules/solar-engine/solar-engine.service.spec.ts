import { Test, TestingModule } from '@nestjs/testing';
import { SolarEngineService } from './solar-engine.service';
import { IrradiationService } from '../irradiation/irradiation.service';
import { CompaniesService } from '../companies/companies.service';
import { InventoryService } from '../inventory/inventory.service';
import { NotFoundException } from '@nestjs/common';

describe('SolarEngineService', () => {
  let service: SolarEngineService;
  let irradiationService: IrradiationService;
  let companiesService: CompaniesService;
  let inventoryService: InventoryService;

  const mockIrradiationService = {
    getIrradiation: jest.fn(),
  };

  const mockCompaniesService = {
    findOne: jest.fn(),
  };

  const mockInventoryService = {
    findAllModules: jest.fn(),
    findAllInverters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolarEngineService,
        { provide: IrradiationService, useValue: mockIrradiationService },
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    service = module.get<SolarEngineService>(SolarEngineService);
    irradiationService = module.get<IrradiationService>(IrradiationService);
    companiesService = module.get<CompaniesService>(CompaniesService);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate solar system correctly', async () => {
      // Mock Data
      const companyId = 'comp-1';
      const city = 'Manaus - AM';
      const consumption = 500; // kWh

      mockCompaniesService.findOne.mockResolvedValue({
        id: companyId,
        lossFactor: 0.85,
        defaultMargin: 20, // 20%
      });

      mockIrradiationService.getIrradiation.mockResolvedValue({
        city,
        monthly_generation_per_kwp: 120, // 120 kWh/kWp
      });

      mockInventoryService.findAllModules.mockResolvedValue([
        { id: 'mod-1', model: '550W Panel', powerWatt: 550, cost: 800 },
      ]);

      mockInventoryService.findAllInverters.mockResolvedValue([
        { id: 'inv-1', model: '5kW Inverter', nominalPowerKw: 5.0, cost: 3000 },
      ]);

      // Execution
      const result = await service.calculate(companyId, consumption, city);

      // Validation Logic
      // 1. Required Power = 500 / (120 * 0.85) = 500 / 102 = 4.9019 kWp
      // 2. Module Qty = Ceil(4.9019 * 1000 / 550) = Ceil(8.91) = 9 modules
      // 3. System Power = 9 * 550 / 1000 = 4.95 kWp

      expect(result.module_qty).toBe(9);
      expect(result.system_power_kwp).toBe(4.95);

      // 4. Inverter Selection: 5kW is close to 4.95kWp (ratio ~1.01), so it should be picked.
      expect(result.inverter.id).toBe('inv-1');

      // 5. Costs
      // Modules: 9 * 800 = 7200
      // Inverter: 3000
      // Structure: 4.95 * 300 = 1485
      // Labor: 4.95 * 400 = 1980
      // Travel: 0
      // Subtotal: 7200 + 3000 + 1485 + 1980 = 13665
      const expectedSubtotal = 7200 + 3000 + 1485 + 1980;
      expect(result.subtotal).toBeCloseTo(expectedSubtotal, 2);

      // 6. Final Price (Margin 20%) -> Price = Cost / (1 - 0.20) = Cost / 0.8
      const expectedFinalPrice = expectedSubtotal / 0.8;
      expect(result.final_price).toBeCloseTo(expectedFinalPrice, 2);

      // 7. Payback
      // Est Generation = 4.95 * 120 * 0.85 = 504.9 kWh/mo
      // Savings = 504.9 * 0.95 = 479.655 R$/mo
      // Annual = 479.655 * 12 = 5755.86
      // Payback = FinalPrice / Annual
      const expectedPayback = expectedFinalPrice / (504.9 * 0.95 * 12);
      expect(result.payback_years).toBeCloseTo(expectedPayback, 1);
    });

    it('should throw NotFoundException if company not found', async () => {
      mockCompaniesService.findOne.mockResolvedValue(null);
      await expect(service.calculate('bad-id', 100, 'City')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
