import { BadRequestException } from '@nestjs/common';
import { PricingEngineService } from './pricing-engine.service';
import { PricingInputDto } from './dto/pricing-input.dto';

describe('PricingEngineService', () => {
  let service: PricingEngineService;

  beforeEach(() => {
    service = new PricingEngineService();
  });

  it('calcula preço com comissão percentual: base 22.800, markup 25%, comissão 2,5% -> finalPrice 29.419,35 e comissão 735,48', () => {
    const input = new PricingInputDto();
    input.equipmentCost = 16000;
    input.costProject = 1500;
    input.costArt = 400;
    input.costInstallation = 4000;
    input.costFreight = 600;
    input.costOther = 300;
    input.marginPct = 25;
    input.minMarginPct = 15;
    input.recommendedMarginPct = 25;
    input.commissionPct = 2.5;

    const result = service.calculate(input);

    expect(result.finalPrice).toBe(29419.35);
    expect(result.commission).toBe(735.48);
    expect(result.totalCost).toBe(23535.48);
    expect(result.breakdown.costCommission).toBe(735.48);
  });

  it('comissão 0 mantém o valor informado em costCommission', () => {
    const input = new PricingInputDto();
    input.equipmentCost = 16000;
    input.costProject = 1500;
    input.costArt = 400;
    input.costInstallation = 4000;
    input.costFreight = 600;
    input.costOther = 300;
    input.costCommission = 1000;
    input.commissionPct = 0;
    input.marginPct = 25;

    const result = service.calculate(input);

    expect(result.commission).toBe(1000);
    expect(result.breakdown.costCommission).toBe(1000);
    // Base 22800 + 1000 = 23800
    expect(result.totalCost).toBe(23800);
    // 23800 * 1.25 = 29750
    expect(result.finalPrice).toBe(29750);
  });

  it('percentual impossível que deixa o denominador <= 0 é recusado', () => {
    const input = new PricingInputDto();
    input.equipmentCost = 20000;
    input.marginPct = 25;
    // Denominador = 1 - (80/100) * (1 + 0.25) = 1 - 0.8 * 1.25 = 1 - 1 = 0
    input.commissionPct = 80;

    expect(() => service.calculate(input)).toThrow(BadRequestException);
  });
});
