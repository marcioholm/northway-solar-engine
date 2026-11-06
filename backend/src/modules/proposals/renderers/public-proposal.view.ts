import { Proposal } from '../entities/proposal.entity';

type WebEquipment = {
  type: 'module' | 'inverter';
  brand?: string;
  model?: string;
  quantity?: number;
  power?: string;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const powerValue = (power?: string) =>
  power ? toNumber(power.replace(/[^\d.]/g, '')) : undefined;

/**
 * Lista de campos permitidos na proposta sem login. Custos, margem, lucro,
 * orçamento do fornecedor, documento e contatos do cliente ficam de fora.
 * Campo novo só aparece aqui se for adicionado de propósito.
 */
export function toPublicProposalView(
  web: Record<string, any>,
  proposal: Pick<Proposal, 'publicToken' | 'expiresAt'>,
) {
  const equipment: WebEquipment[] = web.equipment ?? [];
  const module = equipment.find((item) => item.type === 'module');
  const inverter = equipment.find((item) => item.type === 'inverter');

  const finalPrice = toNumber(web.finalPrice) || 0;
  const cashDiscount = toNumber(web.paymentCashDiscount);
  const cardTax = toNumber(web.paymentCardTax);
  const cardInstallments = toNumber(web.paymentCardInstallments);
  const financeTax = toNumber(web.paymentFinanceTax);
  const financeInstallments = toNumber(web.paymentFinanceInstallments);

  const cashPrice =
    cashDiscount !== undefined && finalPrice > 0
      ? finalPrice * (1 - cashDiscount / 100)
      : undefined;

  const hasCard =
    cardTax !== undefined &&
    cardInstallments !== undefined &&
    cardInstallments > 0 &&
    finalPrice > 0;
  const cardTotalPrice =
    hasCard && cardTax !== undefined
      ? finalPrice * (1 + cardTax / 100)
      : undefined;
  const cardInstallment =
    hasCard && cardTotalPrice !== undefined && cardInstallments !== undefined
      ? cardTotalPrice / cardInstallments
      : undefined;

  const hasFinance =
    financeTax !== undefined &&
    financeInstallments !== undefined &&
    financeInstallments > 0 &&
    finalPrice > 0;
  const financeTotalPrice =
    hasFinance && financeTax !== undefined
      ? finalPrice * (1 + financeTax / 100)
      : undefined;
  const financeInstallment =
    hasFinance &&
    financeTotalPrice !== undefined &&
    financeInstallments !== undefined
      ? financeTotalPrice / financeInstallments
      : undefined;

  const genMonthly = toNumber(web.generationMonthlyKwh);

  return {
    publicToken: proposal.publicToken,
    clientName: web.clientName,
    clientCity: web.clientCity,
    clientState: web.clientState,
    consultantName: web.consultantName,
    consultantPhone: web.consultantPhone,
    createdAt: web.createdAt,
    expirationDate: proposal.expiresAt ?? undefined,
    profile: web.profile,
    utility: web.utility,
    tariff: toNumber(web.tariff),
    consumption: toNumber(web.consumption),
    monthlyBill: toNumber(web.monthlyBill),
    systemPowerKwp: toNumber(web.systemPowerKwp),
    generationMonthlyKwh:
      genMonthly !== undefined && genMonthly > 0 ? genMonthly : undefined,
    moduleQty: toNumber(web.moduleQty),
    module: module && {
      brand: module.brand,
      model: module.model,
      powerWatt: powerValue(module.power),
    },
    inverter: inverter && {
      brand: inverter.brand,
      model: inverter.model,
      powerKw: powerValue(inverter.power),
      quantity: inverter.quantity || 1,
    },
    equipment: equipment.map(({ type, brand, model, quantity, power }) => ({
      type,
      brand,
      model,
      quantity,
      power,
    })),
    finalPrice: toNumber(web.finalPrice),
    paybackYears: toNumber(web.paybackYears),
    company: web.company && {
      name: web.company.name,
      logoUrl: web.company.logoUrl,
    },
    settings: web.settings && {
      template: web.settings.template,
      primaryColor: web.settings.primaryColor,
      secondaryColor: web.settings.secondaryColor,
      coverImageUrl: web.settings.coverImageUrl,
      aboutText: web.settings.aboutText,
      aboutImageUrl: web.settings.aboutImageUrl,
      stats: web.settings.stats,
      partnerLogos: web.settings.partnerLogos,
      brandLogos: web.settings.brandLogos,
      serviceAreaText: web.settings.serviceAreaText,
      includedItems: web.settings.includedItems,
      warrantiesText: web.settings.warrantiesText,
      exclusionsText: web.settings.exclusionsText,
      notesText: web.settings.notesText,
      acceptanceText: web.settings.acceptanceText,
      contact: web.settings.contact,
      sectionsEnabled: web.settings.sectionsEnabled,
    },
    payment: {
      cashDiscount,
      cardTax,
      cardInstallments:
        cardInstallments !== undefined && cardInstallments > 0
          ? cardInstallments
          : undefined,
      financeTax,
      financeInstallments:
        financeInstallments !== undefined && financeInstallments > 0
          ? financeInstallments
          : undefined,
      cashPrice,
      cardInstallment,
      cardTotalPrice,
      financeInstallment,
      financeTotalPrice,
    },
    options: Array.isArray(web.options)
      ? web.options.map((o: any) => ({
          id: o.id,
          position: toNumber(o.position),
          name: o.name,
          recommended: Boolean(o.recommended),
          systemPowerKwp: toNumber(o.systemPowerKwp),
          moduleQty: toNumber(o.moduleQty),
          moduleDesc: o.moduleDesc,
          inverterDesc: o.inverterDesc,
          structureDesc: o.structureDesc,
          generationMonthlyKwh:
            toNumber(o.generationMonthlyKwh) &&
            Number(o.generationMonthlyKwh) > 0
              ? toNumber(o.generationMonthlyKwh)
              : undefined,
          finalPrice: toNumber(o.finalPrice),
          imageUrl: o.imageUrl,
          payment: o.payment,
        }))
      : undefined,
  };
}

export type PublicProposalView = ReturnType<typeof toPublicProposalView>;
