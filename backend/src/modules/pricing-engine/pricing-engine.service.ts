import { Injectable } from '@nestjs/common';
import { PricingInputDto } from './dto/pricing-input.dto';
import { PricingResultDto } from './dto/pricing-result.dto';

@Injectable()
export class PricingEngineService {
  calculate(input: PricingInputDto): PricingResultDto {
    const operationalCostTotal =
      input.costProject +
      input.costArt +
      input.costInstallation +
      input.costHotel +
      input.costFreight +
      input.costFood +
      input.costTravel +
      input.costToll +
      input.costCommission +
      input.costCrane +
      input.costThirdParties +
      input.costAdmin +
      input.costTaxes +
      input.costOther;

    const totalCost = input.equipmentCost + operationalCostTotal;

    const minPrice = totalCost * (1 + input.minMarginPct / 100);
    const recommendedPrice = totalCost * (1 + input.recommendedMarginPct / 100);
    const finalPrice = totalCost * (1 + input.marginPct / 100);
    const profit = finalPrice - totalCost;
    const effectiveMarginPct = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

    return {
      operationalCostTotal,
      totalCost,
      minPrice,
      recommendedPrice,
      finalPrice,
      effectiveMarginPct: Math.round(effectiveMarginPct * 100) / 100,
      profit,
      appliedMarginPct: input.marginPct,
      breakdown: {
        equipmentCost: input.equipmentCost,
        costProject: input.costProject,
        costArt: input.costArt,
        costInstallation: input.costInstallation,
        costHotel: input.costHotel,
        costFreight: input.costFreight,
        costFood: input.costFood,
        costTravel: input.costTravel,
        costToll: input.costToll,
        costCommission: input.costCommission,
        costCrane: input.costCrane,
        costThirdParties: input.costThirdParties,
        costAdmin: input.costAdmin,
        costTaxes: input.costTaxes,
        costOther: input.costOther,
      },
    };
  }
}
