import { BadRequestException, Injectable } from '@nestjs/common';
import { PricingInputDto } from './dto/pricing-input.dto';
import { PricingResultDto } from './dto/pricing-result.dto';

@Injectable()
export class PricingEngineService {
  calculate(input: PricingInputDto): PricingResultDto {
    const baseOperational =
      (input.costProject || 0) +
      (input.costArt || 0) +
      (input.costInstallation || 0) +
      (input.costHotel || 0) +
      (input.costFreight || 0) +
      (input.costFood || 0) +
      (input.costTravel || 0) +
      (input.costToll || 0) +
      (input.costCrane || 0) +
      (input.costThirdParties || 0) +
      (input.costAdmin || 0) +
      (input.costTaxes || 0) +
      (input.costOther || 0);

    const base = (input.equipmentCost || 0) + baseOperational;
    const markup = (input.marginPct || 0) / 100;
    const minMarkup =
      (input.minMarginPct !== undefined ? input.minMarginPct : 15) / 100;
    const recMarkup =
      (input.recommendedMarginPct !== undefined
        ? input.recommendedMarginPct
        : 25) / 100;
    const commissionPct = input.commissionPct || 0;

    let finalPrice: number;
    let commission: number;
    let totalCost: number;
    let minPrice: number;
    let recommendedPrice: number;
    let operationalCostTotal: number;

    if (commissionPct > 0) {
      const comissao = commissionPct / 100;
      const denom = 1 - comissao * (1 + markup);
      const minDenom = 1 - comissao * (1 + minMarkup);
      const recDenom = 1 - comissao * (1 + recMarkup);

      if (denom <= 0 || minDenom <= 0 || recDenom <= 0) {
        throw new BadRequestException(
          'Percentual de comissão e margem inviabiliza o cálculo (denominador menor ou igual a zero)',
        );
      }

      finalPrice = Math.round(((base * (1 + markup)) / denom) * 100) / 100;
      commission = Math.round(finalPrice * comissao * 100) / 100;
      totalCost = Math.round((base + commission) * 100) / 100;
      minPrice = Math.round(((base * (1 + minMarkup)) / minDenom) * 100) / 100;
      recommendedPrice =
        Math.round(((base * (1 + recMarkup)) / recDenom) * 100) / 100;
      operationalCostTotal =
        Math.round((baseOperational + commission) * 100) / 100;
    } else {
      commission = input.costCommission || 0;
      operationalCostTotal = baseOperational + commission;
      totalCost = (input.equipmentCost || 0) + operationalCostTotal;
      finalPrice = Math.round(totalCost * (1 + markup) * 100) / 100;
      minPrice = Math.round(totalCost * (1 + minMarkup) * 100) / 100;
      recommendedPrice = Math.round(totalCost * (1 + recMarkup) * 100) / 100;
    }

    const profit = Math.round((finalPrice - totalCost) * 100) / 100;
    const effectiveMarginPct =
      finalPrice > 0 ? Math.round((profit / finalPrice) * 10000) / 100 : 0;

    return {
      operationalCostTotal,
      totalCost,
      commission,
      minPrice,
      recommendedPrice,
      finalPrice,
      effectiveMarginPct,
      profit,
      appliedMarginPct: input.marginPct,
      breakdown: {
        equipmentCost: input.equipmentCost || 0,
        costProject: input.costProject || 0,
        costArt: input.costArt || 0,
        costInstallation: input.costInstallation || 0,
        costHotel: input.costHotel || 0,
        costFreight: input.costFreight || 0,
        costFood: input.costFood || 0,
        costTravel: input.costTravel || 0,
        costToll: input.costToll || 0,
        costCommission: commission,
        costCrane: input.costCrane || 0,
        costThirdParties: input.costThirdParties || 0,
        costAdmin: input.costAdmin || 0,
        costTaxes: input.costTaxes || 0,
        costOther: input.costOther || 0,
      },
    };
  }
}
