export interface CostBreakdown {
  equipmentCost: number;
  costProject: number;
  costArt: number;
  costInstallation: number;
  costHotel: number;
  costFreight: number;
  costFood: number;
  costTravel: number;
  costToll: number;
  costCommission: number;
  costCrane: number;
  costThirdParties: number;
  costAdmin: number;
  costTaxes: number;
  costOther: number;
}

export class PricingResultDto {
  /** Soma de todos os custos operacionais (excluindo equipamentos) */
  operationalCostTotal!: number;

  /** Custo total = equipmentCost + operationalCostTotal */
  totalCost!: number;

  /** Preço mínimo = totalCost * (1 + minMarginPct / 100) */
  minPrice!: number;

  /** Preço recomendado = totalCost * (1 + recommendedMarginPct / 100) */
  recommendedPrice!: number;

  /** Preço final = totalCost * (1 + marginPct / 100) */
  finalPrice!: number;

  /** Margem efetiva (%) sobre o preço final */
  effectiveMarginPct!: number;

  /** Lucro = finalPrice - totalCost */
  profit!: number;

  /** Margem (%) aplicada */
  appliedMarginPct!: number;

  /** Detalhamento dos custos */
  breakdown!: CostBreakdown;
}
