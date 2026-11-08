import { BadRequestException } from '@nestjs/common';

export interface SizingRules {
  folgaPct: number; // default 10, between 0 and 30
  expansaoPct: number; // default 25, between 0 and 100
}

export interface FutureLoadCatalogItem {
  id: string;
  name: string;
  category?: string;
  powerKw?: number;
  fixedKwh?: number;
  defaultHoursPerDay?: number;
  defaultDaysPerMonth?: number;
}

export interface SelectedFutureLoad {
  id: string;
  name: string;
  category?: string;
  powerKw?: number;
  fixedKwh?: number;
  hoursPerDay?: number;
  daysPerMonth?: number;
  quantity: number;
}

export const DEFAULT_SIZING_RULES: SizingRules = {
  folgaPct: 10,
  expansaoPct: 25,
};

export const DEFAULT_FUTURE_LOADS_CATALOG: FutureLoadCatalogItem[] = [
  { id: 'ac_inv_9000', name: 'Ar-condicionado inverter 9.000 BTU', category: 'Climatização', powerKw: 0.50, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_12000', name: 'Ar-condicionado inverter 12.000 BTU', category: 'Climatização', powerKw: 0.65, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_18000', name: 'Ar-condicionado inverter 18.000 BTU', category: 'Climatização', powerKw: 1.00, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_24000', name: 'Ar-condicionado inverter 24.000 BTU', category: 'Climatização', powerKw: 1.30, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_conv_12000', name: 'Ar-condicionado convencional 12.000 BTU', category: 'Climatização', powerKw: 1.10, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'carro_eletrico', name: 'Carro elétrico', category: 'Mobilidade', fixedKwh: 180, defaultHoursPerDay: 0, defaultDaysPerMonth: 30 },
  { id: 'chuveiro_5500', name: 'Chuveiro elétrico 5,5 kW', category: 'Eletrodomésticos', powerKw: 5.50, defaultHoursPerDay: 0.5, defaultDaysPerMonth: 30 },
  { id: 'bomba_piscina_750', name: 'Bomba de piscina 0,75 kW', category: 'Lazer', powerKw: 0.75, defaultHoursPerDay: 6, defaultDaysPerMonth: 30 },
];

export const DEFAULT_FUTURE_LOADS = DEFAULT_FUTURE_LOADS_CATALOG;

export function validateAndEnrichFutureLoads(
  loads: any[] | undefined,
  catalog: any[],
): SelectedFutureLoad[] {
  if (!loads || loads.length === 0) return [];

  const effectiveCatalog =
    catalog && catalog.length > 0 ? catalog : DEFAULT_FUTURE_LOADS;

  const enriched: SelectedFutureLoad[] = [];
  for (const load of loads) {
    if (!load || !load.id) {
      throw new BadRequestException('Carga futura deve conter id');
    }
    const catalogItem = effectiveCatalog.find((c: any) => c.id === load.id);
    if (!catalogItem) {
      throw new BadRequestException(
        `Carga futura '${load.id}' não encontrada no catálogo da empresa`,
      );
    }
    const qty = Number(load.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      throw new BadRequestException(
        'A quantidade de cada carga futura deve ser um número inteiro entre 1 e 20',
      );
    }
    let hours = load.hoursPerDay;
    if (catalogItem.fixedKwh != null && Number(catalogItem.fixedKwh) > 0) {
      hours = undefined;
    } else {
      hours = hours != null ? Number(hours) : (catalogItem.defaultHoursPerDay ?? 8);
      if (typeof hours !== 'number' || isNaN(hours) || hours < 0.5 || hours > 24) {
        throw new BadRequestException(
          'As horas de uso por dia devem estar entre 0.5 e 24',
        );
      }
    }

    enriched.push({
      id: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      powerKw: catalogItem.powerKw,
      fixedKwh: catalogItem.fixedKwh,
      quantity: qty,
      hoursPerDay: hours,
      daysPerMonth: catalogItem.defaultDaysPerMonth ?? 30,
    });
  }
  return enriched;
}

/**
 * Calcula os kWh/mês de uma carga futura selecionada.
 * Se fixedKwh estiver definido e for > 0, usa fixedKwh * quantidade.
 * Senão: potência (kW) * horas/dia * dias * quantidade (dias padrão = 30).
 */
export function calculateFutureLoadKwh(load: SelectedFutureLoad): number {
  const qty = Math.max(1, Number(load.quantity) || 1);
  if (load.fixedKwh != null && Number(load.fixedKwh) > 0) {
    return Number(load.fixedKwh) * qty;
  }
  const power = Number(load.powerKw) || 0;
  const hours = Number(load.hoursPerDay) || 0;
  const days = Number(load.daysPerMonth) || 30;
  return power * hours * days * qty;
}

/**
 * Calcula o total de kWh/mês para todas as cargas selecionadas.
 */
export function calculateTotalFutureLoadsKwh(loads?: SelectedFutureLoad[]): number {
  if (!loads || !loads.length) return 0;
  return loads.reduce((sum, l) => sum + calculateFutureLoadKwh(l), 0);
}

/**
 * Normaliza e restringe folgaPct e expansaoPct aos limites permitidos.
 * folgaPct: 0 a 30 (padrão 10)
 * expansaoPct: 0 a 100 (padrão 25)
 */
export function normalizeSizingRules(rules?: Partial<SizingRules>): SizingRules {
  let folgaPct = Number(rules?.folgaPct);
  if (isNaN(folgaPct)) folgaPct = DEFAULT_SIZING_RULES.folgaPct;
  folgaPct = Math.min(30, Math.max(0, folgaPct));

  let expansaoPct = Number(rules?.expansaoPct);
  if (isNaN(expansaoPct)) expansaoPct = DEFAULT_SIZING_RULES.expansaoPct;
  expansaoPct = Math.min(100, Math.max(0, expansaoPct));

  return { folgaPct, expansaoPct };
}

/**
 * Formata o resumo das cargas para exibição no texto do cenário.
 */
export function formatLoadsSummary(loads?: SelectedFutureLoad[]): string {
  if (!loads || !loads.length) return '';
  return loads
    .filter((l) => (l.quantity || 1) > 0)
    .map((l) => {
      const qty = l.quantity || 1;
      if (l.fixedKwh != null && Number(l.fixedKwh) > 0) {
        return `${l.name} (${qty}x)`;
      }
      const hours = l.hoursPerDay ?? 8;
      const hoursFormatted = Number(hours).toLocaleString('pt-BR');
      return `${l.name} (${qty}x, ${hoursFormatted} h/dia)`;
    })
    .join(', ');
}

/**
 * Gera a nota explicativa detalhada para o rodapé da proposta sobre as cargas futuras.
 */
export function formatLoadsFootnote(loads?: SelectedFutureLoad[]): string {
  if (!loads || !loads.length) return '';
  const items = loads
    .filter((l) => (l.quantity || 1) > 0)
    .map((l) => {
      const qty = l.quantity || 1;
      const kwh = Math.round(calculateFutureLoadKwh(l));
      if (l.fixedKwh != null && Number(l.fixedKwh) > 0) {
        return `${l.name} (${qty}x = ${kwh} kWh/mês)`;
      }
      const powerFormatted = Number(l.powerKw || 0).toLocaleString('pt-BR');
      const hoursFormatted = Number(l.hoursPerDay || 0).toLocaleString('pt-BR');
      return `${l.name} (${qty}x, ${powerFormatted} kW × ${hoursFormatted} h/dia = ${kwh} kWh/mês)`;
    });
  return `* Cargas futuras consideradas (30 dias/mês): ${items.join('; ')}.`;
}

export interface ScenarioCalculationInput {
  consumptionMonthlyKwh: number;
  sizingPowerKwp: number;
  sizingGenerationKwh: number;
  modulePowerWatt?: number;
  sizingRules?: Partial<SizingRules>;
  futureLoads?: SelectedFutureLoad[];
}

export interface CalculatedScenarioItem {
  position: number;
  scenarioType: 'essential' | 'recommended' | 'expansion';
  name: string;
  recommended: boolean;
  targetConsumptionKwh: number;
  systemPowerKwp: number;
  moduleQty: number;
  generationMonthlyKwh: number;
  scenarioText: string;
  footnote?: string;
}

export interface ScenarioCalculationResult {
  factor: number; // kWh/mês por kWp
  consumptionMonthlyKwh: number;
  scenarios: CalculatedScenarioItem[];
  warnings: string[];
  maxPowerKwp: number;
}

/**
 * Realiza o dimensionamento dos 3 cenários de consumo no servidor:
 * 1. Essencial: meta = consumo × 1,00
 * 2. Recomendado: meta = consumo × (1 + folgaPct / 100)
 * 3. Expansão: meta = (consumo + kWh cargas) × (1 + folgaPct / 100) [ou consumo × (1 + expansaoPct / 100) sem cargas]
 */
export function calculateScenarios(
  input: ScenarioCalculationInput,
): ScenarioCalculationResult {
  const {
    consumptionMonthlyKwh,
    sizingPowerKwp,
    sizingGenerationKwh,
    modulePowerWatt = 550,
    sizingRules,
    futureLoads = [],
  } = input;

  if (
    sizingPowerKwp == null ||
    Number(sizingPowerKwp) <= 0 ||
    sizingGenerationKwh == null ||
    Number(sizingGenerationKwh) <= 0
  ) {
    throw new Error('Projeto sem dimensionamento válido');
  }

  const factor = Number(sizingGenerationKwh) / Number(sizingPowerKwp);
  const consumo = Math.max(0, Number(consumptionMonthlyKwh) || 0);
  const rules = normalizeSizingRules(sizingRules);
  const totalCargasKwh = calculateTotalFutureLoadsKwh(futureLoads);
  const activeLoads = futureLoads.filter((l) => (l.quantity || 1) > 0);

  // 1. Essencial
  const targetEssencial = consumo * 1.0;
  const kwpEssencial = targetEssencial / factor;
  const modQtyEssencial = Math.ceil((kwpEssencial * 1000) / modulePowerWatt);
  const finalPowerEssencial = Number(
    ((modQtyEssencial * modulePowerWatt) / 1000).toFixed(2),
  );
  const genEssencial = Math.round(finalPowerEssencial * factor);
  const textEssencial = `Cobre seu consumo atual de ${Math.round(consumo).toLocaleString('pt-BR')} kWh/mês`;

  // 2. Recomendado
  const targetRecomendado = consumo * (1 + rules.folgaPct / 100);
  const kwpRecomendado = targetRecomendado / factor;
  const modQtyRecomendado = Math.ceil((kwpRecomendado * 1000) / modulePowerWatt);
  const finalPowerRecomendado = Number(
    ((modQtyRecomendado * modulePowerWatt) / 1000).toFixed(2),
  );
  const genRecomendado = Math.round(finalPowerRecomendado * factor);
  const textRecomendado = `Inclui ${rules.folgaPct}% de folga para a perda natural dos painéis`;

  // 3. Expansão
  let targetExpansao: number;
  let textExpansao: string;
  let footnoteExpansao: string | undefined = undefined;

  if (activeLoads.length > 0 && totalCargasKwh > 0) {
    targetExpansao = (consumo + totalCargasKwh) * (1 + rules.folgaPct / 100);
    const cargasSummary = formatLoadsSummary(activeLoads);
    textExpansao = `Prevê +${Math.round(totalCargasKwh).toLocaleString('pt-BR')} kWh/mês: ${cargasSummary}`;
    footnoteExpansao = formatLoadsFootnote(activeLoads);
  } else {
    targetExpansao = consumo * (1 + rules.expansaoPct / 100);
    textExpansao = `Prevê aumento de ${rules.expansaoPct}% no consumo`;
  }

  const kwpExpansao = targetExpansao / factor;
  const modQtyExpansao = Math.ceil((kwpExpansao * 1000) / modulePowerWatt);
  const finalPowerExpansao = Number(
    ((modQtyExpansao * modulePowerWatt) / 1000).toFixed(2),
  );
  const genExpansao = Math.round(finalPowerExpansao * factor);

  const scenarios: CalculatedScenarioItem[] = [
    {
      position: 1,
      scenarioType: 'essential',
      name: 'Essencial',
      recommended: false,
      targetConsumptionKwh: Number(targetEssencial.toFixed(2)),
      systemPowerKwp: finalPowerEssencial,
      moduleQty: modQtyEssencial,
      generationMonthlyKwh: genEssencial,
      scenarioText: textEssencial,
    },
    {
      position: 2,
      scenarioType: 'recommended',
      name: 'Recomendado',
      recommended: true,
      targetConsumptionKwh: Number(targetRecomendado.toFixed(2)),
      systemPowerKwp: finalPowerRecomendado,
      moduleQty: modQtyRecomendado,
      generationMonthlyKwh: genRecomendado,
      scenarioText: textRecomendado,
    },
    {
      position: 3,
      scenarioType: 'expansion',
      name: 'Expansão',
      recommended: false,
      targetConsumptionKwh: Number(targetExpansao.toFixed(2)),
      systemPowerKwp: finalPowerExpansao,
      moduleQty: modQtyExpansao,
      generationMonthlyKwh: genExpansao,
      scenarioText: textExpansao,
      footnote: footnoteExpansao,
    },
  ];

  // Avisos (não bloqueiam):
  // 1. Sempre: "Confirme se o padrão de entrada comporta X kWp."
  // 2. Se a geração de algum cenário passar de 130% do consumo atual:
  //    "Créditos excedentes vencem em 60 meses (Lei 14.300, art. 13)."
  const maxPowerKwp = Math.max(
    finalPowerEssencial,
    finalPowerRecomendado,
    finalPowerExpansao,
  );

  const warnings: string[] = [
    `Confirme se o padrão de entrada comporta ${maxPowerKwp.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWp.`,
  ];

  const hasExceeding130 = scenarios.some(
    (s) => consumo > 0 && s.generationMonthlyKwh > consumo * 1.3,
  );
  if (hasExceeding130) {
    warnings.push(
      'Créditos excedentes vencem em 60 meses (Lei 14.300, art. 13).',
    );
  }

  return {
    factor,
    consumptionMonthlyKwh: consumo,
    scenarios,
    warnings,
    maxPowerKwp,
  };
}

