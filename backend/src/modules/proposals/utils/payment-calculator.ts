export interface PaymentConfig {
  cashDiscountPct?: number | null;
  card?: {
    installments?: number;
    totalMarkupPct?: number;
  } | null;
  finance?: Array<{
    n: number;
    totalMarkupPct: number;
  }> | null;
  own?: {
    downPaymentPct?: number;
    installments?: number;
  } | null;
}

export interface OptionPaymentResult {
  cashPrice?: number;
  cashDiscountPct?: number;
  cardInstallments?: number;
  cardInstallment?: number;
  cardTotalPrice?: number;
  financeOptions?: Array<{
    n: number;
    installment: number;
    totalPrice: number;
  }>;
  ownPlan?: {
    downPct: number;
    downValue: number;
    n: number;
    installment: number;
  };
}

/**
 * Calcula as formas de pagamento para uma opção de proposta.
 *
 * Fórmulas:
 * - À vista: preço × (1 - desconto/100)
 * - Cartão: Parcela = preço × (1 + acréscimo/100) / n
 * - Financiamento: Parcela = preço × (1 + acréscimo/100) / n
 * - Parcelamento próprio: Entrada = preço × entradaPct/100; Boletos = restante / boletos
 *
 * Cada forma só é incluída no resultado se estiver devidamente configurada.
 */
export function calculateOptionPayment(
  finalPrice: number,
  config?: PaymentConfig | null,
): OptionPaymentResult {
  if (!config || !finalPrice || finalPrice <= 0) return {};

  const res: OptionPaymentResult = {};

  // 1. À vista
  if (config.cashDiscountPct != null && config.cashDiscountPct > 0) {
    res.cashDiscountPct = config.cashDiscountPct;
    res.cashPrice =
      Math.round(finalPrice * (1 - config.cashDiscountPct / 100) * 100) / 100;
  }

  // 2. Cartão de crédito
  if (config.card && config.card.installments && config.card.installments > 0) {
    const markupPct = config.card.totalMarkupPct || 0;
    const n = config.card.installments;
    const totalPrice =
      Math.round(finalPrice * (1 + markupPct / 100) * 100) / 100;
    const installment = Math.round((totalPrice / n) * 100) / 100;
    res.cardInstallments = n;
    res.cardInstallment = installment;
    res.cardTotalPrice = totalPrice;
  }

  // 3. Financiamento (lista de { n, totalMarkupPct })
  if (Array.isArray(config.finance) && config.finance.length > 0) {
    const validFinance = config.finance
      .filter((f) => f && f.n > 0)
      .map((f) => {
        const markupPct = f.totalMarkupPct || 0;
        const totalPrice =
          Math.round(finalPrice * (1 + markupPct / 100) * 100) / 100;
        const installment = Math.round((totalPrice / f.n) * 100) / 100;
        return {
          n: f.n,
          installment,
          totalPrice,
        };
      });
    if (validFinance.length > 0) {
      res.financeOptions = validFinance;
    }
  }

  // 4. Parcelamento próprio { downPaymentPct, installments }
  if (config.own && config.own.installments && config.own.installments > 0) {
    const downPct = config.own.downPaymentPct ?? 0;
    const downValue = Math.round(finalPrice * (downPct / 100) * 100) / 100;
    const remaining = Math.max(0, finalPrice - downValue);
    const n = config.own.installments;
    const installment = Math.round((remaining / n) * 100) / 100;
    res.ownPlan = {
      downPct,
      downValue,
      n,
      installment,
    };
  }

  return res;
}

/**
 * Calcula a geração proporcional de uma opção a partir da potência e do fator do projeto.
 * Se o projeto não tiver dimensionamento válido (potência > 0 e geração > 0), retorna null.
 */
export function calculateProportionalGeneration(
  systemPowerKwp: number,
  projectSizingPowerKwp?: number | null,
  projectSizingGenerationKwh?: number | null,
): number | null {
  if (
    !projectSizingPowerKwp ||
    projectSizingPowerKwp <= 0 ||
    !projectSizingGenerationKwh ||
    projectSizingGenerationKwh <= 0 ||
    !systemPowerKwp ||
    systemPowerKwp <= 0
  ) {
    return null;
  }
  const factor = projectSizingGenerationKwh / projectSizingPowerKwp;
  return Math.round(systemPowerKwp * factor);
}
